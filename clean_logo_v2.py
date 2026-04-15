from PIL import Image
import os

def clean_logo(image_path):
    if not os.path.exists(image_path):
        print(f"File {image_path} not found")
        return
        
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If it's pure white or very close to it (threshold 230)
        # We also check if it's already transparent
        if item[3] == 0:
            new_data.append(item)
            continue
            
        r, g, b, a = item
        # Calculate "whiteness"
        if r > 230 and g > 230 and b > 230:
            # Shift towards transparency based on how white it is
            avg = (r + g + b) / 3
            alpha = int(255 * (1 - (avg - 230) / (255 - 230))) if avg > 230 else 255
            new_data.append((r, g, b, 0)) # Force total transparency for near-white
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(image_path, "PNG")
    print(f"Cleaned {image_path} - Background removed.")

if __name__ == "__main__":
    clean_logo('public/logo.png')
