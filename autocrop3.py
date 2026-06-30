from PIL import Image
import sys

for path in sys.argv[1:]:
    img = Image.open(path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # zero out outer 10%
    margin_x = int(width * 0.1)
    margin_y = int(height * 0.1)
    
    for x in range(width):
        for y in range(height):
            if x < margin_x or x > width - margin_x or y < margin_y or y > height - margin_y:
                pixels[x, y] = (0,0,0,0)

    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(path)
        print(f"Forced border clear & cropped {path} to {cropped.size} using bbox {bbox}")
    else:
        print(f"Skipped {path}")
