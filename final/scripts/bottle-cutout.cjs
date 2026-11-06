// Cuts each product photo down to the bottle alone, on a transparent background. The bottle is symmetric: the cap gives its middle, the
// left edge above and below the label gives its width, and that outline is mirrored to the right. Everything outside
// it (the panels, leaves and props beside the bottle) goes transparent. Labels are white too, so through the label
// the outline keeps the body's full width. Made the photos in public/img/bottles for slide 3 (src/lib/ourFlavors.ts).
// Usage: node scripts/bottle-cutout.cjs <photoDir> <outDir> <file> [<file> ...]
const sharp = require('sharp'); const path = require('path');
const [inDir, outDir, ...files] = process.argv.slice(2);
const white = (d, i) => Math.min(d[i], d[i + 1], d[i + 2]) > 232;
(async () => {
  for (const f of files) {
    const { data: d, info } = await sharp(path.join(inDir, f)).rotate().flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, px = (x, y) => (y * W + x) * 3;
    const first = (y, x0, x1) => { for (let x = x0; x < x1; x++) if (!white(d, px(x, y))) return x; return -1; };
    let top = 0; while (top < H && first(top, 0, W) < 0) top++;
    const yc = top + Math.round(H * 0.012); const l0 = first(yc, 0, W); let r0 = l0; while (r0 < W && !white(d, px(r0, yc))) r0++;
    const cx = Math.round((l0 + r0) / 2);
    const left = new Array(H).fill(-1); for (let y = top; y < H; y++) left[y] = first(y, 0, cx);
    // the body's left edge: the smallest edge that a good share of rows sit on (props make scattered smaller ones)
    const tol = Math.round(W * 0.012), vals = left.filter((v) => v >= 0).sort((a, b) => a - b);
    let bodyLeft = vals[0];
    for (const L of vals) { const n = vals.filter((v) => v >= L && v <= L + tol); if (n.length >= vals.length * 0.06) { bodyLeft = n[Math.floor(n.length / 2)]; break; } }
    const body = cx - bodyLeft, lim = Math.round(body * 1.03);
    const onBody = (y) => left[y] >= 0 && Math.abs(left[y] - bodyLeft) <= tol;
    let sEnd = top; while (sEnd < H && !onBody(sEnd)) sEnd++;
    let bStart = H - 1; while (bStart > sEnd && !onBody(bStart)) bStart--;
    let bottom = bStart; for (let y = bStart; y < H; y++) if (first(y, Math.max(0, cx - lim), cx) >= 0) bottom = y;
    const hw = new Array(H).fill(0);
    for (let y = top; y <= bottom; y++) {
      if (y < sEnd) hw[y] = left[y] >= 0 ? cx - left[y] : 0;
      else if (y <= bStart) hw[y] = body;
      else { const l = first(y, Math.max(0, cx - lim), cx); hw[y] = l >= 0 ? Math.min(body, cx - l) : 0; }
    }
    const sm = hw.map((_, y) => { let m = 0; for (let k = -6; k <= 6; k++) m = Math.max(m, hw[y + k] || 0); return y < top || y > bottom ? 0 : Math.min(m, lim); });
    // transparent outside the outline; above and below the label, also the white between the outline and the bottle's
    // colored edge (the cap and shoulders curve inside it). Through the label the outline is the edge.
    const a = Buffer.alloc(W * H, 0);
    for (let y = top; y <= bottom; y++) {
      if (!sm[y]) continue;
      let x0 = cx - sm[y], x1 = cx + sm[y];
      if (y < sEnd || y > bStart) { while (x0 < cx && white(d, px(x0, y))) x0++; while (x1 > cx && white(d, px(x1, y))) x1--; }
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) a[y * W + x] = 255;
    }
    const rgba = Buffer.alloc(W * H * 4); for (let k = 0; k < W * H; k++) { rgba[k * 4] = d[k * 3]; rgba[k * 4 + 1] = d[k * 3 + 1]; rgba[k * 4 + 2] = d[k * 3 + 2]; rgba[k * 4 + 3] = a[k]; }
    const pad = Math.round(body * 0.06);
    const x0 = Math.max(0, cx - lim - pad), width = Math.min(W - x0, 2 * (lim + pad)), t = Math.max(0, top - pad), h = Math.min(H - t, bottom - top + 2 * pad);
    const out = path.join(outDir, f.replace(/\.(jpg|png)$/, '.webp'));
    await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract({ left: x0, top: t, width, height: h }).resize({ height: 640 }).webp({ quality: 86, alphaQuality: 100 }).toFile(out);
    console.log(f, 'cx', cx, 'body', body, 'shoulder', sEnd, 'label to', bStart, 'bottom', bottom);
  }
})();
