// So khớp cấu trúc mã giữa bản tiếng Việt và bản tiếng Anh.
// Chỉ được khác nhau ở nội dung chuỗi (string / template); mọi token mã khác phải giống hệt.
// Dùng: node i18n/tokcmp.js <vi.js> <en.js> [--pairs out.json]
const fs = require('fs');
const acorn = require('acorn');
function toks(src) {
  const out = [];
  try {
    for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', allowReturnOutsideFunction: true, allowHashBang: true })) {
      const ty = t.type.label;
      const isStr = ty === 'string' || ty === 'template';
      out.push({ ty, v: isStr ? String(t.value) : (t.value !== undefined ? String(t.value) : ty), str: isStr, pos: t.start });
    }
  } catch (e) { return { err: e.message }; }
  return { out };
}
const lineOf = (src, pos) => src.slice(0, pos).split('\n').length;
const [vf, ef] = process.argv.slice(2);
const pi = process.argv.indexOf('--pairs');
const vs = fs.readFileSync(vf, 'utf8'), es = fs.readFileSync(ef, 'utf8');
const A = toks(vs), B = toks(es);
if (A.err) { console.log('PARSE ERROR (vi)', A.err); process.exit(2); }
if (B.err) { console.log('PARSE ERROR (en)', B.err); process.exit(2); }
const a = A.out, b = B.out;
let bad = 0; const pairs = []; const warn = [];
const n = Math.min(a.length, b.length);
for (let i = 0; i < n; i++) {
  const x = a[i], y = b[i];
  if (x.str !== y.str || (!x.str && (x.ty !== y.ty || x.v !== y.v))) {
    bad++;
    if (bad <= 15) console.log(`MISMATCH vi:${lineOf(vs, x.pos)} en:${lineOf(es, y.pos)}  vi=[${x.ty} ${x.v.slice(0, 60)}]  en=[${y.ty} ${y.v.slice(0, 60)}]`);
    if (bad === 15) console.log('... (stopping detail)');
    if (bad > 200) break;
    continue;
  }
  if (x.str) {
    pairs.push([x.v, y.v]);
    const VN = /[À-ỹđĐ]/;
    if (VN.test(y.v)) warn.push(`STILL-VIETNAMESE en:${lineOf(es, y.pos)}  ${y.v.slice(0, 90).replace(/\n/g, ' ')}`);
    // chuỗi kỹ thuật (không dấu, không khoảng trắng) không nên đổi
    if (x.v !== y.v && !VN.test(x.v) && !/\s/.test(x.v) && x.v.length < 40) warn.push(`CHANGED-TECH-STRING en:${lineOf(es, y.pos)}  "${x.v}" -> "${y.v}"`);
  }
}
if (a.length !== b.length) { bad++; console.log(`TOKEN COUNT DIFFERS vi=${a.length} en=${b.length}`); }
warn.slice(0, 40).forEach(w => console.log(w)); if (warn.length > 40) console.log(`... ${warn.length - 40} more warnings`);
console.log(bad ? `FAIL: ${bad} structural mismatches` : `OK structure identical (${a.length} tokens, ${pairs.length} strings, ${warn.length} warnings)`);
if (pi > 0) fs.writeFileSync(process.argv[pi + 1], JSON.stringify(pairs));
process.exit(bad ? 1 : 0);
