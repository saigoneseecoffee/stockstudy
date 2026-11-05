#!/usr/bin/env python3
"""Tạo 3e_epsh.js: lịch sử EPS theo năm tài chính (mới nhất trước) từ các tệp raw/F_*.txt."""
import os, re, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
def eps_hist(txt):
    """Trả về (ttm, [(năm, eps), ...] mới nhất trước) hoặc (None, [])."""
    if not txt: return None, []
    lines = [l.strip().strip('`') for l in txt.strip().split('\n') if l.strip()]
    labels = None
    lines = [re.sub(r'^([A-Za-z][A-Za-z ()/&.-]*):\s*', r'\1, ', l) for l in lines]
    for l in lines:
        labs = re.findall(r'\bTTM\b|\bFY ?\d{4}\b', l)
        if len(labs) >= 3: labels = labs; break
    if not labels: return None, []
    best = None
    for l in lines:
        if 'per share' in l.lower() or re.match(r'^-?[\d.]', l) or l.lower().startswith('eps'):
            toks = [t.strip() for t in l.split(',')]
            while toks and re.match(r'^[A-Za-z]', toks[0]) and toks[0].lower() not in ('n/a',): toks.pop(0)
            if len(toks) != len(labels): continue
            ok = all(re.match(r'^(-?\d+(\.\d+)?|-|n/a|—)$', t) for t in toks)
            dec = sum('.' in t for t in toks)
            if ok and dec >= len(toks) // 2 and ('per share' in l.lower() or best is None): best = toks
    if not best: return None, []
    val = lambda t: float(t) if re.match(r'^-?\d', t) else None
    ttm = None; fy = []
    for lab, t in zip(labels, best):
        v = val(t)
        if lab == 'TTM': ttm = v
        else:
            y = re.search(r'\d{4}', lab).group(0)
            if v is not None: fy.append((int(y), v))
    fy.sort(reverse=True)
    return ttm, fy[:6]
def enc(ttm, fy):
    s = ';'.join(f'{y}:{round(v, 2)}' for y, v in fy)
    return (f'T:{round(ttm, 2)};' if ttm is not None else '') + s
if __name__ == '__main__':
    ctx = open('3c_universe.js').read()
    US = [r[0] for r in json.loads(re.search(r'const UNI_US=(\[.*?\]);', ctx, re.S).group(1))]
    VN = [r[0] for r in json.loads(re.search(r'const UNI_VN=(\[.*?\]);', ctx, re.S).group(1))]
    out = {'US': {}, 'VN': {}}; bad = []
    for m, L in (('US', US), ('VN', VN)):
        for t in L:
            cands = [f'raw/F_VN.{t}.txt', f'raw/F_{t}.txt'] if (m == 'VN' and t in US) else [f'raw/F_{t}.txt']
            for p in cands:
                if not os.path.exists(p): continue
                txt = open(p, encoding='utf-8', errors='replace').read()
                unit = 'VND' if 'VND' in txt else ('USD' if 'USD' in txt else None)
                if unit and ((m == 'US') != (unit == 'USD')): bad.append(p); continue
                ttm, fy = eps_hist(txt)
                if len(fy) < 3: break
                # đối chiếu EPS 12 tháng với giá ÷ P/E trên trang thống kê cùng ngày; lệch quá 25% là tệp sai mã
                sp = p.replace('/F_', '/S_')
                st = open(sp, encoding='utf-8', errors='replace').read() if os.path.exists(sp) else ''
                kv = dict((k.strip().lower(), v.strip()) for k, v in (x.split('=', 1) for x in st.replace('\n', ' ').split(';') if '=' in x))
                num = lambda v: float(re.sub(r'[,$%]', '', v)) if v and re.match(r'^-?[\d,.]+$', re.sub(r'[$%]', '', v)) else None
                px, pe = num(kv.get('price')), num(kv.get('pe ratio'))
                if ttm is not None and px and pe and pe > 0:
                    r = ttm / (px / pe)
                    if not (0.75 < r < 1.33): bad.append((m, t, round(r, 2))); break
                elif ttm is not None and ttm > 0 and px and not pe:
                    bad.append((m, t, 'pe n/a')); break
                out[m][t] = enc(ttm, fy)
                break
    js = '/* Lịch sử EPS theo năm tài chính (mới nhất trước), T = 12 tháng gần nhất. Nguồn: stockanalysis.com, tạo bởi gen_epsh.py */\nconst EPSH=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open('3e_epsh.js', 'w').write(js)
    print('US', len(out['US']), '/', len(US), 'VN', len(out['VN']), '/', len(VN), 'rejected', len(bad), bad[:12], 'NEM', out['US'].get('NEM'), 'MU', out['US'].get('MU'), 'HPG', out['VN'].get('HPG'))
