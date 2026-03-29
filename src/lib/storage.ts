import { supabase } from './supabase';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const uploadFile = async (file: File, bucketPath: string = 'uploads') => {
  const sizeMb = file.size / (1024 * 1024);

  // Free Tier Optimization: Route large media > 5MB to Cloudinary (free 25GB)
  if (sizeMb > 5) {
    if (!cloudName) throw new Error("Cloudinary engine unconfigured");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset'); // Requires an unsigned preset setup in Cloudinary
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
        throw new Error("Cloudinary upload rejected. Verify Cloud Name and internal presets.");
    }
    
    const result = await response.json();
    console.log(`[Storage] Routed large file (${sizeMb.toFixed(2)}MB) to Cloudinary successfully.`);
    return { url: result.secure_url, provider: 'cloudinary', size: sizeMb };
  }

  // Fast Path Optimization: Route standard documents and tiny media to Supabase Vault
  const filePath = `${bucketPath}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const { data, error } = await supabase.storage.from('vault').upload(filePath, file, { upsert: true });
  
  if (error) throw error;
  
  const { data: publicData } = supabase.storage.from('vault').getPublicUrl(data.path);
  console.log(`[Storage] Routed standard file (${sizeMb.toFixed(2)}MB) to Supabase Vault successfully.`);
  return { url: publicData.publicUrl, provider: 'supabase', size: sizeMb };
};

export const listBrandAssets = async () => {
    const { data, error } = await supabase.storage.from('brand_assets').list();
    if (error) {
        console.error('Error listing assets:', error);
        throw error;
    }
    // Filter out common system files
    return data.filter(file => file.name !== '.emptyFolderPlaceholder');
};

export const uploadBrandAsset = async (file: File) => {
    const filePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const { data, error } = await supabase.storage.from('brand_assets').upload(filePath, file, { upsert: false });
    if (error) throw error;
    
    return data;
};

export const deleteBrandAsset = async (fileName: string) => {
    const { data, error } = await supabase.storage.from('brand_assets').remove([fileName]);
    if (error) throw error;
    return data;
};

export const getBrandAssetUrl = (fileName: string) => {
    const { data } = supabase.storage.from('brand_assets').getPublicUrl(fileName);
    return data.publicUrl;
};
