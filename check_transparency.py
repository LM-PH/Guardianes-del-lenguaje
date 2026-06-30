from PIL import Image
import sys

for path in sys.argv[1:]:
    img = Image.open(path).convert("RGBA")
    data = img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata()
    transparent_count = sum(1 for c in data if c[3] == 0)
    print(f"{path}: {transparent_count} / {len(data)} transparent pixels")
