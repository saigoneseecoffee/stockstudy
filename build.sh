#!/bin/sh
# Một trang, hai bản ứng dụng (vi, en). Ngôn ngữ được chọn trước khi chạy; đổi ngôn ngữ thì tải lại trang.
cd "$(dirname "$0")/src"
FILES="3_data.js 3c_universe.js 4a_core.js 3d_build.js 4b_views.js 4c_more.js 4d_learn.js 4e_chart.js 4f_patterns.js 4g_options.js 4h_live.js 4j_etf.js 4k0_lessons2.js 4k_levels.js 4z_boot.js"
bundle(){ # $1 = lang, $2 = dir prefix
  echo "<script>window.__LB_APP_$1=function(){"
  for f in $FILES; do cat "$2$f"; done
  echo '};</script>'
}
{ cat 1_head.html
  echo '<body>'; echo '<template id="lb-body-vi">'; cat 2_body.html; echo '</template>'
  echo '<template id="lb-body-en">'; cat en/2_body.html; echo '</template>'
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
  bundle vi ''
  bundle en 'en/'
  cat <<'EOF'
<script>(function(){
  var L=null;
  try{ var v=localStorage.getItem('labanCoPhieu.lang'); if(v==='vi'||v==='en') L=v; }catch(e){}
  if(!L){ var m=/lb-lang=(vi|en)/.exec(window.name||''); L=m?m[1]:'vi'; }
  window.__LB_LANG=L;
  document.documentElement.lang=L;
  if(L==='en') document.title='Stock Compass';
  var t=document.getElementById('lb-body-'+L);
  document.body.insertBefore(t.content.cloneNode(true), document.body.firstChild);
  window['__LB_APP_'+L]();
})();</script>
EOF
} > ../la-ban-co-phieu.html
ls -l ../la-ban-co-phieu.html | awk '{print $5" bytes"}'
{ echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  cat ../la-ban-co-phieu.html; echo '</html>'; } > ../index.html
