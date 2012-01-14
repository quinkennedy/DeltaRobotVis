var camera = new BLUR.Camera3D(window.innerWidth-20,window.innerHeight-20);
var scene = new BLUR.Scene3D();
var renderer = new BLUR.CanvasRenderer(scene,camera);
var mouseX = 0;
var mouseY = 0;
var shouldDraw = false;

//from sMath
var upperLegLength=200;
var lowerLegLength=300;
var upperHingeDistance=70;
var lowerHingeDistance=20;
var hingeDistance=upperHingeDistance-lowerHingeDistance;
var hingeAngle1=0;
var hingeAngle2=2*Math.PI/3;
var hingeAngle3=4*Math.PI/3;
var legAngle1=-35*Math.PI/180;
var legAngle2=-35*Math.PI/180;
var legAngle3=-35*Math.PI/180;

function pol2xy(r,a){
	return {x:r*Math.cos(a),
		y:r*Math.sin(a)};
}

function kneePoint(legAngle,hingeAngle,hingeDistance,upperLegLength){
	var r = hingeDistance+Math.cos(legAngle)*upperLegLength;
	var xy=pol2xy(r,hingeAngle);
	return new BLUR.Vector(xy.x,-Math.sin(legAngle)*upperLegLength,xy.y);
}

function getAvgPt(arrVectors){
	var x,y,z;
	x = y = z = 0;
	for(var i in arrVectors){
		x+=arrVectors[i].x;
		y+=arrVectors[i].y;
		z+=arrVectors[i].z;
	}	
	x/=arrVectors.length;
	y/=arrVectors.length;
	z/=arrVectors.length;
	return new BLUR.Vector(x,y,z);
}

function crossProduct(a,b){
	return new BLUR.Vector(
		a.y*b.z-a.z*b.y,
		a.z*b.x-a.x*b.z,
		a.x*b.y-a.y*b.x);
}

function duplicateVector(v){
	return new BLUR.Vector(v.x,v.y,v.z);
}

function multiplyVector(v,n){
	return new BLUR.Vector(v.x*n,v.y*n,v.z*n);
}

function vectorLength(v){
	return Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
}

function init(){
	var knee1=kneePoint(legAngle1,hingeAngle1,hingeDistance,upperLegLength);
	var knee2=kneePoint(legAngle2,hingeAngle2,hingeDistance,upperLegLength);
	var knee3=kneePoint(legAngle3,hingeAngle3,hingeDistance,upperLegLength);
	var avgPt=getAvgPt([knee1,knee2,knee3]);
	var tmp1=duplicateVector(knee1);
	tmp1.subtract(avgPt);
	var tmp2=duplicateVector(knee2);
	tmp2.subtract(avgPt);
	var toolLn=crossProduct(tmp1,tmp2);
	toolLn.normalise();
	var dist=Math.sqrt(lowerLegLength*lowerLegLength-Math.pow(vectorLength(tmp1),2));
	var toolPt=duplicateVector(avgPt);
	toolPt.subtract(multiplyVector(toolLn,dist));

	//points for drawing
	var xyTemp = pol2xy(lowerHingeDistance,hingeAngle1);
	var lowerHingeOffset1=new BLUR.Vector(xyTemp.x,0,xyTemp.y);
	xyTemp = pol2xy(lowerHingeDistance,hingeAngle2);
	var lowerHingeOffset2=new BLUR.Vector(xyTemp.x,0,xyTemp.y);
	xyTemp = pol2xy(lowerHingeDistance,hingeAngle3);
	var lowerHingeOffset3=new BLUR.Vector(xyTemp.x,0,xyTemp.y);
	xyTemp = pol2xy(upperHingeDistance,hingeAngle1);
	var upperHingeOffset1=new BLUR.Vector(xyTemp.x,0,xyTemp.y);
	xyTemp = pol2xy(upperHingeDistance,hingeAngle2);
	var upperHingeOffset2=new BLUR.Vector(xyTemp.x,0,xyTemp.y);
	xyTemp = pol2xy(upperHingeDistance,hingeAngle3);
	var upperHingeOffset3=new BLUR.Vector(xyTemp.x,0,xyTemp.y);
	var actualKnee1=duplicateVector(knee1);
	actualKnee1.add(lowerHingeOffset1);
	var actualKnee2=duplicateVector(knee2);
	actualKnee2.add(lowerHingeOffset2);
	var actualKnee3=duplicateVector(knee3);
	actualKnee3.add(lowerHingeOffset3);
	var toolPt1=duplicateVector(toolPt);
	toolPt1.add(lowerHingeOffset1);
	var toolPt2=duplicateVector(toolPt);
	toolPt2.add(lowerHingeOffset2);
	var toolPt3=duplicateVector(toolPt);
	toolPt3.add(lowerHingeOffset3);

	var arrOrder = [toolPt1,actualKnee1,upperHingeOffset1,
			upperHingeOffset2,actualKnee2,toolPt2,
			toolPt1,toolPt3,toolPt2,toolPt3,
			actualKnee3,upperHingeOffset3,upperHingeOffset2,
			upperHingeOffset3,upperHingeOffset1];
	for(var i = 1; i<arrOrder.length; i++){
		var line = new BLUR.Line(2);
		line.setPosition(duplicateVector(arrOrder[i-1]),duplicateVector(arrOrder[i]));
		scene.addObject(line);
	}
	//var line = new BLUR.Line(10);
	//line.setPosition(new BLUR.Vector(100,100,0),new BLUR.Vector(-100,-100,0));
	//scene.addObject(line);
	setInterval(render,10);
}

function render(){
	if (shouldDraw){
		var yAmount = -(((window.innerWidth/2)-mouseX)*.02);
		var xAmount = (((window.innerHeight/2)-mouseY)*.02);
		for(var i in scene.objects){
			scene.objects[i].rotateY(yAmount);
			scene.objects[i].rotateX(xAmount);
		}
	}
	renderer.render(scene,camera);
}

function setMousePosition(x,y){
	mouseX = x;
	mouseY = y;
}

jQuery(document).ready(function(){
	var canv = $('canvas');
	canv.mousemove(function(e){setMousePosition(e.pageX,e.pageY);});
	canv.mousedown(function(e){shouldDraw=true;});
	canv.mouseup(function(e){shouldDraw=false;});
});

init();
