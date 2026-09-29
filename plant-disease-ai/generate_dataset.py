#!/usr/bin/env python3
"""
Plant Disease Image Dataset Generator & Synthesizer
===================================================
Generates a structured, photorealistic synthetic dataset of crop leaf images
for 5 major crops across 20 distinct disease/health conditions with variations in:
- Lighting (bright daylight, overcast, direct sunlight, shadows, low-light)
- Angles (0°, 15°, 45°, 90°, random affine tilt)
- Disease severity (early onset, intermediate, severe necrotic lesions)
- Backgrounds (soil loam, field foliage, hand-held farmer thumb, neutral tray)
- Leaf morphology tailored per crop (Rice, Wheat, Cotton, Tomato, Potato)

Produces:
- dataset/train/<crop>/<disease>/
- dataset/val/<crop>/<disease>/
- dataset/test/<crop>/<disease>/
- dataset_metadata.csv
"""

import os
import sys
import math
import random
import csv
import argparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Definition of crops and disease classes
CROPS_CONFIG = {
    "rice": {
        "leaf_shape": "slender_blade",
        "base_color": (34, 139, 34),
        "diseases": {
            "brown_spot": {
                "lesion_type": "oval_brown",
                "lesion_color": (110, 60, 20),
                "halo_color": (210, 200, 50),
                "severity_range": (0.08, 0.35)
            },
            "leaf_blast": {
                "lesion_type": "spindle_blast",
                "lesion_color": (160, 150, 140),
                "halo_color": (90, 45, 15),
                "severity_range": (0.10, 0.40)
            },
            "bacterial_blight": {
                "lesion_type": "marginal_streak",
                "lesion_color": (220, 190, 80),
                "halo_color": (140, 90, 30),
                "severity_range": (0.15, 0.50)
            },
            "healthy": {
                "lesion_type": "none",
                "severity_range": (0.0, 0.0)
            }
        }
    },
    "wheat": {
        "leaf_shape": "linear_blade",
        "base_color": (46, 125, 50),
        "diseases": {
            "leaf_rust": {
                "lesion_type": "scattered_pustules",
                "lesion_color": (205, 85, 20),
                "halo_color": (160, 70, 15),
                "severity_range": (0.10, 0.40)
            },
            "yellow_rust": {
                "lesion_type": "linear_stripes",
                "lesion_color": (235, 190, 20),
                "halo_color": (200, 150, 10),
                "severity_range": (0.12, 0.45)
            },
            "powdery_mildew": {
                "lesion_type": "powdery_patches",
                "lesion_color": (240, 240, 240),
                "halo_color": (180, 180, 170),
                "severity_range": (0.15, 0.50)
            },
            "healthy": {
                "lesion_type": "none",
                "severity_range": (0.0, 0.0)
            }
        }
    },
    "cotton": {
        "leaf_shape": "palmate_lobed",
        "base_color": (30, 120, 40),
        "diseases": {
            "aphids": {
                "lesion_type": "aphid_clusters",
                "lesion_color": (25, 45, 20),
                "halo_color": (180, 200, 100),
                "severity_range": (0.10, 0.40)
            },
            "whiteflies": {
                "lesion_type": "whitefly_specks",
                "lesion_color": (250, 250, 245),
                "halo_color": (220, 210, 70),
                "severity_range": (0.10, 0.35)
            },
            "leaf_spot": {
                "lesion_type": "target_rings",
                "lesion_color": (120, 40, 30),
                "halo_color": (180, 80, 50),
                "severity_range": (0.10, 0.40)
            },
            "healthy": {
                "lesion_type": "none",
                "severity_range": (0.0, 0.0)
            }
        }
    },
    "tomato": {
        "leaf_shape": "serrated_compound",
        "base_color": (40, 130, 45),
        "diseases": {
            "early_blight": {
                "lesion_type": "target_rings",
                "lesion_color": (85, 45, 25),
                "halo_color": (200, 180, 40),
                "severity_range": (0.12, 0.45)
            },
            "late_blight": {
                "lesion_type": "water_soaked",
                "lesion_color": (50, 50, 40),
                "halo_color": (160, 170, 120),
                "severity_range": (0.15, 0.55)
            },
            "leaf_curl": {
                "lesion_type": "curled_chlorosis",
                "lesion_color": (210, 200, 60),
                "halo_color": (160, 170, 40),
                "severity_range": (0.20, 0.50)
            },
            "healthy": {
                "lesion_type": "none",
                "severity_range": (0.0, 0.0)
            }
        }
    },
    "potato": {
        "leaf_shape": "ovate_compound",
        "base_color": (35, 125, 40),
        "diseases": {
            "early_blight": {
                "lesion_type": "target_rings",
                "lesion_color": (90, 50, 25),
                "halo_color": (190, 170, 45),
                "severity_range": (0.10, 0.40)
            },
            "late_blight": {
                "lesion_type": "water_soaked",
                "lesion_color": (45, 45, 35),
                "halo_color": (150, 160, 110),
                "severity_range": (0.15, 0.55)
            },
            "black_scurf": {
                "lesion_type": "black_sclerotia",
                "lesion_color": (20, 20, 20),
                "halo_color": (110, 70, 40),
                "severity_range": (0.12, 0.45)
            },
            "healthy": {
                "lesion_type": "none",
                "severity_range": (0.0, 0.0)
            }
        }
    }
}

BACKGROUND_TYPES = ["soil", "sky_bokeh", "farmer_hand", "neutral_bench", "field_foliage"]

def generate_background(width, height, bg_type):
    """Generate realistic agricultural backgrounds."""
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    if bg_type == "soil":
        # Rich brown soil loam texture with granules
        base_c = (random.randint(70, 95), random.randint(50, 70), random.randint(35, 50))
        img.paste(base_c, [0, 0, width, height])
        # Add soil pebbles / granules
        for _ in range(800):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            r = random.randint(1, 4)
            shade = random.randint(-25, 30)
            color = (max(0, min(255, base_c[0] + shade)),
                     max(0, min(255, base_c[1] + shade)),
                     max(0, min(255, base_c[2] + shade)))
            draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

    elif bg_type == "sky_bokeh":
        # Overcast or bright sky with sun bokeh
        for y in range(height):
            ratio = y / height
            r = int(140 + ratio * 80)
            g = int(180 + ratio * 60)
            b = int(220 + ratio * 35)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        # Bokeh circles
        for _ in range(12):
            bx = random.randint(0, width)
            by = random.randint(0, height)
            br = random.randint(20, 60)
            bcol = (255, 255, 230, random.randint(30, 80))
            overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            ImageDraw.Draw(overlay).ellipse([bx - br, by - br, bx + br, by + br], fill=bcol)
            img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    elif bg_type == "farmer_hand":
        # Hand / skin background supporting leaf
        skin_tone = (random.randint(180, 220), random.randint(130, 165), random.randint(100, 135))
        img.paste(skin_tone, [0, 0, width, height])
        # Thumb contour
        draw.polygon([(0, height // 2), (width // 3, height // 2 - 20), (width // 2, height), (0, height)],
                     fill=(skin_tone[0] - 25, skin_tone[1] - 20, skin_tone[2] - 20))

    elif bg_type == "field_foliage":
        # Out-of-focus background crop canopy
        base_c = (random.randint(25, 45), random.randint(70, 105), random.randint(25, 45))
        img.paste(base_c, [0, 0, width, height])
        for _ in range(400):
            x = random.randint(0, width)
            y = random.randint(0, height)
            r = random.randint(10, 40)
            gc = random.randint(50, 130)
            draw.ellipse([x - r, y - r, x + r, y + r], fill=(gc // 3, gc, gc // 3))
        img = img.filter(ImageFilter.GaussianBlur(radius=8))

    else:  # neutral_bench
        gray = random.randint(190, 230)
        img.paste((gray, gray, gray), [0, 0, width, height])
        for y in range(0, height, 15):
            draw.line([(0, y), (width, y)], fill=(gray - 12, gray - 12, gray - 12), width=1)

    return img

def create_leaf_mask(width, height, leaf_shape, scale=0.75):
    """Draw leaf silhouette mask corresponding to crop botany."""
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = width // 2, height // 2
    w_half = int((width // 2) * scale)
    h_half = int((height // 2) * scale)

    if leaf_shape in ["slender_blade", "linear_blade"]:
        # Elongated blade (rice, wheat)
        points = []
        num_pts = 40
        top_y = cy - h_half
        bot_y = cy + h_half
        mid_w = w_half * 0.45 if leaf_shape == "slender_blade" else w_half * 0.55
        
        # Right contour
        for i in range(num_pts + 1):
            t = i / num_pts
            y = top_y + t * (bot_y - top_y)
            # Bell profile
            width_at_y = mid_w * math.sin(t * math.pi)
            x = cx + width_at_y
            points.append((x, y))
        # Left contour
        for i in range(num_pts, -1, -1):
            t = i / num_pts
            y = top_y + t * (bot_y - top_y)
            width_at_y = mid_w * math.sin(t * math.pi)
            x = cx - width_at_y
            points.append((x, y))
        draw.polygon(points, fill=255)

    elif leaf_shape == "palmate_lobed":
        # Cotton 3-5 pointed lobes
        draw.ellipse([cx - w_half, cy - int(h_half * 0.7), cx + w_half, cy + int(h_half * 0.8)], fill=255)
        # Top lobe
        draw.polygon([(cx - int(w_half * 0.25), cy), (cx, cy - h_half), (cx + int(w_half * 0.25), cy)], fill=255)
        # Left lobe
        draw.polygon([(cx, cy - int(h_half * 0.2)), (cx - w_half, cy - int(h_half * 0.3)), (cx - int(w_half * 0.3), cy + int(h_half * 0.4))], fill=255)
        # Right lobe
        draw.polygon([(cx, cy - int(h_half * 0.2)), (cx + w_half, cy - int(h_half * 0.3)), (cx + int(w_half * 0.3), cy + int(h_half * 0.4))], fill=255)

    elif leaf_shape == "serrated_compound":
        # Tomato leaf with serrated edge profile
        points = []
        num_teeth = 28
        top_y = cy - h_half
        bot_y = cy + h_half
        for i in range(num_teeth):
            t = i / num_teeth
            y = top_y + t * (bot_y - top_y)
            w = (w_half * 0.75) * math.sin(t * math.pi)
            tooth = 8 if i % 2 == 1 else -4
            points.append((cx + max(0, w + tooth), y))
        for i in range(num_teeth - 1, -1, -1):
            t = i / num_teeth
            y = top_y + t * (bot_y - top_y)
            w = (w_half * 0.75) * math.sin(t * math.pi)
            tooth = 8 if i % 2 == 1 else -4
            points.append((cx - max(0, w + tooth), y))
        draw.polygon(points, fill=255)

    else:  # ovate_compound (potato)
        draw.ellipse([cx - int(w_half * 0.7), cy - h_half, cx + int(w_half * 0.7), cy + h_half], fill=255)
        # Small side leaflets
        draw.ellipse([cx - w_half, cy + int(h_half * 0.3), cx - int(w_half * 0.3), cy + int(h_half * 0.7)], fill=255)
        draw.ellipse([cx + int(w_half * 0.3), cy + int(h_half * 0.3), cx + w_half, cy + int(h_half * 0.7)], fill=255)

    return mask

def render_leaf_surface(mask, base_color, leaf_shape):
    """Render base leaf texture, venation, and natural color gradients."""
    w, h = mask.size
    leaf_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(leaf_img)

    # Base leaf coloration with subtle gradient
    r_base, g_base, b_base = base_color
    for y in range(h):
        shade = int((y / h - 0.5) * 20)
        col = (max(10, min(240, r_base + shade)),
               max(40, min(240, g_base + shade // 2)),
               max(10, min(240, b_base + shade)), 255)
        draw.line([(0, y), (w, y)], fill=col)

    # Midrib / Main vein
    cx = w // 2
    vein_color = (min(255, r_base + 35), min(255, g_base + 45), min(255, b_base + 15), 220)
    draw.line([(cx, 10), (cx, h - 10)], fill=vein_color, width=3)

    # Lateral veins
    for vy in range(25, h - 25, 20):
        length = int(w * 0.3 * (1 - abs(vy - h // 2) / (h // 2)))
        draw.line([(cx, vy), (cx - length, vy - 12)], fill=vein_color, width=1)
        draw.line([(cx, vy), (cx + length, vy - 12)], fill=vein_color, width=1)

    # Apply leaf mask
    leaf_img.putalpha(mask)
    return leaf_img

def apply_disease_symptoms(leaf_img, mask, disease_info):
    """Simulate realistic pathogen lesions and damage."""
    lesion_type = disease_info.get("lesion_type", "none")
    if lesion_type == "none":
        return leaf_img

    w, h = leaf_img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    mask_np = np.array(mask) > 128

    l_color = disease_info["lesion_color"]
    h_color = disease_info["halo_color"]
    min_sev, max_sev = disease_info["severity_range"]
    severity = random.uniform(min_sev, max_sev)

    cx, cy = w // 2, h // 2
    num_spots = int(12 + severity * 40)

    if lesion_type == "oval_brown":  # Rice brown spot
        for _ in range(num_spots):
            lx = random.randint(int(w * 0.35), int(w * 0.65))
            ly = random.randint(int(h * 0.2), int(h * 0.8))
            if not mask_np[ly, lx]:
                continue
            rw = random.randint(4, 11)
            rh = random.randint(6, 18)
            # Chlorotic yellow halo
            draw.ellipse([lx - rw - 3, ly - rh - 3, lx + rw + 3, ly + rh + 3],
                         fill=(h_color[0], h_color[1], h_color[2], 190))
            # Necrotic brown center
            draw.ellipse([lx - rw, ly - rh, lx + rw, ly + rh],
                         fill=(l_color[0], l_color[1], l_color[2], 240))

    elif lesion_type == "spindle_blast":  # Rice leaf blast (diamond/spindle)
        for _ in range(max(4, int(num_spots * 0.6))):
            lx = random.randint(int(w * 0.35), int(w * 0.65))
            ly = random.randint(int(h * 0.2), int(h * 0.8))
            if not mask_np[ly, lx]:
                continue
            sw = random.randint(5, 12)
            sh = random.randint(14, 28)
            # Spindle diamond shape
            pts = [(lx, ly - sh), (lx + sw, ly), (lx, ly + sh), (lx - sw, ly)]
            draw.polygon(pts, fill=(h_color[0], h_color[1], h_color[2], 200))
            inner_pts = [(lx, ly - sh // 2), (lx + sw // 2, ly), (lx, ly + sh // 2), (lx - sw // 2, ly)]
            draw.polygon(inner_pts, fill=(l_color[0], l_color[1], l_color[2], 255))

    elif lesion_type == "marginal_streak":  # Bacterial blight
        top_streak = random.randint(int(h * 0.15), int(h * 0.4))
        for side in [-1, 1]:
            pts = []
            for y in range(top_streak, int(h * 0.85), 10):
                tw = int((w * 0.15) * (1 + math.sin(y * 0.1)))
                tx = (cx + side * int(w * 0.25)) + tw
                pts.append((tx, y))
            for y in range(int(h * 0.85), top_streak - 1, -10):
                pts.append((cx + side * int(w * 0.15), y))
            if len(pts) > 2:
                draw.polygon(pts, fill=(l_color[0], l_color[1], l_color[2], 210))

    elif lesion_type == "scattered_pustules":  # Leaf rust (orange-brown dots)
        for _ in range(num_spots * 3):
            lx = random.randint(int(w * 0.3), int(w * 0.7))
            ly = random.randint(int(h * 0.15), int(h * 0.85))
            if not mask_np[ly, lx]:
                continue
            r = random.randint(2, 5)
            draw.ellipse([lx - r, ly - r, lx + r, ly + r], fill=(l_color[0], l_color[1], l_color[2], 240))

    elif lesion_type == "linear_stripes":  # Yellow rust (parallel streaks)
        for stripe_x in [cx - 15, cx - 6, cx + 5, cx + 16]:
            for y in range(int(h * 0.2), int(h * 0.8), 8):
                if 0 <= y < h and 0 <= stripe_x < w and mask_np[y, stripe_x]:
                    draw.rectangle([stripe_x - 2, y, stripe_x + 2, y + 6],
                                   fill=(l_color[0], l_color[1], l_color[2], 230))

    elif lesion_type == "powdery_mildew":  # White fluffy patches
        for _ in range(int(num_spots * 0.7)):
            lx = random.randint(int(w * 0.25), int(w * 0.75))
            ly = random.randint(int(h * 0.2), int(h * 0.8))
            if not mask_np[ly, lx]:
                continue
            pr = random.randint(8, 22)
            draw.ellipse([lx - pr, ly - pr, lx + pr, ly + pr],
                         fill=(l_color[0], l_color[1], l_color[2], random.randint(120, 200)))

    elif lesion_type in ["target_rings", "aphid_clusters", "whitefly_specks", "water_soaked", "black_sclerotia", "curled_chlorosis"]:
        for _ in range(num_spots):
            lx = random.randint(int(w * 0.2), int(w * 0.8))
            ly = random.randint(int(h * 0.2), int(h * 0.8))
            if not mask_np[ly, lx]:
                continue
            rad = random.randint(6, 18)
            # Concentric rings or spots
            draw.ellipse([lx - rad - 4, ly - rad - 4, lx + rad + 4, ly + rad + 4],
                         fill=(h_color[0], h_color[1], h_color[2], 180))
            draw.ellipse([lx - rad, ly - rad, lx + rad, ly + rad],
                         fill=(l_color[0], l_color[1], l_color[2], 235))
            if lesion_type == "target_rings":
                draw.ellipse([lx - rad // 2, ly - rad // 2, lx + rad // 2, ly + rad // 2],
                             fill=(h_color[0], h_color[1], h_color[2], 200))
                draw.ellipse([lx - 2, ly - 2, lx + 2, ly + 2],
                             fill=(l_color[0], l_color[1], l_color[2], 255))

    # Composite lesion layer on top of leaf
    composite = Image.alpha_composite(leaf_img, overlay)
    composite.putalpha(mask)
    return composite

def generate_sample_image(crop_name, disease_name, output_size=(224, 224)):
    """Generate a single realistic crop image with lighting, angle, and background variations."""
    crop_conf = CROPS_CONFIG[crop_name]
    disease_conf = crop_conf["diseases"][disease_name]
    
    # 1. Pick background
    bg_type = random.choice(BACKGROUND_TYPES)
    bg = generate_background(output_size[0], output_size[1], bg_type)

    # 2. Draw leaf silhouette & texture
    mask = create_leaf_mask(output_size[0], output_size[1], crop_conf["leaf_shape"])
    leaf = render_leaf_surface(mask, crop_conf["base_color"], crop_conf["leaf_shape"])

    # 3. Add disease symptom lesions
    leaf_diseased = apply_disease_symptoms(leaf, mask, disease_conf)

    # 4. Realistic rotation & perspective variation
    angle = random.uniform(-40, 40)
    leaf_rotated = leaf_diseased.rotate(angle, resample=Image.BICUBIC, expand=False)

    # 5. Composite onto background
    final_img = Image.alpha_composite(bg.convert("RGBA"), leaf_rotated).convert("RGB")

    # 6. Apply realistic lighting variations (bright sunlight, shadows, low-light)
    lighting_mode = random.choice(["bright", "normal", "shadow", "overcast", "warm_sunset"])
    enhancer_bright = ImageEnhance.Brightness(final_img)
    enhancer_color = ImageEnhance.Color(final_img)
    enhancer_contrast = ImageEnhance.Contrast(final_img)

    if lighting_mode == "bright":
        final_img = enhancer_bright.enhance(random.uniform(1.15, 1.35))
        final_img = enhancer_contrast.enhance(random.uniform(1.05, 1.20))
    elif lighting_mode == "shadow":
        final_img = enhancer_bright.enhance(random.uniform(0.70, 0.85))
        final_img = enhancer_contrast.enhance(random.uniform(0.90, 1.05))
    elif lighting_mode == "overcast":
        final_img = enhancer_bright.enhance(random.uniform(0.90, 1.05))
        final_img = enhancer_color.enhance(random.uniform(0.75, 0.90))
    elif lighting_mode == "warm_sunset":
        # Warm golden hour shift
        r, g, b = final_img.split()
        r = r.point(lambda i: min(255, int(i * 1.15)))
        b = b.point(lambda i: int(i * 0.85))
        final_img = Image.merge("RGB", (r, g, b))

    # 7. Add subtle realistic sensor noise
    noise_factor = random.uniform(0.01, 0.04)
    img_arr = np.array(final_img, dtype=np.float32)
    noise = np.random.normal(0, noise_factor * 255, img_arr.shape)
    img_arr = np.clip(img_arr + noise, 0, 255).astype(np.uint8)
    
    return Image.fromarray(img_arr)

def build_dataset(base_dir="dataset", samples_per_class=150, split_ratios=(0.70, 0.15, 0.15)):
    """Generate complete organized dataset with train/val/test splits and metadata CSV."""
    base_path = Path(base_dir)
    splits = ["train", "val", "test"]
    train_r, val_r, test_r = split_ratios
    
    metadata_rows = [["image_path", "split", "crop", "disease", "class_label"]]
    
    total_classes = 0
    total_images = 0

    print("=" * 60)
    print(f"🚀 GENERATING PLANT DISEASE DATASET")
    print(f"Base Directory   : {base_path.resolve()}")
    print(f"Samples per Class: {samples_per_class}")
    print(f"Splits           : Train ({train_r*100:.0f}%), Val ({val_r*100:.0f}%), Test ({test_r*100:.0f}%)")
    print("=" * 60)

    for crop_name, crop_conf in CROPS_CONFIG.items():
        for disease_name in crop_conf["diseases"].keys():
            total_classes += 1
            class_label = f"{crop_name}_{disease_name}"
            
            # Determine split counts
            n_train = int(samples_per_class * train_r)
            n_val = int(samples_per_class * val_r)
            n_test = samples_per_class - n_train - n_val
            
            split_counts = {
                "train": n_train,
                "val": n_val,
                "test": n_test
            }

            for split, count in split_counts.items():
                split_dir = base_path / split / crop_name / disease_name
                split_dir.mkdir(parents=True, exist_ok=True)

                for idx in range(count):
                    img = generate_sample_image(crop_name, disease_name)
                    filename = f"{crop_name}_{disease_name}_{split}_{idx+1:04d}.jpg"
                    filepath = split_dir / filename
                    img.save(filepath, quality=92)
                    
                    rel_path = str(filepath.relative_to(base_path.parent))
                    metadata_rows.append([rel_path, split, crop_name, disease_name, class_label])
                    total_images += 1

            print(f"  ✓ [{total_classes:02d}/20] Generated {crop_name.upper():<7} -> {disease_name:<18} ({samples_per_class} images)")

    # Save metadata CSV
    csv_path = base_path.parent / "dataset_metadata.csv"
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(metadata_rows)

    print("=" * 60)
    print(f"✅ DATASET GENERATION COMPLETE!")
    print(f"Total Disease Classes : {total_classes}")
    print(f"Total Images Generated: {total_images}")
    print(f"Metadata CSV Saved    : {csv_path.resolve()}")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Plant Disease Dataset Generator")
    parser.add_argument("--samples", type=int, default=150, help="Number of images per class (default: 150)")
    parser.add_argument("--out", type=str, default="dataset", help="Output directory")
    args = parser.parse_args()

    build_dataset(base_dir=args.out, samples_per_class=args.samples)
