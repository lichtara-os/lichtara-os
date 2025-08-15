from PIL import Image, ImageDraw, ImageFilter
import math, os

# Parameters
w, h = 900, 480
fps = 20
duration_s = 6
frames = fps * duration_s
out_dir = 'arte'
out_path = os.path.join(out_dir, 'aurora_preview.gif')

# Colors
bg_color = (6, 18, 32)
star_color = (255, 255, 255)

def make_gradient(size, colors):
    g = Image.new('RGBA', size, (0,0,0,0))
    draw = ImageDraw.Draw(g)
    for y in range(size[1]):
        t = y / (size[1]-1)
        # linear interpolate between colors[0] and colors[1]
        r = int(colors[0][0]*(1-t) + colors[1][0]*t)
        gg = int(colors[0][1]*(1-t) + colors[1][1]*t)
        b = int(colors[0][2]*(1-t) + colors[1][2]*t)
        draw.line([(0,y),(size[0],y)], fill=(r,gg,b,40))
    return g

# pre-generate star field
import random
random.seed(42)
stars = [(random.randint(0,w-1), random.randint(0,h-1), random.uniform(0.6,1.6)) for _ in range(120)]

frames_list = []
for f in range(frames):
    t = f / frames
    img = Image.new('RGBA', (w,h), bg_color)
    draw = ImageDraw.Draw(img)

    # stars
    for (sx, sy, r) in stars:
        a = 160 if random.random() < 0.02 else int(120 + 80*math.sin((t*2*math.pi)+(sx*0.01)))
        draw.ellipse((sx-r, sy-r, sx+r, sy+r), fill=(255,255,255,a))

    # aurora layers (3 layers)
    layer = Image.new('RGBA', (w,h), (0,0,0,0))
    ld = ImageDraw.Draw(layer)
    for i, params in enumerate([ (0.18,0.06,(125,231,212),(105,208,198)), (0.30,0.045,(106,215,224),(77,169,215)), (0.45,0.035,(217,163,255),(159,196,255)) ]):
        base_frac, amp_frac, c1, c2 = params
        base = int(h*base_frac)
        amp = int(h*amp_frac)
        points = []
        phase = t*2*math.pi*(0.3 + i*0.12)
        steps = 60
        for x in range(0, w+1, w//steps if steps else 1):
            px = x
            y = base + math.sin((x/w)*6.0 + phase) * amp * (1 + 0.4*math.sin(phase*0.7 + x*0.01))
            points.append((px, y))
        # build polygon
        poly = [(0,h)] + points + [(w,h)]
        # gradient fill approximation: draw with blurred solid
        col = tuple(int((c1[j]*(1-i/3) + c2[j]*(i/3))) for j in range(3)) + (int(120*(1 - i*0.18)),)
        ld.polygon(poly, fill=col)
    # blur the aurora a bit to get soft veil
    layer = layer.filter(ImageFilter.GaussianBlur(radius=18))
    img = Image.alpha_composite(img, layer)

    # comet path (arc)
    cx = int(w * (0.15 + 0.7 * ((math.sin(t*2*math.pi*0.5)+1)/2)))
    cy = int(h * (0.25 + 0.3 * ((math.cos(t*2*math.pi*0.5)+1)/2)))
    comet_x = int(w * (0.9 - 1.6 * t))
    comet_y = int(h * (0.2 + 0.5 * math.sin(t*2*math.pi*0.5)))
    # comet tail
    tail = Image.new('RGBA', (w,h), (0,0,0,0))
    td = ImageDraw.Draw(tail)
    for i in range(16):
        alpha = int(140 * (1 - i/16))
        rx = comet_x + int(i*6)
        ry = comet_y + int(i*2)
        r = max(1, 6 - i*0.35)
        td.ellipse((rx-r, ry-r, rx+r, ry+r), fill=(255, 230, 180, alpha))
    tail = tail.filter(ImageFilter.GaussianBlur(radius=6))
    img = Image.alpha_composite(img, tail)
    # comet head
    dd = ImageDraw.Draw(img)
    dd.ellipse((comet_x-6, comet_y-6, comet_x+6, comet_y+6), fill=(255,245,210,255))

    # slight vignette
    vign = Image.new('L', (w,h), 0)
    vd = ImageDraw.Draw(vign)
    max_r = min(w,h)//2
    for i_r in range(max_r):
        a = int(140 * (i_r / (max_r)))
        vd.ellipse((i_r, i_r, w-i_r-1, h-i_r-1), fill=a)
    img.putalpha(255)

    frames_list.append(img.convert('P', palette=Image.ADAPTIVE))

# save as GIF
frames_list[0].save(out_path, save_all=True, append_images=frames_list[1:], optimize=True, duration=int(1000/fps), loop=0)
print('Saved', out_path)
