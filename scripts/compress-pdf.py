#!/usr/bin/env python3
"""Shrink the exported deck PDF: re-encode large opaque images as JPEG.
Images with transparency (logos, 3D cut-outs) are left untouched.

    pip install pymupdf pillow
    python3 scripts/compress-pdf.py dist/TheraBreath_Flavor_Playbook_Deck.pdf
"""
import io, os, sys, tempfile
import pymupdf
from PIL import Image

path = sys.argv[1] if len(sys.argv) > 1 else "dist/TheraBreath_Flavor_Playbook_Deck.pdf"
doc = pymupdf.open(path)
seen, n = set(), 0
for page in doc:
    for info in page.get_images(full=True):
        xref, smask = info[0], info[1]
        if xref in seen or smask:
            continue
        seen.add(xref)
        if len(doc.xref_stream_raw(xref)) < 150_000:
            continue
        pix = pymupdf.Pixmap(doc, xref)
        if pix.alpha or not pix.colorspace or pix.colorspace.n != 3:
            continue
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        if im.width > 1920:
            im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=82, optimize=True)
        page.replace_image(xref, stream=buf.getvalue()); n += 1
tmp = tempfile.mktemp(suffix=".pdf")
doc.save(tmp, garbage=4, deflate=True); doc.close()
os.replace(tmp, path)
print(f"re-encoded {n} images -> {os.path.getsize(path) // 1024} KB")
