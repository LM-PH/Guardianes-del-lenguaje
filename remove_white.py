from PIL import Image
from collections import deque
import sys

def process(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = deque()
    
    # Add borders to queue
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    transparent = (0, 0, 0, 0)
    
    def is_white(c):
        r, g, b = c[:3]
        return r > 240 and g > 240 and b > 240

    for start_node in queue:
        qx, qy = start_node
        if start_node not in visited:
            if is_white(pixels[qx, qy]):
                q = deque([start_node])
                visited.add(start_node)
                
                while q:
                    cx, cy = q.popleft()
                    pixels[cx, cy] = transparent
                    
                    for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if (nx, ny) not in visited:
                                if is_white(pixels[nx, ny]):
                                    visited.add((nx, ny))
                                    q.append((nx, ny))

    # Also clean up any lingering near-white pixels that got anti-aliased to the background
    for x in range(width):
        for y in range(height):
            if is_white(pixels[x, y]):
                pixels[x, y] = transparent

    # Autocrop transparent edges
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

if __name__ == '__main__':
    for path in sys.argv[1:]:
        print(f"Processing white bg {path}")
        process(path, path.replace('.jpg', '.png'))
