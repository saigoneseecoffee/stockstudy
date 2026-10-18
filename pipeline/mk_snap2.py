#!/usr/bin/env python3
"""Build the initial db documents:
   out2/snap/{US,VN,ETF,IDX}.json, out2/hist/*.json, out2/meta_feed.json
   Sources: bulk lists (universe/lists), old per-symbol docs (docs/), raw ETF/stock pages (data/fund.json, data/hist.json)."""
import json, re, os, glob, datetime
OUT = 'out2'; os.makedirs(OUT + '/snap', exist_ok=True); os.makedirs(OUT + '/hist', exist_ok=True)
F = json.load(open('data/fund.json')); H = json.load(open('data/hist.json'))
jobs = json.load(open('jobs/all.json'))
US = [t for m, t, b in jobs if m == 'US']; VN = [t for m, t, b in jobs if m == 'VN']; ETF = [t for m, t, b in jobs if m == 'ETF']
def num(v):
    v = str(v).strip().replace(',', '').replace('%', '').replace('$', '')
    m = re.match(r'^(-?[\d.]+)\s*([TBMK]?)', v)
    if not m: return None
    return float(m.group(1)) * {'T': 1e12, 'B': 1e9, 'M': 1e6, 'K': 1e3, '': 1}[m.group(2)]
def load(f):
    o = {}
    for l in open('universe/lists/' + f):
        p = l.strip().split('|')
        if len(p) < 4 or p[0].startswith('ROWS'): continue
        o[p[0]] = (num(p[1]), num(p[2]), num(p[3]))
    return o
LUS = load('sp500.psv'); LVN = {**load('hose.psv'), **load('hnx.psv')}
old = {}
for p in glob.glob('docs/*.json'):
    if os.path.basename(p).startswith('_'): continue
    d = json.load(open(p)); old[(d['m'], d['t'])] = d
D = '2026-10-16'; PREV = '2026-10-15'

def snap_for(m, tickers, L, capdiv):
    # dates window: from old hist docs of this market
    ds = sorted({b[0] for (mm, t), d in old.items() if mm == m and not t.startswith('IDX') for b in d.get('hist', [])})[-25:]
    if D not in ds: ds = (ds + [D])[-25:]
    q = {}; c = {}
    for t in tickers:
        f = F[m].get(t, {}); od = old.get((m, t))
        if t in L and L[t][0]:
            px, pct, cap = L[t]; cap = cap / capdiv if cap else f.get('cap')
        elif od:
            px, pct, cap = od['px'], od.get('pct'), od.get('cap')
        elif f.get('px'):
            px, pct, cap = f['px'], None, f.get('cap')
        else:
            continue
        q[t] = [px, None if pct is None else round(pct, 3), None if cap is None else round(cap, 2)]
        cm = {}
        if od: cm = {b[0]: b[4] for b in od.get('hist', [])}
        cm[D] = px
        if pct is not None and PREV not in cm: cm[PREV] = round(px / (1 + pct / 100), 4)
        c[t] = [cm.get(x) for x in ds]
    return {'d': D, 'dates': ds, 'q': q, 'c': c}

snapUS = snap_for('US', US, LUS, 1e9)
snapVN = snap_for('VN', VN, LVN, 1e12)
# ETF: price & pct from history bars (H) else from E page
eds = sorted({b[0] for t in ETF for b in H.get(t, [])})[-25:]
eq = {}; ec = {}
for t in ETF:
    bars = H.get(t) or []
    f = F['ETF'].get(t, {})
    if bars and bars[-1][0] == D and len(bars) > 1:
        px = bars[-1][4]; pct = (px / bars[-2][4] - 1) * 100
    elif f.get('px'):
        px = f['px']; pct = None
    else:
        continue
    eq[t] = [px, None if pct is None else round(pct, 3), f.get('aum')]
    cm = {b[0]: b[4] for b in bars}; ec[t] = [cm.get(x) for x in eds]
    if bars: json.dump({'d': bars[-1][0], 'bars': bars, 'src': 'stockanalysis.com'}, open(f'{OUT}/hist/E.{t}.json', 'w'), separators=(',', ':'))
snapETF = {'d': D, 'dates': eds, 'q': eq, 'c': ec}
idx = {'q': {}}
for (m, t), d in old.items():
    if t.startswith('IDX'):
        idx['q'][t] = {k: d.get(k) for k in ('px', 'pct', 'chg', 'o', 'h', 'l', 'd')}; idx['q'][t]['hist'] = d.get('hist', [])[-60:]
    else:
        json.dump({'d': d['d'], 'bars': d.get('hist', []), 'src': d.get('src'), 'adjWarn': d.get('adjWarn')}, open(f"{OUT}/hist/{m}.{t}.json", 'w'), separators=(',', ':'))
for k, v in (('US', snapUS), ('VN', snapVN), ('ETF', snapETF), ('IDX', idx)):
    json.dump(v, open(f'{OUT}/snap/{k}.json', 'w'), separators=(',', ':'))
meta = {'upd': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'usDate': D, 'vnDate': D,
        'ok': len(snapUS['q']) + len(snapVN['q']) + len(eq), 'failed': [],
        'note': 'Giá: bảng niêm yết stockanalysis.com (S&P 500, HOSE, HNX) và trang ETF · Chỉ số VN: CafeF · Chỉ số Mỹ: Google Finance'}
json.dump(meta, open(f'{OUT}/meta_feed.json', 'w'), ensure_ascii=False)
for k in ('US', 'VN', 'ETF', 'IDX'):
    print(k, len(json.load(open(f'{OUT}/snap/{k}.json'))['q']), os.path.getsize(f'{OUT}/snap/{k}.json'))
print('hist', len(glob.glob(OUT + '/hist/*.json')))
