from PIL import Image
import sys

for path in sys.argv[1:]:
    img = Image.open(path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(path)
        print(f"Cropped {path} from {img.size} to {cropped.size} using bbox {bbox}")
    else:
        print(f"Skipped {path} (completely transparent?)")
