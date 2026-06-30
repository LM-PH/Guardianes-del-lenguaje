import sys
from PIL import Image

def process(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # DALL-E checkerboard colors are usually around (102,102,102) and (153,153,153) or similar
    # Let's just find the top-left pixel color, and the adjacent checker color
    # Actually, we can check if a pixel is exactly gray (R==G==B) or close to it, and within the background range
    # Let's do a flood fill from the corners, or just color distance.
    # We can use the top-left pixel to get one of the checker colors.
    bg1 = data[0]
    
    # We can also just make all perfectly gray-ish pixels transparent if they match the checker pattern.
    # To be safe against gray clothes, a floodfill is better.
    
    from collections import deque
    width, height = img.size
    
    # Flood fill to find all connected background pixels
    visited = set()
    queue = deque([(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)])
    
    def color_dist(c1, c2):
        return sum(abs(a-b) for a, b in zip(c1[:3], c2[:3]))

    pixels = img.load()
    
    # Identify the two checker colors by looking at the first row
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

    print(f"Detected bg colors: {bg_colors}")

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
                                    
    # The DALL-E sparkle is at the bottom right. We can erase it manually if we want, but it's probably cropped out 
    # since it's on the background. If the sparkle is white, it won't be flood filled.
    # Let's do a pass to remove the sparkle if it's in the bottom right 100x100 box
    for x in range(width - 150, width):
        for y in range(height - 150, height):
            # If it's bright/white and isolated, remove it
            c = pixels[x, y]
            if c[3] > 0 and sum(c[:3]) > 600:
                pixels[x, y] = transparent

    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

process("/Users/luismiguelponceherrera/.gemini/antigravity/brain/71174fee-c5a7-45b2-a236-013387ecb655/media__1782789445682.png", "public/sprites/girl.png")
