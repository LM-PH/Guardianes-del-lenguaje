from PIL import Image

for file in ["public/sprites/girl.png", "public/sprites/boy.png", "public/sprites/gran_maestro.png", "public/sprites/librarian.png"]:
    img = Image.open(file)
    print(f"{file} - Size: {img.size}")
