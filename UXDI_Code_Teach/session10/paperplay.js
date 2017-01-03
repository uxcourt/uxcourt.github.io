var count = 150;

var path = new Path.Circle({
	center: [0,0],
	radius:10,
	fillColor:'blue',
	strokeColor:'blue'
});
var symbol = new Symbol(path);
for(var i=0;i<count;i++){
	var center=Point.random()*view.size;
	var placedSymbol=symbol.place(center);
	placedSymbol.scale(i/count);
}
function onFrame(event){
	for(var i=0;i<count;i++){
		var item=project.activeLayer.children[i];
		item.position.x += item.bounds.width/30;
		if(item.bounds.left>view.size.width){
			item.position.x=-item.bounds.width;
		}
	}
}
function onMouseDown(event){
	for(var i=0;i<count;i++){
		var item=project.activeLayer.children[i];
		var targetX = item.position.x;
		var targetY = item.position.y;
		targetX=roundTo(targetX,30);
		targetY=roundTo(targetY,30);
		//console.log(targetX);
		var mouseX=event.point.x;
		var mouseY=event.point.y;
		mouseX=roundTo(mouseX,30);
		mouseY=roundTo(mouseY,30);
		//console.log(mouseX);
		if(targetX==mouseX){
			if(targetY==mouseY){
				console.log("you have a match");
				var starCenter = new Point(item.position);
				var starPath = new Path.Star(starCenter,7,item.scaling*10,(item.scaling*10)+5);
				starPath.fillColor='gold';
				item.replaceWith(starPath);
			}
		}
	}
}
function roundTo(a,b){
	var c = a/b;
	c=c.toFixed(0);
	c=c*b;
	return c;
}






