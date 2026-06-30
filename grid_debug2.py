from PIL import Image, ImageDraw
import sys

img_path = sys.argv[1]
img = Image.open(img_path).convert("RGBA")
width, height = img.size

frameW = width // 4
rows = max(1, round(height / frameW))
frameH = height // rows

draw = ImageDraw.Draw(img)

for r in range(rows):
    for c in range(4):
        x = c * frameW
        y = r * frameH
        draw.rectangle([x, y, x + frameW, y + frameH], outline="red", width=2)

img.save("public/grid_debug2.png")
print(f"Saved grid_debug2.png with grid {frameW}x{frameH}")
