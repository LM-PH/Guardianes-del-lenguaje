import sys
from PIL import Image

def process(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata()
    
    from collections import deque
    width, height = img.size
    
    visited = set()
    queue = deque([(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)])
    
    def color_dist(c1, c2):
        return sum(abs(a-b) for a, b in zip(c1[:3], c2[:3]))

    pixels = img.load()
    
    bg_colors = []
    for x in range(min(50, width)):
        c = pixels[x, 0]
        if not bg_colors:
            bg_colors.append(c)
        else:
            if all(color_dist(c, bc) > 10 for bc in bg_colors):
                bg_colors.append(c)
                if len(bg_colors) == 2:
                    break

    transparent = (0, 0, 0, 0)
    for qx, qy in queue:
        if (qx, qy) not in visited:
            start_color = pixels[qx, qy]
            if any(color_dist(start_color, bc) < 15 for bc in bg_colors):
                q = deque([(qx, qy)])
                visited.add((qx, qy))
                while q:
                    cx, cy = q.popleft()
                    pixels[cx, cy] = transparent
                    
                    for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if (nx, ny) not in visited:
                                nc = pixels[nx, ny]
                                if any(color_dist(nc, bc) < 15 for bc in bg_colors):
                                    visited.add((nx, ny))
                                    q.append((nx, ny))
                                    
    for x in range(width - 150, width):
        for y in range(height - 150, height):
            c = pixels[x, y]
            if c[3] > 0 and sum(c[:3]) > 600:
                pixels[x, y] = transparent

    img.save(output_path, "PNG")

if len(sys.argv) > 2:
    process(sys.argv[1], sys.argv[2])
