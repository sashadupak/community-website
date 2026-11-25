/* Deterministic masonry placement: preserve feed order, vary card widths, and pack to the shortest available columns. */
var MASONRY_SPANS={
  wide:{mini:3,medium:4,large:5,xl:6},
  tablet:{mini:2,medium:3,large:4,xl:4},
  phone:{mini:1,medium:1,large:1,xl:1}
};
function masonryConfig(width){
  if(width<=767)return {columns:2,gap:12,spans:MASONRY_SPANS.phone};
  if(width<=960)return {columns:6,gap:18,spans:MASONRY_SPANS.tablet};
  return {columns:12,gap:20,spans:MASONRY_SPANS.wide};
}
function scheduleMasonry(container){
  if(!container||container.dataset.masonryScheduled)return;
  container.dataset.masonryScheduled="1";
  requestAnimationFrame(function(){
    container.dataset.masonryScheduled="";
    layoutMasonry(container);
  });
}
function layoutMasonry(container){
  if(!container)return;
  var width=container.getBoundingClientRect().width;
  if(width<1)return;
  var cards=Array.prototype.slice.call(container.querySelectorAll(":scope > .feed-card"));
  var config=masonryConfig(width),columns=config.columns,gap=config.gap;
  var track=(width-gap*(columns-1))/columns;
  var bottoms=new Array(columns).fill(0);
  container.style.position="relative";
  container.style.height="auto";
  cards.forEach(function(card){
    var size=card.dataset.size||"mini";
    var span=Math.min(columns,config.spans[size]||1);
    var bestStart=0,bestTop=Infinity;
    for(var start=0;start<=columns-span;start++){
      var top=0;
      for(var col=start;col<start+span;col++)top=Math.max(top,bottoms[col]);
      if(top<bestTop){bestTop=top;bestStart=start;}
    }
    card.style.position="absolute";
    card.style.left=(bestStart*(track+gap))+"px";
    card.style.top=bestTop+"px";
    card.style.width=(span*track+(span-1)*gap)+"px";
    var cardHeight=card.getBoundingClientRect().height;
    for(var used=bestStart;used<bestStart+span;used++)bottoms[used]=bestTop+cardHeight+gap;
    if(!card.dataset.masonryImageBound){
      card.dataset.masonryImageBound="1";
      card.querySelectorAll("img").forEach(function(img){
        img.addEventListener("load",function(){scheduleMasonry(container)},{once:true});
        img.addEventListener("error",function(){scheduleMasonry(container)},{once:true});
      });
    }
  });
  var maxBottom=bottoms.length?Math.max.apply(Math,bottoms):0;
  container.style.height=Math.max(0,maxBottom-(cards.length?gap:0))+"px";
  if(!container.dataset.masonryResizeBound){
    container.dataset.masonryResizeBound="1";
    window.addEventListener("resize",function(){scheduleMasonry(container)},{passive:true});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){scheduleMasonry(container)});
  }
}
