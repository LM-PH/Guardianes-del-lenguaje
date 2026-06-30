from PIL import Image
from collections import Counter
import sys

img = Image.open(sys.argv[1]).convert("RGB")
data = img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata()
counts = Counter(data)
print("Most common colors:")
for color, count in counts.most_common(10):
    print(f"Color: {color}, Count: {count}")
