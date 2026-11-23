(function(){
var $=function(i){return document.getElementById(i)},PS=window.POSTS,CS=window.CASES,ov=$("ov"),mod=$("mod"),cur="home",sy={},lastF=null;
var M=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
function dt(s){var d=new Date(s+"T00:00:00");return d.getDate()+" "+M[d.getMonth()]+" "+d.getFullYear()}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function attr(s){return esc(s).replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}
function assetPath(s){if(!s)return "";s=String(s).trim();if(/^(https?:|data:|\/)/i.test(s)||s.indexOf("../")===0||s.indexOf("content/")===0||s.indexOf("assets/")===0)return s;return "content/"+s}
// Лента: размеры из файлов материалов; последний по дате пост заменён подпиской.
var feedPosts=PS.slice(0,-1);
function tg(p){return p.fmt||p.topic?'<div class="tags">'+(p.fmt?'<span class="tag">'+esc(p.fmt)+'</span>':'')+(p.topic?'<span class="tag t">'+esc(p.topic)+'</span>':'')+'</div>':''}
function card(x){var p=x.p,photo=p.cover?'<img class="feed-image" src="'+attr(assetPath(p.cover))+'" alt="">':'';return '<button class="card s-'+p.size+' sp'+x.s+(p.accent?' ac':'')+'" style="grid-column:span '+x.s+'" data-post="'+attr(p.slug)+'" data-from="materials">'+tg(p)+'<h3 class="serif">'+esc(p.title)+'</h3>'+photo+'</button>'}
$("feed").innerHTML=layoutRows(feedPosts).map(function(r){return r.map(card).join("")}).join("")+
'<section class="card wide newsletter" aria-labelledby="newsletter-title"><div class="newsletter-copy"><span class="k">Письма AI Business SPb</span><h3 class="serif" id="newsletter-title">Полезное — прямо в почту</h3><p>Разборы проектов, анонсы событий и другие полезные материалы.</p></div><form id="newsletter-form" class="newsletter-form"><label class="newsletter-label" for="newsletter-email">Ваш email</label><div class="newsletter-row"><input id="newsletter-email" name="email" type="email" autocomplete="email" placeholder="name@example.com" required><button type="submit">Подписаться</button></div><p class="newsletter-note" id="newsletter-note">Откроется почтовая программа для подтверждения подписки.</p></form></section>';
$("newsletter-form").addEventListener("submit",function(e){e.preventDefault();var email=$("newsletter-email");if(!email.reportValidity())return;var subject=encodeURIComponent("Подписка на рассылку AI Business SPb"),body=encodeURIComponent("Здравствуйте! Прошу подписать меня на email-рассылку AI Business SPb.\n\nМой email: "+email.value);$("newsletter-note").textContent="Открываем письмо для подтверждения подписки.";window.location.href="mailto:hello@ai-business-spb.ru?subject="+subject+"&body="+body});
// главная
var feat=PS.filter(function(p){return p.featured})[0]||PS[0],lead=$("lead");lead.dataset.post=feat.slug;lead.innerHTML=(feat.cover?'<img class="lead-cover" src="'+attr(assetPath(feat.cover))+'" alt="">':'')+'<h3 class="serif">'+esc(feat.title)+'</h3><span class="cta">Читать →</span>';
$("brief").innerHTML=PS.filter(function(p){return p!==feat}).slice(0,5).map(function(p){return '<li><button data-post="'+attr(p.slug)+'" data-from="home"><span>'+esc(p.title)+'</span></button></li>'}).join("");
$("ev").innerHTML=PS.filter(function(p){return p.kind=="event"}).slice(0,5).map(function(p){return '<button data-post="'+attr(p.slug)+'" data-from="home"><time>'+dt(p.date)+'</time><span>'+esc(p.title)+'</span><span>→</span></button>'}).join("");
// кейсы хакатона
$("cases").innerHTML=CS.map(function(c){return '<button class="tile" data-case="'+attr(c.slug)+'"><span class="n">'+esc(c.company)+'</span><h3 class="serif">'+esc(c.title)+'</h3><p>'+esc(c.summary)+'</p>'+c.tags.map(function(t){return '<span class="tag">'+esc(t)+'</span> '}).join("")+'</button>'}).join("");
// оверлей
function show(html){lastF=document.activeElement;mod.innerHTML='<button class="x" aria-label="Закрыть">×</button>'+html;ov.classList.add("on");document.body.style.overflow="hidden";mod.querySelector(".x").focus()}
function pic(c,alt){return c?'<img class="cv" src="'+attr(assetPath(c))+'" alt="'+attr(alt||"")+'">':''}
function openP(slug,from){var p=PS.filter(function(x){return x.slug==slug})[0];if(!p)return;
show('<span class="dt">'+dt(p.date)+'</span>'+(from=="home"?'<button class="back" data-back>← Назад</button>':'')+pic(p.cover,p.title)+tg(p)+'<h2 class="serif">'+esc(p.title)+'</h2><div class="body">'+p.body+'</div>'+(p.author?'<p class="k">Автор: '+esc(p.author)+'</p>':''))}
function openC(slug){var c=CS.filter(function(x){return x.slug==slug})[0];if(!c)return;
show('<span class="k lbl">'+esc(c.company)+'</span>'+pic(c.cover,c.title)+'<h2 class="serif">'+esc(c.title)+'</h2><div class="tags">'+c.tags.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join("")+'</div><div class="body">'+c.body+'</div>')}
function closeP(){ov.classList.remove("on");document.body.style.overflow="";if(lastF)lastF.focus()}
document.addEventListener("click",function(e){var c=e.target.closest("[data-post]");if(c)return openP(c.dataset.post,c.dataset.from);
c=e.target.closest("[data-case]");if(c)return openC(c.dataset.case);
if(e.target==ov||e.target.closest(".x")||e.target.closest("[data-back]"))closeP()});
document.addEventListener("keydown",function(e){if(!ov.classList.contains("on"))return;
if(e.key=="Escape")closeP();if(e.key=="Tab"){var f=mod.querySelectorAll("button,a"),a=f[0],z=f[f.length-1];
if(e.shiftKey&&document.activeElement==a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement==z){e.preventDefault();a.focus()}}});
var ty=0;ov.addEventListener("touchstart",function(e){ty=e.touches[0].clientY});
ov.addEventListener("touchend",function(e){if(e.changedTouches[0].clientY-ty>120&&ov.scrollTop<5)closeP()});
// страницы
function route(){var h=location.hash.slice(1),pg=(h=="materials"||h=="programs")?h:"home";
sy[cur]=window.scrollY;cur=pg;
document.querySelectorAll(".pg").forEach(function(e){e.classList.toggle("on",e.id==pg)});
document.querySelectorAll("nav a").forEach(function(a){a.classList.toggle("on",a.dataset.p==(pg=="programs"?"home":pg))});
window.scrollTo(0,pg=="programs"?0:(sy[pg]||0))}
window.addEventListener("hashchange",route);route();
})();
