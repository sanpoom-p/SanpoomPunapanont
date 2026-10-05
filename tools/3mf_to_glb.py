#!/usr/bin/env python3
"""
Convert a .3MF CAD export into a compact .glb for the website's 3D viewer.

Usage:
    python3 tools/3mf_to_glb.py input.3mf assets/models/output.glb [--z-up]

Orientation: CAD tools such as SolidWorks write 3MF files that are effectively Y-up, so by
default coordinates are kept as-is. Files that follow the 3MF spec strictly (Z-up, e.g. from
slicers) need --z-up. If a model shows up standing on end or lying on its side, flip the option.

Standard library only. Flattens components/build transforms, groups triangles by
color (one glTF primitive per color), converts millimetres to metres and Z-up to Y-up,
and centres the model. No normals are written, so viewers render it flat-shaded (CAD look).
Positions are quantized to int16 (KHR_mesh_quantization, ~7 um precision on a 0.5 m part);
indices are uint16/uint32 as needed.
"""
import json
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = {
    "c": "http://schemas.microsoft.com/3dmanufacturing/core/2015/02",
    "m": "http://schemas.microsoft.com/3dmanufacturing/material/2015/02",
}
DEFAULT_COLOR = "#B0B4BA"
UNIT_TO_METRES = {"micron": 1e-6, "millimeter": 1e-3, "centimeter": 1e-2, "inch": 0.0254, "foot": 0.3048, "meter": 1.0}


def parse_matrix(text):
    """3MF transform: 12 numbers, row-major 4x3 (m00 m01 m02 m10 ... m30 m31 m32)."""
    if not text:
        return None
    v = [float(x) for x in text.split()]
    return v


def apply(m, p):
    if m is None:
        return p
    x, y, z = p
    return (
        x * m[0] + y * m[3] + z * m[6] + m[9],
        x * m[1] + y * m[4] + z * m[7] + m[10],
        x * m[2] + y * m[5] + z * m[8] + m[11],
    )


def compose(a, b):
    """Return transform equivalent to applying a, then b."""
    if a is None:
        return b
    if b is None:
        return a
    out = [0.0] * 12
    for r in range(4):
        for c in range(3):
            s = sum(a[r * 3 + k] * b[k * 3 + c] for k in range(3)) if r < 3 else \
                sum(a[9 + k] * b[k * 3 + c] for k in range(3)) + b[9 + c]
            out[r * 3 + c] = s
    return out


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    a = int(h[6:8], 16) / 255 if len(h) >= 8 else 1.0
    return [srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b), a]


def load(path, z_up=False):
    with zipfile.ZipFile(path) as z:
        name = next(n for n in z.namelist() if n.lower().endswith(".model"))
        root = ET.fromstring(z.read(name))
    scale = UNIT_TO_METRES.get(root.get("unit", "millimeter"), 1e-3)

    colors = {}
    for tag in ("m:colorgroup", "c:basematerials"):
        for group in root.iter("{%s}%s" % (NS[tag[0]], tag.split(":")[1])):
            entries = []
            for child in group:
                entries.append(child.get("color") or child.get("displaycolor") or DEFAULT_COLOR)
            colors[group.get("id")] = entries

    def color_of(pid, idx):
        group = colors.get(pid) if pid else None
        if group:
            i = int(idx or 0)
            if 0 <= i < len(group):
                return group[i].upper()
        return DEFAULT_COLOR

    objects = {}
    for obj in root.iter("{%s}object" % NS["c"]):
        mesh = obj.find("c:mesh", NS)
        if mesh is not None:
            verts = [(float(v.get("x")), float(v.get("y")), float(v.get("z")))
                     for v in mesh.find("c:vertices", NS)]
            tris = []
            opid, oidx = obj.get("pid"), obj.get("pindex")
            for t in mesh.find("c:triangles", NS):
                pid = t.get("pid") or opid
                idx = t.get("p1") if t.get("pid") else (t.get("p1") or oidx)
                tris.append((int(t.get("v1")), int(t.get("v2")), int(t.get("v3")), color_of(pid, idx)))
            objects[obj.get("id")] = ("mesh", verts, tris)
        else:
            comps = [(c.get("objectid"), parse_matrix(c.get("transform")))
                     for c in obj.iter("{%s}component" % NS["c"])]
            objects[obj.get("id")] = ("comp", comps)

    by_color = {}  # color -> (positions list, index list, vertex dedupe map)
    instance = [0]  # unique id per emitted mesh instance (used to de-duplicate vertices)

    def emit(obj_id, matrix):
        kind = objects[obj_id]
        if kind[0] == "comp":
            for child_id, child_m in kind[1]:
                emit(child_id, compose(child_m, matrix))
            return
        _, verts, tris = kind
        world = [apply(matrix, v) for v in verts]
        instance[0] += 1
        inst = instance[0]
        for a, b, c, col in tris:
            pos, idx, seen = by_color.setdefault(col, ([], [], {}))
            for vi in (a, b, c):
                key = (inst, vi)
                if key not in seen:
                    seen[key] = len(pos)
                    x, y, z = world[vi]
                    pos.append((x * scale, z * scale, -y * scale) if z_up else (x * scale, y * scale, z * scale))
                idx.append(seen[key])

    build = root.find("c:build", NS)
    for item in build:
        emit(item.get("objectid"), parse_matrix(item.get("transform")))
    return by_color


def write_glb(by_color, out_path):
    all_pos = [p for pos, _, _ in by_color.values() for p in pos]
    mins = [min(p[i] for p in all_pos) for i in range(3)]
    maxs = [max(p[i] for p in all_pos) for i in range(3)]
    centre = [(mins[i] + maxs[i]) / 2 for i in range(3)]

    blob = bytearray()
    buffer_views, accessors, materials, primitives = [], [], [], []

    def add_view(data, target):
        while len(blob) % 4:
            blob.append(0)
        buffer_views.append({"buffer": 0, "byteOffset": len(blob), "byteLength": len(data), "target": target})
        blob.extend(data)
        return len(buffer_views) - 1

    # Quantize positions to int16 (KHR_mesh_quantization); the node scale restores real size.
    half = max(maxs[i] - mins[i] for i in range(3)) / 2 or 1.0
    q = half / 32767

    for col, (pos, idx, _) in sorted(by_color.items()):
        pts = [tuple(round((p[i] - centre[i]) / q) for i in range(3)) for p in pos]
        pmin = [min(p[i] for p in pts) for i in range(3)]
        pmax = [max(p[i] for p in pts) for i in range(3)]
        data = b"".join(struct.pack("<hhhh", p[0], p[1], p[2], 0) for p in pts)  # padded to 8-byte stride
        pv = add_view(data, 34962)
        buffer_views[pv]["byteStride"] = 8
        accessors.append({"bufferView": pv, "componentType": 5122, "count": len(pts), "type": "VEC3", "min": pmin, "max": pmax})
        pa = len(accessors) - 1
        big = len(pts) > 65535
        iv = add_view(struct.pack("<%d%s" % (len(idx), "I" if big else "H"), *idx), 34963)
        accessors.append({"bufferView": iv, "componentType": 5125 if big else 5123, "count": len(idx), "type": "SCALAR"})
        ia = len(accessors) - 1
        materials.append({"name": col, "pbrMetallicRoughness": {"baseColorFactor": hex_to_rgba(col), "metallicFactor": 0.1, "roughnessFactor": 0.6}, "doubleSided": True})
        primitives.append({"attributes": {"POSITION": pa}, "indices": ia, "material": len(materials) - 1})

    gltf = {
        "asset": {"version": "2.0", "generator": "3mf_to_glb.py"},
        "extensionsUsed": ["KHR_mesh_quantization"], "extensionsRequired": ["KHR_mesh_quantization"],
        "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0, "scale": [q, q, q]}],
        "meshes": [{"primitives": primitives}],
        "materials": materials, "accessors": accessors, "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(blob)}],
    }
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    blob += b"\0" * (-len(blob) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
        f.write(struct.pack("<II", len(blob), 0x004E4942) + bytes(blob))
    tris = sum(len(i) for _, i, _ in by_color.values()) // 3
    size = [maxs[i] - mins[i] for i in range(3)]
    print("%s: %d triangles, %d colors, %.0f KB, size %.0f x %.0f x %.0f mm" % (
        out_path, tris, len(by_color), total / 1024, size[0] * 1000, size[1] * 1000, size[2] * 1000))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 2 or any(a not in ("--z-up",) for a in sys.argv[1:] if a.startswith("--")):
        sys.exit(__doc__)
    write_glb(load(args[0], z_up="--z-up" in sys.argv), args[1])
