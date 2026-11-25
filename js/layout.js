/* Equal-width masonry cards: three desktop columns and two compact columns on smaller screens. */
function masonryConfig(viewportWidth){
  if(viewportWidth<=767)return {columns:2,gap:12};
  if(viewportWidth<=900)return {columns:2,gap:16};
  return {columns:3,gap:viewportWidth<=1024?16:20};
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
  var viewport=window.innerWidth||document.documentElement.clientWidth;
  var config=masonryConfig(viewport),columns=config.columns,gap=config.gap;
  var cards=Array.prototype.slice.call(container.querySelectorAll(":scope > .feed-card"));
  var community=container.querySelector(":scope > .feed-community");
  var cardWidth=(width-gap*(columns-1))/columns;
  var bottoms=new Array(columns).fill(0);
  container.style.display="block";
  container.style.position="relative";
  cards.forEach(function(card){
    card.style.setProperty("position","absolute","important");
    card.style.setProperty("width",cardWidth+"px","important");
    card.style.left="0px";
    card.style.top="0px";
    card.style.gridColumn="auto";
    var column=0;
    for(var i=1;i<columns;i++)if(bottoms[i]<bottoms[column])column=i;
    var height=card.getBoundingClientRect().height;
    card.style.left=(column*(cardWidth+gap))+"px";
    card.style.top=bottoms[column]+"px";
    bottoms[column]+=height+gap;
  });
  var cardsHeight=cards.length?Math.max.apply(null,bottoms)-gap:0;
  if(community){
    community.style.position="absolute";
    community.style.left="0";
    community.style.top=(cardsHeight?cardsHeight+gap:0)+"px";
    community.style.width="100%";
    var communityHeight=community.getBoundingClientRect().height;
    container.style.height=(cardsHeight+(cardsHeight?gap:0)+communityHeight)+"px";
  }else container.style.height=cardsHeight+"px";
  if(!container.dataset.masonryResizeBound){
    container.dataset.masonryResizeBound="1";
    window.addEventListener("resize",function(){scheduleMasonry(container)},{passive:true});
  }
  if(!container.dataset.masonryFontBound&&document.fonts&&document.fonts.ready){
    container.dataset.masonryFontBound="1";
    document.fonts.ready.then(function(){scheduleMasonry(container)});
  }
}
