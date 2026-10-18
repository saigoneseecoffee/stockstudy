#!/usr/bin/env python3
"""data/fund.json + universe lists -> 3c_universe.js (compact arrays)."""
import json, csv, re
F = json.load(open('data/fund.json'))

GICS = {'Information Technology': 'tech', 'Communication Services': 'comm', 'Consumer Discretionary': 'cons',
        'Consumer Staples': 'staple', 'Health Care': 'health', 'Energy': 'energy', 'Industrials': 'ind',
        'Materials': 'mat', 'Real Estate': 're', 'Utilities': 'util', 'Financials': 'ins'}
def us_sector(sec, sub):
    s = GICS.get(sec, 'other')
    if sec == 'Information Technology' and 'Semiconductor' in sub: s = 'semi'
    if sec == 'Consumer Discretionary':
        if 'Retail' in sub or sub == 'Distributors': s = 'retail'
        if 'Automobile' in sub or 'Automotive Parts' in sub: s = 'auto'
    if sec == 'Consumer Staples' and 'Retail' in sub: s = 'retail'
    if sec == 'Financials':
        if 'Banks' in sub: s = 'bank'
        elif 'Payment' in sub or 'Consumer Finance' in sub: s = 'pay'
        elif 'Brokerage' in sub: s = 'broker'
    return s

VN_RULES = [('bank', r'\bbank\b'), ('broker', r'securities'), ('ins', r'insurance|reinsurance'),
            ('energy', r'petro|\boil\b|\bgas\b|drilling'), ('util', r'power|electric|hydro|thermal|energy|water|wind|solar'),
            ('health', r'pharma|medic|hospital|health'), ('agri', r'seafood|fish|aquacul|agricult|sugar|rubber|livestock|feed|rice|coffee|\btea\b|cashew|fruit|husbandry|plantation'),
            ('mat', r'steel|plastic|chemical|fertil|paper|packag|mineral|mining|coal|cement|glass|metal|aluminum|zinc|galvan|pipe|wire|cable|battery|tire|tyre'),
            ('build', r'construct|infrastructure|concrete|building|engineering|bridge|road|installation'),
            ('re', r'real estate|\bland\b|housing|urban|property|properties|realty|residential|industrial park|\bhomes?\b|resort'),
            ('ind', r'\bport\b|logistic|transport|shipping|airport|airline|aviation|marine|railway|\bbus\b|taxi|maritime|cargo|warehouse|machinery|mechanical|equipment'),
            ('retail', r'retail|mobile world|digiworld|jewel|trading|commerce|supermarket'),
            ('staple', r'food|beverage|milk|beer|brew|confection|edible|bakery|candy|biscuit|tobacco'),
            ('tech', r'technolog|telecom|software|digital|informatic|computer|electronic|postal'),
            ('cons', r'textile|garment|apparel|footwear|shoe|furniture|wood|tourism|travel|hotel|entertainment|education|book|media|advertis|\bauto|motor')]
MAN = dict(l.split() for l in open('universe/vn_sector_manual.txt') if l.strip())
def vn_sector(t, n):
    if t in MAN: return MAN[t]
    for k, r in VN_RULES:
        if re.search(r, n.lower()): return k
    return 'other'
def short(n):
    n = re.sub(r',?\s*(Joint[- ]Stock Company|Joint Stock Corporation|Shareholding Company|JSC|Corporation|Corp\.?|Company Limited|Holdings? Company|Incorporated|Inc\.?|plc|Ltd\.?)\s*$', '', n, flags=re.I).strip(' ,-')
    n = re.sub(r'\s*-\s*JSC$', '', n)
    return n

FKEYS = ['pxf', 'cap', 'pe', 'fpe', 'ps', 'pb', 'ev', 'fcf', 'dy', 'po', 'roe', 'roa', 'roic', 'gm', 'om', 'nm', 'de', 'cr', 'ic', 'z',
         'fsn', 'b', 'mo', 'rg', 'eg', 'fg', 'rgf', 'tgt', 'ana', 'anc', 'ydg']
def fenc(f):
    f = dict(f, pxf=f.get('px'))
    out = [f.get(k) for k in FKEYS]
    while out and out[-1] is None: out.pop()
    return out
uni_us = []; uni_vn = []; fund_us = {}; fund_vn = {}
for r in csv.DictReader(open('universe/sp500.csv')):
    t = r['t']; uni_us.append([t, r['name'], us_sector(r['sector'], r['sub']), r['sub']])
    if t in F['US']: fund_us[t] = fenc(F['US'][t])
for l in list(open('universe/vn500.psv'))[1:]:
    t, ex, n, cap = l.rstrip('\n').split('|')
    uni_vn.append([t, short(n), ex, vn_sector(t, n)])
    if t in F['VN']: fund_vn[t] = fenc(F['VN'][t])
pairs = []; etf_uni = []
for l in open('universe/etf_list.txt'):
    l = l.strip()
    if not l or l.startswith('#'): continue
    p = l.split('|')
    if len(p) == 4:
        pairs.append(p); m = re.search(r'\((\d(?:\.\d)?)x', p[3]); lv = float(m.group(1)) if m else 1.0
        etf_uni.append([p[0], p[2], lv]); etf_uni.append([p[1], p[2], -lv])
    else:
        etf_uni.append([p[0], p[1], None])
EFKEYS = ['n', 'prov', 'aum', 'er', 'dy', 'b', 'hold', 'inc', 'cls', 'cat', 'idx', 'lev', 'r1y', 'rinc', 'w52l', 'w52h', 'top']
def eenc(f):
    out = [f.get(k) for k in EFKEYS]
    while out and out[-1] is None: out.pop()
    return out
etf_fund = {t: eenc(F['ETF'][t]) for t, g, lv in etf_uni if t in F['ETF']}
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
js = ['/* Sinh tự động bởi gen_universe.py. Danh sách mã: S&P 500 (Wikipedia), HOSE + HNX (stockanalysis.com). Chỉ số cơ bản: stockanalysis.com, lấy ngày 17/10/2026. */',
      'const FUND_ASOF="2026-10-17";',
      'const FKEYS=' + J(FKEYS) + ';', 'const EFKEYS=' + J(EFKEYS) + ';',
      'const UNI_US=' + J(uni_us) + ';', 'const UNI_VN=' + J(uni_vn) + ';',
      'const FUND_US=' + J(fund_us) + ';', 'const FUND_VN=' + J(fund_vn) + ';',
      'const ETF_UNI=' + J(etf_uni) + ';', 'const ETF_FUND=' + J(etf_fund) + ';',
      'const ETF_PAIRS=' + J([[a, b, g, u] for a, b, g, u in pairs]) + ';']
open('3c_universe.js', 'w').write('\n'.join(js) + '\n')
print('US', len(uni_us), len(fund_us), 'VN', len(uni_vn), len(fund_vn), 'ETF', len(etf_uni), len(etf_fund), 'pairs', len(pairs))
from collections import Counter
print(Counter(r[3] for r in uni_vn))
sp=set(r[0] for r in uni_us)|set(r[0] for r in uni_vn)
print('ETF/stock ticker collisions', [t for t,g,l in etf_uni if t in sp])
json.dump({'FKEYS':FKEYS,'EFKEYS':EFKEYS},open('data/keys.json','w'))
