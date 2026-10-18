import json,glob,sys,random,math
from playwright.sync_api import sync_playwright
SCR="/tmp/claude-0/-home-claude/3d0e7046-bf55-520e-bb99-30e0af9e9b36/scratchpad"; GSAP=SCR+"/node_modules/gsap/dist/gsap.min.js"
src=open("/home/claude/labans/la-ban-co-phieu.html",encoding="utf8").read()
open(SCR+"/test.html","w",encoding="utf8").write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+src+'</body></html>')
D={}
for p in glob.glob("/home/claude/labans/out3/snap/*.json"): D["snap/"+p.split('/')[-1][:-5]]=json.load(open(p))
for p in glob.glob("/home/claude/labans/out3/hist/*.json"): D["hist/"+p.split('/')[-1][:-5]]=json.load(open(p))
D["meta/feed"]={"upd":"2026-10-17T12:06:49+00:00","usDate":"2026-10-16","vnDate":"2026-10-16","ok":58,"failed":[]}
mock="""window.__D=%s;
window.claude={use:async(name)=>{ if(name!=='db') return null; await new Promise(r=>setTimeout(r,200));
 const snap=(p)=>{ const v=window.__D[p]; return {id:p.split('/').pop(),exists:!!v,data:()=>v}; };
 return {collection:(p)=>({onSnapshot:(n)=>{ setTimeout(()=>n({docs:[],size:0,empty:true,docChanges:()=>[]}),30); return ()=>{}; }}),
  doc:(p)=>({onSnapshot:(next,err)=>{ setTimeout(()=>next(snap(p)),40+Math.random()*60); return ()=>{}; }, get:()=>new Promise(r=>setTimeout(()=>r(snap(p)),80))})}; }};""" % json.dumps(D)
def run(pw,name,vp,mobile,scheme,with_db=True):
    b=pw.chromium.launch(); ctx=b.new_context(viewport=vp,device_scale_factor=2 if mobile else 1,is_mobile=mobile,has_touch=mobile,color_scheme=scheme); p=ctx.new_page(); errs=[]
    if __import__('os').environ.get('LB_LANG')=='en': p.add_init_script("try{localStorage.setItem('labanCoPhieu.lang','en')}catch(e){}"); name=name+'-en'
    if with_db: p.add_init_script(mock)
    p.on("pageerror",lambda e: errs.append("PAGEERR "+str(e))); p.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
    p.route("https://cdnjs.cloudflare.com/**",lambda r: r.fulfill(path=GSAP,content_type="application/javascript")); p.route("https://fonts.googleapis.com/**",lambda r: r.fulfill(body="",content_type="text/css"))
    t0=__import__('time').time(); p.goto("file://"+SCR+"/test.html"); p.wait_for_timeout(1500); clicks=0
    def L(*a): print(f"  [{name}]",*a,flush=True)
    L("load+1.5s", round(__import__('time').time()-t0,2),"s")
    def ov(tag):
        w=p.evaluate("[document.documentElement.scrollWidth,innerWidth]")
        if w[0]>w[1]+1: L("OVERFLOW",tag,w)
    def click(sel,nth=None,wait=150):
        nonlocal clicks; loc=p.locator(sel) if nth is None else p.locator(sel).nth(nth); loc.scroll_into_view_if_needed(timeout=3000); loc.click(timeout=4000); clicks+=1; p.wait_for_timeout(wait)
    L("brand:", p.locator("#brandSub").inner_text())
    L("live:", p.locator(".live-panel").inner_text()[:220].replace("\n"," | "))
    ov("home"); p.screenshot(path=f"{SCR}/{name}-h.png",full_page=True)
    for m in ["US","ALL","VN"]:
        click(f'#mktSeg button[data-m="{m}"]',wait=300); ov("home-"+m)
    L("hero stats:", p.locator(".hero-stats").inner_text().replace("\n"," "))
    p.locator("#dist").screenshot(path=f"{SCR}/{name}-dist.png")
    if with_db and p.locator(".ps").count(): click(".ps",0,400); L("pair sheet:", p.locator("#sheetBody").inner_text()[:200].replace("\n"," | ")); p.screenshot(path=f"{SCR}/{name}-pairsheet.png",full_page=False); click("#sheetClose",wait=400)
    click('#tabbar button[data-v="screen"]',wait=300)
    L("count:", p.locator("#resCount").inner_text())
    click("#mktSeg button[data-m=\"US\"]",wait=300); n0=p.locator("#resList .srow").count()
    if p.locator("#moreRows").count(): click("#moreRows",wait=300)
    L("rows",n0,"->",p.locator("#resList .srow").count())
    for v in ["tgt","mo","pe","chg"]: p.select_option("#fSort",v); p.wait_for_timeout(120)
    click("#mktSeg button[data-m=\"VN\"]",wait=300)
    if p.locator("#fEx").count(): p.select_option("#fEx","HNX"); p.wait_for_timeout(150); L("HNX:",p.locator("#resCount").inner_text()); p.select_option("#fEx","all")
    p.fill("#q","hoa"); p.wait_for_timeout(200); L("search hoa:",p.locator("#resCount").inner_text()); p.fill("#q","")
    click("#resList .srow",0,500); L("detail:", p.locator("#sheetBody").inner_text()[:260].replace("\n"," | ")); ov("detail"); p.screenshot(path=f"{SCR}/{name}-detail.png",full_page=False)
    p.locator("#sheetBody").evaluate("e=>e.scrollTop=900"); p.wait_for_timeout(200); p.screenshot(path=f"{SCR}/{name}-detail2.png",full_page=False)
    click("#dChart",wait=700); L("chart:", p.locator("#v-chart .disc").first.inner_text()[:140]); ov("chart")
    p.select_option("#chT","E:TQQQ"); p.wait_for_timeout(700); L("chart TQQQ:", p.locator("#v-chart .disc").first.inner_text()[:140])
    p.select_option("#chT","FPT"); p.wait_for_timeout(700); L("chart FPT:", p.locator("#v-chart .disc").first.inner_text()[:140])
    click('#tabbar button[data-v="screen"]',wait=300)
    click('[data-sm="etf"]',wait=400); L("etf:", p.locator("#eCount").inner_text()); ov("etf"); p.screenshot(path=f"{SCR}/{name}-etf.png",full_page=True)
    for g in ["lev",("Bonds" if name.endswith('-en') else "Trái phiếu"),"star","all"]:
        click(f'[data-eg="{g}"]',wait=200); L(" grp",g,p.locator("#eCount").inner_text())
    for v in ["er","dy","r1y","chg","chgabs","b","lev","age","aum"]: p.select_option("#eSort",v); p.wait_for_timeout(80)
    p.fill("#eq","nasdaq"); p.wait_for_timeout(200); L(" search nasdaq:",p.locator("#eCount").inner_text()); p.fill("#eq","")
    click("#eList .star",0); click("#eList .erow",0,500); L("etf sheet:", p.locator("#sheetBody").inner_text()[:240].replace("\n"," | ")); ov("etfsheet"); p.screenshot(path=f"{SCR}/{name}-etfsheet.png",full_page=False)
    if p.locator("#ePair").count(): click("#ePair",wait=500); L("pair from etf:",p.locator("#sheetTitle").inner_text())
    click("#sheetClose",wait=400)
    click('[data-sm="pairs"]',wait=600); L("pairs cards:", p.locator(".pcard").count()); ov("pairs"); p.screenshot(path=f"{SCR}/{name}-pairs.png",full_page=False)
    for v in ["decay","dev","lev","grp","move"]: p.select_option("#pSort",v); p.wait_for_timeout(120)
    click('[data-pg="'+("Single Stock" if name.endswith('-en') else "Cổ phiếu đơn")+'"]',wait=300); L(" single-stock pairs:",p.locator(".pcard").count()); click('[data-pg="all"]',wait=300)
    click(".pcard",0,600); L("pair:", p.locator("#pairBody").inner_text()[:300].replace("\n"," | ")); p.screenshot(path=f"{SCR}/{name}-pair.png",full_page=False)
    click("[data-etf-open]",0,500); click("#sheetClose",wait=400)
    click('[data-pv="table"]',wait=300); L("table rows:",p.locator(".ptab tbody tr").count()); ov("ptable"); click(".ptab tbody tr",0,500); click("#sheetClose",wait=400); click('[data-pv="card"]',wait=200)
    click('[data-lesson="etf-pairs"]',wait=400); L("lesson:",p.locator("#sheetTitle").inner_text()); click("#sheetClose",wait=400)
    click('[data-sm="stock"]',wait=300)
    click('#tabbar button[data-v="expert"]',wait=400); ov("expert")
    click('#tabbar button[data-v="learn"]',wait=400); L("learn groups:", p.locator("#v-learn").inner_text().count("ETF")); ov("learn")
    click('#tabbar button[data-v="port"]',wait=400); ov("port")
    click('#tabbar button[data-v="home"]',wait=300)
    if with_db: click("#liveInfo",wait=300); L("feed:", p.locator("#sheetBody").inner_text()[:400].replace("\n"," | ")); click("#sheetClose",wait=300)
    L(f"clicks={clicks} errors={len(errs)}"); [L("  ",e[:300]) for e in errs[:10]]; b.close()
with sync_playwright() as pw:
    which=sys.argv[1] if len(sys.argv)>1 else 'all'
    if which in('all','iphone'): run(pw,"iphone",{"width":390,"height":844},True,"dark")
    if which in('all','desktop'): run(pw,"desktop",{"width":1300,"height":820},False,"light")
    if which in('all','nodb'): run(pw,"nodb",{"width":390,"height":844},True,"dark",with_db=False)
