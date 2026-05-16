#!/usr/bin/env python3
"""Generate a premium 18-page The Flavor Factory x TheraBreath workshop booklet.

The generator intentionally has no third-party runtime dependencies so the final
print PDF can be rebuilt in restricted CI/deployment environments. It creates a
vector-first US Letter portrait PDF with a restrained corporate editorial system,
TheraBreath blue/mint palette, molecule/water accents, strategic copy, and a
consistent confidential footer on every page.
"""
from __future__ import annotations

import math
import os
from dataclasses import dataclass, field
from typing import Iterable, List, Sequence, Tuple

W, H = 612, 792  # US Letter portrait, 8.5 x 11 inches at 72 points/inch
BLUE = (0.0, 0.639, 0.878)      # #00A3E0
MINT = (0.494, 0.827, 0.129)    # #7ED321
NAVY = (0.051, 0.106, 0.165)    # #0D1B2A
INK = (0.12, 0.18, 0.25)
GRAY = (0.47, 0.53, 0.60)
LINE = (0.82, 0.88, 0.91)
PALE_BLUE = (0.925, 0.982, 1.0)
PALE_MINT = (0.940, 0.990, 0.905)
PAPER = (0.992, 0.997, 1.0)
WHITE = (1, 1, 1)
FOOTER = "Confidential - Prepared exclusively for Church & Dwight / TheraBreath | July 2026"


def clean_text(s: str) -> str:
    return (s.replace("–", "-")
             .replace("—", "-")
             .replace("×", "x")
             .replace("“", '"').replace("”", '"')
             .replace("’", "'")
             .replace("…", "..."))


def pdf_literal(s: str) -> str:
    b = clean_text(s).encode("cp1252", "replace")
    out = []
    for ch in b.decode("cp1252"):
        if ch in "\\()":
            out.append("\\" + ch)
        elif ch == "\n":
            out.append("\\n")
        else:
            out.append(ch)
    return "(" + "".join(out) + ")"


def rgb(c: Tuple[float, float, float]) -> str:
    return f"{c[0]:.4f} {c[1]:.4f} {c[2]:.4f}"


def blend(a, b, t):
    return tuple(a[i] * (1 - t) + b[i] * t for i in range(3))


@dataclass
class Page:
    ops: List[str] = field(default_factory=list)

    def raw(self, s: str) -> None:
        self.ops.append(s)

    def fill_color(self, c):
        self.raw(f"{rgb(c)} rg")

    def stroke_color(self, c):
        self.raw(f"{rgb(c)} RG")

    def line_width(self, w):
        self.raw(f"{w:.2f} w")

    def rect(self, x, y, w, h, fill=None, stroke=None, sw=1):
        if fill:
            self.fill_color(fill)
        if stroke:
            self.stroke_color(stroke); self.line_width(sw)
        op = "B" if fill and stroke else "f" if fill else "S"
        self.raw(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")

    def round_rect(self, x, y, w, h, r=10, fill=None, stroke=None, sw=1):
        k = 0.5522847498
        if fill:
            self.fill_color(fill)
        if stroke:
            self.stroke_color(stroke); self.line_width(sw)
        self.raw(
            f"{x+r:.2f} {y:.2f} m {x+w-r:.2f} {y:.2f} l "
            f"{x+w-r+r*k:.2f} {y:.2f} {x+w:.2f} {y+r-r*k:.2f} {x+w:.2f} {y+r:.2f} c "
            f"{x+w:.2f} {y+h-r:.2f} l "
            f"{x+w:.2f} {y+h-r+r*k:.2f} {x+w-r+r*k:.2f} {y+h:.2f} {x+w-r:.2f} {y+h:.2f} c "
            f"{x+r:.2f} {y+h:.2f} l "
            f"{x+r-r*k:.2f} {y+h:.2f} {x:.2f} {y+h-r+r*k:.2f} {x:.2f} {y+h-r:.2f} c "
            f"{x:.2f} {y+r:.2f} l "
            f"{x:.2f} {y+r-r*k:.2f} {x+r-r*k:.2f} {y:.2f} {x+r:.2f} {y:.2f} c "
            + ("B" if fill and stroke else "f" if fill else "S")
        )

    def line(self, x1, y1, x2, y2, color=NAVY, sw=1):
        self.stroke_color(color); self.line_width(sw)
        self.raw(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def poly(self, pts: Sequence[Tuple[float, float]], fill=None, stroke=None, sw=1):
        if fill:
            self.fill_color(fill)
        if stroke:
            self.stroke_color(stroke); self.line_width(sw)
        first = pts[0]
        path = [f"{first[0]:.2f} {first[1]:.2f} m"]
        path += [f"{x:.2f} {y:.2f} l" for x, y in pts[1:]]
        path.append("h")
        path.append("B" if fill and stroke else "f" if fill else "S")
        self.raw(" ".join(path))

    def circle(self, x, y, r, fill=None, stroke=None, sw=1):
        k = 0.5522847498 * r
        if fill:
            self.fill_color(fill)
        if stroke:
            self.stroke_color(stroke); self.line_width(sw)
        self.raw(
            f"{x+r:.2f} {y:.2f} m {x+r:.2f} {y+k:.2f} {x+k:.2f} {y+r:.2f} {x:.2f} {y+r:.2f} c "
            f"{x-k:.2f} {y+r:.2f} {x-r:.2f} {y+k:.2f} {x-r:.2f} {y:.2f} c "
            f"{x-r:.2f} {y-k:.2f} {x-k:.2f} {y-r:.2f} {x:.2f} {y-r:.2f} c "
            f"{x+k:.2f} {y-r:.2f} {x+r:.2f} {y-k:.2f} {x+r:.2f} {y:.2f} c "
            + ("B" if fill and stroke else "f" if fill else "S")
        )

    def text(self, x, y, s, size=12, font="F1", color=NAVY, align="left"):
        self.fill_color(color)
        s = clean_text(s)
        factor = 0.50 if font == "F1" else 0.56
        width = len(s) * size * factor
        if align == "center":
            x -= width / 2
        elif align == "right":
            x -= width
        self.raw(f"BT /{font} {size:.2f} Tf {x:.2f} {y:.2f} Td {pdf_literal(s)} Tj ET")

    def wrap(self, x, y, text, max_width, size=11, font="F1", color=NAVY, leading=None, align="left"):
        if leading is None:
            leading = size * 1.42
        words = clean_text(text).split()
        lines, cur = [], ""
        factor = 0.50 if font == "F1" else 0.56
        for word in words:
            test = (cur + " " + word).strip()
            if len(test) * size * factor <= max_width or not cur:
                cur = test
            else:
                lines.append(cur); cur = word
        if cur:
            lines.append(cur)
        yy = y
        for line in lines:
            self.text(x, yy, line, size, font, color, align=align)
            yy -= leading
        return yy

    def gradient_rect(self, x, y, w, h, c1, c2, steps=40, horizontal=False):
        for i in range(steps):
            t = i / max(steps - 1, 1)
            c = blend(c1, c2, t)
            if horizontal:
                self.rect(x + w*i/steps, y, w/steps + .6, h, fill=c)
            else:
                self.rect(x, y + h*i/steps, w, h/steps + .6, fill=c)


class PDF:
    def __init__(self):
        self.pages: List[Page] = []

    def page(self):
        p = Page(); self.pages.append(p); return p

    def write(self, path):
        objs = []
        def add(obj):
            objs.append(obj); return len(objs)
        f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        f3 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>")
        page_ids, content_ids = [], []
        for p in self.pages:
            stream = "\n".join(p.ops).encode("latin1", "replace")
            content_ids.append(add(f"<< /Length {len(stream)} >>\nstream\n" + stream.decode("latin1") + "\nendstream"))
            page_ids.append(0)
        pages_id_placeholder = len(objs) + len(self.pages) + 1
        for i, cid in enumerate(content_ids):
            page_ids[i] = add(
                f"<< /Type /Page /Parent {pages_id_placeholder} 0 R /MediaBox [0 0 {W} {H}] "
                f"/Resources << /Font << /F1 {f1} 0 R /F2 {f2} 0 R /F3 {f3} 0 R >> >> /Contents {cid} 0 R >>"
            )
        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        pages_id = add(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog_id = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")
        assert pages_id == pages_id_placeholder
        with open(path, "wb") as f:
            f.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
            offsets = [0]
            for i, obj in enumerate(objs, 1):
                offsets.append(f.tell())
                f.write(f"{i} 0 obj\n{obj}\nendobj\n".encode("latin1", "replace"))
            xref = f.tell()
            f.write(f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n".encode())
            for off in offsets[1:]:
                f.write(f"{off:010d} 00000 n \n".encode())
            f.write(f"trailer << /Size {len(objs)+1} /Root {catalog_id} 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())


def paper(p: Page):
    p.rect(0, 0, W, H, fill=PAPER)
    for i in range(22):
        shade = 0.972 + (i % 4) * 0.004
        p.line(0, 40 + i*34, W, 44 + i*34, color=(shade, shade + .006, 1), sw=.28)


def footer(p: Page, n: int):
    p.rect(54, 36, 250, 1.2, fill=BLUE)
    p.rect(304, 36, 254, 1.2, fill=MINT)
    p.text(54, 20, FOOTER, 6.8, "F1", GRAY)
    p.text(558, 20, f"{n:02d}", 8.7, "F2", BLUE, align="right")


def molecule_field(p: Page, x0=405, y0=500, scale=1.0, alpha_color=(0.78, 0.91, 0.96), count=8):
    for i in range(count):
        x = x0 + math.sin(i * 1.7) * 62 * scale + (i % 2) * 42 * scale
        y = y0 - i * 54 * scale
        r = (8 + (i % 3) * 3) * scale
        p.circle(x, y, r, stroke=alpha_color, sw=.65)
        p.circle(x + 22*scale, y + 17*scale, r*.42, fill=alpha_color)
        p.line(x + r*.7, y + r*.5, x + 22*scale - r*.15, y + 17*scale, color=alpha_color, sw=.55)


def droplet_texture(p: Page, x0, y0, w, h, color=(0.85, 0.96, 1), count=16):
    for i in range(count):
        x = x0 + (i * 37) % int(max(w, 1))
        y = y0 + (i * 71) % int(max(h, 1))
        r = 3 + (i % 4)
        p.circle(x, y, r, stroke=color, sw=.45)
        p.line(x, y-r-2, x-2, y-r-7, color=color, sw=.35)


def section_header(p: Page, title: str, eyebrow: str, deck: str | None = None):
    paper(p)
    molecule_field(p, 462, 632, .86, (0.84, 0.93, 0.97), 7)
    p.text(54, 718, eyebrow.upper(), 8.8, "F2", BLUE)
    p.wrap(54, 678, title, 430, 28, "F2", NAVY, 31)
    p.rect(54, 648, 104, 2.2, fill=BLUE)
    p.rect(158, 648, 64, 2.2, fill=MINT)
    if deck:
        p.wrap(54, 616, deck, 365, 12.2, "F1", INK, 17)


def brand_lockup(p: Page, x, y, scale=1.0, light=False):
    c1 = WHITE if light else NAVY
    p.round_rect(x, y-42*scale, 136*scale, 58*scale, 8*scale, fill=(1,1,1) if not light else (0.95,1,1), stroke=(0.78,0.89,0.93), sw=.7)
    p.text(x+14*scale, y-8*scale, "THE FLAVOR", 8.5*scale, "F2", c1)
    p.text(x+14*scale, y-25*scale, "FACTORY", 17*scale, "F2", BLUE)
    p.text(x+154*scale, y-14*scale, "x", 12*scale, "F2", GRAY)
    p.round_rect(x+181*scale, y-42*scale, 148*scale, 58*scale, 8*scale, fill=(1,1,1), stroke=(0.78,0.89,0.93), sw=.7)
    p.text(x+197*scale, y-14*scale, "Thera", 18*scale, "F2", BLUE)
    p.text(x+253*scale, y-14*scale, "Breath", 18*scale, "F2", MINT)
    p.text(x+198*scale, y-29*scale, "Church & Dwight oral care", 6.7*scale, "F1", GRAY)


def bullets(p: Page, items: Iterable[str], x: float, y: float, width: float, size=11.2, gap=25, dot=MINT):
    yy = y
    for item in items:
        p.circle(x, yy + 4, 3.1, fill=dot)
        yy = p.wrap(x + 15, yy, item, width - 18, size, "F1", INK, size*1.38)
        yy -= gap - size*1.38
    return yy


def label(p: Page, x, y, text, color=BLUE):
    p.round_rect(x, y-5, len(text)*5.8+18, 20, 10, fill=(0.955,0.990,1), stroke=(0.78,0.90,0.94), sw=.4)
    p.text(x+9, y, text.upper(), 7.6, "F2", color)


def photo_panel(p: Page, x, y, w, h, theme="lab", c1=BLUE, c2=MINT):
    p.round_rect(x, y, w, h, 18, fill=(0.97,0.99,1), stroke=(0.76,0.88,0.92), sw=.8)
    p.gradient_rect(x+1, y+1, w-2, h-2, blend(c1, WHITE, .55), blend(c2, WHITE, .45), 34, horizontal=False)
    droplet_texture(p, x+12, y+12, w-24, h-24, (0.90,0.99,1), 18)
    if theme == "lab":
        # benches, scientists, sample vials
        p.rect(x+22, y+34, w-44, 54, fill=(1,1,1), stroke=(0.78,0.88,0.92), sw=.5)
        for i, col in enumerate([BLUE, MINT, (1,.55,.52), (1,.78,.20), (.55,.45,.92), (.28,.82,.88)]):
            vx = x+45+i*27
            p.rect(vx, y+52, 13, 43, fill=(.96,.99,1), stroke=(.65,.78,.84), sw=.4)
            p.rect(vx+2, y+52, 9, 22 + (i%3)*6, fill=col)
            p.circle(vx+6.5, y+101, 5, fill=blend(col, WHITE, .2))
        for sx in [x+w*.26, x+w*.55, x+w*.78]:
            p.circle(sx, y+h*.58, 18, fill=(0.98,0.78,0.62), stroke=WHITE, sw=.8)
            p.round_rect(sx-18, y+h*.35, 36, 50, 5, fill=WHITE, stroke=(.70,.84,.88), sw=.5)
            p.line(sx-12, y+h*.43, sx+12, y+h*.43, color=BLUE, sw=1.5)
    elif theme == "operations":
        for i in range(5):
            xx = x + 28 + i*(w-56)/5
            p.rect(xx, y+42, 30, h-84, fill=(.93,.96,.97), stroke=(.68,.78,.82), sw=.6)
            p.line(xx+6, y+56, xx+24, y+56, color=BLUE if i%2 else MINT, sw=2)
        p.poly([(x+18,y+42),(x+w-18,y+42),(x+w-44,y+24),(x+42,y+24)], fill=(.80,.86,.88), stroke=(.66,.75,.78), sw=.5)
    elif theme == "facility":
        p.poly([(x+24,y+48),(x+w-24,y+48),(x+w-52,y+h-40),(x+54,y+h-40)], fill=(.07,.20,.30), stroke=(.65,.82,.88), sw=.8)
        p.rect(x+54, y+75, w-108, h-145, fill=(.80,.94,.98), stroke=WHITE, sw=.5)
        p.rect(x+78, y+102, w-156, h-196, fill=(.70,.91,.80))
        p.rect(x+w*.48, y+48, 32, h-118, fill=(.03,.10,.16))
        p.rect(x+54, y+h-62, w-108, 19, fill=BLUE)
        p.text(x+w/2, y+h-57, "THE FLAVOR FACTORY", 8.2, "F2", WHITE, align="center")


def cover(pdf: PDF):
    p = pdf.page()
    p.gradient_rect(0, 0, W, H, NAVY, (0.0, 0.42, 0.62), 70, horizontal=False)
    p.gradient_rect(0, 0, W, 300, (0.0, 0.20, 0.33), (0.38, 0.80, 0.44), 44, horizontal=True)
    droplet_texture(p, 10, 40, 590, 690, (0.55,0.82,0.91), 42)
    molecule_field(p, 430, 670, 1.25, (0.42,0.78,0.84), 9)
    photo_panel(p, 64, 325, 484, 230, "facility", BLUE, MINT)
    p.rect(0, 0, W, 245, fill=(0.015,0.052,0.088))
    p.gradient_rect(0, 245, W, 80, (0.015,0.052,0.088), (0.015,0.052,0.088), 1)
    brand_lockup(p, 136, 720, .88)
    p.text(306, 233, "BREATH OF INNOVATION", 12, "F2", MINT, align="center")
    p.wrap(78, 190, "Scaling Fresh Together", 456, 40, "F2", WHITE, 45, align="center")
    p.text(306, 137, "Fresh Futures - New Flavor Concepts for TheraBreath", 16.5, "F2", MINT, align="center")
    p.text(306, 104, "The Flavor Factory x Church & Dwight Capabilities Workshop", 10.8, "F1", WHITE, align="center")
    p.text(306, 83, "July 2026 | Norco, California", 10.8, "F1", (0.86,0.94,0.98), align="center")
    for i, col in enumerate([BLUE, MINT, (0.92,.30,.50), (1,.75,.22), (.48,.85,.92), (.55,.45,.72)]):
        x = 148 + i*52
        p.round_rect(x, 45, 22, 74, 5, fill=(.94,.99,1), stroke=(.85,.95,.98), sw=.5)
        p.rect(x+3, 45, 16, 43+i%2*8, fill=blend(col, WHITE, .08))
        p.rect(x+6, 119, 10, 10, fill=(.80,.88,.90))
    footer(p, 1)


def inside_cover(pdf: PDF):
    p = pdf.page(); paper(p)
    p.rect(0, 0, 288, H, fill=WHITE)
    p.rect(288, 0, 324, H, fill=PALE_BLUE)
    molecule_field(p, 126, 318, 1.05, (0.88,0.95,0.97), 7)
    brand_lockup(p, 54, 684, .82)
    p.text(56, 585, "Built for the future", 30, "F2", NAVY)
    p.wrap(58, 542, "A focused capabilities workshop aligning operational excellence, sensory expertise, and strategic growth for the next era of TheraBreath innovation.", 190, 12.2, "F1", INK, 18)
    label(p, 58, 430, "Strategic partner briefing", BLUE)
    label(p, 58, 398, "Innovation tasting session", MINT)
    photo_panel(p, 318, 120, 240, 540, "lab", BLUE, MINT)
    p.round_rect(338, 562, 200, 74, 12, fill=(1,1,1), stroke=(0.78,0.90,0.94), sw=.6)
    p.text(358, 606, "Welcome", 20, "F2", NAVY)
    p.text(358, 584, "Fresh thinking. Disciplined execution.", 9.6, "F2", BLUE)
    footer(p, 2)


def welcome(pdf: PDF):
    p = pdf.page(); section_header(p, "Dear TheraBreath Team,", "Welcome Letter")
    p.round_rect(70, 120, 472, 470, 18, fill=WHITE, stroke=(0.84,0.91,0.94), sw=.7)
    p.rect(70, 120, 8, 470, fill=PALE_MINT)
    paras = [
        "Thank you for joining us at The Flavor Factory for this capabilities review. As your long-standing flavor partner, we are excited to share not only our current capabilities but a bold vision for the future of fresh breath.",
        "This booklet highlights five new prototype concepts developed specifically for your growth trajectory. Each was crafted in our labs with your core values - clean, effective, and sensorially superior - in mind.",
        "We look forward to your candid feedback and to co-creating the next chapter of TheraBreath innovation together.",
    ]
    y = 525
    for para in paras:
        y = p.wrap(104, y, para, 390, 13.1, "F1", INK, 21) - 20
    p.text(104, y-6, "Sincerely,", 12.2, "F1", INK)
    p.text(104, y-44, "Dan Wixted", 20, "F3", BLUE)
    p.text(104, y-64, "President, The Flavor Factory", 10.5, "F2", GRAY)
    footer(p, 3)


def toc(pdf: PDF):
    p = pdf.page(); section_header(p, "Table of Contents", "Workshop Guide")
    items = [
        ("01", "Our Partnership with TheraBreath", "5"),
        ("02", "The 4 Pillars of Capabilities", "6-9"),
        ("03", "Flavor Trends Shaping Oral Care", "10"),
        ("04", "New Prototype Concepts", "11-15"),
        ("", "Berry Bliss", "11"),
        ("", "Tropical Oasis", "12"),
        ("", "Crisp Cucumber Mint", "13"),
        ("", "Citrus Ginger Spark", "14"),
        ("", "Dessert Mint Dream", "15"),
        ("05", "Sensory Evaluation Guide", "16"),
        ("06", "Your Feedback & Scoring", "17"),
        ("07", "Co-Creation & Next Steps", "18"),
    ]
    y = 592
    for code, title, pg in items:
        indent = 28 if not code else 0
        if code:
            p.text(78, y, code, 9.5, "F2", BLUE)
            p.line(112, y+4, 468, y+4, color=LINE, sw=.55)
            p.text(128, y, title, 12.5, "F2", NAVY)
            p.text(520, y, pg, 12, "F2", BLUE, align="right")
            y -= 37
        else:
            p.circle(132, y+4, 2.2, fill=MINT)
            p.text(146 + indent, y, title, 10.5, "F1", INK)
            p.text(520, y, pg, 10.5, "F1", GRAY, align="right")
            y -= 24
    footer(p, 4)


def partnership(pdf: PDF):
    p = pdf.page(); section_header(p, "A Proven Partnership Built on Trust", "Our Partnership", "A relationship grounded in service reliability, dedicated support, and shared growth ambition.")
    # Timeline
    p.line(86, 505, 526, 505, color=LINE, sw=1.2)
    milestones = [("Quality", "Multi-year collaboration"), ("Room", "Dedicated production"), ("99%+", "OTIF performance"), ("Growth", "Year-over-year volume"), ("Core", "Mint portfolio trust")]
    for i, (top, bot) in enumerate(milestones):
        x = 88 + i*110
        p.circle(x, 505, 10, fill=WHITE, stroke=BLUE if i%2==0 else MINT, sw=2)
        p.text(x, 468, top, 14, "F2", BLUE if i%2==0 else MINT, align="center")
        p.wrap(x-43, 444, bot, 86, 7.8, "F1", GRAY, 10, align="center")
    # Metrics cards
    cards = [(70, 265, "99%+", "OTIF reliability"), (230, 265, "Dedicated", "TheraBreath room"), (390, 265, "Scale", "ready capacity")]
    for x, y, big, small in cards:
        p.round_rect(x, y, 132, 96, 14, fill=WHITE, stroke=(0.80,0.90,0.94), sw=.8)
        p.text(x+66, y+55, big, 22, "F2", NAVY, align="center")
        p.text(x+66, y+31, small, 9.5, "F2", BLUE, align="center")
    p.round_rect(70, 124, 472, 82, 16, fill=PALE_BLUE, stroke=(0.76,0.90,0.96), sw=.8)
    p.wrap(94, 174, "We view TheraBreath as more than a customer - you are a strategic growth partner.", 420, 17.5, "F2", NAVY, 24, align="center")
    footer(p, 5)


def pillar(pdf: PDF, page_no: int, number: str, title: str, subtitle: str, theme: str, bullets_list: list[str], visual: str):
    p = pdf.page(); section_header(p, title, f"Pillar {number}", subtitle)
    photo_panel(p, 330, 392, 206, 180, visual, BLUE, MINT)
    p.round_rect(70, 368, 220, 204, 16, fill=WHITE, stroke=(0.82,0.90,0.94), sw=.7)
    p.text(92, 526, "Strategic emphasis", 10, "F2", BLUE)
    p.wrap(92, 496, theme, 170, 14, "F2", NAVY, 20)
    y = bullets(p, bullets_list, 86, 315, 438, 11.4, 26, MINT)
    # elegant workflow/data strip
    p.round_rect(70, 112, 472, 86, 14, fill=(0.985,0.998,1), stroke=(0.84,0.91,0.94), sw=.6)
    labels = ["Plan", "Protect", "Validate", "Scale"] if number == "1" else ["Discover", "Create", "Test", "Launch"] if number == "2" else ["Source", "Make", "Move", "Report"] if number == "3" else ["Align", "Invest", "Govern", "Grow"]
    for i, lab in enumerate(labels):
        x = 108 + i*112
        p.circle(x, 155, 18, fill=BLUE if i % 2 == 0 else MINT)
        p.text(x, 150, str(i+1), 11, "F2", WHITE, align="center")
        p.text(x, 128, lab, 8.8, "F2", NAVY, align="center")
        if i < 3:
            p.line(x+24, 155, x+83, 155, color=LINE, sw=1)
    footer(p, page_no)


def trends(pdf: PDF):
    p = pdf.page(); section_header(p, "Flavor Trends Shaping Oral Care", "Market & Sensory Direction", "Freshness is evolving from a single-note mint expectation into a broader portfolio of wellness-led sensory experiences.")
    trends = [
        ("Functional + sensory pleasure", "Wellness benefits paired with memorable freshness."),
        ("Beyond mint", "Dessert, tropical, herbal-calming and nuanced mint adjacencies."),
        ("Clean-label orientation", "Natural-forward profiles with clear, approachable cues."),
        ("Segment expansion", "Kid-friendly fun and adult indulgence can coexist in oral care."),
        ("Seasonal energy", "Limited editions create trial, conversation, and repeat discovery."),
    ]
    y = 548
    for i, (t, d) in enumerate(trends, 1):
        p.round_rect(70, y-18, 472, 62, 14, fill=WHITE if i%2 else (0.982,0.997,1), stroke=(0.84,0.91,0.94), sw=.6)
        p.circle(105, y+12, 17, fill=BLUE if i%2 else MINT)
        p.text(105, y+6, f"{i}", 11, "F2", WHITE, align="center")
        p.text(136, y+19, t, 13, "F2", NAVY)
        p.text(136, y-1, d, 9.8, "F1", GRAY)
        y -= 78
    footer(p, 10)


def sensory_chart(p: Page, x, y, w, stages, color):
    p.text(x, y+52, "SENSORY ARC", 8, "F2", BLUE)
    for i, (name, desc, val) in enumerate(stages):
        yy = y + 28 - i*30
        p.text(x, yy, name.upper(), 7.5, "F2", GRAY)
        p.round_rect(x+58, yy-2, w-58, 8, 4, fill=(0.90,0.95,0.97))
        p.round_rect(x+58, yy-2, (w-58)*val, 8, 4, fill=color)
        p.text(x+58, yy-16, desc, 7.8, "F1", INK)


def concept(pdf: PDF, page_no: int, idx: int, name: str, subtitle: str, theme: str, stages, apps: str, claims: str, position: str, color):
    p = pdf.page(); paper(p)
    molecule_field(p, 448, 686, .78, (0.86,0.93,0.96), 7)
    p.text(54, 724, f"PROTOTYPE CONCEPT {idx}", 8.8, "F2", BLUE)
    p.text(54, 684, name, 32, "F2", NAVY)
    p.text(54, 654, subtitle, 13.5, "F2", color)
    # hero band
    p.round_rect(54, 438, 504, 174, 20, fill=WHITE, stroke=(0.80,0.90,0.94), sw=.7)
    p.gradient_rect(55, 439, 502, 172, blend(color, WHITE, .25), blend(BLUE, WHITE, .45), 38, horizontal=True)
    droplet_texture(p, 74, 456, 454, 132, (0.94,1,1), 18)
    # macro ingredient/glass arrangement
    for i in range(8):
        cx = 96 + i*55
        cy = 520 + math.sin(i*1.5)*26
        r = 20 + (i%3)*5
        p.circle(cx, cy, r, fill=blend(color, WHITE, .18), stroke=WHITE, sw=1)
        p.circle(cx-6, cy+6, r*.32, fill=blend(WHITE, color, .15))
    p.round_rect(430, 470, 72, 96, 9, fill=(.96,.995,1), stroke=WHITE, sw=.7)
    p.rect(438, 470, 56, 54, fill=blend(color, WHITE, .15))
    p.rect(450, 566, 30, 12, fill=(.82,.89,.91))
    p.text(96, 574, theme.upper(), 8.5, "F2", WHITE)
    p.wrap(96, 492, position, 288, 13.6, "F2", WHITE, 19)
    # details
    p.round_rect(54, 116, 240, 278, 16, fill=WHITE, stroke=(0.82,0.90,0.94), sw=.7)
    sensory_chart(p, 78, 308, 184, stages, color)
    p.text(78, 204, "IDEAL APPLICATIONS", 8, "F2", BLUE)
    p.wrap(78, 181, apps, 182, 10.2, "F1", INK, 14)
    p.round_rect(318, 250, 240, 144, 16, fill=(0.988,0.997,1), stroke=(0.82,0.90,0.94), sw=.7)
    p.text(342, 356, "SUGGESTED CLAIMS", 8, "F2", BLUE)
    p.wrap(342, 330, claims, 184, 12.5, "F2", NAVY, 18)
    p.round_rect(318, 116, 240, 110, 16, fill=WHITE, stroke=(0.82,0.90,0.94), sw=.7)
    p.text(342, 190, "TASTING NOTES", 8, "F2", BLUE)
    p.wrap(342, 166, position, 178, 10.2, "F1", INK, 14)
    footer(p, page_no)


def sensory_guide(pdf: PDF):
    p = pdf.page(); section_header(p, "How to Taste Like a Pro", "Sensory Evaluation Guide", "Use a consistent tasting protocol so feedback is comparable, actionable, and connected to launch potential.")
    steps = [
        ("Swish", "Swish 10-15 ml for 10 seconds."),
        ("Notice", "Note aroma, flavor intensity, and cooling effect."),
        ("Evaluate", "Assess aftertaste and duration of freshness."),
        ("Rate", "Score overall liking and purchase intent."),
    ]
    y = 526
    for i, (verb, copy) in enumerate(steps, 1):
        p.round_rect(78, y-18, 456, 70, 16, fill=WHITE, stroke=(0.82,0.90,0.94), sw=.7)
        p.circle(114, y+17, 21, fill=BLUE if i%2 else MINT)
        p.text(114, y+10, str(i), 14, "F2", WHITE, align="center")
        p.text(152, y+25, verb, 14, "F2", NAVY)
        p.text(152, y+5, copy, 10.5, "F1", INK)
        y -= 94
    p.round_rect(120, 112, 372, 70, 16, fill=PALE_MINT, stroke=(0.78,0.90,0.76), sw=.7)
    p.text(306, 148, "Calibrate. Taste. Discuss. Decide.", 14, "F2", NAVY, align="center")
    footer(p, 16)


def feedback(pdf: PDF):
    p = pdf.page(); section_header(p, "Your Feedback", "Collaborative Evaluation", "Capture what works, what can be improved, and which prototypes merit further development.")
    cols = [54, 148, 252, 344, 436, 558]
    headers = ["Flavor", "Overall Liking (1-10)", "Uniqueness", "Purchase Intent", "Comments / Suggested Improvements"]
    p.round_rect(54, 378, 504, 180, 12, fill=WHITE, stroke=(0.75,0.87,0.91), sw=.8)
    p.rect(54, 526, 504, 32, fill=NAVY)
    for x in cols[1:-1]:
        p.line(x, 378, x, 558, color=LINE, sw=.65)
    for yy in [526, 496, 466, 436, 406, 378]:
        p.line(54, yy, 558, yy, color=LINE, sw=.65)
    for i, h in enumerate(headers):
        p.wrap(cols[i]+6, 544, h, cols[i+1]-cols[i]-10, 7.6, "F2", WHITE, 9)
    for r, name in enumerate(["Berry Bliss", "Tropical Oasis", "Crisp Cucumber Mint", "Citrus Ginger Spark", "Dessert Mint Dream"]):
        p.text(62, 508-r*30, name, 8.6, "F1", INK)
    # QR placeholder panel
    p.round_rect(162, 112, 288, 206, 18, fill=WHITE, stroke=(0.78,0.89,0.93), sw=.8)
    p.rect(232, 154, 148, 148, fill=WHITE, stroke=NAVY, sw=1)
    cell = 7.4
    for iy in range(20):
        for ix in range(20):
            finder = (ix < 5 and iy < 5) or (ix > 14 and iy < 5) or (ix < 5 and iy > 14)
            on = finder or ((ix*5 + iy*9 + ix*iy) % 6 in [0, 1])
            if on:
                p.rect(233+ix*cell, 155+iy*cell, cell-.8, cell-.8, fill=NAVY)
    p.text(306, 132, "Scan to Provide Feedback", 14, "F2", BLUE, align="center")
    footer(p, 17)


def back_cover(pdf: PDF):
    p = pdf.page(); paper(p)
    p.rect(0, 0, 306, H, fill=WHITE)
    p.gradient_rect(306, 0, 306, H, (0.0, 0.36, 0.62), MINT, 72, horizontal=False)
    droplet_texture(p, 320, 60, 270, 660, (0.74,0.96,0.93), 36)
    molecule_field(p, 392, 650, 1.12, (0.74,0.96,0.93), 10)
    p.text(54, 684, "Co-Creation &", 26, "F2", NAVY)
    p.text(54, 652, "Next Steps", 26, "F2", NAVY)
    p.rect(54, 626, 98, 2.2, fill=BLUE)
    p.rect(152, 626, 56, 2.2, fill=MINT)
    p.text(54, 575, "We are ready to move fast:", 12.4, "F2", BLUE)
    bullets(p, [
        "Compound larger pilot batches",
        "Conduct formal sensory panels",
        "Develop custom claims and packaging concepts",
        "Scale winning concepts into production",
    ], 72, 532, 202, 11, 30, MINT)
    p.round_rect(54, 154, 210, 110, 16, fill=PALE_BLUE, stroke=(0.76,0.90,0.96), sw=.7)
    p.wrap(75, 220, "Strategic partnership document designed for the future growth of TheraBreath.", 168, 12.2, "F2", NAVY, 18, align="center")
    p.text(459, 520, "Confidential", 24, "F2", WHITE, align="center")
    p.wrap(342, 480, "Prepared exclusively for Church & Dwight / TheraBreath July 2026", 232, 12, "F1", WHITE, 17, align="center")
    p.round_rect(330, 104, 252, 142, 16, fill=(1,1,1), stroke=(0.78,0.96,0.88), sw=.8)
    p.text(456, 214, "The Flavor Factory", 13, "F2", NAVY, align="center")
    p.text(456, 190, "Dan Wixted, President", 9.2, "F2", BLUE, align="center")
    p.text(456, 172, "Ryan Wixted | Alex Wixted | Matt Wixted", 8.8, "F1", INK, align="center")
    p.text(456, 146, "2058 Second Street | Norco, CA 92860", 8.4, "F1", INK, align="center")
    p.text(456, 128, "(951) 273-9877 | www.flavorfactory.net", 8.4, "F1", INK, align="center")
    footer(p, 18)


def build():
    pdf = PDF()
    cover(pdf)
    inside_cover(pdf)
    welcome(pdf)
    toc(pdf)
    partnership(pdf)
    pillar(pdf, 6, "1", "Resiliency & Business Continuity", "We're Built to Scale and Protect Your Supply", "Operational control, supply protection, and disciplined contingency planning for a high-growth oral care platform.", ["Capacity planning and scalability", "Dedicated TheraBreath production room", "Redundancy and risk mitigation", "Quality systems and compliance infrastructure", "Disaster recovery and contingency planning"], "operations")
    pillar(pdf, 7, "2", "Innovation & Technical Capabilities", "Creating the Next Generation of Fresh", "Future-focused sensory innovation supported by flavor creation, consumer learning, and technical development rigor.", ["Flavor creation capabilities and trend identification", "Proactive ideation and new product development", "R&D investment and technology roadmap", "Consumer insights and sensory science resources", "Support for new formats and adjacencies"], "lab")
    pillar(pdf, 8, "3", "Supply Chain & Operations", "Reliable. Scalable. Transparent.", "Operational strength that turns planning, sourcing, production, and communication into dependable service.", ["Current manufacturing footprint and recent investments", "Lead times, OTIF performance, and scalability", "Raw material sourcing strategy and supply security", "Multi-site and geographic coverage"], "operations")
    pillar(pdf, 9, "4", "Partnership & Growth Vision", "Your Strategic Flavor Partner for the Next 5 Years", "Long-term alignment, thoughtful investment, and a clear operating model for supporting TheraBreath growth.", ["Strategic alignment with Church & Dwight's oral care ambitions", "Willingness and ability to invest in the partnership", "Enhanced communication and ways of working", "Vision for supporting TheraBreath growth over the next 3-5 years"], "lab")
    trends(pdf)
    concept(pdf, 11, 1, "Berry Bliss", "Sweet Wild Berry + Cooling Mint Finish", "Playful premium berry freshness", [("Top", "Juicy strawberry & raspberry", .90), ("Heart", "Subtle blueberry roundness", .62), ("Finish", "Signature TFF cooling mint", .78)], "Kids line, gums, lozenges, seasonal promotions", '"Fun, Fresh Breath Kids Love" / "Juicy Freshness That Lasts"', "Approachable, playful, and designed to mask metallic notes while delivering long-lasting freshness.", (0.93,0.22,0.45))
    concept(pdf, 12, 2, "Tropical Oasis", "Mango, Pineapple, Coconut Water + Subtle Mint", "Vacation-inspired freshness", [("Top", "Bright mango & pineapple", .88), ("Heart", "Creamy coconut water", .66), ("Finish", "Gentle mint cooling", .58)], "Summer seasonal, travel sizes, dry-mouth relief", '"Escape to Fresh" / "Bright, Juicy, Island-Inspired Freshness"', "Vacation in a bottle - energizing, juicy, and incredibly refreshing.", (1.0,0.67,0.12))
    concept(pdf, 13, 3, "Crisp Cucumber Mint", "Fresh Cucumber + Cooling Mint Finish", "Spa-like hydration and clean freshness", [("Top", "Crisp watery cucumber", .78), ("Heart", "Light herbal freshness", .54), ("Finish", "Long cooling mint", .86)], "Daily rinse, hydration-focused line, sensitive mouths, sports/performance", '"Cool, Clean Breath That Lasts" / "Hydrating Freshness"', "Crisp, cooling freshness with an ultra-clean mouthfeel and long-lasting coolness.", (0.43,0.76,0.28))
    concept(pdf, 14, 4, "Citrus Ginger Spark", "Bright Lemon-Lime + Ginger Zing + Cooling Mint", "Bright functional energy", [("Top", "Zesty lemon-lime", .92), ("Heart", "Warming ginger kick", .58), ("Finish", "Crisp mint", .70)], "Functional freshness, energizing line, adult trial concepts", '"Spark of Fresh" / "Invigorating Clean with a Gentle Kick"', "Clean, bright, and slightly spicy with a memorable energized finish.", (1.0,0.78,0.13))
    concept(pdf, 15, 5, "Dessert Mint Dream", "Vanilla Bean + Chocolate Mint + Cooling Finish", "Luxury indulgence", [("Top", "Warm vanilla bean", .74), ("Heart", "Hint of chocolate mint", .68), ("Finish", "Sophisticated cooling", .76)], "Premium line, limited edition, adult indulgence", '"Sweet Escape, Clean Finish" / "Guilt-Free Dessert Breath"', "Indulgent yet sophisticated - balancing treat and treatment.", (0.40,0.27,0.21))
    sensory_guide(pdf)
    feedback(pdf)
    back_cover(pdf)
    return pdf


if __name__ == "__main__":
    os.makedirs("dist", exist_ok=True)
    build().write("dist/therabreath_capabilities_workshop_booklet.pdf")
    print("Generated dist/therabreath_capabilities_workshop_booklet.pdf")
