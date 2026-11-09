import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_tactical_icon(size, is_foreground_only=False, is_round=False):
    # Supersample 4x for extreme crispness and anti-aliasing
    SCALE = 4
    canvas_size = size * SCALE
    center = canvas_size / 2.0
    
    if is_foreground_only:
        img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    else:
        # Deep tactical obsidian carbon background
        img = Image.new("RGBA", (canvas_size, canvas_size), (8, 11, 18, 255))
        
    draw = ImageDraw.Draw(img)
    
    if not is_foreground_only:
        # Subtle tactical circular radar grid rings
        for r_ratio in [0.88, 0.68, 0.48]:
            r = (canvas_size * r_ratio) / 2.0
            draw.ellipse([center - r, center - r, center + r, center + r], outline=(255, 255, 255, 18), width=max(1, int(1.5 * SCALE)))
            
        # Tactical crosshairs
        ch_len = canvas_size * 0.45
        draw.line([(center - ch_len, center), (center - ch_len * 0.7, center)], fill=(16, 185, 129, 90), width=int(2 * SCALE))
        draw.line([(center + ch_len * 0.7, center), (center + ch_len, center)], fill=(16, 185, 129, 90), width=int(2 * SCALE))
        draw.line([(center, center - ch_len), (center, center - ch_len * 0.7)], fill=(16, 185, 129, 90), width=int(2 * SCALE))
        draw.line([(center, center + ch_len * 0.7), (center, center + ch_len)], fill=(16, 185, 129, 90), width=int(2 * SCALE))
        
        # Outer Hexagonal Shield Ring
        hex_radius = canvas_size * 0.42
        hex_points = []
        for i in range(6):
            angle = math.radians(60 * i - 30)
            hx = center + hex_radius * math.cos(angle)
            hy = center + hex_radius * math.sin(angle)
            hex_points.append((hx, hy))
        draw.polygon(hex_points, outline=(6, 182, 212, 140), width=int(3 * SCALE))

    # Tactical Neural Brain / Core Nodes & Connectors
    # Main core coordinates relative to center
    nodes = [
        # Center core
        (0.0, 0.0, 16 * SCALE, (16, 185, 129)),       # Emerald Core
        # Upper frontal cortex nodes
        (-0.16, -0.22, 10 * SCALE, (6, 182, 212)),     # Cyan Left Upper
        (0.16, -0.22, 10 * SCALE, (6, 182, 212)),      # Cyan Right Upper
        (-0.28, -0.06, 9 * SCALE, (56, 189, 248)),     # Left Mid
        (0.28, -0.06, 9 * SCALE, (56, 189, 248)),      # Right Mid
        (-0.18, 0.16, 9 * SCALE, (16, 185, 129)),      # Left Lower
        (0.18, 0.16, 9 * SCALE, (16, 185, 129)),       # Right Lower
        (0.0, 0.26, 11 * SCALE, (245, 158, 11)),       # Golden Command Anchor
        (0.0, -0.32, 11 * SCALE, (16, 185, 129)),      # Top Zenith
    ]
    
    # Scale nodes to absolute pixels
    abs_nodes = []
    for nx, ny, r, col in nodes:
        ax = center + nx * canvas_size
        ay = center + ny * canvas_size
        abs_nodes.append((ax, ay, r, col))
        
    # Synaptic Neural Connections
    links = [
        (8, 1), (8, 2),
        (1, 3), (2, 4),
        (1, 0), (2, 0),
        (3, 5), (4, 6),
        (5, 7), (6, 7),
        (0, 5), (0, 6),
        (0, 7), (0, 8)
    ]
    
    # Draw glowing synaptic lines
    for idx_a, idx_b in links:
        x1, y1, _, _ = abs_nodes[idx_a]
        x2, y2, _, _ = abs_nodes[idx_b]
        draw.line([(x1, y1), (x2, y2)], fill=(6, 182, 212, 180), width=int(3.5 * SCALE))
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 120), width=int(1.5 * SCALE))

    # Draw Nodes with Glow
    for ax, ay, r, col in abs_nodes:
        # Outer glow
        draw.ellipse([ax - r * 1.5, ay - r * 1.5, ax + r * 1.5, ay + r * 1.5], fill=(col[0], col[1], col[2], 60))
        # Body
        draw.ellipse([ax - r, ay - r, ax + r, ay + r], fill=(10, 14, 24, 255), outline=col, width=int(2.5 * SCALE))
        # Inner Phosphor Core
        inner_r = r * 0.5
        draw.ellipse([ax - inner_r, ay - inner_r, ax + inner_r, ay + inner_r], fill=col)

    # Stylized Arabic letter 'ع' (Aql / Aqliya) or Cyber Diamond at center
    cd_r = 18 * SCALE
    diamond = [
        (center, center - cd_r),
        (center + cd_r * 0.85, center),
        (center, center + cd_r),
        (center - cd_r * 0.85, center)
    ]
    draw.polygon(diamond, outline=(245, 158, 11, 240), width=int(2.5 * SCALE))
    
    # If round icon requested (ic_launcher_round)
    if is_round and not is_foreground_only:
        mask = Image.new("L", (canvas_size, canvas_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, canvas_size, canvas_size], fill=255)
        # Apply mask
        img.putalpha(mask)

    # Downsample to target size with Lanczos anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    res_base = r"E:\AqliyaHQ\android\app\src\main\res"
    
    # Standard Mipmap specs: (folder, launcher_size, foreground_size)
    mipmaps = [
        ("mipmap-mdpi", 48, 108),
        ("mipmap-hdpi", 72, 162),
        ("mipmap-xhdpi", 96, 216),
        ("mipmap-xxhdpi", 144, 324),
        ("mipmap-xxxhdpi", 192, 432),
    ]
    
    print("Generating tactical military-grade icons for Aqliya HQ...")
    
    for folder, l_size, fg_size in mipmaps:
        folder_path = os.path.join(res_base, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # 1. ic_launcher.png (standard square with rounded corners or full fill)
        launcher = create_tactical_icon(l_size, is_foreground_only=False, is_round=False)
        launcher.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        # 2. ic_launcher_round.png
        launcher_round = create_tactical_icon(l_size, is_foreground_only=False, is_round=True)
        launcher_round.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        
        # 3. ic_launcher_foreground.png (Adaptive icon foreground with padding)
        fg = create_tactical_icon(fg_size, is_foreground_only=True)
        fg.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        
        print(f"Generated {folder}: ic_launcher ({l_size}px), ic_launcher_round ({l_size}px), foreground ({fg_size}px)")

    # Generate high-res 512x512 store/desktop icon
    public_dir = r"E:\AqliyaHQ\public"
    os.makedirs(public_dir, exist_ok=True)
    icon_512 = create_tactical_icon(512, is_foreground_only=False, is_round=False)
    icon_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")
    icon_512.save(os.path.join(r"E:\AqliyaHQ", "icon.png"), "PNG")
    
    # Generate Splash screen 1024x1024
    drawable_dir = os.path.join(res_base, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    splash = create_tactical_icon(1024, is_foreground_only=False, is_round=False)
    splash.save(os.path.join(drawable_dir, "splash.png"), "PNG")
    print("All tactical icons and splash screens successfully generated!")

if __name__ == "__main__":
    main()
