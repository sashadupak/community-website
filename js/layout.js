/* Адаптивная асимметричная раскладка ленты.
   Размеры контента задаются в публикации, ширина подбирается по рядам из 12 колонок.
   В одном ряду не более одной большой статьи; широкая карточка получает самый крупный span. */
var LBASE={mini:2,medium:3,large:6};
function layoutRows(items){
  function compositions(count,minima){
    var out=[];
    function visit(prefix,left,slot){
      if(slot===count-1){if(left>=minima[slot])out.push(prefix.concat([left]));return}
      var remainingMin=0;
      for(var i=slot+1;i<count;i++)remainingMin+=minima[i];
      for(var width=minima[slot];width<=left-remainingMin;width++)visit(prefix.concat([width]),left-width,slot+1);
    }
    visit([],12,0);return out;
  }
  function rowCost(segment,spans,end){
    var types=segment.map(function(p){return p.size||"mini"}),large=0,baseSum=0,min=12,max=0;
    types.forEach(function(size){if(size==="large")large++;baseSum+=LBASE[size]||2});
    if(large>1)return Infinity;
    for(var j=0;j<spans.length;j++){if(spans[j]< (LBASE[types[j]]||2))return Infinity;min=Math.min(min,spans[j]);max=Math.max(max,spans[j]);}
    var cost=12-baseSum;
    if(spans.length===1)cost+=12+(types[0]==="large"?0:3);
    if(spans.length===4)cost+=3;
    if(spans.length>1&&max-min<2)cost+=2.5;
    var largestType=large?"large":(types.indexOf("medium")>=0?"medium":"mini"),largestWidth=0,largestCardWidth=0;
    for(var k=0;k<types.length;k++){
      if(types[k]===largestType)largestCardWidth=Math.max(largestCardWidth,spans[k]);
      largestWidth=Math.max(largestWidth,spans[k]);
    }
    if(largestCardWidth<largestWidth)cost+=1.5;
    if(spans.length>1){
      var preferLeft=end%2===0;
      if((spans[0]>spans[spans.length-1])!==preferLeft)cost+=0.2;
    }
    return cost;
  }
  var n=items.length,best=[0],pick=[];
  for(var i=1;i<=n;i++){
    best[i]=Infinity;
    for(var count=1;count<=4&&count<=i;count++){
      var segment=items.slice(i-count,i),minima=segment.map(function(p){return LBASE[p.size]||2});
      compositions(count,minima).forEach(function(spans){
        var cost=rowCost(segment,spans,i);
        if(best[i-count]+cost<best[i]){best[i]=best[i-count]+cost;pick[i]={count:count,spans:spans};}
      });
    }
  }
  var rows=[],i=n;
  while(i>0){
    var choice=pick[i],row=[];
    for(var j=0;j<choice.count;j++)row.push({p:items[i-choice.count+j],s:choice.spans[j],wide:choice.spans[j]===12});
    rows.unshift(row);i-=choice.count;
  }
  return rows;
}
