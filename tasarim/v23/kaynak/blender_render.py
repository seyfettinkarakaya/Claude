# Z-Anatomy (CC BY-SA 4.0) kas modeli → ön/arka render + kas grubu maskeleri.
import bpy, mathutils, math, sys, re, os
SAMPLES = int(os.environ.get('SAMPLES', '48'))
ONLY = os.environ.get('ONLY', '')  # 'base' ya da 'mask' ya da ''
bpy.ops.wm.open_mainfile(filepath='zan/Z-Anatomy/Startup.blend')
sc = bpy.context.scene
col = bpy.data.collections['4: Muscular system']
SKIP = re.compile(r'fascia|bursa|septum|retinacul|sheath|aponeuros|ligament|arch|ring|tarsus', re.I)
GRP = [
 ('Göğüs', r'pectoralis|subclavius'),
 ('Omuz', r'deltoid|supraspinatus|infraspinatus|teres minor|subscapularis'),
 ('Sırt', r'trapezius|latissimus|rhomboid|teres major|levator scapulae|serratus posterior'),
 ('Gövde', r'rectus abdominis|abdominal oblique|transversus abdominis|pyramidalis|quadratus lumborum|iliocostalis|longissimus thoracis|spinalis thoracis|multifidus|serratus anterior|intercostal'),
 ('Kalça', r'gluteus|tensor fasciae latae|piriformis|gemellus|obturator|quadratus femoris'),
 ('Bacak', r'rectus femoris|vastus|sartorius|gracilis|adductor (longus|brevis|magnus)|pectineus|biceps femoris|semitendinosus|semimembranosus|gastrocnemius|soleus|tibialis|fibularis|popliteus|plantaris|extensor digitorum longus|extensor hallucis longus|flexor digitorum longus|flexor hallucis longus|iliotibial|calcaneal'),
 ('Kol', r'biceps brachii|brachialis|brachioradialis|triceps|anconeus|coracobrachialis|carpi|pronator|supinator|palmaris|flexor digitorum (superficialis|profundus)|^extensor digitorum\.|extensor pollicis|abductor pollicis longus|extensor indicis|extensor digiti minimi|flexor pollicis longus|head of flexor digitorum superficialis'),
]
def grp(name):
    n = name.lower()
    for g, rx in GRP:
        if re.search(rx, n):
            return g
    return None
keep = [o for o in col.objects if o.type == 'MESH' and re.search(r'\.[lr]$', o.name) and not SKIP.search(o.name)
        and not any(m and m.name == 'Text' for m in o.data.materials)]
print('keep', len(keep), {g: sum(1 for o in keep if grp(o.name) == g) for g, _ in GRP})
skel = [o for o in bpy.data.collections['1: Skeletal system'].objects if o.type == 'MESH'
        and not any(m and m.name == 'Text' for m in o.data.materials) and not re.search(r'\.(j|g|t)$', o.name)]
mid = [o for o in col.objects if o.type == 'MESH' and not re.search(r'\.[a-z]$', o.name) and not SKIP.search(o.name)
       and not any(m and m.name == 'Text' for m in o.data.materials)]
print('skel', len(skel), 'mid', len(mid), [o.name for o in mid][:20], flush=True)
# Baş: kafatası ve yüz kasları yerine deri yüzeyi (bölgeler) + saç
HEADZ = float(os.environ.get('HEADZ', '1.47'))
def zmin(o):
    return min((o.matrix_world @ mathutils.Vector(c)).z for c in o.bound_box)
def zmid(o):
    zs = [(o.matrix_world @ mathutils.Vector(c)).z for c in o.bound_box]; return (min(zs) + max(zs)) / 2
reg = [o for o in bpy.data.collections['9: Regions of human body'].objects if o.type == 'MESH'
       and not any(m and m.name == 'Text' for m in o.data.materials) and len(o.data.vertices) > 30]
headskin = [o for o in reg if zmid(o) > HEADZ + 0.03 and o.name != 'Hairs of head' and 'neck' not in o.name.lower()]
# baş yüzeylerini tek nesnede birleştir; voksel yeniden örgü delikleri kapatır, yumuşatma manken görünümü verir
bpy.ops.object.select_all(action='DESELECT')
copies = []
for o in headskin:
    mw = o.matrix_world.copy()
    c = o.copy(); c.data = o.data.copy(); bpy.context.scene.collection.objects.link(c)
    c.parent = None; c.matrix_world = mw; c.constraints.clear()
    c.modifiers.clear(); copies.append(c)
for c in copies: c.select_set(True)
bpy.context.view_layer.objects.active = copies[0]
bpy.ops.object.join()
bas = bpy.context.view_layer.objects.active; bas.name = 'Bas-manken'
so = bas.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.02; so.offset = 0
rm = bas.modifiers.new('rm', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = float(os.environ.get('VOX', '0.008'))
sm = bas.modifiers.new('sm', 'SMOOTH'); sm.iterations = 25; sm.factor = 0.9
bas.data.shade_smooth() if hasattr(bas.data, 'shade_smooth') else None
headskin = [bas]
hair = [o for o in reg if o.name == 'Hairs of head'] if os.environ.get('HAIR') else []
skel = [o for o in skel if zmin(o) < HEADZ - 0.02]
keep = [o for o in keep if zmin(o) < HEADZ - 0.02]
mid = [o for o in mid if zmin(o) < HEADZ - 0.02]
print('head', len(headskin), 'hair', len(hair), flush=True)
keepset = set(keep) | set(skel) | set(mid) | set(headskin) | set(hair)
for o in bpy.data.objects:
    o.hide_render = o not in keepset
mn = mathutils.Vector((1e9,)*3); mx = mathutils.Vector((-1e9,)*3)
bpy.context.view_layer.update()
for o in keep + headskin + hair:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
ctr = (mn + mx) / 2
def newmat(name, color=None, emit=None, hold=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    if hold:
        s = nt.nodes.new('ShaderNodeHoldout')
    elif emit is not None:
        s = nt.nodes.new('ShaderNodeEmission'); s.inputs['Color'].default_value = emit; s.inputs['Strength'].default_value = 1
    else:
        s = nt.nodes.new('ShaderNodeBsdfPrincipled'); s.inputs['Base Color'].default_value = color
        s.inputs['Roughness'].default_value = 0.4; s.inputs['Specular IOR Level'].default_value = 0.65
        s.inputs['Coat Weight'].default_value = 0.15
    nt.links.new(s.outputs[0], out.inputs['Surface'])
    return m
def assign(o, m):
    if not o.material_slots:
        o.data.materials.append(None)
    for sl in o.material_slots:
        sl.link = 'OBJECT'; sl.material = m
KAS = newmat('kas', color=(0.30, 0.33, 0.38, 1))
KEMIK = newmat('kemik', color=(0.16, 0.18, 0.21, 1))
DERI = newmat('deri', color=(0.30, 0.33, 0.38, 1))
SAC = newmat('sac', color=(0.07, 0.08, 0.10, 1))
WHITE = newmat('beyaz', emit=(1, 1, 1, 1)); HOLD = newmat('hold', hold=True)
for o in bpy.data.objects:
    if o.type == 'LIGHT': o.hide_render = True
tgt = bpy.data.objects.new('T', None); sc.collection.objects.link(tgt); tgt.location = ctr
def light(name, energy, loc, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.color = color; d.size = size
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
    c = o.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    return o
cam_data = bpy.data.cameras.new('C'); cam_data.type = 'ORTHO'; cam_data.ortho_scale = (mx.z - mn.z) * 1.04
cam = bpy.data.objects.new('C', cam_data); sc.collection.objects.link(cam); sc.camera = cam
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.render.use_freestyle = False; sc.use_nodes = False
sc.render.use_compositing = False; sc.render.use_sequencer = False
for vl in sc.view_layers: vl.use_freestyle = False
sc.render.resolution_x, sc.render.resolution_y = 520, 1040
sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'
sc.view_settings.exposure = float(os.environ.get('EXPO', '-1.4'))
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
OUT = os.environ.get('OUT', 'r'); os.makedirs(OUT, exist_ok=True)
VIEWS = os.environ.get('VIEWS', 'front,back').split(',')
IDC = {g: c for g, c in zip([g for g, _ in GRP], [(1,0,0,1),(0,1,0,1),(0,0,1,1),(1,1,0,1),(1,0,1,1),(0,1,1,1),(1,1,1,1)])}
IDM = {g: newmat('id_' + g, emit=c) for g, c in IDC.items()}
for view, s in [(v, -1 if v == 'front' else 1) for v in VIEWS]:
    for o in [o for o in sc.collection.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(o)
    # anahtar: kameranın sol üstü; dolgu: sağ; kenar: arkadan üst
    side = 1 if s < 0 else -1
    light('key', 520, (ctr.x - 1.8 * side, ctr.y + s * 2.4, ctr.z + 1.9), 2.2)
    light('fill', 140, (ctr.x + 2.4 * side, ctr.y + s * 2.0, ctr.z - 0.1), 3.0, (0.7, 0.82, 1.0))
    light('rim', 420, (ctr.x + 0.6 * side, ctr.y - s * 2.6, ctr.z + 1.4), 1.8, (0.75, 0.88, 1.0))
    cam.location = (ctr.x, ctr.y + s * 5, ctr.z)
    cam.rotation_euler = (math.radians(90), 0, math.radians(0 if s < 0 else 180))
    if ONLY in ('', 'base'):
        for o in keep: assign(o, KAS)
        for o in mid: assign(o, KAS)
        for o in skel: assign(o, KEMIK)
        for o in headskin: assign(o, DERI)
        for o in hair: assign(o, SAC)
        sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
        sc.render.filepath = f'{OUT}/base_{view}.png'
        bpy.ops.render.render(write_still=True); print('saved', sc.render.filepath, flush=True)
    if ONLY == 'id':
        sc.cycles.samples = 1; sc.cycles.use_denoising = False; sc.cycles.filter_width = 0.01
        sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = 0
        for o in keep:
            g = grp(o.name); assign(o, IDM[g] if g else HOLD)
        for o in mid + skel + headskin + hair: assign(o, HOLD)
        sc.render.filepath = f'{OUT}/id_{view}.png'
        bpy.ops.render.render(write_still=True); print('saved', sc.render.filepath, flush=True)
    if ONLY in ('', 'mask'):
        sc.cycles.samples = 4; sc.cycles.use_denoising = False
        for g, _ in GRP:
            for o in keep: assign(o, WHITE if grp(o.name) == g else HOLD)
            for o in mid + skel + headskin + hair: assign(o, HOLD)
            sc.render.filepath = f'{OUT}/mask_{g}_{view}.png'
            bpy.ops.render.render(write_still=True); print('saved', sc.render.filepath, flush=True)
