#!/usr/bin/env python3
"""Склеивает сайт в один index.bundle.html (CSS, JS, данные и картинки внутри)."""
import re,base64,os
d=os.path.dirname(os.path.abspath(__file__));r=lambda p:open(os.path.join(d,p),encoding="utf-8").read()
h=r("index.html")
h=h.replace('<link rel="stylesheet" href="css/styles.css">','<style>'+r("css/styles.css")+'</style>')
h=h.replace('<script src="js/posts.js"></script><script src="js/cases.js"></script><script src="js/layout.js"></script><script src="js/app.js"></script>','<script>'+r("js/posts.js")+'\n'+r("js/cases.js")+'\n'+r("js/layout.js")+'\n'+r("js/app.js")+'</script>')
for m in set(re.findall(r'src="(assets/[^"]+)"',h)):
    h=h.replace('src="%s"'%m,'src="data:image/png;base64,'+base64.b64encode(open(os.path.join(d,m),"rb").read()).decode()+'"')
open(os.path.join(d,"index.bundle.html"),"w",encoding="utf-8").write(h);print(len(h))
