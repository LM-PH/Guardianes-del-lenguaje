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
    
    def is_background(c):
        # The background is a grey checkerboard.
        # R, G, B are all close to each other.
        r, g, b = c[:3]
        if max(r,g,b) - min(r,g,b) < 35: # It's somewhat grey
            if 40 < r < 140: # Brightness matches the dark grey checkerboard (68 or 118)
                return True
        return False

    # Also we want to allow slightly anti-aliased edges to be removed.
    # We will do a standard flood fill for all pixels matching is_background.
    
    for start_node in queue:
        qx, qy = start_node
        if start_node not in visited:
            if is_background(pixels[qx, qy]):
                q = deque([start_node])
                visited.add(start_node)
                while q:
                    cx, cy = q.popleft()
                    pixels[cx, cy] = transparent
                    
                    for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if (nx, ny) not in visited:
                                if is_background(pixels[nx, ny]):
                                    visited.add((nx, ny))
                                    q.append((nx, ny))
                                    
    # Remove the DALL-E sparkle
    for x in range(width - 150, width):
        for y in range(height - 150, height):
            c = pixels[x, y]
            if c[3] > 0 and sum(c[:3]) > 600:
                pixels[x, y] = transparent

    img.save(output_path, "PNG")
    print(f"Processed {output_path}")

for path in sys.argv[1:]:
    process(path, path)

