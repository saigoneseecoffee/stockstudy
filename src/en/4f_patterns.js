/* ============================================================
   THƯ VIỆN MẪU NẾN · MÔ HÌNH GIÁ · BÀI HỌC KỸ THUẬT · ÔN TẬP NHẬN DIỆN
   ============================================================ */
/* Mỗi mẫu: nến [mở, cao, thấp, đóng] trên thang 0–100; ctx = xu hướng trước đó */
const CDL=[
 {id:'doji',n:'Doji',en:'Doji',cat:'Indecision',ctx:'none',rel:'Low',k:1,c:[[50,64,36,50.6]],
  d:'Open and close are almost equal: buyers and sellers are balanced. A Doji is not a signal by itself; its meaning comes from where it appears — after a long trend, a Doji warns that momentum is running out.',cf:'Wait for the next candle to close against the prior trend.',h:'A plus sign = “nobody won yet”.'},
 {id:'dragonfly',n:'Dragonfly Doji',en:'Dragonfly Doji',cat:'Bullish reversal',ctx:'down',rel:'Medium',k:1,c:[[60,60.6,28,60.4]],
  d:'Open, close and high coincide, with a very long lower wick: sellers pushed price far down, but buyers pulled it all the way back by the close.',cf:'A following bullish candle, better on heavy volume.',h:'A letter T — deep roots, the tree stands firm.'},
 {id:'gravestone',n:'Gravestone Doji',en:'Gravestone Doji',cat:'Bearish reversal',ctx:'up',rel:'Medium',k:1,c:[[40,72,39.4,40.4]],
  d:'Open, close and low coincide, with a long upper wick: buyers tried to push higher but were sold back to the starting point.',cf:'A following bearish candle closing below the Doji’s body.',h:'An upside-down T — a headstone at the top.'},
 {id:'longleg',n:'Long-legged Doji',en:'Long-legged Doji',cat:'Indecision',ctx:'none',rel:'Low',k:1,c:[[50,74,26,50.6]],
  d:'Both wicks are long and there is almost no body: big swings during the session but a draw at the close — the market is very undecided.',cf:'Watch for a break of this candle’s high or low.',h:'A person with arms and legs spread — standing at a crossroads.'},
 {id:'spinning',n:'Spinning Top',en:'Spinning Top',cat:'Indecision',ctx:'none',rel:'Low',k:1,c:[[47,64,36,54]],
  d:'A small body in the middle with fairly long wicks on both sides: buying and selling pressure are fading, the trend may pause.',cf:'Needs a confirming candle.',h:'A top losing its spin.'},
 {id:'marubozuup',n:'Bullish Marubozu',en:'Bullish Marubozu',cat:'Continuation',ctx:'none',rel:'Medium',k:1,c:[[28,72,28,72]],
  d:'A bullish candle with no wicks: opens at the low, closes at the high. Buyers were in full control all session.',cf:'The next candle does not erase more than half the body.',h:'A solid bullish block — nothing in the way.'},
 {id:'marubozudn',n:'Bearish Marubozu',en:'Bearish Marubozu',cat:'Continuation',ctx:'none',rel:'Medium',k:1,c:[[72,72,28,28]],
  d:'A bearish candle with no wicks: sellers dominated from start to finish.',cf:'The next candle does not recover more than half the body.',h:'A solid bearish block — free fall.'},
 {id:'hammer',n:'Hammer',en:'Hammer',cat:'Bullish reversal',ctx:'down',rel:'Medium',k:1,c:[[50,57,28,56]],
  d:'Appears after a decline: a small body at the top and a lower wick at least twice the body. Selling was absorbed and buyers struck back.',cf:'The next session closes above the Hammer’s high.',h:'A hammer pounding out the bottom.'},
 {id:'invhammer',n:'Inverted Hammer',en:'Inverted Hammer',cat:'Bullish reversal',ctx:'down',rel:'Low',k:1,c:[[30,58,29,35]],
  d:'After a decline, a small body at the bottom and a long upper wick: buyers tried to push price up — an early but weak signal.',cf:'A bullish confirming candle is required.',h:'A hammer turned upside down at the bottom.'},
 {id:'hangingman',n:'Hanging Man',en:'Hanging Man',cat:'Bearish reversal',ctx:'up',rel:'Low',k:1,c:[[66,67,44,61]],
  d:'Same shape as the Hammer but appears after a rally: sellers dragged price down hard during the session — a warning that buyers are tiring.',cf:'The next session closes below the body.',h:'Looks like a Hammer — at the top it becomes a hanging man.'},
 {id:'shootingstar',n:'Shooting Star',en:'Shooting Star',cat:'Bearish reversal',ctx:'up',rel:'Medium',k:1,c:[[62,84,57,58]],
  d:'After a rally: a small body at the bottom and an upper wick twice the body. Price was strongly rejected at high levels.',cf:'A following bearish candle on heavy volume.',h:'A star shoots up, then falls.'},
 {id:'bullengulf',n:'Bullish Engulfing',en:'Bullish Engulfing',cat:'Bullish reversal',ctx:'down',rel:'High',k:2,c:[[48,50,40,42],[40,56,39,54]],
  d:'A large bullish body completely covers the body of the previous bearish candle: the balance clearly flipped in a single session.',cf:'Volume on the engulfing session is above average; the next session holds above the low.',h:'The big fish swallows the small fish — in bullish color.'},
 {id:'bearengulf',n:'Bearish Engulfing',en:'Bearish Engulfing',cat:'Bearish reversal',ctx:'up',rel:'High',k:2,c:[[52,60,50,58],[60,61,44,46]],
  d:'A large bearish body covers the body of the previous bullish candle near a top: sellers take control.',cf:'The next session closes below the engulfing candle’s low.',h:'A big bearish fish swallows a small one.'},
 {id:'bullharami',n:'Bullish Harami',en:'Bullish Harami',cat:'Bullish reversal',ctx:'down',rel:'Medium',k:2,c:[[62,63,38,40],[45,52,44,50]],
  d:'A small bullish candle sits inside the body of the previous large bearish candle (“the pregnant mother”): selling suddenly stalls.',cf:'A third session closes above the mother candle’s body — forming Three Inside Up.',h:'Harami = “pregnant” in Japanese.'},
 {id:'bearharami',n:'Bearish Harami',en:'Bearish Harami',cat:'Bearish reversal',ctx:'up',rel:'Medium',k:2,c:[[38,62,37,60],[55,56,48,50]],
  d:'A small bearish candle inside the body of a large bullish candle near a top: the rally is interrupted.',cf:'The next session closes below the mother candle’s body.',h:'A bullish mother holding a bearish child.'},
 {id:'haramicross',n:'Harami Cross',en:'Harami Cross',cat:'Bullish reversal',ctx:'down',rel:'Medium',k:2,c:[[62,63,38,40],[49,54,45,49.4]],
  d:'A Harami variant where the child candle is a Doji: clearer indecision, a stronger signal than a regular Harami.',cf:'A bullish confirming candle.',h:'A cross inside the mother’s belly.'},
 {id:'piercing',n:'Piercing Line',en:'Piercing Line',cat:'Bullish reversal',ctx:'down',rel:'Medium',k:2,c:[[62,63,40,42],[37,56,36,55]],
  d:'The second session opens below the prior low, then rallies hard and closes above the midpoint of the bearish body.',cf:'A close above 50% of the prior body is the minimum; the higher, the stronger.',h:'An arrow piercing through half the body.'},
 {id:'darkcloud',n:'Dark Cloud Cover',en:'Dark Cloud Cover',cat:'Bearish reversal',ctx:'up',rel:'Medium',k:2,c:[[38,60,37,58],[63,64,44,45]],
  d:'The second session opens above the prior high, then falls sharply and closes below the midpoint of the bullish body.',cf:'The next session keeps falling.',h:'Dark clouds cover half the sky.'},
 {id:'morningstar',n:'Morning Star',en:'Morning Star',cat:'Bullish reversal',ctx:'down',rel:'High',k:3,c:[[62,63,44,46],[42,44,38,40],[44,60,43,58]],
  d:'Three candles: a long bearish one, a small-bodied candle (the star) and a long bullish one closing deep into the first body. One of the most reliable bottom-reversal patterns.',cf:'The third candle closes above 50% of the first body, on rising volume.',h:'The morning star rises — dawn is coming.'},
 {id:'eveningstar',n:'Evening Star',en:'Evening Star',cat:'Bearish reversal',ctx:'up',rel:'High',k:3,c:[[38,56,37,54],[58,62,57,60],[56,57,40,42]],
  d:'Three candles: a long bullish one, a small-bodied star at the top and a long bearish one closing deep into the first body.',cf:'The third candle closes below 50% of the first body.',h:'The evening star appears — night is coming.'},
 {id:'morningdoji',n:'Morning Doji Star',en:'Morning Doji Star',cat:'Bullish reversal',ctx:'down',rel:'High',k:3,c:[[62,63,44,46],[41,44,37,41.4],[44,60,43,58]],
  d:'A Morning Star whose star is a Doji: perfect balance before the reversal — a stronger signal than a regular Morning Star.',cf:'Same as the Morning Star.',h:'A cross-shaped star.'},
 {id:'abandoned',n:'Abandoned Baby',en:'Abandoned Baby',cat:'Bullish reversal',ctx:'down',rel:'High',k:3,c:[[62,63,44,46],[37.6,40,35,37.8],[44,60,43,58]],
  d:'A Doji isolated by price gaps on both sides. Rare but very strong; uncommon in Vietnam because the open is usually close to the previous session’s close.',cf:'The gap after it is not filled within a few sessions.',h:'A baby left stranded between two gap banks.'},
 {id:'soldiers',n:'Three White Soldiers',en:'Three White Soldiers',cat:'Bullish reversal',ctx:'down',rel:'High',k:3,c:[[34,45,33,44],[41,53,40,52],[49,61,48,60]],
  d:'Three long bullish candles in a row, each opening within the previous body and closing near its high: buyers advancing with discipline.',cf:'Short upper wicks; upper wicks growing longer is a sign of exhaustion.',h:'Three soldiers marching up the stairs.'},
 {id:'crows',n:'Three Black Crows',en:'Three Black Crows',cat:'Bearish reversal',ctx:'up',rel:'High',k:3,c:[[66,67,55,56],[58,59,47,48],[50,51,39,40]],
  d:'Three long bearish candles in a row near a top, each opening within the previous body and closing near its low.',cf:'Volume rising each day.',h:'Three crows perched on stairs going down.'},
 {id:'tweezerbot',n:'Tweezer Bottom',en:'Tweezer Bottom',cat:'Bullish reversal',ctx:'down',rel:'Low',k:2,c:[[52,53,36,40],[40,50,36,48]],
  d:'Two consecutive candles with equal lows: that price area was defended twice — short-term support forms.',cf:'Only reliable when it comes with another pattern (hammer, engulfing).',h:'Two tweezer tips touching the same point.'},
 {id:'tweezertop',n:'Tweezer Top',en:'Tweezer Top',cat:'Bearish reversal',ctx:'up',rel:'Low',k:2,c:[[50,64,49,60],[60,64,50,52]],
  d:'Two candles with equal highs: short-term resistance is established.',cf:'A following bearish candle.',h:'Tweezers pinching the top.'},
 {id:'rising3',n:'Rising Three Methods',en:'Rising Three Methods',cat:'Continuation',ctx:'up',rel:'Medium',k:5,c:[[34,52,33,50],[49,50,44,46],[47,48,43,44],[45,47,41,43],[44,62,43,60]],
  d:'A long bullish candle, three small pullback candles within its range, then a long bullish candle breaking the high: the uptrend rests, then continues.',cf:'The last candle closes above the first candle’s high.',h:'Up — rest three beats — up again.'},
 {id:'falling3',n:'Falling Three Methods',en:'Falling Three Methods',cat:'Continuation',ctx:'down',rel:'Medium',k:5,c:[[66,67,48,50],[51,56,50,54],[53,57,52,56],[55,58,54,57],[56,57,38,40]],
  d:'The bearish version: a long bearish candle, three small bounces, then a long bearish candle breaking the low.',cf:'The last candle closes below the first candle’s low.',h:'Down — rest — down again.'},
 {id:'kickerup',n:'Bullish Kicker',en:'Bullish Kicker',cat:'Bullish reversal',ctx:'down',rel:'High',k:2,c:[[52,53,42,44],[56,70,55,69]],
  d:'A bearish candle followed by a bullish candle that gaps above the previous open: a sudden change in sentiment, often news-driven.',cf:'The gap is not filled.',h:'One kick changes direction.'},
 {id:'kickerdn',n:'Bearish Kicker',en:'Bearish Kicker',cat:'Bearish reversal',ctx:'up',rel:'High',k:2,c:[[48,58,47,56],[44,45,30,31]],
  d:'A bullish candle followed by a bearish candle that gaps below the previous open.',cf:'The gap is not filled.',h:'A kick the other way.'},
 {id:'belthold',n:'Bullish Belt Hold',en:'Bullish Belt Hold',cat:'Bullish reversal',ctx:'down',rel:'Low',k:1,c:[[38,58,38,57]],
  d:'After a decline, the candle opens exactly at its low and rallies straight up.',cf:'The next session holds above the body’s midpoint.',h:'Grabbed by the belt and lifted up.'},
 {id:'threeinside',n:'Three Inside Up',en:'Three Inside Up',cat:'Bullish reversal',ctx:'down',rel:'High',k:3,c:[[62,63,40,42],[45,52,44,50],[50,64,49,63]],
  d:'A Bullish Harami confirmed by a third candle closing above the mother candle’s high.',cf:'The pattern already contains its confirmation.',h:'Harami + confirmation = three inside.'},
 {id:'threeoutside',n:'Three Outside Down',en:'Three Outside Down',cat:'Bearish reversal',ctx:'up',rel:'High',k:3,c:[[52,58,51,56],[58,59,46,48],[48,49,38,40]],
  d:'A Bearish Engulfing confirmed by a third bearish candle closing lower.',cf:'The pattern already contains its confirmation.',h:'Engulfing + confirmation.'},
 {id:'tasuki',n:'Upside Tasuki Gap',en:'Upside Tasuki Gap',cat:'Continuation',ctx:'up',rel:'Low',k:3,c:[[38,50,37,49],[52,60,51,59],[57,58,50,51]],
  d:'Two bullish candles with a gap, then a third bearish candle that fills part but not all of the gap: the uptrend still holds.',cf:'The gap is not completely filled.',h:'A sash (tasuki) holding the gap open.'}
];
const PATTERN_NAME={}, PATTERN_ABBR={morningstar:'MS',eveningstar:'ES',soldiers:'3W',crows:'3C',bullengulf:'E',bearengulf:'E',piercing:'PL',darkcloud:'DC',bullharami:'H',bearharami:'H',hammer:'HM',hangingman:'HG',shootingstar:'SS',invhammer:'IH',doji:'D',dragonfly:'DD',gravestone:'GD'};
CDL.forEach(p=>PATTERN_NAME[p.id]=p.n);

function cdlSVG(p,opt){
  opt=opt||{}; const ctxN=p.ctx==='none'?1:3; const all=[]; const first=p.c[0]; const fh=first[1], fl=first[2];
  const f0=Math.max(first[0],first[3]), f1=Math.min(first[0],first[3]);
  if(p.ctx==='down'){ for(let i=0;i<ctxN;i++){ const c=f0+(ctxN-1-i)*7+1, o=c+7; all.push({b:[o,o+1.5,c-1.5,c],ctx:1}); } }
  else if(p.ctx==='up'){ for(let i=0;i<ctxN;i++){ const c=f1-(ctxN-1-i)*7-1, o=c-7; all.push({b:[o,c+1.5,o-1.5,c],ctx:1}); } }
  else all.push({b:[48,56,44,52],ctx:1});
  p.c.forEach(b=>all.push({b,ctx:0}));
  let lo=Infinity,hi=-Infinity; all.forEach(x=>{ lo=Math.min(lo,x.b[2]); hi=Math.max(hi,x.b[1]); }); const pad=(hi-lo)*.08; lo-=pad; hi+=pad;
  const W=200,H=opt.h||125, bw=Math.min(20,150/all.length*.6), step=Math.min(34,180/all.length), x0=(W-step*all.length)/2+step/2;
  const Y=v=>8+(hi-v)/(hi-lo)*(H-16); let g='';
  all.forEach((x,i)=>{ const [o,h,l,c]=x.b; const up=c>=o; const dj=Math.abs(c-o)<=(h-l)*.04; const col=x.ctx?'var(--mut2)':dj?'var(--ref)':up?'var(--up)':'var(--dn)'; const cx=x0+i*step; const yt=Y(Math.max(o,c)), yb=Y(Math.min(o,c));
    g+=`<line x1="${cx}" x2="${cx}" y1="${Y(h).toFixed(1)}" y2="${Y(l).toFixed(1)}" style="stroke:${col}" stroke-width="1.6"/><rect x="${(cx-bw/2).toFixed(1)}" y="${yt.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1.6,yb-yt).toFixed(1)}" rx="1.5" style="fill:${col};fill-opacity:${x.ctx?.45:1};stroke:${col}"/>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Candlestick pattern ${esc(p.n)}">${g}</svg>`;
}
/* ---------- mô hình giá ---------- */
const CPAT=[
 {id:'hs',n:'Head and shoulders',cat:'Bearish reversal',rel:'High',pts:[[5,108],[30,62],[50,80],[82,28],[112,80],[132,62],[152,82],[180,112]],neck:[[40,79],[195,83]],tgt:[186,83,118],
  d:'Three peaks, the middle one highest. When price closes below the neckline, the uptrend usually ends.',m:'Target = distance from the head to the neckline, measured down from the breakout point.',v:'Volume fades through the right shoulder and rises on the neckline break.'},
 {id:'ihs',n:'Inverse head and shoulders',cat:'Bullish reversal',rel:'High',pts:[[5,12],[30,58],[50,40],[82,92],[112,40],[132,58],[152,38],[180,8]],neck:[[40,41],[195,37]],tgt:[186,37,4],
  d:'The bottom version: three troughs, the middle one deepest. A break above the neckline confirms the bullish reversal.',m:'Target = depth of the head, measured up from the breakout point.',v:'Volume must rise clearly on the neckline break.'},
 {id:'dtop',n:'Double top',cat:'Bearish reversal',rel:'Medium',pts:[[5,110],[48,34],[80,72],[115,36],[150,72],[182,108]],neck:[[60,72],[195,72]],tgt:[188,72,110],
  d:'Two roughly equal peaks, an M shape. Confirmed when price breaks the trough between the peaks.',m:'Target = height from the peaks to the middle trough.',v:'The second peak usually has lower volume.'},
 {id:'dbot',n:'Double bottom',cat:'Bullish reversal',rel:'Medium',pts:[[5,10],[48,86],[80,48],[115,84],[150,48],[182,12]],neck:[[60,48],[195,48]],tgt:[188,48,10],
  d:'A W shape: two roughly equal troughs. Confirmed when price clears the middle peak.',m:'Target = height from the troughs to the middle peak, added from the breakout point.',v:'Volume rises when clearing the middle peak.'},
 {id:'ttop',n:'Triple top',cat:'Bearish reversal',rel:'Medium',pts:[[5,110],[35,40],[60,70],[92,38],[120,70],[148,40],[178,105]],neck:[[50,70],[195,70]],tgt:[188,70,104],
  d:'Three attempts to break the same resistance, all failing.',m:'Same as the double top.',v:'Volume weakens with each peak.'},
 {id:'asc',n:'Ascending triangle',cat:'Bullish continuation',rel:'Medium',pts:[[5,100],[38,36],[62,80],[92,36],[115,64],[142,36],[160,52],[188,10]],neck:[[30,36],[160,36]],extra:[[[62,80],[160,52]]],tgt:[180,36,6],
  d:'Flat resistance with rising lows: patient buyers absorbing supply at one price level.',m:'Target = height of the widest part of the triangle, added from the breakout point.',v:'Volume contracts inside the triangle and surges on the breakout.'},
 {id:'desc',n:'Descending triangle',cat:'Bearish continuation',rel:'Medium',pts:[[5,20],[38,84],[62,40],[92,84],[115,56],[142,84],[160,68],[188,112]],neck:[[30,84],[160,84]],extra:[[[62,40],[160,68]]],tgt:[180,84,114],
  d:'Flat support with falling highs: sellers growing more aggressive.',m:'Target = height of the widest part, subtracted from the breakout point.',v:'Volume rises when support breaks.'},
 {id:'sym',n:'Symmetrical triangle',cat:'Continuation',rel:'Low',pts:[[5,104],[35,28],[62,92],[92,40],[118,78],[140,50],[158,66],[188,22]],extra:[[[35,28],[158,58]],[[62,92],[158,68]]],tgt:[180,62,30],
  d:'Falling highs and rising lows converge: the market coils and usually breaks in the direction of the prior trend.',m:'Target = height of the triangle’s base.',v:'A breakout before about 2/3–3/4 of the triangle’s length is more reliable.'},
 {id:'bullflag',n:'Bull flag',cat:'Bullish continuation',rel:'High',pts:[[5,112],[50,40],[62,52],[74,44],[88,58],[100,50],[112,62],[140,18],[175,6]],extra:[[[50,40],[100,50]],[[62,52],[112,62]]],tgt:[150,58,8],
  d:'Flagpole: a steep rally. Flag: a short, gently declining channel. A break up out of the flag signals continuation.',m:'Target = length of the flagpole, added from the breakout point.',v:'Volume dries up inside the flag.'},
 {id:'bearflag',n:'Bear flag',cat:'Bearish continuation',rel:'High',pts:[[5,10],[50,82],[62,70],[74,78],[88,64],[100,72],[112,60],[140,104],[175,116]],extra:[[[50,82],[100,72]],[[62,70],[112,60]]],tgt:[150,64,114],
  d:'A steep drop followed by a gently rising bounce channel; a break of the channel leads to further decline.',m:'Target = length of the flagpole.',v:'Low volume during the bounce.'},
 {id:'risewedge',n:'Rising wedge',cat:'Bearish reversal',rel:'Medium',pts:[[5,108],[40,64],[60,84],[95,46],[112,62],[142,36],[155,46],[185,96]],extra:[[[40,64],[142,36]],[[5,108],[155,46]]],tgt:[178,60,110],
  d:'Two converging lines both sloping up, with lows rising faster than highs: the rally is tiring and prone to break down.',m:'The target is usually the wedge’s starting point.',v:'Volume declines inside the wedge.'},
 {id:'fallwedge',n:'Falling wedge',cat:'Bullish reversal',rel:'Medium',pts:[[5,12],[40,56],[60,36],[95,74],[112,58],[142,84],[155,74],[185,24]],extra:[[[40,56],[142,84]],[[5,12],[155,74]]],tgt:[178,60,10],
  d:'Two converging lines both sloping down: selling pressure is weakening, price often bounces.',m:'Target is the wedge’s starting high.',v:'Volume rises on the upside break.'},
 {id:'cup',n:'Cup and handle',cat:'Bullish continuation',rel:'High',pts:[[5,30],[20,50],[40,78],[70,92],[100,78],[120,50],[132,30],[142,42],[152,48],[162,40],[175,26],[192,10]],neck:[[5,30],[175,30]],tgt:[186,30,2],
  d:'A rounded U-shaped bottom (the cup) followed by a small pullback (the handle). William O’Neil’s favorite pattern.',m:'Target = depth of the cup, added from the handle breakout point.',v:'Low volume in the handle; breakout on heavy volume.'},
 {id:'rect',n:'Rectangle',cat:'Continuation',rel:'Low',pts:[[5,104],[30,40],[55,84],[80,40],[105,84],[130,40],[150,84],[165,40],[190,10]],neck:[[25,40],[170,40]],extra:[[[50,84],[170,84]]],tgt:[182,40,0],
  d:'Price oscillates between flat support and resistance (a consolidation / “sideways” zone). The breakout direction decides the next trend.',m:'Target = height of the rectangle.',v:'False breakouts are common — wait for a close.'},
 {id:'roundbot',n:'Rounding bottom',cat:'Bullish reversal',rel:'Medium',pts:[[5,14],[25,40],[50,70],[80,86],[110,86],[140,70],[165,40],[190,12]],
  d:'A slow shift from decline to advance over a long period, a wide U shape — also called a “saucer bottom”.',m:'No standard measured target; usually the pattern’s starting high.',v:'Volume also forms a U shape.'}
];
function cpatSVG(p){
  let g=`<polyline points="${p.pts.map(x=>x.join(',')).join(' ')}" fill="none" style="stroke:var(--fg)" stroke-width="2.2" stroke-linejoin="round"/>`;
  if(p.neck) g+=`<line x1="${p.neck[0][0]}" y1="${p.neck[0][1]}" x2="${p.neck[1][0]}" y2="${p.neck[1][1]}" style="stroke:var(--gold)" stroke-width="1.6" stroke-dasharray="5 3"/>`;
  (p.extra||[]).forEach(([a,b])=>g+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--us)" stroke-width="1.5" stroke-dasharray="4 3"/>`);
  if(p.tgt){ const [x,y1,y2]=p.tgt; const up=y2<y1; g+=`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" style="stroke:${up?'var(--up)':'var(--dn)'}" stroke-width="2"/><path d="M${x} ${y2} l-4 ${up?7:-7} h8z" style="fill:${up?'var(--up)':'var(--dn)'}"/>`; }
  return `<svg class="chart" viewBox="0 0 200 120" role="img" aria-label="Chart pattern ${esc(p.n)}">${g}</svg>`;
}

/* ---------- bài học kỹ thuật & cơ bản nâng cao ---------- */
const candlesMini=(arr)=>{ let g=''; arr.forEach((b,i)=>{ const [o,h,l,c]=b; const x=20+i*16, Y=v=>115-v; const up=c>=o, col=up?'var(--up)':'var(--dn)'; g+=`<line x1="${x}" x2="${x}" y1="${Y(h)}" y2="${Y(l)}" style="stroke:${col}"/><rect x="${x-5}" y="${Y(Math.max(o,c))}" width="10" height="${Math.max(1.5,Math.abs(c-o))}" style="fill:${col}"/>`; }); return g; };
const NEW_LESSONS=[
 {id:'candle-anatomy',g:'Technical analysis',t:'Anatomy of a Japanese candlestick',d:'Body, wicks and the story of one session',
  vis:()=>sv(`<line x1="60" x2="60" y1="12" y2="112" style="stroke:var(--up)" stroke-width="2"/><rect x="45" y="34" width="30" height="50" rx="2" style="fill:var(--up)"/><line x1="140" x2="140" y1="12" y2="112" style="stroke:var(--dn)" stroke-width="2"/><rect x="125" y="34" width="30" height="50" rx="2" style="fill:var(--dn)"/>${T(84,15,'High','style="font-size:8px"')}${T(84,37,'Close','style="font-size:8px;fill:var(--up)"')}${T(84,86,'Open','style="font-size:8px;fill:var(--up)"')}${T(84,112,'Low','style="font-size:8px"')}${T(164,37,'Open','style="font-size:8px;fill:var(--dn)"')}${T(164,86,'Close','style="font-size:8px;fill:var(--dn)"')}${T(5,24,'Top wick',TS)}${T(5,62,'Body',TB)}${T(5,104,'Low wick',TS)}`,'Structure of a bullish and a bearish candle'),
  f:'Body = |Close − Open| · Upper wick = High − max(Open, Close) · Lower wick = min(Open, Close) − Low',
  pts:['Bullish candle: closes above the open; bearish candle: the reverse. Vietnam and the US usually use green = up, red = down (some Asian markets such as China use the opposite).','Long body: one side dominated. Short body: balance, indecision.','Long wick: price went there but was rejected — often more informative than the body.','Candlestick techniques were used by Munehisa Homma in the 18th-century Osaka rice market and popularized in the West by Steve Nison in 1991.','A candlestick pattern only means something in context: its position relative to the trend, support/resistance and volume.'],
  thr:[['Body > 70% of range','Dominant session (Marubozu if no wicks)'],['Body < 10% of range','Doji — indecision'],['Wick ≥ 2× body','Strong price rejection (Hammer, Shooting Star)']],
  hook:'<b>Memory tip:</b> the body tells who won, the wicks tell who got pushed back.',src:'Steve Nison, Japanese Candlestick Charting Techniques (1991; 2nd ed. 2001).'},
 {id:'dow',g:'Technical analysis',t:'Dow Theory',d:'The foundation of trend analysis',
  vis:()=>{ const pts=[[10,100],[40,70],[55,85],[90,45],[105,62],[140,25],[155,40],[190,15]]; return sv(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" style="stroke:var(--up)" stroke-width="2"/>${[[40,70,'H1'],[90,45,'H2'],[140,25,'H3']].map(([x,y,l])=>T(x,y-5,l,'text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--up)"')).join('')}${[[55,85,'L1'],[105,62,'L2'],[155,40,'L3']].map(([x,y,l])=>T(x,y+12,l,'text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold)"')).join('')}${T(100,118,'Each high above the last, each low above the last','text-anchor="middle" '+TS)}`,'Uptrend with rising highs and lows'); },
  f:'Uptrend = higher highs + higher lows',
  pts:['The market has three trends: primary (months to years), secondary (weeks to months, retracing 1/3–2/3 of the primary move) and minor (a few days).','A primary trend has three phases: accumulation (informed investors buy), public participation, and distribution.','The averages must confirm each other (originally the industrial and transportation averages).','Volume must confirm the trend: it rises in the direction of the primary trend.','A trend remains in effect until a clear reversal signal appears.'],
  thr:[['Lower high + broken low','Uptrend is broken']],
  hook:'<b>Memory tip:</b> “The trend is your friend — until it bends.”',src:'Charles H. Dow (Wall Street Journal, 1900–1902); Rhea, The Dow Theory (1932).'},
 {id:'sr',g:'Technical analysis',t:'Support, resistance and trendlines',d:'Where supply and demand have met before',
  vis:()=>sv(`<line x1="5" x2="195" y1="30" y2="30" style="stroke:var(--dn)" stroke-dasharray="5 3" stroke-width="1.5"/><line x1="5" x2="195" y1="90" y2="90" style="stroke:var(--up)" stroke-dasharray="5 3" stroke-width="1.5"/><polyline points="5,80 30,32 55,88 85,31 110,89 140,32 160,60 190,10" fill="none" style="stroke:var(--fg)" stroke-width="2"/>${T(8,24,'Resistance','style="font-size:8px;fill:var(--dn);font-weight:700"')}${T(8,102,'Support','style="font-size:8px;fill:var(--up);font-weight:700"')}${T(170,24,'Break','style="font-size:8px;font-weight:700;fill:var(--gold)"')}`,'Support and resistance zones'),
  f:'Broken resistance often becomes support (and vice versa)',
  pts:['Support: a price zone where buying was strong enough to stop a decline; resistance: the opposite.','Draw zones (price bands) rather than single lines; the more often a zone is touched, the more important it is — until it breaks.','Round numbers (50,000₫, $100), old highs/lows and the MA200 often act as psychological support/resistance.','An uptrend line connects at least two rising lows; a third touch confirms it.','A breakout is reliable when the close clearly exceeds the level on heavy volume; in Vietnam, the ATC session can create false breakouts.'],
  thr:[['Close beyond by > 3% with volume > 1.5× avg','Confirmed breakout']],
  hook:'<b>Memory tip:</b> the old ceiling becomes the new floor.',src:'Edwards & Magee, Technical Analysis of Stock Trends (1948; 11th ed. 2018).'},
 {id:'ma',g:'Technical analysis',t:'Moving averages (MA)',d:'SMA, EMA, golden cross and death cross',
  vis:()=>{ const X=v=>10+v*1.8, f=x=>60-25*Math.sin(x/16)-x*.15; let g=`<path d="${pathFn(f,0,100,X,v=>v)}" fill="none" style="stroke:var(--fg)" stroke-width="1.3"/>`;
    g+=`<path d="${pathFn(x=>f(x-6)+3,6,100,X,v=>v)}" fill="none" style="stroke:var(--us)" stroke-width="1.8"/><path d="${pathFn(x=>60-x*.15-10*Math.sin((x-14)/16),14,100,X,v=>v)}" fill="none" style="stroke:var(--gold)" stroke-width="1.8"/>`;
    return sv(g+T(150,112,'Short MA','style="font-size:8px;fill:var(--us);font-weight:700"')+T(10,112,'Long MA','style="font-size:8px;fill:var(--gold);font-weight:700"'),'Short and long moving averages'); },
  f:'SMAₙ = (C₁ + … + Cₙ) ÷ n · EMA = C × k + EMA₋₁ × (1 − k), k = 2/(n+1)',
  pts:['An SMA weights all prices equally; an EMA favors the most recent prices, so it reacts faster.','Common choices: MA20 (1 month), MA50 (a quarter), MA200 (a year). Many funds use the MA200 as the line between bull and bear markets.','Golden cross: MA50 crosses above MA200; death cross: crosses below. These are lagging signals — they confirm, they do not predict.','MAs act as dynamic support/resistance in strong trends.','In sideways markets, MA crossovers produce many false signals.'],
  thr:[['Price > MA50 > MA200','Bullish structure'],['Price < MA50 < MA200','Bearish structure']],
  hook:'<b>Memory tip:</b> an MA tells you “where we are”, not “where we’re going”.',src:'Murphy, Technical Analysis of the Financial Markets (1999), ch. 9.'},
 {id:'rsi-l',g:'Technical analysis',t:'RSI – Relative Strength Index',d:'Overbought, oversold and divergence',
  vis:()=>{ const X=v=>10+v*1.8, Y=v=>110-v; let g=`<rect x="10" y="${Y(70)}" width="180" height="40" style="fill:var(--gold);fill-opacity:.1"/><line x1="10" x2="190" y1="${Y(70)}" y2="${Y(70)}" style="stroke:var(--dn)" stroke-dasharray="4 3"/><line x1="10" x2="190" y1="${Y(30)}" y2="${Y(30)}" style="stroke:var(--up)" stroke-dasharray="4 3"/>`;
    g+=`<path d="${pathFn(x=>50+32*Math.sin(x/9)+5*Math.sin(x/3),0,100,X,Y)}" fill="none" style="stroke:var(--ceil)" stroke-width="2"/>`;
    return sv(g+T(192,Y(70)+3,'70','text-anchor="end" style="font-size:8px;fill:var(--dn)"')+T(192,Y(30)+3,'30','text-anchor="end" style="font-size:8px;fill:var(--up)"'),'RSI line oscillating between 30 and 70'); },
  f:'RSI = 100 − 100 ÷ (1 + RS) · RS = avg gain over 14 sessions ÷ avg loss over 14 sessions (Wilder smoothing)',
  pts:['RSI > 70: overbought; < 30: oversold — but in a strong trend RSI can stay in these zones for a long time.','In an uptrend RSI usually ranges 40–80; in a downtrend 20–60 (Andrew Cardwell’s rule).','Bearish divergence: price makes a new high but RSI does not — momentum is weakening. Bullish divergence: the reverse at a bottom.','The chart in the Chart tab computes RSI(14) using Wilder’s original smoothing method.'],
  thr:[['> 70','Overbought'],['50','Momentum dividing line'],['< 30','Oversold']],
  hook:'<b>Memory tip:</b> “70 trim, 30 watch” — but don’t try to call the top in a strong trend.',src:'J. Welles Wilder, New Concepts in Technical Trading Systems (1978).'},
 {id:'macd-l',g:'Technical analysis',t:'MACD',d:'Convergence – divergence of two EMAs',
  vis:()=>{ const X=v=>10+v*1.8, Ym=v=>62-v*2.2; let g=`<line x1="10" x2="190" y1="62" y2="62" style="stroke:var(--line2)"/>`; for(let i=0;i<100;i+=4){ const h=12*Math.sin(i/12)-2*Math.sin(i/5); g+=`<rect x="${X(i)}" y="${Math.min(62,Ym(h))}" width="5" height="${Math.abs(Ym(h)-62)}" style="fill:${h>=0?'var(--up)':'var(--dn)'};fill-opacity:.55"/>`; }
    g+=`<path d="${pathFn(x=>14*Math.sin(x/12),0,100,X,Ym)}" fill="none" style="stroke:var(--us)" stroke-width="1.8"/><path d="${pathFn(x=>14*Math.sin((x-6)/12),6,100,X,Ym)}" fill="none" style="stroke:var(--gold)" stroke-width="1.8"/>`;
    return sv(g+T(12,14,'MACD','style="font-size:8px;fill:var(--us);font-weight:700"')+T(50,14,'Signal','style="font-size:8px;fill:var(--gold);font-weight:700"')+T(100,14,'Histogram',TS),'MACD, signal line and histogram'); },
  f:'MACD = EMA12 − EMA26 · Signal = EMA9(MACD) · Histogram = MACD − Signal',
  pts:['MACD crossing above the signal line: momentum turns up; crossing below: turns down.','MACD above 0: EMA12 is above EMA26 — the short-term trend is up.','A shrinking histogram is an early warning before a crossover happens.','Divergence between MACD and price at tops/bottoms is a notable reversal signal.'],
  thr:[['Crossover above 0','Stronger bullish signal'],['Crossover below 0','Stronger bearish signal']],
  hook:'<b>Memory tip:</b> “12 – 26 – 9”.',src:'Gerald Appel (late 1970s); histogram: Thomas Aspray (1986).'},
 {id:'bb-l',g:'Technical analysis',t:'Bollinger Bands',d:'Volatility expanding and contracting around the average',
  vis:()=>{ const X=v=>10+v*1.8, f=x=>60-x*.2-6*Math.sin(x/8), w=x=>8+14*Math.abs(Math.sin(x/30)); let g=`<path d="${pathFn(x=>f(x)-w(x),0,100,X,v=>v)} L${X(100)} ${(f(100)+w(100)).toFixed(1)} ${pathFn(x=>f(100-x)+w(100-x),0,100,x=>X(100-x),v=>v).replace('M','L')}Z" style="fill:var(--mut);fill-opacity:.12"/>`;
    g+=`<path d="${pathFn(x=>f(x)-w(x),0,100,X,v=>v)}" fill="none" style="stroke:var(--mut)"/><path d="${pathFn(x=>f(x)+w(x),0,100,X,v=>v)}" fill="none" style="stroke:var(--mut)"/><path d="${pathFn(f,0,100,X,v=>v)}" fill="none" style="stroke:var(--mut)" stroke-dasharray="3 3"/><path d="${pathFn(x=>f(x)+w(x)*.8*Math.sin(x/5),0,100,X,v=>v)}" fill="none" style="stroke:var(--fg)" stroke-width="1.5"/>`;
    return sv(g+T(X(52),18,'Squeeze','text-anchor="middle" style="font-size:8px;fill:var(--gold);font-weight:700"'),'Bollinger Bands expanding and contracting'); },
  f:'Middle = SMA20 · Upper/Lower = SMA20 ± 2 × 20-session standard deviation',
  pts:['About 90% of closes fall inside the bands (not 95% as with a normal distribution, because prices are not normally distributed).','Narrowing bands (a squeeze) = low volatility, often ahead of a big move — but they do not tell you the direction.','Touching the upper band is not a sell signal: in a strong trend price “rides” the upper band.','%B = (Price − Lower band) ÷ (Upper band − Lower band) measures where price sits within the bands.'],
  thr:[['%B > 1','Above the upper band'],['%B < 0','Below the lower band']],
  hook:'<b>Memory tip:</b> contracting bands are like a compressed spring.',src:'John Bollinger, Bollinger on Bollinger Bands (2001).'},
 {id:'stoch-l',g:'Technical analysis',t:'Stochastic Oscillator',d:'Where the close sits within the recent range',
  vis:()=>{ const X=v=>10+v*1.8, Y=v=>110-v; let g=`<line x1="10" x2="190" y1="${Y(80)}" y2="${Y(80)}" style="stroke:var(--dn)" stroke-dasharray="4 3"/><line x1="10" x2="190" y1="${Y(20)}" y2="${Y(20)}" style="stroke:var(--up)" stroke-dasharray="4 3"/>`;
    g+=`<path d="${pathFn(x=>50+40*Math.sin(x/7),0,100,X,Y)}" fill="none" style="stroke:var(--us)" stroke-width="1.8"/><path d="${pathFn(x=>50+36*Math.sin((x-3)/7),3,100,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="1.8"/>`;
    return sv(g+T(12,14,'%K','style="font-size:8px;fill:var(--us);font-weight:700"')+T(32,14,'%D','style="font-size:8px;fill:var(--gold);font-weight:700"'),'%K and %D lines'); },
  f:'%K = (Close − Lowest 14) ÷ (Highest 14 − Lowest 14) × 100 · %D = SMA3(%K)',
  pts:['George Lane’s idea: in an uptrend, price tends to close near the top of its range.','> 80 overbought, < 20 oversold; %K/%D crossovers within these zones are signals.','More sensitive than RSI and suited to sideways markets; in strong trends it tends to give early counter-trend signals.'],
  thr:[['> 80','Overbought'],['< 20','Oversold']],
  hook:'<b>Memory tip:</b> Stochastic asks “is the close near the ceiling or the floor of the last 14 sessions?”.',src:'George Lane (1950s); Murphy (1999), ch. 10.'},
 {id:'volume-l',g:'Technical analysis',t:'Volume and OBV',d:'The real money behind price moves',
  vis:()=>{ let g=''; const v=[20,24,18,30,26,44,60,38,30,52,70,90]; v.forEach((h,i)=>g+=`<rect x="${14+i*15}" y="${112-h}" width="11" height="${h}" rx="1.5" style="fill:${i%3===2?'var(--dn)':'var(--up)'};fill-opacity:.65"/>`);
    g+=`<polyline points="${v.map((h,i)=>`${19.5+i*15},${50-i*3.4-(i%3===2?-6:0)}`).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="2"/>`;
    return sv(g+T(14,12,'OBV up with price = healthy trend','style="font-size:8px;fill:var(--gold);font-weight:700"'),'Volume and the OBV line'); },
  f:'OBV = OBV₋₁ + Vol (if price rises) / − Vol (if price falls)',
  pts:['Volume confirms the trend: rising prices on rising volume are healthy.','Price rising while volume keeps shrinking: buying is drying up — a warning.','Breaks of support/resistance on 1.5–2× the 20-session average volume are more reliable.','In Vietnam, also watch foreign-investor and proprietary-trading flows as a layer of “informed volume”.','OBV making a new high before price can foreshadow a rally (Granville).'],
  thr:[['Vol > 1.5 × MA20','Volume spike session']],
  hook:'<b>Memory tip:</b> “Volume leads price.”',src:'Joseph Granville, New Key to Stock Market Profits (1963).'},
 {id:'fibo',g:'Technical analysis',t:'Fibonacci retracements',d:'The 38.2% – 50% – 61.8% pullback levels',
  vis:()=>{ const lv=[[0,15],[.236,33],[.382,45],[.5,55],[.618,64],[1,95]]; let g=`<polyline points="10,95 80,15 120,60 190,10" fill="none" style="stroke:var(--fg)" stroke-width="2"/>`;
    lv.forEach(([r,y])=>g+=`<line x1="80" x2="195" y1="${y}" y2="${y}" style="stroke:${r===.618||r===.382?'var(--gold)':'var(--line2)'}" stroke-dasharray="3 3"/>`+T(196,y+3,fmt(r*100,1)+'%','text-anchor="end" style="font-size:7.5px;fill:var(--fg)"'));
    return sv(g,'Fibonacci retracement levels'); },
  f:'Level = High − (High − Low) × {23.6% · 38.2% · 50% · 61.8% · 78.6%}',
  pts:['61.8% is the golden ratio (φ − 1); 38.2% = 1 − 61.8%; 50% is not a Fibonacci number but is widely used (Dow).','Shallow pullbacks (23.6–38.2%) show a strong trend; deeper than 61.8% puts the original trend in doubt.','Fibonacci levels work largely because many people watch them — combine them with old support, MAs and volume.','The 161.8% extension is used to estimate price targets.'],
  thr:[['38.2%','Healthy pullback'],['50–61.8%','Common buy zone in an uptrend'],['> 78.6%','The trend may be broken']],
  hook:'<b>Memory tip:</b> “3 – 5 – 6”: 38, 50, 62.',src:'Leonardo Fibonacci, Liber Abaci (1202); Murphy (1999), ch. 13.'},
 {id:'ichimoku-l',g:'Technical analysis',t:'Ichimoku Kinko Hyo',d:'“Equilibrium at a glance”',
  vis:()=>{ const X=v=>10+v*1.8; const a=x=>55-x*.3-6*Math.sin(x/10), b=x=>62-x*.18; let g=`<path d="${pathFn(a,20,100,X,v=>v)} ${pathFn(x=>b(120-x),20,100,x=>X(120-x),v=>v).replace('M','L')}Z" style="fill:var(--up);fill-opacity:.15"/>`;
    g+=`<path d="${pathFn(x=>45-x*.35-8*Math.sin(x/6),0,100,X,v=>v)}" fill="none" style="stroke:var(--fg)" stroke-width="1.6"/><path d="${pathFn(x=>47-x*.33-5*Math.sin(x/7),0,90,X,v=>v)}" fill="none" style="stroke:var(--floor)" stroke-width="1.2"/><path d="${pathFn(x=>50-x*.32-3*Math.sin(x/9),0,90,X,v=>v)}" fill="none" style="stroke:var(--dn)" stroke-width="1.2"/>`;
    return sv(g+T(150,82,'Kumo','style="font-size:8px;fill:var(--up);font-weight:700"')+T(12,14,'Tenkan','style="font-size:8px;fill:var(--floor)"')+T(50,14,'Kijun','style="font-size:8px;fill:var(--dn)"'),'Ichimoku system with the cloud'); },
  f:'Tenkan = (High9 + Low9)/2 · Kijun = (High26 + Low26)/2 · Span A = (Tenkan + Kijun)/2 shifted 26 · Span B = (High52 + Low52)/2 shifted 26',
  pts:['Price above the cloud: uptrend; below: downtrend; inside: neutral.','A thick cloud is strong support/resistance; a thin cloud is easily pierced.','Tenkan crossing above Kijun above the cloud is the strongest bullish signal.','Developed by Goichi Hosoda and published in 1969 after decades of research.'],
  thr:[['Price > cloud, Tenkan > Kijun','Fully confirmed uptrend']],
  hook:'<b>Memory tip:</b> “9 – 26 – 52”.',src:'Goichi Hosoda (1969); Elliott, Ichimoku Charts (2007).'},
 {id:'elliott',g:'Technical analysis',t:'Elliott Waves',d:'5 impulse waves, 3 corrective waves',
  vis:()=>{ const P=[[5,105],[30,72],[45,85],[85,30],[100,52],[130,12],[148,48],[160,35],[185,72]]; let g=`<polyline points="${P.map(p=>p.join(',')).join(' ')}" fill="none" style="stroke:var(--fg)" stroke-width="2"/>`;
    ['1','2','3','4','5','A','B','C'].forEach((l,i)=>{ const [x,y]=P[i+1]; const up=i%2===0&&i<5||i===6; g+=T(x,up?y-5:y+12,l,'text-anchor="middle" style="font-size:9px;font-weight:800;fill:'+(i<5?'var(--up)':'var(--dn)')+'"'); });
    return sv(g,'Cycle of 5 impulse waves and 3 corrective waves'); },
  f:'Complete cycle = 5 impulse waves (1-2-3-4-5) + 3 corrective waves (A-B-C)',
  pts:['Three rules that must never be broken: wave 2 never retraces more than 100% of wave 1; wave 3 is never the shortest; wave 4 never overlaps the price territory of wave 1.','Wave 3 is usually the longest and strongest, with heavy volume.','The theory is highly interpretive — two analysts can count waves differently; use it as a thinking framework, not a precise forecasting tool.'],
  thr:[['Wave 2 retraces 50–61.8%','Common'],['Wave 3 ≈ 161.8% of wave 1','Typical target']],
  hook:'<b>Memory tip:</b> “Five steps up, three steps back.”',src:'Ralph N. Elliott, The Wave Principle (1938); Frost & Prechter (1978).'},
 {id:'atr-l',g:'Technical analysis',t:'ATR and stop-loss placement',d:'Stops based on volatility, not on gut feeling',
  vis:()=>{ let g=''; const c=[[50,58,46,55],[55,60,50,52],[52,57,47,56],[56,63,54,61],[61,66,57,58],[58,64,55,63],[63,70,60,68]]; g+=candlesMini(c.map(b=>b.map(v=>v+10)));
    g+=`<line x1="10" x2="190" y1="${115-58}" y2="${115-58}" style="stroke:var(--dn)" stroke-dasharray="4 3" stroke-width="1.5"/>`+T(130,115-50,'Stop = P − 2×ATR','style="font-size:8px;fill:var(--dn);font-weight:700"');
    return sv(g,'ATR-based stop-loss'); },
  f:'TR = max(High − Low, |High − Close₋₁|, |Low − Close₋₁|) · ATR = 14-session Wilder average of TR',
  pts:['ATR measures the true trading range, including price gaps.','Placing a stop 1.5–3 ATR from price helps avoid being “shaken out” by normal noise.','Combine with the “Position size” tool: a wider stop → buy fewer shares to keep the risk constant.','Chandelier exit: trail the stop at the highest high − 3 ATR as price rises.'],
  thr:[['ATR/price < 2%','Low volatility'],['> 4%','High volatility (small caps, cyclicals)']],
  hook:'<b>Memory tip:</b> your stop must sit outside the “noise” zone — that is, a few ATRs away.',src:'Wilder (1978); Chuck LeBeau, Chandelier Exit.'},
 {id:'ddm',g:'Valuation',t:'Dividend discount model (DDM)',d:'Gordon Growth and dividend stocks',
  vis:()=>{ let g=''; for(let i=0;i<8;i++){ const d=10*Math.pow(1.05,i), pv=d/Math.pow(1.1,i+1); g+=`<rect x="${14+i*20}" y="${100-d*4}" width="14" height="${d*4}" rx="2" style="fill:var(--line2)"/><rect x="${14+i*20}" y="${100-pv*4}" width="14" height="${pv*4}" rx="2" style="fill:var(--gold)"/>`; }
    return sv(g+T(100,116,'Dividends grow g = 5%/yr, discount r = 10%','text-anchor="middle" '+TS),'Future dividends and their present value'); },
  f:'P₀ = D₁ ÷ (r − g)',
  pts:['Suits mature companies with stable payouts (utilities, consumer staples, large banks).','g must be lower than r and sustainable: g ≈ ROE × (1 − payout ratio).','Example: D₁ = 3,000₫, r = 12%, g = 5% → P₀ = 3,000 ÷ 0.07 ≈ 42,857₫.','In Vietnam, many companies pay dividends in shares — that is not cash flow and should be excluded from a DDM.'],
  thr:[['r − g < 3%','Result is very sensitive, be careful']],
  hook:'<b>Memory tip:</b> “Next year’s dividend divided by the gap between r and g.”',src:'Gordon & Shapiro (1956); Gordon (1959), Review of Economics and Statistics.'},
 {id:'wacc',g:'Valuation',t:'Weighted average cost of capital (WACC)',d:'The minimum return a company must earn',
  vis:()=>sv(`<rect x="15" y="30" width="110" height="34" rx="4" style="fill:var(--gold);fill-opacity:.8"/>${T(70,51,'Equity 70% × 13%','text-anchor="middle" style="font-size:8.5px;font-weight:700;fill:var(--gold-ink)"')}<rect x="125" y="30" width="60" height="34" rx="4" style="fill:var(--us);fill-opacity:.8"/>${T(155,51,'Debt 30%×6%','text-anchor="middle" style="font-size:8px;font-weight:700;fill:#fff"')}${T(100,88,'× (1 − tax 20%)','text-anchor="middle" '+TS)}${T(100,108,'WACC ≈ 0.7×13% + 0.3×6%×0.8 ≈ 10.5%','text-anchor="middle" '+TB)}`,'WACC components'),
  f:'WACC = E/V × r_E + D/V × r_D × (1 − t)',
  pts:['r_E comes from CAPM; r_D is the marginal borrowing rate; t is the tax rate (Vietnam 20%, US federal 21%).','Use market values for E and D, not book values.','Adding debt lowers WACC (the tax shield) up to a point; beyond it, bankruptcy risk makes r_E and r_D jump.','WACC is the “hurdle” for ROIC and the discount rate in a free cash flow to the firm (FCFF) DCF.'],
  thr:[['US WACC (large companies)','Usually 7–10%'],['Vietnam WACC','Usually 11–15%']],
  hook:'<b>Memory tip:</b> debt is cheaper than equity thanks to the tax shield — but it is not free.',src:'Modigliani & Miller (1958, 1963); Damodaran (2012).'},
 {id:'ccc',g:'Quality',t:'Cash conversion cycle',d:'How many days a company’s cash is “buried”',
  vis:()=>sv(`<rect x="10" y="30" width="90" height="18" rx="3" style="fill:var(--us);fill-opacity:.8"/>${T(55,42,'DIO 60 days','text-anchor="middle" style="font-size:8px;fill:#fff;font-weight:700"')}<rect x="100" y="30" width="45" height="18" rx="3" style="fill:var(--gold);fill-opacity:.85"/>${T(122,42,'DSO 30','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold-ink)"')}<rect x="10" y="58" width="70" height="18" rx="3" style="fill:var(--up);fill-opacity:.8"/>${T(45,70,'DPO 45 days','text-anchor="middle" style="font-size:8px;fill:#fff;font-weight:700"')}<rect x="80" y="58" width="65" height="18" rx="3" style="fill:var(--dn);fill-opacity:.7"/>${T(112,70,'CCC 45','text-anchor="middle" style="font-size:8px;fill:#fff;font-weight:700"')}${T(100,100,'CCC = DIO + DSO − DPO','text-anchor="middle" '+TB)}`,'Cash conversion cycle'),
  f:'CCC = Days inventory + Days receivables − Days payables',
  pts:['The shorter the CCC, the less working capital a company needs to grow.','Negative CCC (Costco, Amazon, many retail chains): suppliers fund the growth.','Receivables growing faster than revenue is a sign of loosened credit to “push” sales — a yellow flag.','Vietnamese real estate developers often carry huge inventory — a CCC of hundreds of days.'],
  thr:[['CCC < 0','Supplier-funded business model'],['CCC up 3 years in a row','Check revenue quality']],
  hook:'<b>Memory tip:</b> “Inventory + Receivables − Payables”.',src:'Richards & Laughlin (1980), Financial Management 9(1).'},
 {id:'beneish',g:'Quality',t:'Beneish M-Score',d:'Spotting signs of “cooked” earnings',
  vis:()=>{ const X=v=>14+(v+4)/3*172; return sv(`<rect x="${X(-4)}" y="50" width="${X(-1.78)-X(-4)}" height="18" rx="3" style="fill:var(--up);fill-opacity:.7"/><rect x="${X(-1.78)}" y="50" width="${X(-1)-X(-1.78)}" height="18" rx="3" style="fill:var(--dn);fill-opacity:.7"/>${T(X(-1.78),44,'−1.78','text-anchor="middle" '+TB)}${T(X(-3),82,'Unlikely manipulator','text-anchor="middle" '+TS)}${T(X(-1.35),82,'Suspect','text-anchor="middle" style="font-size:8px;fill:var(--dn);font-weight:700"')}${T(100,22,'8 vars: DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA','text-anchor="middle" '+TS)}`,'Beneish M-Score threshold'); },
  f:'M = −4.84 + 0.92·DSRI + 0.528·GMI + 0.404·AQI + 0.892·SGI + 0.115·DEPI − 0.172·SGAI + 4.679·TATA − 0.327·LVGI',
  pts:['DSRI (receivables/revenue rising), GMI (gross margin deteriorating), AQI (“soft” assets rising), SGI (hot revenue growth) and TATA (large accruals) are the most important variables.','M > −1.78 (8-variable version) suggests a higher probability of manipulation — not proof.','The model flagged Enron before the scandal broke (according to a 1998 Cornell student study).','Combine with Piotroski (improving quality) and Altman (bankruptcy risk) for a full picture.'],
  thr:[['M < −2.22','Safer (5-variable version threshold)'],['M > −1.78','Suspect']],
  hook:'<b>Memory tip:</b> hot revenue + bloated receivables + large accruals = look closely.',src:'Beneish, M. D. (1999), “The Detection of Earnings Manipulation”, Financial Analysts Journal 55(5).'},
 {id:'famafrench',g:'Portfolio & risk',t:'Fama–French factor investing',d:'Why value, size, profitability and momentum earn a premium',
  vis:()=>{ const f=[['Market',100],['Size (SMB)',30],['Value (HML)',45],['Profit (RMW)',40],['Invest. (CMA)',32],['Momentum',55]]; let g=''; f.forEach(([n,v],i)=>{ g+=`<rect x="78" y="${8+i*18}" width="${v}" height="12" rx="3" style="fill:var(--gold);fill-opacity:${.35+i*.1}"/>`+T(74,17+i*18,n,'text-anchor="end" style="font-size:7.5px;fill:var(--fg)"'); });
    return sv(g+T(100,122,'Qualitative illustration, not data','text-anchor="middle" '+TS),'Fama–French factors'); },
  f:'Rᵢ − R_f = α + β·MKT + s·SMB + h·HML + r·RMW + c·CMA + ε',
  pts:['The 3-factor model (1993): market, size (small caps), value (low P/B). The 5-factor model (2015) adds profitability (RMW) and conservative investment (CMA).','Momentum (Carhart 1997; Jegadeesh & Titman 1993) is a common additional factor.','Factor premiums are not stable: value underperformed for a long stretch in the US in 2010–2020.','The Compass Score is itself a multi-factor model: valuation ~ HML, quality ~ RMW, momentum ~ MOM.'],
  thr:[['Statistically significant α > 0','True outperformance after accounting for factors']],
  hook:'<b>Memory tip:</b> most “alpha” is really beta to some factor.',src:'Fama & French (1993, 2015), Journal of Financial Economics; Carhart (1997), Journal of Finance.'},
 {id:'emh',g:'Behavior & cycles',t:'Efficient market hypothesis',d:'Three forms and their limits',
  vis:()=>sv(`<circle cx="100" cy="64" r="52" style="fill:var(--us);fill-opacity:.12;stroke:var(--us)"/><circle cx="100" cy="74" r="36" style="fill:var(--gold);fill-opacity:.15;stroke:var(--gold)"/><circle cx="100" cy="84" r="20" style="fill:var(--up);fill-opacity:.2;stroke:var(--up)"/>${T(100,22,'Strong: all info, incl. insider','text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')}${T(100,46,'Semi-strong: public info','text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')}${T(100,87,'Weak: past prices','text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')}`,'Three forms of market efficiency'),
  f:'Prices reflect all available information → you cannot systematically beat the market after adjusting for risk',
  pts:['Weak form: technical analysis gives no edge. Semi-strong form: fundamental analysis gives no edge. Strong form: not even inside information.','Supporting evidence: most active funds underperform their index after fees over the long run (SPIVA reports).','Counter-evidence: bubbles, anomalies (momentum, PEAD), behavioral finance.','Frontier/emerging markets such as Vietnam are thought to be less efficient than the US — both opportunities and risks are bigger.'],
  thr:[['Practical implication','Without a clear edge, a low-cost index fund is a strong choice']],
  hook:'<b>Memory tip:</b> “Weak – Semi-strong – Strong” = old prices – public news – inside info.',src:'Fama, E. (1970), “Efficient Capital Markets”, Journal of Finance 25(2); S&P SPIVA Scorecards.'},
 {id:'margin-trade',g:'US & VN markets',t:'Margin trading',d:'Leverage, maintenance ratio and margin calls',
  vis:()=>{ const X=v=>14+v/50*172, Y=v=>110-v*.9; let g=`<line class="axis" x1="14" y1="110" x2="190" y2="110"/><path d="M${X(0)} ${Y(0)} L${X(50)} ${Y(50)}" style="stroke:var(--mut)" stroke-width="1.5"/><path d="M${X(0)} ${Y(0)} L${X(50)} ${Y(100)}" style="stroke:var(--dn)" stroke-width="2"/>`;
    return sv(g+T(150,30,'1:1 margin','style="font-size:8px;fill:var(--dn);font-weight:700"')+T(150,76,'Unlevered','style="font-size:8px"')+T(100,122,'Price drop (%) →','text-anchor="middle" '+TS),'Leverage doubles losses'); },
  f:'Margin ratio = (Securities value − Debt) ÷ Securities value',
  pts:['Vietnam: the minimum initial margin is 50% under SSC rules; brokers set a maintenance ratio (usually 30–40%) and a liquidation ratio (call/force sell).','US: Regulation T requires 50% initial margin; FINRA requires a minimum 25% maintenance ratio (many brokers set 30–40%).','Borrowing 1:1 means a 25% price drop wipes out 50% of your capital; a 50% drop wipes you out entirely.','Waves of forced margin selling can send stocks limit-down for several sessions in a row in Vietnam (e.g., the 2022 episodes).'],
  thr:[['No borrowing','Safest'],['Borrowing ≤ 30% of portfolio','Acceptable for experienced investors'],['Borrowing 1:1','Very high risk']],
  hook:'<b>Memory tip:</b> margin amplifies both gains and losses — but losses have no ceiling.',src:'Circular 120/2020/TT-BTC (VN); Federal Reserve Regulation T; FINRA Rule 4210.'},
 {id:'costs',g:'US & VN markets',t:'Taxes, fees and hidden costs',d:'What eats into your returns every year',
  vis:()=>{ const X=v=>14+v/30*172, Y=v=>110-v/8*92; let g=`<line class="axis" x1="14" y1="110" x2="190" y2="110"/>`;
    [[0,'var(--gold)'],[1,'var(--us)'],[2,'var(--dn)']].forEach(([f,c])=>g+=`<path d="${pathFn(t=>Math.pow(1+(.10-f/100),t),0,30,X,Y)}" fill="none" style="stroke:${c}" stroke-width="2"/>`);
    return sv(g+T(160,20,'Fee 0%','style="font-size:8px;fill:var(--gold);font-weight:700"')+T(165,52,'1%','style="font-size:8px;fill:var(--us);font-weight:700"')+T(165,72,'2%','style="font-size:8px;fill:var(--dn);font-weight:700"')+T(100,122,'Years (10% gross) →','text-anchor="middle" '+TS),'Impact of fees over time'); },
  f:'Vietnam: 0.1% tax on sale value + 5% on cash dividends · US: capital gains tax depends on holding period',
  pts:['Vietnam: personal income tax of 0.1% of the value of every sell order (even at a loss), 5% on cash dividends; brokerage fees are usually 0.1–0.35% each way.','US (for US tax residents): short-term capital gains (< 1 year) are taxed as ordinary income; long-term at 0/15/20%; qualified dividends get preferential rates. Foreign investors usually have 30% withheld on dividends (reduced under tax treaties).','The bid–ask spread and slippage are hidden costs, large for illiquid stocks.','A 2%/year fee over 30 years can take roughly 40% of your ending wealth compared with no fee.'],
  thr:[['Trading once a week, 0.25% fee','≈ 26% of capital/year in fees and sell tax alone (VN)']],
  hook:'<b>Memory tip:</b> costs are the only negative return you control 100%.',src:'Personal Income Tax Law and Circular 111/2013/TT-BTC (VN); IRS Publication 550 (US). Check current regulations.'},
 {id:'earnings',g:'US & VN markets',t:'Earnings season and the event calendar',d:'The days when prices tend to swing hard',
  vis:()=>{ const m=['J','F','M','A','M','J','J','A','S','O','N','D']; let g=''; m.forEach((x,i)=>{ const hot=[0,3,6,9].includes(i)||[1,4,7,10].includes(i)&&false; const vn=[0,3,6,9].includes(i); g+=`<rect x="${8+i*15.5}" y="40" width="13" height="40" rx="2" style="fill:${[0,3,6,9].includes(i)?'var(--gold)':'var(--line2)'};fill-opacity:${[0,3,6,9].includes(i)?.85:.5}"/>`+T(14.5+i*15.5,92,x,'text-anchor="middle" style="font-size:7px"'); });
    return sv(g+T(100,28,'Earnings season: Jan, Apr, Jul, Oct','text-anchor="middle" '+TB)+T(100,110,'VN: quarterly reports in 20–30 days · US: 10-Q in 40–45 days','text-anchor="middle" style="font-size:7px"'),'Earnings season calendar'); },
  f:'Volatility around earnings release dates is often several times that of normal days',
  pts:['US: earnings season starts about 2 weeks after quarter-end, kicked off by the big banks; companies file a 10-Q (quarterly) and 10-K (annual) with the SEC.','Vietnam: listed companies publish quarterly financial statements within 20 days (30 days for parent companies with consolidated statements); audited annual statements within 90 days.','Major macro events: FOMC meetings (8 per year), US CPI, SBV meetings, and quarterly ETF rebalancings (VN30, FTSE, VNM ETF).','Derivatives expiry: the third Thursday of the month (VN30F) and the third Friday (US options).','“Buy the rumor, sell the news”: prices usually already reflect expectations before the release date.'],
  thr:[['Post-announcement drift (PEAD)','Price tends to keep drifting in the direction of the surprise for several weeks']],
  hook:'<b>Memory tip:</b> January–April–July–October are the “open the books” months.',src:'SEC Form 10-Q/10-K rules; Circular 96/2020/TT-BTC (information disclosure, VN); Bernard & Thomas (1989) on PEAD.'}
];
NEW_LESSONS.forEach(l=>LESSONS.push(l));
const ORDER=['Valuation','Quality','Technical analysis','Portfolio & risk','Behavior & cycles','US & VN markets'];
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));

/* câu hỏi mới */
[
 {q:'Where must a Hammer candle appear to signal a bullish reversal?',a:['After a decline','After a rally','In the middle of a sideways range','Anywhere'],c:0,e:'With the same shape, if it appears after a rally it is called a “Hanging Man” — a bearish signal. Context decides the meaning.'},
 {q:'How many candles make up a Morning Star pattern?',a:['3','1','2','5'],c:0,e:'A long bearish candle, a small-bodied candle (the star), then a long bullish candle closing deep into the first body.'},
 {q:'What is a Golden Cross?',a:['MA50 crosses above MA200','MA200 crosses above MA50','RSI rises above 70','Price breaks above the upper Bollinger Band'],c:0,e:'A short-term MA crossing above a long-term MA: the long-term trend turns up — a confirming signal that lags price.'},
 {q:'How is MACD calculated?',a:['EMA12 − EMA26','SMA50 − SMA200','RSI − 50','Price − MA20'],c:0,e:'The signal line is the EMA9 of MACD; the histogram is MACD minus the signal line.'},
 {q:'Which Fibonacci retracement level is called the “golden ratio”?',a:['61.8%','50%','23.6%','100%'],c:0,e:'0.618 = φ − 1. 38.2% = 1 − 0.618. The 50% level is not a Fibonacci number.'},
 {q:'In Elliott Wave theory, which wave can NEVER be the shortest?',a:['Wave 3','Wave 1','Wave 5','Wave B'],c:0,e:'Three hard rules: wave 2 never retraces more than 100% of wave 1; wave 3 is never the shortest; wave 4 never overlaps the price territory of wave 1.'},
 {q:'What does a Bollinger Band squeeze signal?',a:['Low volatility, with a big move likely ahead','Price will certainly rise','Price will certainly fall','Liquidity has dried up for good'],c:0,e:'A squeeze tells you volatility is about to expand but not the direction — you need other signals for that.'},
 {q:'When is a Head and shoulders pattern confirmed?',a:['When price closes below the neckline','When the head forms','When the left shoulder forms','When RSI is below 30'],c:0,e:'Price target = distance from the head to the neckline, measured down from the breakout point.'},
 {q:'Which chart pattern is William O’Neil’s “favorite” (CAN SLIM)?',a:['Cup and handle','Head and shoulders','Rising wedge','Triple top'],c:0,e:'A U-shaped bottom followed by a small pullback (the handle), breaking out on heavy volume.'},
 {q:'Which chart type does NOT use an evenly spaced time axis?',a:['Renko','Japanese candlesticks','OHLC bars','Line'],c:0,e:'Renko only draws a new brick when price moves a full box, so the horizontal axis counts bricks. Three Line Break charts work the same way.'},
 {q:'How does Heikin-Ashi calculate the close?',a:['(Open + High + Low + Close) ÷ 4','Same as the actual close','(High + Low) ÷ 2','3-session average'],c:0,e:'The HA open = the average of the previous candle’s HA open and close. HA candles smooth the trend but are not actual traded prices.'},
 {q:'What is the Gordon (DDM) formula for valuing a stock?',a:['D₁ ÷ (r − g)','EPS × P/E','D₀ × r','FCF ÷ g'],c:0,e:'Example: D₁ = 3,000₫, r = 12%, g = 5% → 42,857₫. Very sensitive when r − g is small.'},
 {q:'What does a negative cash conversion cycle (CCC) mean?',a:['Suppliers are funding the company’s working capital','The company is about to go bankrupt','Inventory is too large','Revenue is falling'],c:0,e:'CCC = DIO + DSO − DPO. Costco and Amazon have negative CCCs: they collect from customers before they have to pay suppliers.'},
 {q:'What is the Beneish M-Score used to detect?',a:['The likelihood of earnings manipulation','Bankruptcy risk','Cheap valuation','Price momentum'],c:0,e:'Common threshold for the 8-variable version: M > −1.78 is suspect. Bankruptcy is Altman Z’s job.'},
 {q:'In Vietnam, what is the tax on selling listed stocks?',a:['0.1% of the sale value, even at a loss','20% of the profit','5% of the sale value','Tax-free'],c:0,e:'Cash dividends are also taxed at 5%. Brokerage fees are charged separately by each securities firm.'},
 {q:'What minimum initial margin does US Regulation T require?',a:['50%','25%','10%','100%'],c:0,e:'FINRA requires a minimum 25% maintenance ratio; many brokers set it higher.'},
 {q:'What condition does a Bullish Engulfing require?',a:['The bullish body covers the previous bearish body','Two candles with equal lows','A bullish candle inside the bearish body','A downside price gap'],c:0,e:'“Inside the previous body” is a Harami. Two equal lows is a Tweezer Bottom.'},
 {q:'Ichimoku: what does price above the Kumo cloud indicate?',a:['Uptrend','Downtrend','Sideways','Oversold'],c:0,e:'Above the cloud: up; below: down; inside: neutral. The classic parameter set is 9 – 26 – 52.'}
].forEach(q=>QUIZ.push(q));

/* ---------- mở chi tiết mẫu nến / mô hình ---------- */
function openCandle(id){
  const p=CDL.find(x=>x.id===id); if(!p) return; const i=CDL.indexOf(p), next=CDL[(i+1)%CDL.length];
  const catCls=p.cat.includes('Bullish')?'g-A':p.cat.includes('Bearish')?'g-D':'g-C';
  openSheet(p.n,`<div class="lesson">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="grade ${catCls}" style="font-size:12.5px;padding:3px 9px">${esc(p.cat)}</span><span class="chip">${p.k}-candle</span><span class="chip">Reliability: ${esc(p.rel)}</span><span class="note">${esc(p.en)}</span></div>
    <div class="vis">${cdlSVG(p,{h:140})}</div>
    <p class="note">Gray candles: the prior ${p.ctx==='down'?'downtrend':p.ctx==='up'?'uptrend':'context (any)'}. Colored candles: the pattern.</p>
    <p style="font-size:15px">${esc(p.d)}</p>
    <div class="hook" style="border-color:var(--us)"><b style="color:var(--us)">Confirmation:</b> ${esc(p.cf)}</div>
    <div class="hook"><b>Memory tip:</b> ${esc(p.h)}</div>
    <p class="note">Reliability is a qualitative rating compiled from the literature (Nison; Bulkowski, Encyclopedia of Candlestick Charts, 2008), not a probability. Always combine it with the trend, support/resistance and volume.</p>
    <div class="row-btns"><button class="btn pri" id="cNext">Next pattern: ${esc(next.n)}</button><button class="btn" id="cChart">Find on chart</button></div></div>`,body=>{
    $('#cNext').onclick=()=>openCandle(next.id);
    $('#cChart').onclick=()=>{ closeSheet(); CH.ind.pat=true; if(['renko','lb','line','area'].includes(CH.type)) CH.type='candle'; saveChartPrefs(); setView('chart'); };
  });
}
function openChartPattern(id){
  const p=CPAT.find(x=>x.id===id); if(!p) return; const i=CPAT.indexOf(p), next=CPAT[(i+1)%CPAT.length];
  const catCls=p.cat.includes('Bullish')?'g-A':p.cat.includes('Bearish')?'g-D':'g-C';
  openSheet(p.n,`<div class="lesson">
    <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="grade ${catCls}" style="font-size:12.5px;padding:3px 9px">${esc(p.cat)}</span><span class="chip">Reliability: ${esc(p.rel)}</span></div>
    <div class="vis">${cpatSVG(p)}</div>
    <div class="legend" style="margin:0"><span><i style="background:var(--gold)"></i>Neckline / support – resistance</span><span><i style="background:var(--us)"></i>Boundary line</span><span><i style="background:var(--up)"></i>Measured target</span></div>
    <p style="font-size:15px">${esc(p.d)}</p>
    <table class="thr"><tr><td><b>Measuring the target</b></td><td>${esc(p.m)}</td></tr><tr><td><b>Volume</b></td><td>${esc(p.v)}</td></tr></table>
    <p class="note">Sources: Edwards & Magee, Technical Analysis of Stock Trends; Bulkowski, Encyclopedia of Chart Patterns (3rd ed., 2021). Measured targets are rules of thumb; price often falls short of them.</p>
    <div class="row-btns"><button class="btn pri" id="pNext">Next pattern: ${esc(next.n)}</button></div></div>`,()=>{ $('#pNext').onclick=()=>openChartPattern(next.id); });
}
/* ôn tập nhận diện nến */
function startCandleQuiz(){
  const pool=shuffle(CDL).slice(0,8); const st={k:0,score:0};
  const render=()=>{
    if(st.k>=pool.length){ store.cdlBest=Math.max(store.cdlBest||0,st.score); persist();
      $('#sheetBody').innerHTML=`<div class="lesson" style="text-align:center;align-items:center"><div class="bigring" style="margin:10px auto">${ringSVG(st.score/pool.length*100,108,9)}<div class="v"><b>${st.score}/${pool.length}</b><span>identified correctly</span></div></div><p>${st.score>=7?'You read candles very well.':st.score>=5?'Pretty good — review the patterns you mixed up.':'Browse the candlestick library again, then try once more.'}</p><div class="row-btns" style="justify-content:center"><button class="btn pri" id="cqAgain">Try 8 more patterns</button><button class="btn" id="cqClose">Back to library</button></div></div>`;
      animateRings($('#sheetBody')); $('#cqAgain').onclick=startCandleQuiz; $('#cqClose').onclick=()=>{ closeSheet(); if(S.view==='learn') RENDER.learn(); }; return; }
    const p=pool[st.k]; const others=shuffle(CDL.filter(x=>x.id!==p.id&&x.cat===p.cat).concat(shuffle(CDL.filter(x=>x.id!==p.id&&x.cat!==p.cat)))).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);
    const opts=shuffle([p].concat(others));
    $('#sheetBody').innerHTML=`<div class="lesson"><div style="display:flex;justify-content:space-between"><span class="note">Pattern ${st.k+1}/${pool.length}</span><span class="note">Correct: ${st.score}</span></div><div class="progress"><i style="width:${st.k/pool.length*100}%"></i></div>
      <h3 style="font-size:19px">Which candlestick pattern is this?</h3><div class="vis">${cdlSVG(p,{h:140})}</div>
      <div style="display:flex;flex-direction:column;gap:8px" id="cqOpts">${opts.map(o=>`<button class="quiz-opt" data-id="${o.id}">${esc(o.n)}</button>`).join('')}</div><div id="cqFb"></div></div>`;
    let done=false;
    $$('#cqOpts .quiz-opt').forEach(b=>b.onclick=()=>{ if(done) return; done=true; const ok=b.dataset.id===p.id; if(ok) st.score++;
      $$('#cqOpts .quiz-opt').forEach(x=>{ if(x.dataset.id===p.id) x.classList.add('ok'); x.disabled=true; }); if(!ok) b.classList.add('bad');
      $('#cqFb').innerHTML=`<div class="hook" style="border-color:${ok?'var(--up)':'var(--dn)'}"><b style="color:${ok?'var(--up)':'var(--dn)'}">${ok?'Correct.':'Not quite — this is '+esc(p.n)+'.'}</b> ${esc(p.d)}</div><div class="row-btns" style="margin-top:10px"><button class="btn pri" id="cqNext">${st.k+1<pool.length?'Next pattern':'See results'}</button></div>`;
      $('#cqNext').onclick=()=>{ st.k++; render(); }; });
  };
  openSheet('Candlestick pattern quiz','',()=>render());
}
/* mở rộng màn hình Học thuật */
const _learnBase=RENDER.learn;
RENDER.learn=function(){ _learnBase(); appendLibs(); };
function appendLibs(){
  const el=$('#v-learn'); const cats=['Bullish reversal','Bearish reversal','Continuation','Indecision'];
  const lib=document.createElement('section'); lib.id='cdlLib';
  lib.innerHTML=`<div class="sec-h"><div><h2 style="font-size:18px">Japanese candlestick library</h2><p>${CDL.length} patterns · context, confirmation, memory tips · best quiz score ${store.cdlBest||0}/8</p></div><button class="btn sm pri" id="startCdlQuiz">Practice</button></div>
   <div class="chips" style="margin-bottom:10px" role="group" aria-label="Filter candlestick pattern groups">${['All'].concat(cats).map((c,i)=>`<button class="chip ${i===0?'on':''}" data-cdlcat="${c}" aria-pressed="${i===0}">${c}</button>`).join('')}</div>
   <div class="learn-grid cdl-grid">${CDL.map(p=>`<button class="lcard" data-cdl="${p.id}" data-cat="${esc(p.cat)}"><span class="th">${cdlSVG(p)}</span><span class="tx"><b>${esc(p.n)}</b><span>${esc(p.cat)} · ${p.k}-candle · reliability ${esc(p.rel.toLowerCase())}</span></span></button>`).join('')}</div>`;
  const cp=document.createElement('section'); cp.id='cpatLib';
  cp.innerHTML=`<div class="sec-h"><div><h2 style="font-size:18px">Classic chart patterns</h2><p>${CPAT.length} patterns · how to measure price targets</p></div></div>
   <div class="learn-grid">${CPAT.map(p=>`<button class="lcard" data-cpat="${p.id}"><span class="th">${cpatSVG(p)}</span><span class="tx"><b>${esc(p.n)}</b><span>${esc(p.cat)} · reliability ${esc(p.rel.toLowerCase())}</span></span></button>`).join('')}</div>`;
  const anchor=$$('#v-learn > section').find(s=>s.querySelector('h2')&&s.querySelector('h2').textContent==='Technical analysis');
  if(anchor){ anchor.after(lib); lib.after(cp); } else { el.appendChild(lib); el.appendChild(cp); }
  $('#startCdlQuiz').onclick=startCandleQuiz;
  $$('[data-cdlcat]',lib).forEach(b=>b.onclick=()=>{ const c=b.dataset.cdlcat; $$('[data-cdlcat]',lib).forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',String(x===b)); }); $$('.cdl-grid .lcard',lib).forEach(card=>card.hidden= c!=='All'&&card.dataset.cat!==c); });
  if(S._scrollCdl){ S._scrollCdl=false; setTimeout(()=>lib.scrollIntoView({block:'start'}),50); }
}
const _openLessonBase=openLesson;
openLesson=function(id){ if(id==='cdl-library'){ closeSheet(); S._scrollCdl=true; setView('learn',{keepScroll:true}); return; } _openLessonBase(id); };
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-cdl]'); if(c){ openCandle(c.dataset.cdl); return; }
  const p=e.target.closest('[data-cpat]'); if(p){ openChartPattern(p.dataset.cpat); return; }
});
