#!/bin/sh
# Ghép các phần trong src/ thành:
#   la-ban-co-phieu.html  – bản đăng lên Claude (Artifact tự thêm khung tài liệu)
#   index.html            – bản đầy đủ cho GitHub Pages
set -e
cd "$(dirname "$0")"
{ cat src/1_head.html src/2_body.html
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
  echo '<script>'; echo '(function(){'
  cat src/3_data.js src/3c_universe.js src/4a_core.js src/3d_build.js src/4b_views.js src/4c_more.js src/4d_learn.js src/4e_chart.js src/4f_patterns.js src/4g_options.js src/4h_live.js src/4j_etf.js src/4k0_lessons2.js src/4k_levels.js src/4z_boot.js
  echo '})();'; echo '</script>'; } > la-ban-co-phieu.html
{ echo '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  cat la-ban-co-phieu.html; echo '</html>'; } > index.html
