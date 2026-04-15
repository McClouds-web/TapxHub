from PIL import Image
import os

def crop_and_clean_logo(image_path):
    if not os.path.exists(image_path):
        print(f"File {image_path} not found")
        return
        
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    
    # Let's crop 2 pixels from each side just in case there's a faint line at the boundary
    # This removes any potential 1px border lines baked into the image attributes
    if width > 4 and height > 4:
        left = 2
        top = 2
        right = width - 2
        bottom = height - 2
        img = img.crop((left, top, right, bottom))
    
    datas = img.getdata()
    new_data = []
    
    for item in datas:
        # Aggressive cleaning: anything that isn't significantly dark is made transparent
        # (Assuming the logo is dark text on white/light background)
        r, g, b, a = item
        # Calculate grayscale value (luminance)
        v = (r + g + b) / 3
        
        # Threshold 200: Wipes out anything light-gray to white
        if v > 200:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(image_path, "PNG")
    print(f"Logo cropped and aggressively cleaned. Final size: {img.size}")

if __name__ == "__main__":
    crop_and_clean_logo('public/logo.png')
