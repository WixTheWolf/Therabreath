/*
  The Flavor Playbook: light engine for style frames.
  WebGL2 fullscreen shaders. Two scenes:
    drop     a perfectly clear drop, a beam of light, and the soft spectrum it splits into
    glasses  "The Gap": two glasses of clear rinse, the empty space in one of them glowing
  Everything is lit, nothing is dyed: color only ever comes from light.
*/

const hexToLin = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.pow(v / 255, 2.2));
};

export const THEMES = {
  a: {
    name: 'Laboratory Light',
    bgTop: '#F4F2EE', bgHorizon: '#EFEDE8', bgBottom: '#E7E4DE',
    floor: '#ECE9E3', horizon: '#EFEDE8',
    keyI: 3.4, stripI: 1.2, strip2I: 0.0, topI: 1.4, cardI: 0.62, card: '#16232F',
    beam: '#FFFFFF', focusI: 0.9,
    dropFloor: '#EFEDE8', ambCol: [0.74, 0.74, 0.74], direct: 0.26, shaftR: 1.0e4, shaftI: 0.0, causticGain: 1.0, shadowFloor: 0.06, causticDisp: 4.4,
    glowA: '#FFF1DA', glowB: '#FFFFFF', glowI: 0.10, glowSpill: 0.06, glowFilter: 0.42,
    shadow: 0.14, contact: 0.30, caustic: 0.65, causticCol: '#FFFFFF',
    floorRefl: 0.05, liquidAbs: [0.09, 0.03, 0.02], exposure: 1.0, grain: 1.2,
    halo: [0.14, 0.10, -1.0, 0.10], haloCol: '#FFFFFF',
  },
  b: {
    name: 'After Hours',
    bgTop: '#0D2133', bgHorizon: '#0B1B2B', bgBottom: '#070F18',
    floor: '#08131E', horizon: '#0A1826',
    keyI: 0.9, stripI: 2.2, strip2I: 1.8, topI: 0.9, cardI: 0.0, card: '#000000',
    beam: '#F2FAFF', focusI: 1.6,
    dropFloor: '#5A6B7A', ambCol: [0.010, 0.018, 0.034], direct: 0.70, shaftR: 1.02, shaftI: 0.022, causticGain: 1.25, shadowFloor: 0.0, causticDisp: 2.4,
    glowA: '#BFEFFA', glowB: '#FFFFFF', glowI: 0.42, glowSpill: 0.12,
    shadow: 0.45, contact: 0.55, caustic: 1.2, causticCol: '#CFF4FF',
    floorRefl: 0.38, liquidAbs: [0.12, 0.04, 0.02], exposure: 1.0, grain: 1.6,
    halo: [0.14, 0.08, -1.0, 0.30], haloCol: '#5FAFC4',
  },
};

const VERT = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const COMMON = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime;
uniform vec3 uCamPos; uniform vec3 uCamTarget; uniform float uFov; uniform vec2 uShift;
uniform vec3 uBgTop; uniform vec3 uBgHorizon; uniform vec3 uBgBottom;
uniform float uKeyI; uniform float uStripI; uniform float uStrip2I; uniform float uTopI; uniform float uCardI; uniform vec3 uCard;
uniform float uExposure; uniform float uGrain;
uniform vec4 uHalo; uniform vec3 uHaloCol;
out vec4 fragColor;

vec3 camRay(vec2 fc, out vec3 ro){
  vec2 ndc = fc / uRes * 2.0 - 1.0;
  ndc -= uShift;
  float th = tan(uFov * 0.5);
  float asp = uRes.x / uRes.y;
  vec3 f = normalize(uCamTarget - uCamPos);
  vec3 r = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
  vec3 u = cross(r, f);
  ro = uCamPos;
  return normalize(f + r * ndc.x * th * asp + u * ndc.y * th);
}

// soft rectangular light seen in direction d, centred on c, half size hs (gnomonic units)
float softbox(vec3 d, vec3 c, vec2 hs, float soft){
  float k = dot(d, c); if (k <= 0.0) return 0.0;
  vec3 t1 = normalize(cross(c, abs(c.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
  vec3 t2 = cross(t1, c);
  vec2 q = vec2(dot(d, t1), dot(d, t2)) / k;
  vec2 m = 1.0 - smoothstep(hs - soft, hs + soft, abs(q));
  return m.x * m.y;
}

vec3 env(vec3 d){
  vec3 c = mix(uBgBottom, uBgHorizon, smoothstep(-0.30, 0.0, d.y));
  c = mix(c, uBgTop, smoothstep(0.02, 0.65, d.y));
  // key: a large window above and to the left, on the camera side
  c += uKeyI * softbox(d, normalize(vec3(-0.55, 0.55, 0.65)), vec2(0.34, 0.22), 0.06);
  // strip lights at the sides (rim light in the dark direction)
  c += uStripI * softbox(d, normalize(vec3(0.92, 0.12, 0.18)), vec2(0.07, 0.62), 0.04);
  c += uStrip2I * softbox(d, normalize(vec3(-0.92, 0.10, 0.10)), vec2(0.06, 0.62), 0.04);
  // overhead panel for rim highlights
  c += uTopI * softbox(d, normalize(vec3(0.0, 1.0, 0.25)), vec2(0.55, 0.28), 0.10);
  // black cards: give clear glass its edges on a light set
  float cards = softbox(d, normalize(vec3(-1.0, -0.05, -0.25)), vec2(0.75, 1.3), 0.25)
              + softbox(d, normalize(vec3( 1.0, -0.05, -0.25)), vec2(0.75, 1.3), 0.25);
  cards *= smoothstep(0.66, 0.88, abs(d.x));
  c = mix(c, uCard, clamp(cards, 0.0, 1.0) * uCardI);
  // a soft pool of light on the backdrop, so clear liquid has something to bend
  float ha = max(dot(d, normalize(uHalo.xyz)), 0.0);
  c += uHaloCol * uHalo.w * (pow(ha, 160.0) + 0.35 * pow(ha, 40.0));
  return c;
}

vec3 bump3y(vec3 x, vec3 yo){ vec3 y = vec3(1.0) - x * x; return clamp(y - yo, 0.0, 1.0); }
vec3 spectral(float w){
  float x = clamp(w, 0.0, 1.0);
  const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
  const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
  const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
  const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
  const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
  const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
  return bump3y(c1 * (x - x1), y1) + bump3y(c2 * (x - x2), y2);
}

float fresnel(float cosi, float n1, float n2){
  float r0 = (n1 - n2) / (n1 + n2); r0 *= r0;
  if (n1 > n2) {
    float e = n1 / n2; float s2 = e * e * (1.0 - cosi * cosi);
    if (s2 > 1.0) return 1.0;
    cosi = sqrt(1.0 - s2);
  }
  float x = 1.0 - cosi;
  return r0 + (1.0 - r0) * x * x * x * x * x;
}

float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

vec3 finish(vec3 c, vec2 fc){
  c *= uExposure;
  // soft shoulder only above 0.82, so flat tokens stay exact
  vec3 k = vec3(0.82);
  c = mix(c, k + (1.0 - k) * (1.0 - exp(-(c - k) / (1.0 - k))), step(k, c));
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  c += (hash12(fc + fract(uTime) * 17.0) - 0.5) * uGrain / 255.0;
  return c;
}
`;

const DROP = COMMON + `
uniform mat3 uDropM; uniform float uDropS; uniform vec3 uEta;
uniform vec3 uBeamCol; uniform float uFocusI;
uniform vec3 uL; uniform float uFloorY; uniform vec3 uAlbedo; uniform vec3 uAmbCol; uniform float uDirect; uniform vec3 uHorizon2;
uniform float uRs; uniform float uShaftI; uniform float uLensR; uniform float uCausticGain; uniform float uShadowFloor; uniform float uCausticDisp;

float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
float sdRoundCone(vec3 p, float r1, float r2, float h){
  float b = (r1 - r2) / h; float a = sqrt(1.0 - b * b);
  vec2 q = vec2(length(p.xz), p.y);
  float k = dot(q, vec2(-b, a));
  if (k < 0.0) return length(q) - r1;
  if (k > a * h) return length(q - vec2(0.0, h)) - r2;
  return dot(q, vec2(a, b)) - r1;
}
float sdDrop(vec3 p){
  p = uDropM * p / uDropS;
  vec3 q = p - vec3(0.0, -0.34, 0.0);
  float ds = length(q) - 0.68;
  float dc = sdRoundCone(q, 0.30, 0.03, 1.22);
  float d = smin(ds, dc, 0.55);
  float ang = atan(p.z, p.x);
  d += 0.010 * sin(3.0 * p.y + 2.0 * ang + uTime * 0.9) * smoothstep(-1.0, 0.2, p.y)
     + 0.006 * sin(5.0 * p.y - 3.0 * ang - uTime * 1.3);
  return d * uDropS * 0.92;
}
vec3 nrm(vec3 p){
  const vec2 e = vec2(0.0006, -0.0006);
  return normalize(e.xyy * sdDrop(p + e.xyy) + e.yyx * sdDrop(p + e.yyx) + e.yxy * sdDrop(p + e.yxy) + e.xxx * sdDrop(p + e.xxx));
}
float marchOut(vec3 ro, vec3 rd){
  float t = 0.0;
  for (int i = 0; i < 140; i++) {
    float d = sdDrop(ro + rd * t);
    if (d < 0.0004 + t * 0.00008) return t;
    t += d; if (t > 40.0) break;
  }
  return -1.0;
}
float marchIn(vec3 ro, vec3 rd){
  float t = 0.004;
  for (int i = 0; i < 72; i++) {
    float d = -sdDrop(ro + rd * t);
    if (d < 0.0004) return t;
    t += max(d, 0.0015); if (t > 6.0) break;
  }
  return t;
}
float pick(vec3 v, int ch){ return ch == 0 ? v.r : (ch == 1 ? v.g : v.b); }

// how much of the light reaches floor point p: a pool of light, the drop's shadow,
// and the spectrum-fringed caustic the drop focuses into it (thick lens model, per channel)
float lightAt(vec3 p, int ch){
  float Dc = -uFloorY / (-uL.y);
  vec3 P0 = uL * Dc;
  vec3 v = p - P0;
  vec3 vp = v - uL * dot(v, uL);
  float rho = length(vp);
  float D = Dc + dot(v, uL);
  float n = uEta.g + (pick(uEta, ch) - uEta.g) * uCausticDisp;
  float R = uLensR;
  float f = n * R / (2.0 * (n - 1.0));
  float rdisk = max(R * abs(D - f) / f, 0.03);
  float blur = 0.03 + 0.022 * max(D, 0.0);
  float shaft = 1.0 - smoothstep(uRs - 0.45, uRs + 0.45, rho);
  float sil = (1.0 - smoothstep(R * 0.97 - blur, R * 1.05 + blur, rho)) * step(0.0, D);
  float disk = 1.0 - smoothstep(rdisk - blur, rdisk + blur, rho);
  float gain = min(R * R / (rdisk * rdisk), 7.0) * 0.62;
  float ring = exp(-pow((rho - rdisk * 0.9) / (blur * 1.25), 2.0)) * gain * 0.6;
  float inner = uShadowFloor + (disk * gain + ring) * uCausticGain;
  return shaft * mix(1.0, inner, sil);
}
float floorCh(vec3 p, vec3 rd, int ch){
  float c = pick(uAlbedo, ch) * (pick(uAmbCol, ch) + uDirect * pick(uBeamCol, ch) * lightAt(p, ch));
  float dist = length(p.xz - uCamPos.xz);
  return mix(c, pick(env(vec3(rd.x, 0.0, rd.z)), ch), smoothstep(7.0, 26.0, dist));
}
float bgCh(vec3 ro, vec3 rd, int ch){
  if (rd.y < -1e-4) { float t = (uFloorY - ro.y) / rd.y; if (t > 0.0) return floorCh(ro + rd * t, rd, ch); }
  return pick(env(rd), ch);
}
float floorT(vec3 ro, vec3 rd){ return rd.y < -1e-4 ? (uFloorY - ro.y) / rd.y : 1e9; }

// the visible shaft of light, marched so the floor and the drop occlude it properly:
// white above the drop, the drop's shadow below it, and inside that shadow a converging spectral cone
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float n = dot(i, vec3(1.0, 57.0, 113.0));
  vec4 h = fract(sin(vec4(n, n + 1.0, n + 57.0, n + 58.0)) * 43758.5453);
  vec4 h2 = fract(sin(vec4(n + 113.0, n + 114.0, n + 170.0, n + 171.0)) * 43758.5453);
  vec2 xy = mix(mix(h.xz, h.yw, f.x), mix(h2.xz, h2.yw, f.x), f.z);
  return mix(xy.x, xy.y, f.y);
}
vec3 shaftVol(vec3 ro, vec3 rd, float tmax){
  if (uShaftI <= 0.0) return vec3(0.0);
  vec3 oc = ro - uL * dot(ro, uL); vec3 dc = rd - uL * dot(rd, uL);
  float a = dot(dc, dc), b = dot(oc, dc), c = dot(oc, oc) - uRs * uRs;
  float h = b * b - a * c; if (h < 0.0 || a < 1e-8) return vec3(0.0);
  h = sqrt(h);
  float t0 = max((-b - h) / a, 0.0), t1 = min((-b + h) / a, tmax);
  if (t1 <= t0) return vec3(0.0);
  vec3 acc = vec3(0.0);
  const int N = 32;
  float dt = (t1 - t0) / float(N);
  vec3 f = uEta * uLensR / (2.0 * (uEta - 1.0));
  float Dc = -uFloorY / (-uL.y);
  float jit = hash12(gl_FragCoord.xy);
  for (int i = 0; i < N; i++) {
    float t = t0 + (float(i) + jit) * dt; vec3 p = ro + rd * t;
    float s = dot(p, uL); float d = length(p - uL * s);
    if (p.y < uFloorY) continue;
    vec3 dens = vec3(1.0 - smoothstep(uRs * 0.55, uRs, d));
    if (s > -uLensR * 0.3) {
      float inShadow = 1.0 - smoothstep(uLensR * 0.93, uLensR * 1.07, d);
      vec3 rr = max(uLensR * abs(vec3(s) - f) / f, vec3(0.03));
      vec3 cone = (1.0 - smoothstep(rr * 0.75, rr, vec3(d))) * min(uLensR * uLensR / (rr * rr), vec3(14.0));
      dens = dens * (1.0 - inShadow) + inShadow * cone;
    }
    dens *= smoothstep(-10.0, -4.0, s) * (0.8 + 0.4 * vnoise(p * 2.3 + vec3(0.0, uTime * 0.15, 0.0)));
    acc += dens;
  }
  return acc * dt * uShaftI * uBeamCol;
}

float shadeChannel(vec3 p, vec3 rd, vec3 n, int ch){
  float eta = pick(uEta, ch);
  float col = 0.0;
  float cosi = clamp(-dot(rd, n), 0.0, 1.0);
  float F = fresnel(cosi, 1.0, eta);
  vec3 rr = reflect(rd, n);
  col += F * bgCh(p + n * 0.003, rr, ch);
  vec3 dir = refract(rd, n, 1.0 / eta);
  vec3 q = p - n * 0.003;
  float T = 1.0 - F;
  for (int k = 0; k < 3; k++) {
    float t = marchIn(q, dir);
    vec3 pe = q + dir * t; vec3 ne = nrm(pe);
    // light focused by the drop blooms where it leaves the far side
    col += T * uFocusI * pow(max(dot(ne, uL), 0.0), 18.0) * (0.75 + 0.25 * float(ch));
    vec3 dout = refract(dir, -ne, eta);
    if (dot(dout, dout) < 1e-6) { dir = reflect(dir, -ne); q = pe - ne * 0.003; continue; }
    float ci = clamp(dot(dir, ne), 0.0, 1.0);
    float Fi = fresnel(ci, eta, 1.0);
    vec3 po = pe + ne * 0.003;
    col += T * (1.0 - Fi) * (bgCh(po, dout, ch) + pick(shaftVol(po, dout, floorT(po, dout)), ch));
    T *= Fi; dir = reflect(dir, -ne); q = pe - ne * 0.003;
    if (T < 0.02) break;
  }
  return col;
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec3 ro; vec3 rd = camRay(fc, ro);
  float th = marchOut(ro, rd);
  vec3 col;
  if (th > 0.0) {
    vec3 p = ro + rd * th; vec3 n = nrm(p);
    col = vec3(shadeChannel(p, rd, n, 0), shadeChannel(p, rd, n, 1), shadeChannel(p, rd, n, 2));
    col += shaftVol(ro, rd, th);
  } else {
    col = vec3(bgCh(ro, rd, 0), bgCh(ro, rd, 1), bgCh(ro, rd, 2)) + shaftVol(ro, rd, floorT(ro, rd));
  }
  fragColor = vec4(finish(col, fc), 1.0);
}
`;

const GLASSES = COMMON + `
uniform vec2 uCx; uniform vec2 uLevel; uniform float uRo; uniform float uRi; uniform float uB; uniform float uH;
uniform vec3 uIorG; uniform vec3 uIorL; uniform vec3 uFloor; uniform vec3 uHorizon;
uniform float uShadow; uniform float uContact; uniform float uCaustic; uniform vec3 uCausticCol;
uniform float uFloorRefl; uniform vec3 uLiqAbs; uniform vec3 uGlowA; uniform vec3 uGlowB; uniform float uGlowI; uniform float uGlowSpill;
uniform float uGlowOn; uniform vec3 uLight; uniform float uGlowFilter;

float cxOf(int g){ return g == 0 ? uCx.x : uCx.y; }
float pick3(vec3 v, int ch){ return ch == 0 ? v.r : (ch == 1 ? v.g : v.b); }
float lvOf(int g){ return g == 0 ? uLevel.x : uLevel.y; }

// 0 outside air, 1 glass, 2 liquid, 3 air inside glass 0, 4 air inside glass 1
int medium(vec3 p){
  for (int g = 0; g < 2; g++) {
    float r = length(p.xz - vec2(cxOf(g), 0.0));
    if (p.y >= 0.0 && p.y <= uH && r <= uRo) {
      if (r < uRi && p.y > uB) { if (p.y < lvOf(g)) return 2; return 3 + g; }
      return 1;
    }
  }
  return 0;
}
float iorOf(int m, int ch){
  if (m == 1) return ch == 0 ? uIorG.r : (ch == 1 ? uIorG.g : uIorG.b);
  if (m == 2) return ch == 0 ? uIorL.r : (ch == 1 ? uIorL.g : uIorL.b);
  return 1.0;
}
void hitCyl(vec3 ro, vec3 rd, float cx, float R, float y0, float y1, inout float tb, inout vec3 nb){
  vec2 o = ro.xz - vec2(cx, 0.0); vec2 d = rd.xz;
  float a = dot(d, d); if (a < 1e-9) return;
  float b = dot(o, d); float c = dot(o, o) - R * R;
  float h = b * b - a * c; if (h < 0.0) return;
  h = sqrt(h);
  float ts[2]; ts[0] = (-b - h) / a; ts[1] = (-b + h) / a;
  for (int i = 0; i < 2; i++) {
    float t = ts[i];
    if (t > 1e-4 && t < tb) {
      float y = ro.y + rd.y * t;
      if (y >= y0 && y <= y1) { tb = t; vec3 p = ro + rd * t; nb = normalize(vec3(p.x - cx, 0.0, p.z)); }
    }
  }
}
void hitDisk(vec3 ro, vec3 rd, float cx, float y, float r0, float r1, inout float tb, inout vec3 nb){
  if (abs(rd.y) < 1e-7) return;
  float t = (y - ro.y) / rd.y;
  if (t <= 1e-4 || t >= tb) return;
  vec3 p = ro + rd * t; float r = length(p.xz - vec2(cx, 0.0));
  if (r < r0 || r > r1) return;
  tb = t; nb = vec3(0.0, 1.0, 0.0);
}

vec3 floorShade(vec3 p, int ch){
  vec3 c = uFloor;
  vec2 sdir = -normalize(uLight.xz);
  float slen = uH * length(uLight.xz) / uLight.y;
  float shift = (float(ch) - 1.0) * 0.035;
  for (int g = 0; g < 2; g++) {
    vec2 q = p.xz - vec2(cxOf(g), 0.0);
    float along = dot(q, sdir); float perp = dot(q, vec2(-sdir.y, sdir.x));
    float a = clamp(along, 0.0, slen);
    float dcap = length(q - sdir * a) - uRo * (1.0 + 0.18 * a / slen);
    float soft = 0.04 + 0.30 * (a / slen);
    float sh = 1.0 - smoothstep(-soft, soft, dcap);
    float contact = 1.0 - smoothstep(0.0, 0.16, length(q) - uRo);
    c *= 1.0 - uShadow * sh * (0.55 + 0.45 * (1.0 - a / slen)) - uContact * contact * 0.6;
    float lv = lvOf(g);
    float cs = slen * (uB / uH), ce = slen * (lv / uH);
    float inC = smoothstep(cs - 0.08, cs + 0.12, along) * (1.0 - smoothstep(ce - 0.25, ce + 0.10, along));
    float w = 0.045 + 0.09 * (along / slen);
    float core = exp(-pow((perp + shift) / w, 2.0));
    float ring = exp(-pow((abs(perp + shift) - uRo * 0.72) / (w * 0.7), 2.0)) * 0.30;
    c += uCausticCol * uCaustic * inC * (core + ring) * sh * (0.6 + 0.4 * sin(along * 9.0 + perp * 5.0 + uTime) * 0.5 + 0.2);
  }
  // the glow in the second glass spills a little light onto the table
  c += uGlowA * uGlowSpill * uGlowOn * exp(-pow(length(p.xz - vec2(uCx.y, 0.0)) / 0.95, 2.0));
  float dist = length(p.xz - uCamPos.xz);
  vec3 hz = env(normalize(vec3(p.x - uCamPos.x, 0.0, p.z - uCamPos.z)));
  return mix(c, hz, smoothstep(6.0, 22.0, dist));
}

vec3 glowSeg(vec3 ro, vec3 rd, float t){
  // emission of the empty space in glass 1, integrated along the segment
  vec3 m = ro + rd * (t * 0.5);
  float lv = uLevel.y;
  float h = clamp((m.y - lv) / (uH - lv), 0.0, 1.0);
  float dens = (0.55 + 0.45 * (1.0 - h)) * (1.0 - smoothstep(0.82, 1.0, h));
  // the empty space holds the spectrum: soft, drifting bands of refracted colour
  float ph = h * 1.15 + (m.x - uCx.y) * 0.55 + m.z * 0.35 + uTime * 0.06;
  vec3 sp = spectral(fract(ph)) * 0.8 + spectral(fract(ph * 0.5 + 0.37)) * 0.35;
  vec3 gc = mix(uGlowA, sp, 0.62) + uGlowB * 0.25;
  return gc * dens * t * uGlowI * uGlowOn;
}

float trace(vec3 ro, vec3 rd, int ch){
  vec3 col = vec3(0.0); float T = 1.0;
  int med = medium(ro);
  for (int i = 0; i < 14; i++) {
    float tb = 1e9; vec3 nb = vec3(0.0); bool isFloor = false;
    for (int g = 0; g < 2; g++) {
      float cx = cxOf(g); float lv = lvOf(g);
      hitCyl(ro, rd, cx, uRo, 0.0, uH, tb, nb);
      hitCyl(ro, rd, cx, uRi, uB, uH, tb, nb);
      hitDisk(ro, rd, cx, uB, 0.0, uRi, tb, nb);
      hitDisk(ro, rd, cx, uH, uRi, uRo, tb, nb);
      if (lv > uB + 0.001) hitDisk(ro, rd, cx, lv, 0.0, uRi, tb, nb);
    }
    if (rd.y < -1e-6) { float tf = -ro.y / rd.y; if (tf > 1e-4 && tf < tb) { tb = tf; nb = vec3(0.0, 1.0, 0.0); isFloor = true; } }
    if (tb > 1e8) { col += T * env(rd); break; }
    vec3 p = ro + rd * tb;
    float absorb = ch == 0 ? uLiqAbs.r : (ch == 1 ? uLiqAbs.g : uLiqAbs.b);
    if (med == 2) T *= exp(-absorb * tb);
    if (med == 4) {
      vec3 gl = glowSeg(ro, rd, tb); col += T * gl;
      // dichroic: the space filters the light behind it into shifting spectral colour
      vec3 m = ro + rd * (tb * 0.5);
      float hh = clamp((m.y - uLevel.y) / (uH - uLevel.y), 0.0, 1.0);
      float ph = hh * 0.85 + (m.x - uCx.y) * 0.42 + m.z * 0.30 + uTime * 0.06;
      vec3 sp = spectral(fract(ph)) + 0.5 * spectral(fract(ph * 0.5 + 0.37));
      sp = mix(vec3(1.0), sp / max(max(sp.r, sp.g), max(sp.b, 1e-3)), 0.75);
      float fade = (1.0 - smoothstep(0.80, 1.0, hh));
      T *= mix(1.0, pick3(sp, ch), uGlowFilter * uGlowOn * fade * min(tb * 1.4, 1.0));
    }
    if (isFloor) {
      vec3 fcol = floorShade(p, ch);
      float fr = uFloorRefl * (0.35 + 0.65 * pow(1.0 - abs(rd.y), 5.0));
      col += T * fcol * (1.0 - fr);
      T *= fr; if (T < 0.01) break;
      rd = reflect(rd, vec3(0.0, 1.0, 0.0)); ro = p + rd * 1e-3; med = medium(ro);
      continue;
    }
    vec3 n = nb; if (dot(n, rd) > 0.0) n = -n;
    int nxt = medium(p + rd * 2e-3);
    float n1 = iorOf(med, ch), n2 = iorOf(nxt, ch);
    if (abs(n1 - n2) < 1e-5) { ro = p + rd * 2e-3; med = nxt; continue; }
    float cosi = clamp(-dot(rd, n), 0.0, 1.0);
    float F = fresnel(cosi, n1, n2);
    if (i < 4) col += T * F * env(reflect(rd, n));
    vec3 rt = refract(rd, n, n1 / n2);
    if (dot(rt, rt) < 1e-6) { rd = reflect(rd, n); ro = p + rd * 2e-3; }
    else { T *= (1.0 - F); rd = rt; ro = p + rd * 2e-3; med = nxt; }
    if (T < 0.01) break;
  }
  return ch == 0 ? col.r : (ch == 1 ? col.g : col.b);
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec3 ro; vec3 rd = camRay(fc, ro);
  vec3 col = vec3(trace(ro, rd, 0), trace(ro, rd, 1), trace(ro, rd, 2));
  fragColor = vec4(finish(col, fc), 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    throw new Error('shader: ' + log);
  }
  return s;
}

const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export function createLight(canvas, cfg) {
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: false });
  if (!gl) throw new Error('WebGL2 unavailable');
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, cfg.scene === 'glasses' ? GLASSES : DROP));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const f1 = (n, v) => { const l = U(n); if (l) gl.uniform1f(l, v); };
  const f2 = (n, v) => { const l = U(n); if (l) gl.uniform2fv(l, v); };
  const f3 = (n, v) => { const l = U(n); if (l) gl.uniform3fv(l, v); };
  const m3 = (n, v) => { const l = U(n); if (l) gl.uniformMatrix3fv(l, false, v); };

  const th = THEMES[cfg.theme || 'a'];
  const cam = Object.assign({ pos: [0, 0, 7.5], target: [0, 0, 0], fov: 26, shift: [0, 0] }, cfg.camera || {});

  function setStatic() {
    f2('uRes', [canvas.width, canvas.height]);
    f3('uCamPos', cam.pos); f3('uCamTarget', cam.target); f1('uFov', cam.fov * Math.PI / 180); f2('uShift', cam.shift);
    f3('uBgTop', hexToLin(th.bgTop)); f3('uBgHorizon', hexToLin(th.bgHorizon)); f3('uBgBottom', hexToLin(th.bgBottom));
    f1('uKeyI', th.keyI); f1('uStripI', th.stripI); f1('uStrip2I', th.strip2I); f1('uTopI', th.topI); f1('uCardI', th.cardI); f3('uCard', hexToLin(th.card));
    f1('uExposure', th.exposure); f1('uGrain', th.grain);
    const halo = cfg.scene === 'glasses' ? (th.halo || [0, 0, 0, 0]) : [0, 0, -1, 0];
    { const l = U('uHalo'); if (l) gl.uniform4fv(l, halo); }
    f3('uHaloCol', hexToLin(th.haloCol || '#000000'));
    if (cfg.scene === 'glasses') {
      const g = Object.assign({ cx: [-0.95, 0.95], fill: [0.65, 0.14], ro: 0.62, ri: 0.565, b: 0.2, h: 2.3 }, cfg.glasses || {});
      f2('uCx', g.cx); f1('uRo', g.ro); f1('uRi', g.ri); f1('uB', g.b); f1('uH', g.h);
      f3('uIorG', [1.492, 1.505, 1.522]); f3('uIorL', [1.329, 1.334, 1.341]);
      f3('uFloor', hexToLin(th.floor)); f3('uHorizon', hexToLin(th.horizon));
      f1('uShadow', th.shadow); f1('uContact', th.contact); f1('uCaustic', th.caustic); f3('uCausticCol', hexToLin(th.causticCol));
      f1('uFloorRefl', th.floorRefl); f3('uLiqAbs', th.liquidAbs);
      f3('uGlowA', hexToLin(th.glowA)); f3('uGlowB', hexToLin(th.glowB)); f1('uGlowI', th.glowI); f1('uGlowSpill', th.glowSpill);
      f3('uLight', norm([-0.55, 0.78, 0.30])); f1('uGlowFilter', th.glowFilter || 0);
      state.glass = g;
    } else {
      f3('uBeamCol', hexToLin(th.beam)); f1('uFocusI', th.focusI);
      f3('uEta', [1.318, 1.333, 1.352]);
      f3('uL', norm(cfg.light || [0.36, -0.90, 0.25]));
      f1('uFloorY', cfg.floorY ?? -1.62);
      const alb = hexToLin(th.dropFloor), amb = th.ambCol;
      f3('uAlbedo', alb.map((v, i) => v / (amb[i] + th.direct)));
      f3('uAmbCol', amb); f1('uDirect', th.direct); f3('uHorizon2', hexToLin(th.horizon));
      f1('uRs', th.shaftR); f1('uShaftI', th.shaftI); f1('uLensR', 0.66 * (cfg.dropScale || 1.0));
      f1('uCausticGain', th.causticGain); f1('uShadowFloor', th.shadowFloor); f1('uCausticDisp', th.causticDisp);
      f1('uDropS', cfg.dropScale || 1.0);
    }
  }
  const state = {};

  function render(time = 0, opts = {}) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    f1('uTime', time);
    if (cfg.scene === 'glasses') {
      const g = state.glass; const fill = opts.fill || g.fill;
      f2('uLevel', [g.b + fill[0] * (g.h - g.b), g.b + fill[1] * (g.h - g.b)]);
      f1('uGlowOn', opts.glow ?? 1.0);
    } else {
      const a = (opts.rot ?? time * 0.18), tilt = cfg.tilt ?? 0.14;
      const c = Math.cos(a), s = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt);
      // object space = rotY(a) * rotZ(tilt): matrices in column major order for GLSL
      const rz = [ct, -st, 0, st, ct, 0, 0, 0, 1];
      const ry = [c, 0, s, 0, 1, 0, -s, 0, c];
      const mul = (A, B) => { const r = new Array(9).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[j * 3 + i] += A[k * 3 + i] * B[j * 3 + k]; return r; };
      m3('uDropM', mul(ry, rz));
    }
    const strips = opts.strips || 12;
    gl.enable(gl.SCISSOR_TEST);
    const hh = Math.ceil(canvas.height / strips);
    for (let i = 0; i < strips; i++) {
      gl.scissor(0, i * hh, canvas.width, hh);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.finish();
    }
    gl.disable(gl.SCISSOR_TEST);
  }

  // world point to CSS pixels (top left origin), matching the shader camera
  function project(P, cssW = canvas.clientWidth || canvas.width, cssH = canvas.clientHeight || canvas.height) {
    const f = norm(sub(cam.target, cam.pos));
    const r = norm(cross(f, [0, 1, 0]));
    const u = cross(r, f);
    const d = sub(P, cam.pos);
    const x = dot(d, r), y = dot(d, u), z = dot(d, f);
    const tf = Math.tan(cam.fov * Math.PI / 360), asp = canvas.width / canvas.height;
    const nx = x / (z * tf * asp) + cam.shift[0], ny = y / (z * tf) + cam.shift[1];
    return [(nx + 1) / 2 * cssW, (1 - (ny + 1) / 2) * cssH];
  }

  setStatic();
  return { render, project, gl };
}
