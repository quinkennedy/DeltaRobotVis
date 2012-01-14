var camera, scene, renderer, geometry, material, mesh,mouseX,mouseY,delta;
mouseX = mouseY = 0;

//from sMath
var upperLegLength=20*5;
var lowerLegLength=35*5;
var upperHingeDistance=7*5;
var lowerHingeDistance=2*5;
var hingeDistance=upperHingeDistance-lowerHingeDistance;
var hingeAngle1=0;
var hingeAngle2=2*Math.PI/3;
var hingeAngle3=4*Math.PI/3;
var legAngle1=-5*Math.PI/180;
var legAngle2=-15*Math.PI/180;
var legAngle3=-55*Math.PI/180;

var idxActualKnee1=0;
var idxActualKnee2=1;
var idxActualKnee3=2;
var idxToolPt1=3;
var idxToolPt2=4;
var idxToolPt3=5;
var idxHingePt1=6;
var idxHingePt2=7;
var idxHingePt3=8;
var arrChangingPts = [idxActualKnee1,idxActualKnee2,idxActualKnee3,idxToolPt1,idxToolPt2,idxToolPt3];
var bDecrease1 = true;
var bDecrease2 = true;
var bDecrease3 = true;
var minAngle = -90*Math.PI/180;
var maxAngle = 55*Math.PI/180;
var incAngle1 = .5*Math.PI/180;
var incAngle2 = .4*Math.PI/180;
var incAngle3 = .3*Math.PI/180;

windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2,

SEPARATION = 200,
AMOUNTX = 10,
AMOUNTY = 10,

init();
animate();
function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,10000);
	camera.position.z=100;
	scene.add(camera);
/*	
	geometry=new THREE.CubeGeometry(200,200,200);
	material=new THREE.MeshBasicMaterial({color:0xff0000,wireframe:true});

	mesh = new THREE.Mesh(geometry,material);
	scene.add(mesh);
	*/
	var geometry = new THREE.Geometry();

	delta = getPoints();
	
	arrGroups = [{color:0xffffff, points:[idxHingePt1,idxHingePt2,idxHingePt3,idxHingePt1]},
			{color:0xff00ff, points:[idxToolPt1,idxToolPt2,idxToolPt3,idxToolPt1]},
			{color:0xff0000, points:[idxHingePt1,idxActualKnee1,idxToolPt1]},
			{color:0x00ff00, points:[idxHingePt2,idxActualKnee2,idxToolPt2]},
			{color:0x0000ff, points:[idxHingePt3,idxActualKnee3,idxToolPt3]}]
	for(var i in arrGroups){
		geometry = new THREE.Geometry();
		for(var j in arrGroups[i].points){
			geometry.vertices.push(new THREE.Vertex(delta[arrGroups[i].points[j]]));
		}
		geometry.dynamic = true;
		var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color:arrGroups[i].color}));
		scene.add(line);
	}
	/*
	for ( var i = 0; i < 100; i ++ ) {

		particle = new THREE.Particle( material );
		particle.position.x = Math.random() * 2 - 1;
		particle.position.y = Math.random() * 2 - 1;
		particle.position.z = Math.random() * 2 - 1;
		particle.position.normalize();
		particle.position.multiplyScalar( Math.random() * 10 + 450 );
		particle.scale.x = particle.scale.y = 5;

		geometry.vertices.push( new THREE.Vertex( particle.position ) );

	}
	*/

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	
	renderer=new THREE.CanvasRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
}

function pol2xy(r,a){
	return {x:r*Math.cos(a),
		y:r*Math.sin(a)};
}

function kneePoint(legAngle,hingeAngle,hingeDistance,upperLegLength){
	var r = hingeDistance+Math.cos(legAngle)*upperLegLength;
	var xy=pol2xy(r,hingeAngle);
	return new THREE.Vector3(xy.x,xy.y,Math.sin(legAngle)*upperLegLength);
}

function getAvgPt(arrVectors){
	var output = new THREE.Vector3();
	for(var i in arrVectors){
		output.addSelf(arrVectors[i]);
	}	
	return output.divideScalar(arrVectors.length);
}

function getPoints(){
	var knee1=kneePoint(legAngle1,hingeAngle1,hingeDistance,upperLegLength);
	var knee2=kneePoint(legAngle2,hingeAngle2,hingeDistance,upperLegLength);
	var knee3=kneePoint(legAngle3,hingeAngle3,hingeDistance,upperLegLength);
	var avgPt=getAvgPt([knee1,knee2,knee3]);
	var tmp1=new THREE.Vector3().sub(knee1,avgPt);
	var toolLn=new THREE.Vector3().cross(tmp1,new THREE.Vector3().sub(knee2,avgPt));
	toolLn.normalize();
	var dist=Math.sqrt(lowerLegLength*lowerLegLength-tmp1.lengthSq());
	var toolPt=new THREE.Vector3().sub(avgPt,toolLn.clone().multiplyScalar(dist));

	//points for drawing
	var xyTemp = pol2xy(lowerHingeDistance,hingeAngle1);
	var lowerHingeOffset1=new THREE.Vector3(xyTemp.x,xyTemp.y,0);
	xyTemp = pol2xy(lowerHingeDistance,hingeAngle2);
	var lowerHingeOffset2=new THREE.Vector3(xyTemp.x,xyTemp.y,0);
	xyTemp = pol2xy(lowerHingeDistance,hingeAngle3);
	var lowerHingeOffset3=new THREE.Vector3(xyTemp.x,xyTemp.y,0);
	xyTemp = pol2xy(upperHingeDistance,hingeAngle1);
	var upperHingeOffset1=new THREE.Vector3(xyTemp.x,xyTemp.y,0);
	xyTemp = pol2xy(upperHingeDistance,hingeAngle2);
	var upperHingeOffset2=new THREE.Vector3(xyTemp.x,xyTemp.y,0);
	xyTemp = pol2xy(upperHingeDistance,hingeAngle3);
	var upperHingeOffset3=new THREE.Vector3(xyTemp.x,xyTemp.y,0);
	var actualKnee1=new THREE.Vector3().add(knee1,lowerHingeOffset1);
	var actualKnee2=new THREE.Vector3().add(knee2,lowerHingeOffset2);
	var actualKnee3=new THREE.Vector3().add(knee3,lowerHingeOffset3);
	var toolPt1=new THREE.Vector3().add(toolPt,lowerHingeOffset1);
	var toolPt2=new THREE.Vector3().add(toolPt,lowerHingeOffset2);
	var toolPt3=new THREE.Vector3().add(toolPt,lowerHingeOffset3);

	return [actualKnee1,actualKnee2,actualKnee3,
		toolPt1,toolPt2,toolPt3,
		upperHingeOffset1,upperHingeOffset2,upperHingeOffset3];
}

function onDocumentMouseMove(event) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {

	if ( event.touches.length > 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}

function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}


function animate(){
	requestAnimationFrame(animate);
	render();
}

function render(){
	legAngle1 += (bDecrease1 ? -incAngle1 : incAngle1);
	if (legAngle1 <= minAngle){
		legAngle1 = minAngle;
		bDecrease1 = false;
	} else if (legAngle1 >= maxAngle){
		legAngle1 = maxAngle;
		bDecrease1 = true;
	}

	legAngle2 += (bDecrease2 ? -incAngle2 : incAngle2);
	if (legAngle2 <= minAngle){
		legAngle2 = minAngle;
		bDecrease2 = false;
	} else if (legAngle2 >= maxAngle){
		legAngle2 = maxAngle;
		bDecrease2 = true;
	}

	legAngle3 += (bDecrease3 ? -incAngle3 : incAngle3);
	if (legAngle3 <= minAngle){
		legAngle3 = minAngle;
		bDecrease3 = false;
	} else if (legAngle3 >= maxAngle){
		legAngle3 = maxAngle;
		bDecrease3 = true;
	}
	var arrPoints = getPoints();

	for(var i in arrChangingPts){
		var currIdx = arrChangingPts[i];
		delta[currIdx].x = arrPoints[currIdx].x;
		delta[currIdx].y = arrPoints[currIdx].y;
		delta[currIdx].z = arrPoints[currIdx].z;
	}

	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
	camera.lookAt( scene.position );

	renderer.render(scene,camera);
}
/*var camera = new BLUR.Camera3D(window.innerWidth-20,window.innerHeight-20);
var scene = new BLUR.Scene3D();
var renderer = new BLUR.CanvasRenderer(scene,camera);
var mouseX = 0;
var mouseY = 0;
var shouldDraw = false;


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
*/
