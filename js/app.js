(function(){
var $=function(i){return document.getElementById(i)},PS=window.POSTS,CS=window.CASES,ov=$("ov"),mod=$("mod"),cur="home",sy={},lastF=null;
var M=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
function dt(s){var d=new Date(s+"T00:00:00");return d.getDate()+" "+M[d.getMonth()]+" "+d.getFullYear()}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function attr(s){return esc(s).replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}
function assetPath(s){if(!s)return "";s=String(s).trim();if(/^(https?:|data:|\/)/i.test(s)||s.indexOf("../")===0||s.indexOf("content/")===0||s.indexOf("assets/")===0)return s;return "content/"+s}
function watchOptionalImages(root){root.querySelectorAll("img[data-optional-image]").forEach(function(img){if(img.dataset.optionalBound)return;img.dataset.optionalBound="1";img.addEventListener("error",function(){var f=img.closest("figure");if(f){f.remove();return}var g=img.closest(".optional-gallery");if(g){img.remove();if(!g.querySelector("img"))g.remove();return}var i=img.closest(".logo-item");if(i){var m=i.closest(".mq");i.remove();if(m&&!m.querySelector(".logo-item"))m.remove();return}var x=img.closest(".optional-image-group");if(x)x.remove();else img.remove()},{once:true});if(img.complete&&img.naturalWidth===0)img.dispatchEvent(new Event("error"))})}
// Последний слот ленты отдан блоку сообщества: исключается самый старый обычный материал.
var feedPosts=PS.slice(),omit=feedPosts.length-1;
while(omit>=0&&(feedPosts[omit].featured||feedPosts[omit].longread||feedPosts[omit].slug=="hackathon-product-start"))omit--;
if(omit>=0)feedPosts.splice(omit,1);
function longreadTag(p){return p.longread?'<span class="badge longread-badge">Длинная статья</span>':''}
function tg(p){return p.fmt||p.topic?'<div class="tags">'+(p.fmt?'<span class="tag">'+esc(p.fmt)+'</span>':'')+(p.topic?'<span class="tag t">'+esc(p.topic)+'</span>':'')+'</div>':''}
function card(x){var p=x.p,photo=p.cover?'<img class="feed-image'+(p.longread?' longread-cover':'')+'" data-optional-image src="'+attr(assetPath(p.cover))+'" alt="" loading="lazy">':'';return '<button class="card s-'+p.size+' sp'+x.s+(p.accent?' ac':'')+'" style="grid-column:span '+x.s+'" data-post="'+attr(p.slug)+'" data-from="materials">'+longreadTag(p)+tg(p)+'<h3 class="serif">'+esc(p.title)+'</h3>'+photo+'</button>'}
$("feed").innerHTML=layoutRows(feedPosts).map(function(r){return r.map(card).join("")}).join("")+ '<section class="card wide feed-community join"><div><h3 class="serif">Присоединяйтесь к сообществу</h3><p>Разборы проектов, анонсы событий, и другие полезные материалы</p></div><div class="jo"><a class="tg" href="https://t.me/ai_business_spb"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#27A7E7"/><path d="M5.400 11.800 17.200 7.200c.5-.2 1 .1.800.9l-2 9.500c-.1.700-.6.900-1.100.6l-3-2.200-1.500 1.400c-.2.200-.3.300-.6.300l.2-3.100 5.600-5c.2-.2 0-.3-.4-.1l-6.900 4.400-3-.9c-.6-.2-.6-.6.100-.9z" fill="#fff"/></svg>@ai_business_spb</a></div></section>';
// главная
var feat=PS.filter(function(p){return p.featured})[0]||PS[0],lead=$("lead");lead.classList.toggle("longread-feature",!!feat.longread);lead.dataset.post=feat.slug;lead.innerHTML=(feat.cover?'<img class="lead-cover" data-optional-image src="'+attr(assetPath(feat.cover))+'" alt="">':'')+longreadTag(feat)+'<h3 class="serif">'+esc(feat.title)+'</h3><span class="cta">Читать →</span>';
$("brief").innerHTML=PS.filter(function(p){return p!==feat}).slice(0,5).map(function(p){return '<li><button data-post="'+attr(p.slug)+'" data-from="home"><span>'+esc(p.title)+'</span></button></li>'}).join("");
$("ev").innerHTML=PS.filter(function(p){return p.kind=="event"}).slice(0,5).map(function(p){return '<button data-post="'+attr(p.slug)+'" data-from="home"><time>'+dt(p.date)+'</time><span>'+esc(p.title)+'</span><span>→</span></button>'}).join("");
// кейсы хакатона
$("cases").innerHTML=CS.map(function(c){return '<button class="tile case-card" data-case="'+attr(c.slug)+'">'+(c.logo?'<span class="case-logo optional-image-group"><img data-optional-image src="'+attr(assetPath(c.logo))+'" alt="Логотип '+attr(c.company)+'" loading="lazy"></span>':'')+'<h3 class="serif">'+esc(c.title)+'</h3><p>'+esc(c.summary)+'</p>'+c.tags.map(function(t){return '<span class="tag">'+esc(t)+'</span> '}).join("")+'</button>'}).join("");
// оверлей
function show(html){lastF=document.activeElement;mod.innerHTML='<button class="x" aria-label="Закрыть">×</button>'+html;watchOptionalImages(mod);ov.classList.add("on");document.body.style.overflow="hidden";mod.querySelector(".x").focus()}
function pic(c,alt){return c?'<img class="cv" data-optional-image src="'+attr(assetPath(c))+'" alt="'+attr(alt||"")+'" loading="lazy">':''}
function openP(slug,from){var p=PS.filter(function(x){return x.slug==slug})[0];if(!p)return;
show('<span class="dt">'+dt(p.date)+'</span>'+(from=="home"?'<button class="back" data-back>← Назад</button>':'')+pic(p.cover,p.title)+tg(p)+'<h2 class="serif">'+esc(p.title)+'</h2><div class="body">'+p.body+'</div>'+(p.author?'<p class="k">Автор: '+esc(p.author)+'</p>':''))}
function openC(slug){var c=CS.filter(function(x){return x.slug==slug})[0];if(!c)return;
var logo=c.logo?'<span class="case-logo optional-image-group"><img data-optional-image src="'+attr(assetPath(c.logo))+'" alt="Логотип '+attr(c.company)+'" loading="lazy"></span>':'';
var photo=c.cover?'<figure class="case-detail-photo"><img data-optional-image src="'+attr(assetPath(c.cover))+'" alt="Фото кейса '+attr(c.company)+'" loading="lazy"></figure>':'';
show(logo+'<h2 class="serif">'+esc(c.title)+'</h2><div class="tags">'+c.tags.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join("")+'</div>'+photo+'<div class="body">'+c.body+'</div>')}
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
watchOptionalImages(document);
window.addEventListener("hashchange",route);route();
})();
