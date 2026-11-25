/* Predictable editorial grid: fixed row patterns, original feed order, equal gaps, no skyline packing. */
var EDITORIAL_GRID={
  desktop:{columns:20,gap:20,duo:[12,8],trio:[6,8,6]},
  tablet:{columns:20,gap:16,duo:[12,8],trio:[6,8,6]},
  phone:{columns:2,gap:12}
};
function editorialConfig(width){
  if(width<=767)return EDITORIAL_GRID.phone;
  if(width<=1024)return EDITORIAL_GRID.tablet;
  return EDITORIAL_GRID.desktop;
}
function scheduleEditorialLayout(container){
  if(!container||container.dataset.editorialScheduled)return;
  container.dataset.editorialScheduled="1";
  requestAnimationFrame(function(){
    container.dataset.editorialScheduled="";
    layoutEditorial(container);
  });
}
function setEditorialSpan(card,span){
  card.style.setProperty("grid-column","span "+span,"important");
}
function layoutEditorial(container){
  if(!container)return;
  var width=container.getBoundingClientRect().width;
  if(width<1)return;
  var config=editorialConfig(window.innerWidth||document.documentElement.clientWidth);
  var columns=config.columns;
  var cards=Array.prototype.slice.call(container.querySelectorAll(":scope > .feed-card"));
  container.style.display="grid";
  container.style.gridTemplateColumns="repeat("+columns+",minmax(0,1fr))";
  container.style.gridAutoFlow="row";
  container.style.columnGap=config.gap+"px";
  container.style.rowGap=config.gap+"px";

  if(columns===2){
    var mobileIndex=0;
    while(mobileIndex<cards.length){
      var mobileSize=cards[mobileIndex].dataset.size||"mini";
      if(mobileSize==="large"||mobileSize==="xl"){
        setEditorialSpan(cards[mobileIndex],2);
        mobileIndex++;
      }else if(mobileIndex+1<cards.length){
        var nextSize=cards[mobileIndex+1].dataset.size||"mini";
        if(nextSize!=="large"&&nextSize!=="xl"){
          setEditorialSpan(cards[mobileIndex],1);
          setEditorialSpan(cards[mobileIndex+1],1);
          mobileIndex+=2;
        }else{
          setEditorialSpan(cards[mobileIndex],2);
          mobileIndex++;
        }
      }else{
        setEditorialSpan(cards[mobileIndex],2);
        mobileIndex++;
      }
    }
  }else{
    var index=0,pattern=0;
    while(index<cards.length){
      var first=cards[index],firstSize=first.dataset.size||"mini";
      if(firstSize==="xl"){
        setEditorialSpan(first,columns);
        index++;
        continue;
      }
      var available=0;
      while(index+available<cards.length&&available<3&&(cards[index+available].dataset.size||"mini")!=="xl")available++;
      var hasLarge=false;
      for(var look=0;look<available;look++)if((cards[index+look].dataset.size||"mini")==="large")hasLarge=true;
      var count=(hasLarge||available<3)?Math.min(2,available):3;
      if(count===1){
        setEditorialSpan(first,columns);
        index++;
        pattern++;
        continue;
      }
      if(count===2){
        var pair=config.duo.slice();
        var largeAt=-1;
        for(var p=0;p<count;p++)if((cards[index+p].dataset.size||"mini")==="large"){largeAt=p;break}
        var mediumAt=-1;
        for(var m=0;m<count;m++)if((cards[index+m].dataset.size||"mini")==="medium"){mediumAt=m;break}
        var wideAt=largeAt>=0?largeAt:(mediumAt>=0?1-mediumAt:pattern%2);
        setEditorialSpan(cards[index+wideAt],pair[0]);
        setEditorialSpan(cards[index+(1-wideAt)],pair[1]);
      }else{
        var trio=config.trio;
        var mediumIndex=-1;
        for(var t=0;t<3;t++)if((cards[index+t].dataset.size||"mini")==="medium"){mediumIndex=t;break}
        var otherSpans=[trio[0],trio[2]],otherIndex=0;
        for(var t=0;t<3;t++)setEditorialSpan(cards[index+t],mediumIndex<0?trio[t]:(t===mediumIndex?trio[1]:otherSpans[otherIndex++]));
      }
      index+=count;
      pattern++;
    }
  }
  if(!container.dataset.editorialResizeBound){
    container.dataset.editorialResizeBound="1";
    window.addEventListener("resize",function(){scheduleEditorialLayout(container)},{passive:true});
  }
}
