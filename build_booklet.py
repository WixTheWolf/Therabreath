#!/usr/bin/env python3
"""Generate the 18-page The Flavor Factory x TheraBreath workshop booklet.

The output is a vector PDF in US Letter portrait format with a print-first layout.
Headings are assigned to a Montserrat-style bold face and body copy to an
Open-Sans-style clean sans face; the generator uses PDF core sans-serif fonts so
it remains dependency-free in locked-down build environments.
"""
from __future__ import annotations

import math
import os
from dataclasses import dataclass, field
from typing import Iterable, List, Tuple

W, H = 612, 792  # US Letter portrait, 8.5 x 11 inches at 72 points/inch
BLUE = (0.0, 0.639, 0.878)      # #00A3E0
MINT = (0.494, 0.827, 0.129)    # #7ED321
NAVY = (0.035, 0.118, 0.220)    # dark corporate navy
LIGHT_BLUE = (0.875, 0.965, 1.0)
LIGHT_MINT = (0.925, 0.985, 0.895)
GRAY = (0.47, 0.54, 0.61)
PALE = (0.965, 0.985, 0.995)
WHITE = (1, 1, 1)
FOOTER = "Confidential - Prepared exclusively for Church & Dwight / TheraBreath | July 2026"


def clean_text(s: str) -> str:
    return (s.replace("–", "-")
             .replace("—", "-")
             .replace("×", "x")
             .replace("•", "•")
             .replace("“", '"').replace("”", '"')
             .replace("’", "'")
             .replace("…", "..."))


def pdf_literal(s: str) -> str:
    s = clean_text(s)
    # Encode as WinAnsi-compatible text. Keep bullets if possible; fall back cleanly.
    b = s.encode("cp1252", "replace")
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


@dataclass
class Page:
    ops: List[str] = field(default_factory=list)

    def raw(self, s: str) -> None:
        self.ops.append(s)

    def save(self) -> None:
        self.raw("q")

    def restore(self) -> None:
        self.raw("Q")

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
            self.stroke_color(stroke)
            self.line_width(sw)
        op = "B" if fill and stroke else "f" if fill else "S"
        self.raw(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")

    def line(self, x1, y1, x2, y2, color=NAVY, sw=1):
        self.stroke_color(color)
        self.line_width(sw)
        self.raw(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def circle(self, x, y, r, fill=None, stroke=None, sw=1):
        # Bezier circle approximation
        k = 0.5522847498 * r
        if fill:
            self.fill_color(fill)
        if stroke:
            self.stroke_color(stroke); self.line_width(sw)
        self.raw(f"{x+r:.2f} {y:.2f} m {x+r:.2f} {y+k:.2f} {x+k:.2f} {y+r:.2f} {x:.2f} {y+r:.2f} c "
                 f"{x-k:.2f} {y+r:.2f} {x-r:.2f} {y+k:.2f} {x-r:.2f} {y:.2f} c "
                 f"{x-r:.2f} {y-k:.2f} {x-k:.2f} {y-r:.2f} {x:.2f} {y-r:.2f} c "
                 f"{x+k:.2f} {y-r:.2f} {x+r:.2f} {y-k:.2f} {x+r:.2f} {y:.2f} c " +
                 ("B" if fill and stroke else "f" if fill else "S"))

    def text(self, x, y, s, size=12, font="F1", color=NAVY, align="left", leading=None):
        self.fill_color(color)
        s = clean_text(s)
        # Approximate text width for simple alignments.
        width = len(s) * size * (0.54 if font != "F2" else 0.58)
        if align == "center":
            x -= width / 2
        elif align == "right":
            x -= width
        self.raw(f"BT /{font} {size:.2f} Tf {x:.2f} {y:.2f} Td {pdf_literal(s)} Tj ET")

    def wrap(self, x, y, text, max_width, size=11, font="F1", color=NAVY, leading=None):
        if leading is None:
            leading = size * 1.38
        words = clean_text(text).split()
        lines, cur = [], ""
        factor = 0.54 if font != "F2" else 0.58
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
            self.text(x, yy, line, size, font, color)
            yy -= leading
        return yy

    def gradient_rect(self, x, y, w, h, c1, c2, steps=36, horizontal=False):
        for i in range(steps):
            t = i / max(steps - 1, 1)
            c = tuple(c1[j] * (1 - t) + c2[j] * t for j in range(3))
            if horizontal:
                self.rect(x + w * i / steps, y, w / steps + .5, h, fill=c)
            else:
                self.rect(x, y + h * i / steps, w, h / steps + .5, fill=c)


class PDF:
    def __init__(self):
        self.pages: List[Page] = []

    def page(self):
        p = Page(); self.pages.append(p); return p

    def write(self, path):
        objs = []
        def add(obj):
            objs.append(obj); return len(objs)
        font1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        font2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        font3 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>")
        page_ids, content_ids = [], []
        for p in self.pages:
            stream = "\n".join(p.ops).encode("latin1", "replace")
            cid = add(f"<< /Length {len(stream)} >>\nstream\n" + stream.decode("latin1") + "\nendstream")
            content_ids.append(cid)
            page_ids.append(None)
        pages_id_placeholder = len(objs) + len(self.pages) + 1
        for idx, cid in enumerate(content_ids):
            pid = add(f"<< /Type /Page /Parent {pages_id_placeholder} 0 R /MediaBox [0 0 {W} {H}] /Resources << /Font << /F1 {font1} 0 R /F2 {font2} 0 R /F3 {font3} 0 R >> >> /Contents {cid} 0 R >>")
            page_ids[idx] = pid
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


def footer(p: Page, n: int):
    p.rect(54, 34, 252, 1.3, fill=BLUE)
    p.rect(306, 34, 252, 1.3, fill=MINT)
    p.text(54, 18, FOOTER, 6.8, "F1", GRAY)
    p.text(558, 18, str(n), 8.5, "F2", BLUE, align="right")


def accents(p: Page, density=7):
    for i in range(density):
        x = 480 + (i * 37) % 120
        y = 610 - i * 72
        r = 9 + (i % 3) * 4
        p.circle(x, y, r, stroke=(0.80, 0.92, 0.96), sw=.7)
        p.circle(x + r + 14, y + 11, 3.2, fill=(0.80, 0.92, 0.96))
        p.line(x + r*.65, y + r*.65, x + r + 14, y + 11, color=(0.80, 0.92, 0.96), sw=.7)
    for i in range(5):
        x = 38 + i * 42
        y = 640 - i * 96
        p.circle(x, y, 5 + i % 2 * 2, stroke=(0.90, 0.96, 1), sw=.9)
        p.line(x, y - 9, x - 4, y - 19, color=(0.90, 0.96, 1), sw=.7)


def header(p: Page, title: str, kicker: str | None = None):
    accents(p)
    if kicker:
        p.text(54, 724, kicker.upper(), 8.5, "F2", BLUE)
    p.wrap(54, 690, title, 410, 26, "F2", NAVY, 32)
    p.rect(54, 666, 96, 3, fill=BLUE)
    p.rect(150, 666, 70, 3, fill=MINT)


def bullets(p: Page, items: Iterable[str], x: float, y: float, width: float, size=12, gap=23):
    yy = y
    for item in items:
        p.circle(x, yy + 4, 3.4, fill=MINT)
        yy = p.wrap(x + 16, yy, item, width - 20, size, "F1", NAVY, size*1.35)
        yy -= gap - size*1.35
    return yy


def logo_lockup(p: Page, x, y):
    p.text(x, y, "THE FLAVOR", 14, "F2", NAVY)
    p.text(x, y - 16, "FACTORY", 22, "F2", BLUE)
    p.text(x + 116, y - 6, "x", 14, "F2", GRAY)
    p.text(x + 144, y, "Thera", 20, "F2", BLUE)
    p.text(x + 207, y, "Breath", 20, "F2", MINT)
    p.text(x + 144, y - 16, "Church & Dwight", 8, "F1", GRAY)


def concept_page(p: Page, num: int, name: str, tagline: str, profile: str, apps: str, claims: str, notes: str, color, fruit_label: str):
    header(p, name, f"Prototype Concept {num}")
    p.gradient_rect(54, 455, 504, 150, (0.98, 1, 1), color, steps=28, horizontal=True)
    for i in range(9):
        p.circle(95 + i*48, 527 + math.sin(i)*28, 16 + (i%3)*4, fill=(1,1,1), stroke=(0.84,0.92,0.94), sw=1)
    p.text(92, 536, str(num), 56, "F2", WHITE)
    p.text(150, 540, name, 28, "F2", NAVY)
    p.wrap(152, 510, tagline, 330, 13, "F2", WHITE)
    p.text(496, 492, fruit_label, 9, "F2", NAVY, align="center")
    sections = [("Sensory Profile", profile), ("Ideal Applications", apps), ("Suggested Claims", claims), ("Tasting Notes", notes)]
    y = 405
    for label, body in sections:
        p.text(72, y, label.upper(), 9, "F2", BLUE)
        y = p.wrap(72, y - 20, body, 465, 12, "F1", NAVY, 17) - 20
    p.rect(54, 86, 504, 46, fill=PALE, stroke=(0.83, 0.92, 0.95), sw=.8)
    p.text(74, 106, "Workshop prompt:", 10, "F2", NAVY)
    p.text(182, 106, "What role could this profile play in the TheraBreath portfolio?", 10, "F1", NAVY)


def build():
    pdf = PDF()
    # 1 cover
    p = pdf.page()
    p.gradient_rect(0, 0, W, H, (0.0, 0.31, 0.52), BLUE, 54, horizontal=False)
    p.gradient_rect(0, 0, W, 310, (0.0, 0.23, 0.42), (0.35, 0.78, 0.35), 36, horizontal=True)
    for i in range(15):
        p.circle(40 + i*43, 642 - (i%4)*42, 10 + (i%5), stroke=(0.62, 0.90, 0.95), sw=.55)
    # factory entrance banner
    p.rect(62, 300, 488, 220, fill=(0.02,0.19,0.30), stroke=WHITE, sw=1.2)
    p.rect(88, 328, 436, 148, fill=(0.04,0.35,0.50))
    p.rect(116, 356, 180, 88, fill=(0.78,0.93,0.98))
    p.rect(316, 356, 180, 88, fill=(0.70,0.92,0.78))
    p.rect(92, 476, 428, 24, fill=BLUE)
    p.text(306, 482, "THE FLAVOR FACTORY", 15, "F2", WHITE, align="center")
    p.rect(286, 328, 40, 118, fill=(0.01,0.11,0.19))
    p.line(62, 300, 550, 520, color=(0.40,0.83,0.86), sw=1.2)
    p.text(58, 225, "Breath of Innovation:", 34, "F2", WHITE)
    p.text(58, 184, "Scaling Fresh Together", 34, "F2", WHITE)
    p.text(60, 145, "Fresh Futures - New Flavor Concepts for TheraBreath", 18, "F2", MINT)
    p.wrap(60, 112, "The Flavor Factory x Church & Dwight Capabilities Workshop | July 2026 | Norco, California", 500, 11.5, "F1", WHITE, 16)
    for i, c in enumerate([BLUE, MINT, (1,0.55,0.70), (1,0.82,0.22), (0.50,0.85,1)]):
        x=170+i*58
        p.rect(x, 48, 20, 62, fill=(0.93,0.98,1), stroke=WHITE, sw=.5)
        p.rect(x+2, 48, 16, 42, fill=c)
        p.rect(x+4, 110, 12, 10, fill=(0.85,0.9,0.92))
    footer(p, 1)

    # 2 inside cover
    p = pdf.page(); accents(p, 8)
    logo_lockup(p, 54, 690)
    p.text(54, 615, "Welcome to the Capabilities Workshop", 24, "F2", NAVY)
    p.wrap(54, 575, "A focused, hands-on session designed to align operational excellence, flavor innovation, and the next generation of TheraBreath fresh-breath experiences.", 220, 12.5, "F1", NAVY, 18)
    p.rect(54, 470, 214, 68, fill=LIGHT_MINT, stroke=(0.80,0.91,0.74), sw=.8)
    p.text(74, 510, "Fresh thinking.", 17, "F2", BLUE)
    p.text(74, 488, "Disciplined execution.", 17, "F2", MINT)
    # pseudo photo lab
    p.rect(306, 118, 252, 536, fill=(0.88,0.96,0.99), stroke=(0.73,0.88,0.93), sw=1)
    p.gradient_rect(306, 118, 252, 536, (0.88,0.96,0.99), (0.58,0.89,0.79), 40, horizontal=False)
    p.rect(326, 158, 212, 110, fill=WHITE)
    for i, c in enumerate([BLUE, MINT, (1,0.48,0.56), (1,0.75,0.20), (0.59,0.42,0.91), (0.22,0.85,0.92)]):
        x=344+i*30
        p.rect(x, 184, 16, 54, fill=(0.96,0.99,1), stroke=(0.70,0.83,0.88), sw=.5)
        p.rect(x+2, 184, 12, 32+i%3*6, fill=c)
        p.circle(x+8, 250, 7, fill=c)
    for x in [358, 430, 500]:
        p.circle(x, 390, 24, fill=(0.99,0.80,0.65), stroke=WHITE, sw=1)
        p.rect(x-20, 322, 40, 52, fill=WHITE, stroke=(0.75,0.88,0.90), sw=.8)
        p.line(x-16, 350, x+16, 350, color=BLUE, sw=2)
    p.rect(326, 574, 212, 52, fill=(1,1,1))
    p.text(432, 604, "Modern sensory tasting lab", 12, "F2", NAVY, align="center")
    p.text(432, 586, "Colorful samples. Expert panels. Clear decisions.", 8.2, "F1", GRAY, align="center")
    footer(p, 2)

    # 3 welcome
    p = pdf.page(); header(p, "Dear TheraBreath Team,")
    body = [
        "Thank you for joining us at The Flavor Factory for this capabilities review. As your long-standing flavor partner, we are excited to share not only our current capabilities but a bold vision for the future of fresh breath.",
        "This booklet highlights five new prototype concepts developed specifically for your growth trajectory. Each was crafted in our labs with your core values - clean, effective, and sensorially superior - in mind.",
        "We look forward to your candid feedback and to co-creating the next chapter of TheraBreath innovation together.",
    ]
    y=588
    for para in body:
        y = p.wrap(72, y, para, 455, 13, "F1", NAVY, 20) - 20
    p.text(72, y-8, "Sincerely,", 12, "F1", NAVY)
    p.text(72, y-42, "Dan Wixted", 18, "F2", BLUE)
    p.text(72, y-60, "President, The Flavor Factory", 11, "F1", GRAY)
    footer(p, 3)

    # 4 toc
    p = pdf.page(); header(p, "Table of Contents")
    toc = [
        ("1. Our Partnership with TheraBreath", "5"),
        ("2. The 4 Pillars of Capabilities", "6-9"),
        ("3. Flavor Trends Shaping Oral Care", "10"),
        ("4. New Prototype Concepts", "11-15"),
        ("   Berry Bliss", "11"),
        ("   Tropical Oasis", "12"),
        ("   Crisp Cucumber Mint", "13"),
        ("   Citrus Ginger Spark", "14"),
        ("   Dessert Mint Dream", "15"),
        ("5. Sensory Evaluation Guide", "16"),
        ("6. Your Feedback & Scoring", "17"),
        ("7. Co-Creation & Next Steps", "18"),
    ]
    y=604
    for label, pg in toc:
        size = 12 if not label.startswith("   ") else 10
        font = "F2" if not label.startswith("   ") else "F1"
        p.text(78, y, label, size, font, NAVY)
        p.line(300, y+3, 500, y+3, color=(0.80,0.88,0.91), sw=.7)
        p.text(524, y, pg, size, "F2", BLUE, align="right")
        y -= 32 if not label.startswith("   ") else 22
    footer(p, 4)

    # 5 partnership
    p = pdf.page(); header(p, "A Proven Partnership Built on Trust", "Our Partnership")
    bullets(p, ["Multi-year collaboration delivering exceptional quality", "Dedicated TheraBreath production room", "Consistent 99%+ OTIF performance", "Significant volume growth year-over-year", "Trusted partner for core mint portfolio"], 82, 570, 430, 13)
    p.rect(74, 178, 464, 94, fill=LIGHT_BLUE, stroke=(0.77,0.90,0.96), sw=.8)
    p.wrap(96, 232, "We view TheraBreath as more than a customer - you are a strategic growth partner.", 420, 17, "F2", NAVY, 24)
    footer(p, 5)

    pillar_data = [
        ("1. Resiliency & Business Continuity", "We're Built to Scale and Protect Your Supply", ["Capacity planning and ability to scale", "Dedicated TheraBreath production room", "Redundancy and risk mitigation (equipment, raw materials, personnel)", "Quality systems and compliance infrastructure", "Disaster recovery and contingency planning"]),
        ("2. Innovation & Technical Capabilities", "Creating the Next Generation of Fresh", ["Flavor creation capabilities and trend identification", "Proactive ideation and new product development", "R&D investment and technology roadmap", "Consumer insights and sensory science resources", "Support for new formats and adjacencies"]),
        ("3. Supply Chain & Operations", "Reliable. Scalable. Transparent.", ["Current manufacturing footprint and recent investments", "Lead times, OTIF performance, and scalability", "Raw material sourcing strategy and supply security", "Multi-site and geographic coverage"]),
        ("4. Partnership & Growth Vision", "Your Strategic Flavor Partner for the Next 5 Years", ["Strategic alignment with Church & Dwight's oral care ambitions", "Willingness and ability to invest in the partnership", "Enhanced communication and ways of working", "Vision for supporting TheraBreath's growth over the next 3-5 years"]),
    ]
    for idx, (title, sub, items) in enumerate(pillar_data, 6):
        p = pdf.page(); header(p, title, "Capabilities Pillar")
        p.text(72, 610, sub, 17, "F2", BLUE)
        p.rect(72, 565, 468, 1, fill=(0.82,0.91,0.94))
        bullets(p, items, 90, 516, 410, 12.5)
        for i in range(4):
            p.circle(92+i*120, 168, 34, stroke=BLUE if i%2==0 else MINT, sw=2)
            p.text(92+i*120, 163, f"0{i+1}", 14, "F2", NAVY, align="center")
        footer(p, idx)

    # 10 trends
    p = pdf.page(); header(p, "Flavor Trends Shaping Oral Care")
    trends=["Functional + sensory pleasure (wellness + freshness)", "Beyond mint: dessert, tropical, herbal-calming", "Clean-label, natural-forward profiles", "Kid-friendly & adult indulgence options", "Seasonal & limited-edition excitement"]
    y=565
    for i,t in enumerate(trends):
        p.rect(74, y-14, 464, 48, fill=WHITE if i%2 else PALE, stroke=(0.86,0.93,0.95), sw=.8)
        p.circle(100, y+10, 13, fill=BLUE if i%2 else MINT)
        p.text(100, y+5, str(i+1), 10, "F2", WHITE, align="center")
        p.text(126, y+5, t, 12.5, "F2", NAVY)
        y-=72
    footer(p, 10)

    concepts=[
        (1,"Berry Bliss","Sweet wild berry + cooling mint finish","Top - Juicy strawberry & raspberry; Heart - Subtle blueberry; Finish - Signature TFF cooling mint","Kids line, gums, lozenges, seasonal promotions",'"Fun, Fresh Breath Kids Love"  "Juicy Freshness That Lasts"',"Approachable, playful, and perfectly masks any metallic notes while delivering long-lasting freshness.",(0.98,0.38,0.58),"berry"),
        (2,"Tropical Oasis","Mango, pineapple, coconut water + subtle mint","Top - Bright mango & pineapple; Heart - Creamy coconut water; Finish - Gentle mint cooling","Summer seasonal, travel sizes, dry-mouth relief",'"Escape to Fresh"  "Bright, Juicy, Island-Inspired Freshness"',"Vacation in a bottle - energizing yet gentle and incredibly refreshing.",(1.0,0.70,0.18),"tropical"),
        (3,"Crisp Cucumber Mint","Fresh cucumber + cooling mint finish","Top - Crisp, watery cucumber; Heart - Light herbal freshness; Finish - Signature TFF cooling mint","Daily rinse, hydration-focused line, sensitive mouths, sports/performance",'"Cool, Clean Breath That Lasts"  "Hydrating Freshness"',"Crisp, spa-like freshness that delivers an ultra-clean mouthfeel and long-lasting coolness.",(0.50,0.82,0.30),"cucumber"),
        (4,"Citrus Ginger Spark","Bright lemon-lime + ginger zing + cooling mint","Top - Zesty lemon-lime; Heart - Warming ginger kick; Finish - Crisp mint","Functional (digestion + breath), energizing line",'"Spark of Fresh"  "Invigorating Clean with a Gentle Kick"',"Clean, bright, and slightly spicy - leaves a memorable, energized mouthfeel.",(1.0,0.82,0.16),"citrus"),
        (5,"Dessert Mint Dream","Vanilla bean + chocolate mint + cooling finish","Top - Warm vanilla bean; Heart - Hint of chocolate mint; Finish - Signature cooling","Premium line, limited edition, adult indulgence",'"Sweet Escape, Clean Finish"  "Guilt-Free Dessert Breath"',"Indulgent yet sophisticated - the perfect balance of treat and treatment.",(0.58,0.40,0.30),"dessert"),
    ]
    for i,c in enumerate(concepts, 11):
        p=pdf.page(); concept_page(p,*c); footer(p,i)

    # 16 guide
    p=pdf.page(); header(p,"How to Taste Like a Pro", "Sensory Evaluation Guide")
    steps=["Swish 10-15 ml for 10 seconds","Note initial aroma, flavor intensity, cooling effect","Evaluate aftertaste & duration of freshness","Rate overall liking and purchase intent"]
    y=570
    for i, st in enumerate(steps,1):
        p.circle(96,y+2,22,fill=BLUE if i%2 else MINT)
        p.text(96,y-4,str(i),17,"F2",WHITE,align="center")
        p.text(135,y-4,st,15,"F2",NAVY)
        p.line(96,y-24,96,y-62,color=(0.82,0.90,0.93),sw=1)
        y-=102
    footer(p,16)

    # 17 feedback
    p=pdf.page(); header(p,"PAGE 17 - Your Feedback")
    cols=[54,145,245,340,435,558]
    headers=["Flavor","Overall Liking (1-10)","Uniqueness","Purchase Intent","Comments / Suggested Improvements"]
    p.rect(54,445,504,116,fill=WHITE,stroke=(0.72,0.86,0.91),sw=1)
    p.rect(54,535,504,26,fill=BLUE)
    for x in cols[1:-1]: p.line(x,445,x,561,color=(0.72,0.86,0.91),sw=.8)
    for y in [513,491,469,447]: p.line(54,y,558,y,color=(0.86,0.93,0.95),sw=.7)
    for i,h in enumerate(headers):
        p.wrap(cols[i]+5,544,h,cols[i+1]-cols[i]-10,7.5,"F2",WHITE,9)
    for r,name in enumerate(["Berry Bliss","Tropical Oasis","Crisp Cucumber Mint","Citrus Ginger Spark","Dessert Mint Dream"]):
        p.text(60,519-r*22,name,8.5,"F1",NAVY)
    # QR placeholder
    p.rect(212,150,188,188,fill=WHITE,stroke=NAVY,sw=1.2)
    cell=9.4
    for iy in range(20):
        for ix in range(20):
            on = ix in (0,1,2,17,18,19) and iy in (0,1,2,17,18,19) or ((ix*7+iy*11+3)%5==0)
            if on:
                p.rect(214+ix*cell,152+iy*cell,cell-1,cell-1,fill=NAVY)
    p.text(306,118,"Scan to Provide Feedback",13,"F2",BLUE,align="center")
    footer(p,17)

    # 18 co-creation + back cover
    p=pdf.page()
    p.rect(0,0,306,H,fill=WHITE); accents(p,4)
    p.gradient_rect(306,0,306,H,(0.0,0.39,0.68),MINT,54,horizontal=False)
    for i in range(14):
        p.circle(335+(i*41)%230,675-i*45,12+(i%4)*4,stroke=(0.80,1,0.95),sw=.8)
    p.text(54,690,"Co-Creation & Next Steps",25,"F2",NAVY)
    p.rect(54,666,95,3,fill=BLUE); p.rect(149,666,70,3,fill=MINT)
    p.text(54,612,"We are ready to move fast:",14,"F2",BLUE)
    bullets(p,["Compound larger pilot batches","Conduct formal sensory panels with your consumers","Develop custom claims & packaging concepts","Scale winners into full production"],74,560,200,11.2,25)
    p.text(459,510,"Confidential",22,"F2",WHITE,align="center")
    p.wrap(344,475,"Prepared exclusively for Church & Dwight / TheraBreath July 2026",230,12,"F1",WHITE,17)
    p.rect(330,112,252,104,fill=(1,1,1),stroke=(0.78,0.96,0.88),sw=1)
    p.text(456,188,"Dan Wixted, President | Ryan Wixted",9,"F2",NAVY,align="center")
    p.text(456,170,"Alex Wixted | Matt Wixted",9,"F2",NAVY,align="center")
    p.text(456,148,"2058 Second Street, Norco, CA 92860",8.5,"F1",NAVY,align="center")
    p.text(456,130,"(951) 273-9877 | www.flavorfactory.net",8.5,"F1",NAVY,align="center")
    footer(p,18)
    return pdf


if __name__ == "__main__":
    os.makedirs("dist", exist_ok=True)
    build().write("dist/therabreath_capabilities_workshop_booklet.pdf")
    print("Generated dist/therabreath_capabilities_workshop_booklet.pdf")
