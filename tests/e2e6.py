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
def run(pw,name,vp,mobile,scheme):
    b=pw.chromium.launch(); ctx=b.new_context(viewport=vp,device_scale_factor=2 if mobile else 1,is_mobile=mobile,has_touch=mobile,color_scheme=scheme); p=ctx.new_page(); errs=[]
    p.add_init_script(mock)
    p.on("pageerror",lambda e: errs.append("PAGEERR "+str(e))); p.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
    p.route("https://cdnjs.cloudflare.com/**",lambda r: r.fulfill(path=GSAP,content_type="application/javascript")); p.route("https://fonts.googleapis.com/**",lambda r: r.fulfill(body="",content_type="text/css"))
    p.goto("file://"+SCR+"/test.html"); p.wait_for_timeout(1200); clicks=0
    def L(*a): print(f"  [{name}]",*a,flush=True)
    def ov(tag):
        w=p.evaluate("[document.documentElement.scrollWidth,innerWidth]")
        if w[0]>w[1]+1: L("OVERFLOW",tag,w)
    def click(sel,nth=None,wait=200):
        nonlocal clicks; loc=p.locator(sel) if nth is None else p.locator(sel).nth(nth); loc.scroll_into_view_if_needed(timeout=3000); loc.click(timeout=4000); clicks+=1; p.wait_for_timeout(wait)
    click('#tabbar button[data-v="learn"]',wait=900); ov("learn")
    L("hero:", p.locator(".lv-hero-top").inner_text().replace("\n"," | "))
    p.screenshot(path=f"{SCR}/{name}-learn.png",full_page=False)
    p.locator(".lv-hero").screenshot(path=f"{SCR}/{name}-ladder.png")
    for i in range(1,11):
        click(f'.lv-list [data-lvgo="{i}"]',wait=300); ov(f"lv{i}")
        L(f"lv{i}:", p.locator("#lvTitle").inner_text(), p.locator("#lvDetail .lcard").count(),"bài")
    click('.lv-list [data-lvgo="1"]',wait=300)
    p.locator("#lvDetail").screenshot(path=f"{SCR}/{name}-lv1.png")
    # read all lessons of level 1 via next button
    click("#lvDetail .lcard",0,500)
    for k in range(5):
        L(" lesson:", p.locator("#sheetTitle").inner_text(),"|",p.locator("#sheetBody .note").first.inner_text())
        if k==0: p.screenshot(path=f"{SCR}/{name}-l1lesson.png")
        click("#lDone",wait=350); click("#lNext",wait=500)
    L("after last next:", p.locator("#sheetTitle").inner_text())
    # level quiz: answer correctly by reading ok class? choose option, count
    for q in range(5):
        if not p.locator("#qOpts .quiz-opt").count(): break
        click("#qOpts .quiz-opt",0,150); click("#qNext",wait=250)
    L("quiz end:", p.locator("#sheetBody").inner_text()[:120].replace("\n"," | "))
    if p.locator("#lqClose").count(): click("#lqClose",wait=500)
    click('.ladder [data-lv="9"]',wait=400); L("ladder click ->", p.locator("#lvTitle").inner_text())
    click('[data-lesson="cdl-library"]',wait=600)
    click('#tabbar button[data-v="learn"]',wait=600)
    click('#startQuiz',wait=500); L("review q:", p.locator("#sheetBody h3").inner_text()[:80]); click("#sheetClose",wait=400)
    for lid in ["l1-risk","l2-board","l2-index","l2-orders","l3-dca","l4-3fs","l4-eps","l1-market","l1-start"]:
        p.evaluate(f"document.querySelector('[data-lesson=\"{lid}\"]')||0")
    ov("end"); L(f"clicks={clicks} errors={len(errs)}"); [L("  ",e[:300]) for e in errs[:10]]; b.close()
with sync_playwright() as pw:
    run(pw,"iphone",{"width":390,"height":844},True,"dark"); run(pw,"desktop",{"width":1300,"height":820},False,"light")
