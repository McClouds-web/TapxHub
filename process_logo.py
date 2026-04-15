import sys
from PIL import Image

def make_white_transparent(image_path):
    # Open image and ensure it has an alpha channel
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # If the pixel is pure white or very close to it (e.g. >240,240,240), make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0)) # transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(image_path, "PNG")
    print(f"Successfully processed {image_path}")

if __name__ == "__main__":
    make_white_transparent('public/logo.png')
