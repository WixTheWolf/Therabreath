# Segment start times parsed straight from the locked cut, so every cue is anchored to picture.
import re, os
SRCDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src')


class Cut:
    # one version of the film: segment start times and durations parsed from its SEGS list
    def __init__(self, name):
        txt = open(os.path.join(SRCDIR, name + '.tsx')).read()
        body = txt[txt.index('const SEGS: Seg[] = ['):txt.index('];', txt.index('const SEGS: Seg[] = ['))]
        self.AT, self.DUR, self.ORDER = {}, {}, []
        acc = 0.0
        for m in re.finditer(r'\{ id: "(\w+)", dur: ([\d.]+)', body):
            i, d = m.group(1), float(m.group(2))
            self.AT[i] = round(acc, 4); self.DUR[i] = d; self.ORDER.append(i); acc += d
        self.TOTAL = round(acc, 4)

    def t(self, i, off=0.0): return self.AT[i] + off


def make_warp(A, B, scaled=(), pre=0.6):
    # Map a time on cut A onto cut B. Offsets inside a kept shot are kept (or scaled for shots whose clip speed
    # changed); in a shot's trimmed tail, sounds within `pre` s of the next cut keep their pre-lap; anything else in a
    # removed shot or trimmed tail returns None for a cue start, or the nearest kept boundary for an automation point.
    def nxt(s):
        for n in A.ORDER[A.ORDER.index(s) + 1:]:
            if n in B.AT: return B.AT[n]
        return B.TOTAL
    def w(x, start=False):
        if x < 0: return x
        for s in A.ORDER:
            a, d = A.AT[s], A.DUR[s]
            if x < a + d or s == A.ORDER[-1]:
                o = x - a
                if s not in B.AT:
                    if d - o <= pre: return nxt(s) - (d - o)          # a pre-lap into the next kept shot survives
                    return None if start else nxt(s)
                nd = B.DUR[s]
                if s in scaled: return B.AT[s] + o * nd / d
                if o <= nd: return B.AT[s] + o
                if d - o <= pre: return nxt(s) - (d - o)
                return None if start else B.AT[s] + nd
        return None
    return w


V9 = Cut('FlavorRaceV9')
AT, DUR, ORDER, TOTAL = V9.AT, V9.DUR, V9.ORDER, V9.TOTAL
def t(i, off=0.0): return AT[i] + off
G0 = t('mcwide', 4.3)
if __name__ == '__main__':
    for i in ORDER: print(f"{AT[i]:8.2f}  {i:10s} {DUR[i]:5.2f}")
    print('total', TOTAL)
