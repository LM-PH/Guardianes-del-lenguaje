from PIL import Image

img = Image.open('public/sprites/boy.png')
w, h = img.size
print(f"Original size: {w}x{h}")
frameW = w // 4
rows = max(1, round(h / frameW))
frameH = h // rows
print(f"frameW={frameW}, frameH={frameH}, rows={rows}")

# crop the first frame
frame = img.crop((0, 0, frameW, frameH))
bbox = frame.getbbox()
print(f"Bounding box of first frame (non-transparent pixels): {bbox}")
