#!/usr/bin/env python3
"""La Bàn Cổ Phiếu — daily feed builder.
  python3 daily.py plan  OLD WORK       -> WORK/jobs_*.txt  (fetch jobs for subagents) + WORK/plan.json
  python3 daily.py build OLD WORK OUT   -> OUT/<collection>/<doc>.json + OUT/manifest.json
OLD = folder with current db docs saved by ArtifactData get (OLD/snap/US.json, OLD/meta/uni.json, ...).
WORK/raw holds fetched text files named <KIND>_<ID>.txt; WORK/lists holds sp500.psv, hose.psv, hnx.psv."""
import json, os, re, sys, math, glob, datetime

def J(p, d=None):
    try: return json.load(open(p))
    except Exception: return d
def W(p, o):
    os.makedirs(os.path.dirname(p), exist_ok=True); json.dump(o, open(p, 'w'), ensure_ascii=False, separators=(',', ':'))
def num(v):
    if v is None: return None
    v = str(v).strip().replace('−', '-')
    if not v or v.lower() in ('n/a', 'na', '-', '—', 'upgrade', 'none', 'null'): return None
    v = v.replace('$', '').replace('%', '').replace('+', '').replace(',', '').strip()
    m = re.match(r'^(-?\d+(?:\.\d+)?)\s*([TBMK]?)\b', v)
    if not m: return None
    return float(m.group(1)) * {'T': 1e12, 'B': 1e9, 'M': 1e6, 'K': 1e3, '': 1}[m.group(2)]
def kv(txt):
    d = {}
    for part in re.split(r';\s*', (txt or '').replace('\n', ' ')):
        if '=' in part:
            k, v = part.split('=', 1); d[k.strip().lower()] = v.strip()
    return d
def g(d, *n):
    for x in n:
        if x.lower() in d: return d[x.lower()]
    return None
def r1(x, k=1): return None if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))) else round(x, k)
def rd(work, name):
    p = os.path.join(work, 'raw', name)
    return open(p, encoding='utf-8', errors='replace').read() if os.path.exists(p) else None
def csv_rows(txt):
    out = {}
    for l in (txt or '').split('\n'):
        p = [x.strip() for x in l.strip().strip('`').split(',')]
        if len(p) >= 5 and re.match(r'^\d{4}-\d{2}-\d{2}$', p[0]):
            try:
                o, h, lo, c = (float(x) if x not in ('', 'n/a') else None for x in p[1:5])
                v = float(p[5]) if len(p) > 5 and p[5] not in ('', 'n/a') else None
            except ValueError:
                continue
            if c and c > 0: out[p[0]] = [p[0], o, h, lo, c, v]
    return [out[k] for k in sorted(out)]
def cagr(a, b, n): return None if a is None or b is None or a <= 0 or b <= 0 else ((a / b) ** (1 / n) - 1) * 100
def parse_fin(txt):
    if not txt: return None, None
    labels = None; rows = []
    for l in [x.strip() for x in txt.strip().split('\n') if x.strip()]:
        cells = [c.strip() for c in re.split(r',\s+|\t|\|', l)]
        if labels is None and any(re.match(r'^(TTM|FY|\d{4}|Q\d)', c) for c in cells):
            labels = [c for c in cells if re.match(r'^(TTM|FY|\d{4}|Q\d|Current)', c)]; continue
        vals = [c for c in cells if re.match(r'^-?[\d.,]+$', c.replace('(', '-').replace(')', ''))]
        if len(vals) >= 3: rows.append([num(c) for c in vals])
    if not labels or not rows: return None, None
    def fy(row):
        off = len(labels) - len(row)
        return [v for i, v in enumerate(row) if 0 <= i + off < len(labels) and labels[i + off].startswith(('FY', '20', '19'))]
    rev = fy(rows[0]); eps = fy(rows[1]) if len(rows) > 1 else []
    rg = cagr(rev[0], rev[3], 3) if len(rev) >= 4 else None
    eg = cagr(eps[0], eps[3], 3) if len(eps) >= 4 else None
    return rg, (eg if eg is None or abs(eg) <= 300 else None)
def parse_stats(txt, fin, m):
    d = kv(txt); capv = num(g(d, 'market cap'))
    cap = (capv / 1e9 if m == 'US' else capv / 1e12) if capv else None
    pe = num(g(d, 'pe ratio'))
    if pe is not None and (pe < 0.5 or pe > 2000): pe = None
    f = dict(pxf=num(g(d, 'price')), cap=r1(cap, 2), pe=r1(pe), fpe=r1(num(g(d, 'forward pe'))), ps=r1(num(g(d, 'ps ratio')), 2),
             pb=r1(num(g(d, 'pb ratio')), 2), ev=r1(num(g(d, 'ev/ebitda', 'ev / ebitda'))), fcf=r1(num(g(d, 'fcf yield')), 2),
             dy=r1(num(g(d, 'dividend yield')), 2), po=r1(num(g(d, 'payout ratio'))), roe=r1(num(g(d, 'roe', 'return on equity (roe)'))),
             roa=r1(num(g(d, 'roa', 'return on assets (roa)'))), roic=r1(num(g(d, 'roic', 'return on invested capital (roic)'))),
             gm=r1(num(g(d, 'gross margin'))), om=r1(num(g(d, 'operating margin'))), nm=r1(num(g(d, 'profit margin'))),
             de=r1(num(g(d, 'debt/equity', 'debt / equity')), 2), cr=r1(num(g(d, 'current ratio')), 2), ic=r1(num(g(d, 'interest coverage'))),
             z=r1(num(g(d, 'altman z-score')), 2), fsn=num(g(d, 'piotroski f-score')), b=r1(num(g(d, 'beta (5y)', 'beta')), 2),
             mo=r1(num(g(d, '52-week price change'))), rgf=r1(num(g(d, 'revenue growth forecast (3y)'))), fg=r1(num(g(d, 'eps growth forecast (3y)'))),
             tgt=num(g(d, 'price target')), ana=g(d, 'analyst consensus'), anc=num(g(d, 'analyst count')), ydg=num(g(d, 'years of dividend growth')))
    if f['ana'] and f['ana'].lower() in ('n/a', '-'): f['ana'] = None
    for k in ('fsn', 'anc', 'ydg'):
        if f[k] is not None: f[k] = int(f[k])
    if f['ic'] is not None and f['ic'] > 999: f['ic'] = 999
    if f['dy'] is None: f['dy'] = 0.0
    f['rg'], f['eg'] = parse_fin(fin); f['rg'] = r1(f['rg']); f['eg'] = r1(f['eg'])
    return f
def load_list(work, name):
    o = {}
    p = os.path.join(work, 'lists', name)
    if not os.path.exists(p): return o
    for l in open(p):
        x = l.strip().split('|')
        if len(x) >= 4 and not x[0].startswith('ROWS'):
            o[x[0].strip()] = (num(x[1]), num(x[2]), num(x[3]))
    return o
D = '?d=' + datetime.date.today().strftime('%Y%m%d')
def url(m, t, ex=None):
    if m == 'US': return f'https://stockanalysis.com/stocks/{t.lower()}/'
    if m == 'VN': return f'https://stockanalysis.com/quote/{(ex or "hose").lower()}/{t}/'
    return f'https://stockanalysis.com/etf/{t.lower()}/'

def plan(old, work):
    uni = J(f'{old}/meta/uni.json'); rot = J(f'{old}/meta/rot.json', {}) or {}
    C = uni['chunk']; jobs = {'etf': [], 'rot': [], 'fund': [], 'tail': []}
    # ETF: 5 most recent rows daily (all ETFs)
    for t in uni['ETF']: jobs['etf'].append(f'H5|E.{t}|{url("ETF", t)}history/{D}')
    # rotation: the 2 stock chunks refreshed longest ago get full history
    chunks = [f'US-{i}' for i in range(math.ceil(len(uni['US']) / C))] + [f'VN-{i}' for i in range(math.ceil(len(uni['VN']) / C))]
    hrot = rot.get('hist', {})
    pick = sorted(chunks, key=lambda c: (hrot.get(c, ''), c))[:2]
    for ck in pick:
        m, i = ck.split('-'); i = int(i)
        L = uni[m][i * C:(i + 1) * C]
        for x in L:
            t, ex = (x, None) if m == 'US' else (x[0], x[1])
            jobs['rot'].append(f'H|{m}.{t}|{url(m, t, ex)}history/{D}')
    # fundamentals: pending first, then the 20 oldest
    frot = rot.get('fund', {}); allid = [f'US.{t}' for t in uni['US']] + [f'VN.{x[0]}' for x in uni['VN']]
    exm = {x[0]: x[1] for x in uni['VN']}
    order = sorted(allid, key=lambda k: (k in frot, frot.get(k, ''), k))[:20]
    for k in order:
        m, t = k.split('.', 1)
        jobs['fund'] += [f'S|{k}|{url(m, t, exm.get(t))}statistics/{D}', f'F|{k}|{url(m, t, exm.get(t))}financials/{D}']
    # S&P 500 names missing from the list page (filled after lists are fetched): written by 'tail' step
    os.makedirs(work, exist_ok=True)
    allj = jobs['etf'] + jobs['rot'] + jobs['fund']
    n = 0
    for i in range(0, len(allj), 60):
        open(f'{work}/jobs_{n:02d}.txt', 'w').write('\n'.join(allj[i:i + 60]) + '\n'); n += 1
    W(f'{work}/plan.json', {'rot_chunks': pick, 'fund': order, 'batches': n})
    print(json.dumps({'batches': n, 'etf': len(jobs['etf']), 'rot': pick, 'fund': len(order)}))

def tail(old, work):
    uni = J(f'{old}/meta/uni.json'); L = load_list(work, 'sp500.psv')
    miss = [t for t in uni['US'] if t not in L]
    open(f'{work}/jobs_tail.txt', 'w').write('\n'.join(f'P|US.{t}|{url("US", t)}{D}' for t in miss) + '\n')
    print(json.dumps({'tail': len(miss)}))

def build(old, work, out):
    uni = J(f'{old}/meta/uni.json'); rot = J(f'{old}/meta/rot.json', {}) or {}; C = uni['chunk']
    plan_ = J(f'{work}/plan.json', {})
    man = []; fails = []
    # ----- session dates
    etf_rows = {t: csv_rows(rd(work, f'H5_E.{t}.txt')) for t in uni['ETF']}
    us_date = max([r[-1][0] for r in etf_rows.values() if r] or [''])
    vni = csv_rows(rd(work, 'X_IDX.VNINDEX.txt')); vn_date = vni[-1][0] if vni else us_date  # dự phòng: cùng ngày phiên Mỹ
    # ----- snapshots
    def upd_snap(key, date, rows_now):
        s = J(f'{old}/snap/{key}.json', {}) or {}
        if not date: return s, False
        dates = list(s.get('dates', [])); c = {t: list(v) for t, v in s.get('c', {}).items()}; q = dict(s.get('q', {}))
        olddate = s.get('d', '')
        if not dates or date > dates[-1]:
            dates.append(date)
        n = len(dates)
        for t in list(c): c[t] = (c[t] + [None] * n)[:n] if len(c[t]) < n else c[t][-n:]
        for t, row in q.items():   # rows not refreshed today keep their own date
            if t not in rows_now and len(row) < 4: q[t] = (row + [None, None, None])[:3] + [olddate]
        for t, row in rows_now.items():
            q[t] = row[:3]
            arr = c.get(t) or [None] * n; arr = (arr + [None] * n)[:n]; arr[-1] = row[0]; c[t] = arr
        k = max(0, len(dates) - 25)
        return {'d': max(date, olddate), 'dates': dates[k:], 'q': q, 'c': {t: v[k:] for t, v in c.items()}}, True
    # US stocks
    LUS = load_list(work, 'sp500.psv'); rows = {}; USET = set(uni['US'])
    for t, (px, pct, cap) in LUS.items():
        if t in USET and px and px > 0: rows[t] = [px, pct, r1(cap / 1e9, 1) if cap else None]
    for t in uni['US']:
        if t in rows: continue
        d = kv(rd(work, f'P_US.{t}.txt'))
        px = num(g(d, 'price')); pct = num(g(d, 'change %', 'change percent', 'change (%)', '% change')); cap = num(g(d, 'market cap'))
        if px: rows[t] = [px, pct, r1(cap / 1e9, 1) if cap else None]
    s, ok = upd_snap('US', us_date, rows)
    if ok: W(f'{out}/snap/US.json', s); man.append('snap/US')
    # VN stocks
    LVN = {**load_list(work, 'hose.psv'), **load_list(work, 'hnx.psv')}; rows = {}
    for x in uni['VN']:
        t = x[0]
        if t in LVN:
            px, pct, cap = LVN[t]
            if px and px > 0 and (pct is None or abs(pct) <= 16): rows[t] = [px, pct, r1(cap / 1e12, 2) if cap else None]
            elif px: fails.append(t)
    s, ok = upd_snap('VN', vn_date, rows)
    if ok: W(f'{out}/snap/VN.json', s); man.append('snap/VN')
    # ETF
    rows = {}
    for t, r in etf_rows.items():
        if r and r[-1][0] == us_date:
            pct = (r[-1][4] / r[-2][4] - 1) * 100 if len(r) > 1 else None
            rows[t] = [r[-1][4], r1(pct, 3), None]
    olde = J(f'{old}/snap/ETF.json', {}) or {}
    for t in rows:
        if t in olde.get('q', {}) and olde['q'][t][2] is not None: rows[t][2] = olde['q'][t][2]
    s, ok = upd_snap('ETF', us_date, rows)
    if ok: W(f'{out}/snap/ETF.json', s); man.append('snap/ETF')
    # indices
    idx = J(f'{old}/snap/IDX.json', {'q': {}}) or {'q': {}}
    for t in ('IDX.VNINDEX', 'IDX.VN30'):
        r = csv_rows(rd(work, f'X_{t}.txt'))
        r = [b for b in r if b[4] and (b[2] is None or b[3] is None or b[2] >= b[3])]
        if len(r) >= 2:
            oldh = {b[0]: b for b in (idx['q'].get(t, {}).get('hist') or [])}
            for b in r: oldh[b[0]] = b
            h = [oldh[k] for k in sorted(oldh)][-60:]
            last, prev = h[-1], h[-2]
            idx['q'][t] = {'px': last[4], 'pct': r1((last[4] / prev[4] - 1) * 100, 3), 'chg': r1(last[4] - prev[4], 2), 'o': last[1], 'h': last[2], 'l': last[3], 'd': last[0], 'hist': h}
    for t in ('IDX.SPX', 'IDX.IXIC', 'IDX.DJI'):
        d = kv(rd(work, f'X_{t}.txt'))
        px = num(g(d, 'index value', 'value', 'price')); chg = num(g(d, 'change')); pct = num(g(d, 'change %', 'change percent'))
        if px and us_date:
            o = idx['q'].get(t, {}); h = [b for b in (o.get('hist') or []) if b[0] != us_date]
            rng = g(d, 'day range') or ''
            lo, hi = (num(x) for x in rng.split('-')) if rng.count('-') == 1 else (num(g(d, 'low')), num(g(d, 'high')))
            h = (h + [[us_date, num(g(d, 'open')), hi, lo, px, None]])[-60:]
            idx['q'][t] = {'px': px, 'pct': pct if pct is not None else (r1(chg / (px - chg) * 100, 3) if chg else None), 'chg': chg, 'o': num(g(d, 'open')), 'h': hi, 'l': lo, 'd': us_date, 'hist': h}
    W(f'{out}/snap/IDX.json', idx); man.append('snap/IDX')
    # ----- history chunks
    def chunk_ids(m, L):
        return {(x if m in ('US', 'E') else x[0]): f'{m}-{i // C}' for i, x in enumerate(L)}
    cmap = {**{('E', t): ck for t, ck in chunk_ids('E', uni['ETF']).items()}, **{('US', t): ck for t, ck in chunk_ids('US', uni['US']).items()}, **{('VN', t): ck for t, ck in chunk_ids('VN', uni['VN']).items()}}
    touched = {}
    def chunk(ck):
        if ck not in touched: touched[ck] = J(f'{old}/hist/{ck}.json', None) or {'bars': {}, 'adj': {}}
        return touched[ck]
    for t, r in etf_rows.items():
        if not r: continue
        ch = chunk(cmap[('E', t)]); bm = {b[0]: b for b in ch['bars'].get(t, [])}
        for b in r: bm[b[0]] = b
        ch['bars'][t] = [bm[k] for k in sorted(bm)][-80:]
    for ck in plan_.get('rot_chunks', []):
        m = ck.split('-')[0]
        for f in glob.glob(f'{work}/raw/H_{m}.*.txt'):
            t = os.path.basename(f)[len('H_' + m + '.'):-4]
            if cmap.get((m, t)) != ck: continue
            r = csv_rows(open(f).read())
            if len(r) < 10: continue
            ch = chunk(ck); bars = r[-80:]   # thay toàn bộ để không trộn hai cách điều chỉnh giá
            adj = None
            for i in range(1, len(bars)):
                a, b2 = bars[i - 1][4], bars[i][4]
                if a and b2 and abs(b2 / a - 1) > (0.16 if m == 'VN' else 0.4): adj = bars[i][0]
            ch['bars'][t] = bars; ch.setdefault('adj', {})[t] = adj
        rot.setdefault('hist', {})[ck] = datetime.date.today().isoformat()
    for ck, ch in touched.items():
        ch['upd'] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'); ch['srcAll'] = 'stockanalysis.com'
        W(f'{out}/hist/{ck}.json', ch); man.append('hist/' + ck)
    # ----- fundamentals
    FK = uni['FKEYS']; changed = set()
    funds = {m: (J(f'{old}/fund/{m}.json', None) or {'keys': FK, 'rows': {}}) for m in ('US', 'VN')}
    for k in plan_.get('fund', []):
        m, t = k.split('.', 1)
        st = rd(work, f'S_{k}.txt')
        if not st: continue
        f = parse_stats(st, rd(work, f'F_{k}.txt'), m)
        if not f.get('pxf'): continue
        arr = [f.get(x) for x in FK]
        while arr and arr[-1] is None: arr.pop()
        funds[m]['rows'][t] = arr; funds[m]['keys'] = FK; changed.add(m)
        rot.setdefault('fund', {})[k] = datetime.date.today().isoformat()
    for m in changed:
        funds[m]['upd'] = datetime.date.today().isoformat(); W(f'{out}/fund/{m}.json', funds[m]); man.append('fund/' + m)
    W(f'{out}/meta/rot.json', rot); man.append('meta/rot')
    nq = lambda k: len((J(f'{out}/snap/{k}.json', {}) or {}).get('q', {}))
    meta = {'upd': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'usDate': us_date, 'vnDate': vn_date,
            'ok': nq('US') + nq('VN') + nq('ETF'), 'failed': fails[:30],
            'note': 'Giá: bảng niêm yết stockanalysis.com (S&P 500, HOSE, HNX) và trang ETF · Chỉ số VN: CafeF · Chỉ số Mỹ: Google Finance'}
    W(f'{out}/meta/feed.json', meta); man.append('meta/feed')
    for p in man:
        sz = os.path.getsize(f'{out}/{p}.json')
        if sz > 250000: print('WARNING too large', p, sz)
    W(f'{out}/manifest.json', man)
    print(json.dumps({'docs': len(man), 'usDate': us_date, 'vnDate': vn_date, 'rot': plan_.get('rot_chunks'), 'fund': len(changed), 'vnSkipped': fails[:10]}))

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'plan': plan(sys.argv[2], sys.argv[3])
    elif cmd == 'tail': tail(sys.argv[2], sys.argv[3])
    elif cmd == 'build': build(sys.argv[2], sys.argv[3], sys.argv[4])
