/* Адаптивная раскладка: размеры материалов задаются в content/posts/*.md.
   Ширина карточек меняется по сетке из 12 колонок; каждый ряд заполняется целиком.
   Минимальная ширина: мини — 3, средняя — 4, большая — 6 колонок. */
var LBASE={mini:3,medium:4,large:6};
function layoutRows(items){
  var patterns={1:[[12]],2:[[6,6]],3:[[4,4,4],[6,3,3],[3,3,6],[3,6,3]],4:[[3,3,3,3]]};
  var n=items.length,best=[0],pick=[];
  for(var i=1;i<=n;i++){
    best[i]=Infinity;
    for(var k=1;k<=4&&k<=i;k++){
      var segment=items.slice(i-k,i);
      patterns[k].forEach(function(spans){
        var cost=k===1?5:0,mini=0,withPhoto=0,valid=true;
        for(var j=0;j<k;j++){
          var size=segment[j].size||"mini",base=LBASE[size]||3;
          if(spans[j]<base){valid=false;break}
          cost+=spans[j]-base;
          if(size==="mini")mini++;else withPhoto++;
        }
        if(!valid)return;
        if(mini&&withPhoto)cost+=1.5;
        if(best[i-k]+cost<best[i]){best[i]=best[i-k]+cost;pick[i]={count:k,spans:spans}}
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
