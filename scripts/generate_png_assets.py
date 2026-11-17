import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.abspath("public/branding")
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_SEGOE_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_SEGOE_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_ARIAL_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_CONSOLAS = "C:/Windows/Fonts/consola.ttf"

def create_gradient_radial(width, height, center_x, center_y, max_r, stops):
    """Creates a radial gradient RGBA image using stops [(r_ratio, (R,G,B,A))]"""
    base = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    # Optimize by calculating on downsampled grid or numpy if available, or math
    # Since width/height is large, let's create a 1/4 size image and resize with BICUBIC
    sw, sh = width // 4, height // 4
    sc_x, sc_y = center_x / 4, center_y / 4
    sm_r = max_r / 4
    small = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    pix = small.load()
    
    for y in range(sh):
        for x in range(sw):
            dist = math.hypot(x - sc_x, y - sc_y)
            ratio = min(1.0, max(0.0, dist / sm_r))
            
            # Find stops
            for i in range(len(stops) - 1):
                r0, c0 = stops[i]
                r1, c1 = stops[i+1]
                if r0 <= ratio <= r1:
                    t = (ratio - r0) / (r1 - r0) if r1 > r0 else 0
                    r = int(c0[0] + (c1[0] - c0[0]) * t)
                    g = int(c0[1] + (c1[1] - c0[1]) * t)
                    b = int(c0[2] + (c1[2] - c0[2]) * t)
                    a = int(c0[3] + (c1[3] - c0[3]) * t)
                    pix[x, y] = (r, g, b, a)
                    break
    return small.resize((width, height), Image.Resampling.BICUBIC)

def create_linear_gradient_diag(width, height, color_start, color_mid, color_end):
    """Linear gradient from bottom-left to top-right"""
    sw, sh = 100, 100
    small = Image.new("RGBA", (sw, sh))
    pix = small.load()
    for y in range(sh):
        for x in range(sw):
            # Diagonal ratio: (x + (sh - y)) / (sw + sh)
            ratio = (x + (sh - 1 - y)) / (sw + sh - 2)
            if ratio < 0.5:
                t = ratio / 0.5
                r = int(color_start[0] + (color_mid[0] - color_start[0]) * t)
                g = int(color_start[1] + (color_mid[1] - color_start[1]) * t)
                b = int(color_start[2] + (color_mid[2] - color_start[2]) * t)
            else:
                t = (ratio - 0.5) / 0.5
                r = int(color_mid[0] + (color_end[0] - color_mid[0]) * t)
                g = int(color_mid[1] + (color_end[1] - color_mid[1]) * t)
                b = int(color_mid[2] + (color_end[2] - color_mid[2]) * t)
            pix[x, y] = (r, g, b, 255)
    return small.resize((width, height), Image.Resampling.BICUBIC)

def generate_ng_avatar():
    W, H = 2160, 2160 # 2x for supersampling -> 1080x1080
    img = Image.new("RGBA", (W, H), (4, 6, 10, 255)) # #04060a
    
    # Ambient glow
    glow = create_gradient_radial(W, H, W//2, H//2, W*0.55, [
        (0.0, (0, 113, 227, 90)),
        (0.4, (121, 40, 202, 50)),
        (0.7, (56, 189, 248, 15)),
        (1.0, (4, 6, 10, 0))
    ])
    img.alpha_composite(glow)
    
    # Badge border gradient: #0071e3 -> #7928ca -> #38bdf8
    bw, bh = 1040, 1040
    bx, by = (W - bw) // 2, (H - bh) // 2
    radius = 280
    
    # Outer glow around badge
    glow_box = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_gb = ImageDraw.Draw(glow_box)
    draw_gb.rounded_rectangle([bx, by, bx + bw, by + bh], radius=radius, fill=(0, 113, 227, 140))
    glow_box = glow_box.filter(ImageFilter.GaussianBlur(80))
    img.alpha_composite(glow_box)
    
    # Badge border
    grad_border = create_linear_gradient_diag(bw, bh, (0, 113, 227), (121, 40, 202), (56, 189, 248))
    mask_outer = Image.new("L", (bw, bh), 0)
    draw_mo = ImageDraw.Draw(mask_outer)
    draw_mo.rounded_rectangle([0, 0, bw, bh], radius=radius, fill=255)
    
    border_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    border_layer.paste(grad_border, (bx, by), mask_outer)
    img.alpha_composite(border_layer)
    
    # Inner background (#0a0d14)
    border_width = 32
    ibw, ibh = bw - border_width * 2, bh - border_width * 2
    ibx, iby = bx + border_width, by + border_width
    inner_radius = radius - border_width // 2
    
    inner_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_inner = ImageDraw.Draw(inner_layer)
    draw_inner.rounded_rectangle([ibx, iby, ibx + ibw, iby + ibh], radius=inner_radius, fill=(10, 13, 20, 255))
    img.alpha_composite(inner_layer)
    
    # Text "NG"
    draw = ImageDraw.Draw(img)
    font_size = 520
    font = ImageFont.truetype(FONT_SEGOE_BOLD, font_size)
    text = "NG"
    
    # Center text accurately
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (W - tw) // 2 - bbox[0]
    ty = (H - th) // 2 - bbox[1]
    
    # Text glow
    text_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_tg = ImageDraw.Draw(text_glow)
    draw_tg.text((tx, ty), text, font=font, fill=(56, 189, 248, 120))
    text_glow = text_glow.filter(ImageFilter.GaussianBlur(25))
    img.alpha_composite(text_glow)
    
    # Main text
    draw_final = ImageDraw.Draw(img)
    draw_final.text((tx, ty), text, font=font, fill=(56, 189, 248, 255))
    
    # Downscale to 1080x1080
    final = img.resize((1080, 1080), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "neuronal-gravity-avatar.png"), "PNG")
    print("Generated: neuronal-gravity-avatar.png")

def generate_ng_horizontal():
    W, H = 3200, 1000 # 2x for supersampling -> 1600x500
    img = Image.new("RGBA", (W, H), (4, 6, 10, 255))
    
    # Ambient glow
    glow = create_gradient_radial(W, H, 600, H//2, 800, [
        (0.0, (0, 113, 227, 80)),
        (0.4, (121, 40, 202, 40)),
        (1.0, (4, 6, 10, 0))
    ])
    img.alpha_composite(glow)
    
    # Badge (left side)
    bw, bh = 560, 560
    bx, by = 200, (H - bh) // 2
    radius = 152
    
    # Badge border
    grad_border = create_linear_gradient_diag(bw, bh, (0, 113, 227), (121, 40, 202), (56, 189, 248))
    mask_outer = Image.new("L", (bw, bh), 0)
    draw_mo = ImageDraw.Draw(mask_outer)
    draw_mo.rounded_rectangle([0, 0, bw, bh], radius=radius, fill=255)
    
    border_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    border_layer.paste(grad_border, (bx, by), mask_outer)
    img.alpha_composite(border_layer)
    
    # Inner box
    border_width = 18
    ibw, ibh = bw - border_width * 2, bh - border_width * 2
    ibx, iby = bx + border_width, by + border_width
    inner_radius = radius - border_width // 2
    
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([ibx, iby, ibx + ibw, iby + ibh], radius=inner_radius, fill=(10, 13, 20, 255))
    
    # NG text
    font_ng = ImageFont.truetype(FONT_SEGOE_BOLD, 280)
    bbox_ng = draw.textbbox((0, 0), "NG", font=font_ng)
    ng_w = bbox_ng[2] - bbox_ng[0]
    ng_h = bbox_ng[3] - bbox_ng[1]
    ng_x = bx + (bw - ng_w) // 2 - bbox_ng[0]
    ng_y = by + (bh - ng_h) // 2 - bbox_ng[1]
    draw.text((ng_x, ng_y), "NG", font=font_ng, fill=(56, 189, 248, 255))
    
    # Brand typography
    text_x = bx + bw + 120
    font_title = ImageFont.truetype(FONT_SEGOE_BOLD, 156)
    font_sub = ImageFont.truetype(FONT_CONSOLAS, 56)
    
    draw.text((text_x, by + 100), "NEURONAL GRAVITY", font=font_title, fill=(255, 255, 255, 255))
    draw.text((text_x + 6, by + 280), "Soluciones Tecnológicas • RUC 10704877850", font=font_sub, fill=(148, 163, 184, 255))
    
    final = img.resize((1600, 500), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "neuronal-gravity-logo.png"), "PNG")
    print("Generated: neuronal-gravity-logo.png")

def draw_shield_check(draw, cx, cy, scale, stroke_color=(255,255,255), fill_color=(56,189,248,30), check_color=(56,189,248)):
    # Shield shape points normalized around 0,0
    # Coordinates based on Lucide shield:
    # Top-left ( -6.5, -9 ), Top-mid ( 0, -11.5 ), Top-right ( 6.5, -9 )
    # Bottom tip ( 0, 11.5 )
    # Let's generate a smooth curve of points
    points = []
    # Top edge curve left to right
    for step in range(21):
        t = step / 20.0
        # x from -6.5 to 6.5
        x = -6.5 + 13.0 * t
        # arc dipping slightly down then peaking or standard shield
        y = -9.0 - (1.0 - (x/6.5)**2) * 2.5
        points.append((cx + x * scale, cy + y * scale))
    
    # Right side down to bottom
    for step in range(1, 31):
        t = step / 30.0
        # x curves from 6.5 down to 0
        x = 6.5 * (1.0 - t**1.4)
        # y curves from -9 down to 11.5
        y = -9.0 + 20.5 * t
        points.append((cx + x * scale, cy + y * scale))
        
    # Left side up from bottom to top-left
    for step in range(1, 31):
        t = step / 30.0
        x = -6.5 * (t**1.4)
        y = 11.5 - 20.5 * t
        points.append((cx + x * scale, cy + y * scale))
        
    draw.polygon(points, fill=fill_color)
    # Draw outline with multiple lines for thickness
    thick = int(scale * 0.22)
    for i in range(len(points)):
        p1 = points[i]
        p2 = points[(i + 1) % len(points)]
        draw.line([p1, p2], fill=stroke_color, width=thick)
        
    # Checkmark inside: from (-2.5, 0.5) -> (0, 3.0) -> (4.5, -2.5)
    c1 = (cx - 2.8 * scale, cy + 0.5 * scale)
    c2 = (cx - 0.2 * scale, cy + 3.2 * scale)
    c3 = (cx + 3.8 * scale, cy - 2.5 * scale)
    check_thick = int(scale * 0.28)
    draw.line([c1, c2], fill=check_color, width=check_thick)
    draw.line([c2, c3], fill=check_color, width=check_thick)

def generate_defensati_avatar():
    W, H = 2160, 2160
    img = Image.new("RGBA", (W, H), (2, 4, 8, 255)) # #020408
    
    # Ambient cyber glow
    glow = create_gradient_radial(W, H, W//2, H//2, W*0.55, [
        (0.0, (0, 113, 227, 95)),
        (0.4, (56, 189, 248, 45)),
        (0.7, (0, 113, 227, 15)),
        (1.0, (2, 4, 8, 0))
    ])
    img.alpha_composite(glow)
    
    # Squircle badge
    bw, bh = 1040, 1040
    bx, by = (W - bw) // 2, (H - bh) // 2
    radius = 280
    
    # Squircle glow
    glow_box = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_gb = ImageDraw.Draw(glow_box)
    draw_gb.rounded_rectangle([bx, by, bx + bw, by + bh], radius=radius, fill=(41, 151, 255, 100))
    glow_box = glow_box.filter(ImageFilter.GaussianBlur(70))
    img.alpha_composite(glow_box)
    
    # Squircle surface with subtle top-to-bottom translucent gradient
    badge_surf = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    draw_bs = ImageDraw.Draw(badge_surf)
    draw_bs.rounded_rectangle([0, 0, bw, bh], radius=radius, fill=(255, 255, 255, 24), outline=(255, 255, 255, 45), width=8)
    img.alpha_composite(badge_surf, (bx, by))
    
    # Draw ShieldCheck in center
    draw = ImageDraw.Draw(img)
    draw_shield_check(draw, W//2, H//2 - 10, scale=32, stroke_color=(255, 255, 255), fill_color=(56, 189, 248, 30), check_color=(56, 189, 248))
    
    final = img.resize((1080, 1080), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "defensa-ti-avatar.png"), "PNG")
    print("Generated: defensa-ti-avatar.png")

def generate_defensati_horizontal():
    W, H = 3200, 1000
    img = Image.new("RGBA", (W, H), (2, 4, 8, 255))
    
    # Ambient glow
    glow = create_gradient_radial(W, H, 600, H//2, 800, [
        (0.0, (0, 113, 227, 85)),
        (0.5, (56, 189, 248, 35)),
        (1.0, (2, 4, 8, 0))
    ])
    img.alpha_composite(glow)
    
    # Shield Squircle on left
    bw, bh = 560, 560
    bx, by = 200, (H - bh) // 2
    radius = 152
    
    badge_surf = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    draw_bs = ImageDraw.Draw(badge_surf)
    draw_bs.rounded_rectangle([0, 0, bw, bh], radius=radius, fill=(255, 255, 255, 22), outline=(255, 255, 255, 45), width=6)
    img.alpha_composite(badge_surf, (bx, by))
    
    draw = ImageDraw.Draw(img)
    draw_shield_check(draw, bx + bw//2, by + bh//2 - 5, scale=17, stroke_color=(255, 255, 255), fill_color=(56, 189, 248, 30), check_color=(56, 189, 248))
    
    # Brand typography
    text_x = bx + bw + 120
    font_title = ImageFont.truetype(FONT_SEGOE_BOLD, 168)
    font_sub = ImageFont.truetype(FONT_SEGOE_BOLD, 68)
    font_meta = ImageFont.truetype(FONT_CONSOLAS, 46)
    
    draw.text((text_x, by + 65), "DEFENSA TI", font=font_title, fill=(255, 255, 255, 255))
    draw.text((text_x + 4, by + 255), "Blindaje & Ciberseguridad Web", font=font_sub, fill=(56, 189, 248, 255))
    draw.text((text_x + 6, by + 345), "Neuronal Gravity • RUC 10704877850", font=font_meta, fill=(100, 116, 139, 255))
    
    final = img.resize((1600, 500), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "defensa-ti-logo.png"), "PNG")
    print("Generated: defensa-ti-logo.png")

if __name__ == "__main__":
    generate_ng_avatar()
    generate_ng_horizontal()
    generate_defensati_avatar()
    generate_defensati_horizontal()
    print("All branding assets generated.")
