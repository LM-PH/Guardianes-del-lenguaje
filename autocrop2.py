from PIL import Image
import sys

for path in sys.argv[1:]:
    img = Image.open(path).convert("RGBA")
    
    # aggressive noise removal on margins: clear top/bottom/left/right 10% if mostly transparent
    width, height = img.size
    pixels = img.load()
    
    # Find true bounding box by scanning from edges until we hit significant non-transparent blocks
    # Actually, let's just clear any pixel that is very isolated or has very low alpha
    for x in range(width):
        for y in range(height):
            c = pixels[x, y]
            if c[3] < 100:
                pixels[x, y] = (0,0,0,0)

    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(path)
        print(f"Cropped {path} to {cropped.size} using bbox {bbox}")
    else:
        print(f"Skipped {path}")
