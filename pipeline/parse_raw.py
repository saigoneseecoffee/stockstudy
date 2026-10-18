#!/usr/bin/env python3
"""Parse raw WebFetch answers (raw/S_*, F_*, E_*, H_*) into universe data files."""
import json, os, re, csv, math
R = 'raw'
jobs = json.load(open('jobs/all.json'))

def num(v, kind=None):
    """'1,612.23T' -> float in units; '12.3%' -> 12.3; '$43.55' -> 43.55; n/a -> None"""
    if v is None: return None
    v = str(v).strip().replace('−', '-')
    if not v or v.lower() in ('n/a', 'na', '-', '—', 'upgrade', 'none', 'null'): return None
    v = v.replace('$', '').replace('%', '').replace('+', '').replace(',', '').replace('VND', '').strip()
    m = re.match(r'^(-?\d+(?:\.\d+)?)\s*([TBMK]?)\b', v)
    if not m: return None
    x = float(m.group(1)); s = m.group(2)
    mult = {'T': 1e12, 'B': 1e9, 'M': 1e6, 'K': 1e3, '': 1}[s]
    return x * mult

def kv(txt):
    d = {}
    for part in re.split(r';\s*', txt.replace('\n', ' ')):
        if '=' in part:
            k, v = part.split('=', 1); d[k.strip().lower()] = v.strip()
    return d

def g(d, *names):
    for n in names:
        if n.lower() in d: return d[n.lower()]
    return None

def rd(p):
    p = os.path.join(R, p)
    return open(p, encoding='utf-8', errors='replace').read() if os.path.exists(p) else None

def cagr(a, b, n):
    if a is None or b is None or a <= 0 or b <= 0: return None
    return ((a / b) ** (1 / n) - 1) * 100

def parse_fin(txt):
    if not txt: return None, None
    lines = [l.strip() for l in txt.strip().split('\n') if l.strip()]
    labels = None; rows = []
    for l in lines:
        cells = [c.strip() for c in re.split(r',\s+|\t|\|', l)]
        if labels is None and any(re.match(r'^(TTM|FY|\d{4}|Q\d)', c) for c in cells):
            labels = [c for c in cells if re.match(r'^(TTM|FY|\d{4}|Q\d|Current)', c)]; continue
        vals = [c for c in cells if re.match(r'^-?[\d.,]+$', c.replace('(', '-').replace(')', ''))]
        if len(vals) >= 3: rows.append([num(c) for c in vals])
    if not labels or len(rows) < 1: return None, None
    def fy_series(row):
        # align from the right (rows may omit label cell); keep FY columns only
        out = []
        off = len(labels) - len(row)
        for i, v in enumerate(row):
            li = i + off
            if 0 <= li < len(labels) and labels[li].startswith(('FY', '20', '19')): out.append(v)
        return out
    rev = fy_series(rows[0]) if rows else []
    eps = fy_series(rows[1]) if len(rows) > 1 else []
    rg = cagr(rev[0], rev[3], 3) if len(rev) >= 4 else (cagr(rev[0], rev[-1], len(rev) - 1) if len(rev) >= 2 else None)
    eg = cagr(eps[0], eps[3], 3) if len(eps) >= 4 else (cagr(eps[0], eps[-1], len(eps) - 1) if len(eps) >= 2 else None)
    return rg, eg

def r1(x, d=1):
    return None if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))) else round(x, d)

def parse_over(t, m):
    txt = rd(f'O_{t}.txt')
    if not txt: return None
    d = kv(txt)
    capv = num(g(d, 'market cap')); cap = capv / 1e9 if capv else None
    pe = num(g(d, 'pe ratio'))
    if pe is not None and (pe < 0.5 or pe > 2000): pe = None
    dv = g(d, 'dividend (amount and yield)') or ''
    mm = re.search(r'\(([-\d.]+)%\)', dv)
    rv = g(d, 'revenue (ttm)') or ''
    rg = re.search(r'([+-][\d.]+)%', rv)
    tg = num((g(d, 'price target') or '').split('(')[0])
    w = (g(d, '52-week range') or '').split('-')
    ana = g(d, 'analyst rating or consensus')
    rec = dict(px=num(g(d, 'price')), cap=r1(cap, 1), pe=r1(pe), fpe=r1(num(g(d, 'forward pe'))),
               dy=r1(float(mm.group(1)), 2) if mm else None, b=r1(num(g(d, 'beta')), 2),
               rg=r1(float(rg.group(1))) if rg else None, tgt=tg, ana=ana if ana and ana.lower() not in ('n/a', '-') else None,
               w52l=num(w[0]) if len(w) == 2 else None, w52h=num(w[1]) if len(w) == 2 else None, partial=1)
    rg2, eg = parse_fin(rd(f'F_{t}.txt'))
    if rg2 is not None: rec['rg'] = r1(rg2)
    if eg is not None and abs(eg) <= 300: rec['eg'] = r1(eg)
    return {k: v for k, v in rec.items() if v is not None}

def parse_stats(t, m):
    txt = rd(f'S_{t}.txt')
    if not txt: return parse_over(t, m)
    d = kv(txt)
    capv = num(g(d, 'market cap'))
    cap = None
    if capv: cap = capv / 1e9 if m == 'US' else capv / 1e12   # US: tỷ USD; VN: nghìn tỷ đồng
    pe = num(g(d, 'pe ratio'))
    if pe is not None and (pe < 0.5 or pe > 2000): pe = None
    rec = dict(
        px=num(g(d, 'price')), cap=r1(cap, 2 if cap and cap < 10 else 1),
        pe=r1(pe), fpe=r1(num(g(d, 'forward pe'))), ps=r1(num(g(d, 'ps ratio')), 2), pb=r1(num(g(d, 'pb ratio')), 2),
        ev=r1(num(g(d, 'ev/ebitda', 'ev / ebitda'))), fcf=r1(num(g(d, 'fcf yield')), 2), dy=r1(num(g(d, 'dividend yield')), 2),
        po=r1(num(g(d, 'payout ratio'))), roe=r1(num(g(d, 'roe', 'return on equity (roe)'))), roa=r1(num(g(d, 'roa'))),
        roic=r1(num(g(d, 'roic', 'return on invested capital (roic)'))), gm=r1(num(g(d, 'gross margin'))),
        om=r1(num(g(d, 'operating margin'))), nm=r1(num(g(d, 'profit margin'))), de=r1(num(g(d, 'debt/equity', 'debt / equity')), 2),
        cr=r1(num(g(d, 'current ratio')), 2), ic=r1(num(g(d, 'interest coverage'))), z=r1(num(g(d, 'altman z-score')), 2),
        fsn=num(g(d, 'piotroski f-score')), b=r1(num(g(d, 'beta (5y)', 'beta')), 2), mo=r1(num(g(d, '52-week price change'))),
        rgf=r1(num(g(d, 'revenue growth forecast (3y)'))), fg=r1(num(g(d, 'eps growth forecast (3y)'))),
        tgt=num(g(d, 'price target')), ana=g(d, 'analyst consensus'), anc=num(g(d, 'analyst count')),
        ydg=num(g(d, 'years of dividend growth')), rev=num(g(d, 'revenue')), ni=num(g(d, 'net income')),
        split=g(d, 'last split date'))
    if rec['ana'] and rec['ana'].lower() in ('n/a', '-'): rec['ana'] = None
    if rec['fsn'] is not None: rec['fsn'] = int(rec['fsn'])
    if rec['anc'] is not None: rec['anc'] = int(rec['anc'])
    if rec['ydg'] is not None: rec['ydg'] = int(rec['ydg'])
    if rec['ic'] is not None and rec['ic'] > 999: rec['ic'] = 999
    rg, eg = parse_fin(rd(f'F_{t}.txt'))
    rec['rg'] = r1(rg); rec['eg'] = r1(eg)
    if rec['eg'] is not None and abs(rec['eg']) > 300: rec['eg'] = None
    return {k: v for k, v in rec.items() if v is not None}

def parse_hist(t):
    txt = rd(f'H_{t}.txt')
    if not txt: return None
    bars = []
    for l in txt.split('\n'):
        p = [x.strip() for x in l.strip().strip('`').split(',')]
        if len(p) >= 5 and re.match(r'^\d{4}-\d{2}-\d{2}$', p[0]):
            try:
                o, h, lo, c = (float(x) if x not in ('', 'n/a') else None for x in p[1:5])
                v = float(p[5]) if len(p) > 5 and p[5] not in ('', 'n/a') else None
            except ValueError:
                continue
            if c: bars.append([p[0], o, h, lo, c, v])
    bars.sort(key=lambda b: b[0])
    ded = {}
    for b in bars: ded[b[0]] = b
    return [ded[k] for k in sorted(ded)]

def parse_etf(t):
    txt = rd(f'E_{t}.txt')
    if not txt: return None
    d = kv(txt)
    dv = g(d, 'dividend (amount and yield)', 'dividend', 'dividend yield') or ''
    m = re.search(r'\(([-\d.]+)%\)', dv) or re.search(r'([-\d.]+)%', dv)
    lev = g(d, 'leverage') or ''
    lm = re.search(r'(-?\d+(?:\.\d+)?)\s*x', lev.lower())
    inc = g(d, 'inception date') or ''
    ym = re.search(r'(19|20)\d{2}', inc)
    rec = dict(n=g(d, 'fund name'), px=num(g(d, 'price')), aum=r1((num(g(d, 'assets')) or 0) / 1e9, 3) or None,
               er=r1(num(g(d, 'expense ratio')), 2), dy=r1(float(m.group(1)), 2) if m else None, b=r1(num(g(d, 'beta')), 2),
               hold=num(g(d, 'holdings')), inc=int(ym.group(0)) if ym else None, cls=g(d, 'asset class'), cat=g(d, 'category'),
               prov=g(d, 'etf provider'), idx=g(d, 'index tracked'), levtxt=lev or None, lev=float(lm.group(1)) if lm else None,
               r1y=r1(num(g(d, 'total return 1y'))), rinc=r1(num(g(d, 'average annual return since inception'))),
               w52l=num(g(d, '52-week low')), w52h=num(g(d, '52-week high')), top=g(d, 'top 3 holdings with weights'))
    if rec.get('n'): rec['n'] = re.sub(r'\s*\([A-Z.]{1,6}\)\s*$', '', rec['n'])
    for k in ('idx', 'cls', 'cat', 'prov', 'top', 'levtxt', 'n'):
        if rec.get(k) and rec[k].lower() in ('n/a', '-', 'none'): rec[k] = None
    if rec['hold'] is not None: rec['hold'] = int(rec['hold'])
    return {k: v for k, v in rec.items() if v is not None}

if __name__ == '__main__':
    US_SET = set(t for m, t, b in jobs if m == 'US')
    out = {'US': {}, 'VN': {}, 'ETF': {}}; hist = {}
    for m, t, b in jobs:
        r = parse_etf(t) if m == 'ETF' else parse_stats(('VN.' + t) if (m == 'VN' and t in US_SET) else t, m)
        if r: out[m][t] = r
        h = parse_hist(t)
        if h: hist[t] = h
    os.makedirs('data', exist_ok=True)
    json.dump(out, open('data/fund.json', 'w'), ensure_ascii=False)
    json.dump(hist, open('data/hist.json', 'w'))
    print({k: len(v) for k, v in out.items()}, 'hist', len(hist))
