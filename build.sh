#!/bin/sh
# Một trang, hai bản ứng dụng (vi, en). Ngôn ngữ được chọn trước khi chạy; đổi ngôn ngữ thì tải lại trang.
cd "$(dirname "$0")/src"
FILES="3_data.js 3c_universe.js 3e_epsh.js 4a_core.js 4a1_cycle.js 3d_build.js 4b_views.js 4c_more.js 4d_learn.js 4e_chart.js 4f_patterns.js 4g_options.js 4h_live.js 4j_etf.js 4k0_lessons2.js 4k_levels.js 4l_search.js 4m_track.js 4n_forecast_core.js 4n_forecast.js 4z_boot.js"
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
cat > ../index.html <<'HEAD'
<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="La Bàn Cổ Phiếu (Stock Compass): chấm điểm 500 cổ phiếu S&amp;P 500 và 500 cổ phiếu HOSE/HNX theo 6 nhân tố, theo dõi 200 ETF Mỹ theo cặp đối xứng, và lộ trình học đầu tư 10 cấp (đọc BCTC, dòng tiền, định giá, tích sản). Tiếng Việt và tiếng Anh, miễn phí, chạy trên iPhone.">
<link rel="canonical" href="https://saigoneseecoffee.github.io/stockstudy/">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="La Bàn Cổ Phiếu">
<meta property="og:title" content="La Bàn Cổ Phiếu: chấm điểm cổ phiếu Mỹ và Việt Nam, học đầu tư 10 cấp">
<meta property="og:description" content="Bộ lọc đa nhân tố cho 1.000 cổ phiếu Mỹ và Việt Nam, 200 ETF Mỹ, 101 bài học có infographic. Song ngữ Việt / Anh.">
<meta property="og:url" content="https://saigoneseecoffee.github.io/stockstudy/">
<meta property="og:image" content="https://saigoneseecoffee.github.io/stockstudy/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="vi_VN"><meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"La Bàn Cổ Phiếu","alternateName":"Stock Compass","url":"https://saigoneseecoffee.github.io/stockstudy/","applicationCategory":"FinanceApplication","operatingSystem":"Any (web browser)","inLanguage":["vi","en"],"isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"Chấm điểm cổ phiếu S&P 500 và HOSE/HNX theo 6 nhân tố, theo dõi ETF Mỹ theo cặp đối xứng, lộ trình học đầu tư 10 cấp. Công cụ học tập, không phải lời khuyên đầu tư.","featureList":["Bộ lọc đa nhân tố cho khoảng 1.000 cổ phiếu Mỹ và Việt Nam","200 ETF Mỹ và các cặp ETF ngược chiều","Biểu đồ nến, 34 mẫu nến và 15 mô hình giá","Phòng thí nghiệm quyền chọn","101 bài học có infographic trong 10 cấp","Máy tính tích sản"]}</script>
HEAD
{ cat ../la-ban-co-phieu.html
  echo '<noscript><h1>La Bàn Cổ Phiếu</h1><p>Ứng dụng cần JavaScript. Chấm điểm cổ phiếu Mỹ và Việt Nam theo 6 nhân tố, theo dõi ETF Mỹ, học đầu tư 10 cấp. Xem mã nguồn tại <a href="https://github.com/saigoneseecoffee/stockstudy">github.com/saigoneseecoffee/stockstudy</a>.</p></noscript>'
  echo '</html>'; } >> ../index.html
