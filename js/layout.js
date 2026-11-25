/* Deterministic editorial grid: fixed templates, source order is never rearranged. */
var SIZE_SPAN={mini:2,medium:3,large:4,xl:6};
var MOBILE_MIN_SPAN={mini:6,medium:9,large:12,xl:20};
var ROW_TEMPLATES=[
  {desktop:[4,2]},
  {desktop:[3,3]},
  {desktop:[2,2,2]},
  {desktop:[2,4]}
];
function layoutRows(items){
  var rows=[],index=0,templateCursor=0;
  while(index<items.length){
    var post=items[index],size=post.size||"mini";
    if(size==="xl"){
      rows.push([{p:post,s:6,m:20}]);
      index++;
      continue;
    }
    var chosen=null,chosenIndex=-1;
    for(var offset=0;offset<ROW_TEMPLATES.length;offset++){
      var ti=(templateCursor+offset)%ROW_TEMPLATES.length,template=ROW_TEMPLATES[ti];
      if(index+template.desktop.length>items.length)continue;
      var fits=true;
      for(var j=0;j<template.desktop.length;j++){
        var itemSize=items[index+j].size||"mini";
        if((SIZE_SPAN[itemSize]||2)>template.desktop[j]){fits=false;break;}
      }
      if(fits){chosen=template;chosenIndex=ti;break;}
    }
    if(!chosen){
      rows.push([{p:post,s:SIZE_SPAN[size]||2,m:MOBILE_MIN_SPAN[size]||6}]);
      index++;
      templateCursor=(templateCursor+1)%ROW_TEMPLATES.length;
      continue;
    }
    var row=[];
    for(var k=0;k<chosen.desktop.length;k++){
      var item=items[index+k],itemSize=item.size||"mini";
      row.push({p:item,s:chosen.desktop[k],m:MOBILE_MIN_SPAN[itemSize]||6});
    }
    rows.push(row);
    index+=chosen.desktop.length;
    templateCursor=(chosenIndex+1)%ROW_TEMPLATES.length;
  }
  return rows;
}
