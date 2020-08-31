import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';




const demoURL = 'https://adelved.github.io/numpy-viz/testdatanpy.npy'



var STYLE = 1
/*
document.getElementById('input-format').addEventListener('change',function () {
    if(this.checked){
        STYLE = 1
    }else{
        STYLE = 0
    }
    main()
})

*/

function asciiDecode(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType = "arraybuffer"; 
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            //
            //console.log(xmlHttp.response)
            callback(xmlHttp.response);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function initilizeCheckMarks(){
    //console.log('checkmarks are initilized')
    document.getElementById('xcheck').checked = true;
    document.getElementById('ycheck').checked = true;
    document.getElementById('zcheck').checked = true;
}



//load numpy array
function getNumpyShape(buffer){
    const dims = []
    var dataHeader = buffer.slice(50,74);
    var view = asciiDecode(dataHeader).split(',')
    var x = view[0].split('(')
    var x = parseInt(x[x.length - 1], 10)  
    var y = parseInt(view[1],10)
    var z = parseInt(view[2].split(')')[0],10)

    dims.push(x)
    dims.push(y)
    dims.push(z)

    return dims
}

function parseData(arrBuff){
    //console.log('arrbuff',arrBuff.slice(10  ))
    const dims = getNumpyShape(arrBuff)
    var dataWithoutHeader = arrBuff.slice(128) //remove header (128 bytes)

    typedArray = new Float32Array(dataWithoutHeader); // convert to float32array

    var typedArrayTfjs = tf.tensor1d(typedArray)

    var typedArrayReshaped = typedArrayTfjs.reshape([dims[0],dims[1],dims[2]])
    var grays = convertToGray(typedArrayReshaped);

    dataHeight = grays.shape[0];
    dataWidth = grays.shape[1];
    //console.log('dataWidth=',dataWidth)
    dataDepth = grays.shape[2];

    document.getElementById('xRange').max = dataHeight;document.getElementById('xRange').value = dataHeight/2;
    document.getElementById('yRange').max = dataWidth;document.getElementById('yRange').value = dataWidth/2;
    document.getElementById('zRange').max = dataDepth;document.getElementById('zRange').value = dataDepth/2;
    main();
}

function convertToGray(tensor){
    let grays = tf.mul((tf.div((tf.sub(tensor, tensor.min())),tf.sub(tensor.max(),tensor.min()))),1)
    return grays
  }

var dataHeight = 0;
var dataWidth = 0;
var dataDepth = 0;
var typedArray = 0

httpGetAsync(demoURL, res => parseData(res));




document.getElementById("file-upload").addEventListener("change", function() {
    initilizeCheckMarks()
    var reader = new FileReader();
    reader.onload = function(){
        
        var rawData = reader.result;
        var dims = getNumpyShape(rawData) //fetch the dimensions of the numpy array
        var dataWithoutHeader = rawData.slice(128) //remove header (128 bytes)

        typedArray = new Float32Array(dataWithoutHeader); // convert to float32array

        var typedArrayTfjs = tf.tensor1d(typedArray)

        var typedArrayReshaped = typedArrayTfjs.reshape([dims[0],dims[1],dims[2]])
        var grays = convertToGray(typedArrayReshaped);

        dataHeight = grays.shape[0];
        dataWidth = grays.shape[1];
        dataDepth = grays.shape[2];

        document.getElementById('xRange').max = dataHeight;document.getElementById('xRange').value = dataHeight/2;
        document.getElementById('yRange').max = dataWidth;document.getElementById('yRange').value = dataWidth/2;
        document.getElementById('zRange').max = dataDepth;document.getElementById('zRange').value = dataDepth/2;
        

        main();
    }
    reader.readAsArrayBuffer(document.querySelector('input').files[0]);
    
});







function main() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 2000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(100, 100, dataDepth + 50);

    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( '#152028' );



    
    
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    
    
    const size = dataWidth * dataHeight;



    var maxOfTypedArray = 0
    var minOfTypedArray = 0

    for (let i =0; i < typedArray.length; i++){
        if(typedArray[i] > maxOfTypedArray){
            maxOfTypedArray = typedArray[i]
        }
        if(typedArray[i] < minOfTypedArray){
            minOfTypedArray = typedArray[i]
        }
    }

function deleteSlice(plane) {
    scene.remove(plane);
    plane.geometry.dispose();
    plane.material.dispose();
    //plane = undefined; //clear any reference for it to be able to garbage collected
}

function getZSlice(index){
    let data = new Uint8Array( 3 * size );
    let normalizedValues = new Uint8Array(size);

    const offset = dataWidth;
    let subTypedArray = typedArray//.slice(index*size,(index + 1)*size)
    
    
    
    for ( let i = 0; i < size; i ++ ) {
        if (index==dataWidth){
            index = dataWidth - 1
        }
        if (i > 0){
            var arrayValue = subTypedArray[(i * offset) + index]
        }else{
            var arrayValue = subTypedArray[i]
        }
        var normalizedValue = (arrayValue - minOfTypedArray) / (maxOfTypedArray - minOfTypedArray)
        var r = Math.floor( normalizedValue * 255 );
        normalizedValues[i] = r;
        //var g = Math.floor( normalizedValue * 255 );
        //var b = Math.floor( normalizedValue * 255 );
    }

    for (let i = 0; i < size; i ++){

        var stride = i * 3;
    
        data[ stride ] = normalizedValues[i]
        data[ stride + 1 ] = normalizedValues[i]
        data[ stride + 2 ] = normalizedValues[i]

    }
    
    return data
}
    
function getXSlice(index){
    //console.log('xslice')
    let data = new Uint8Array( 3 * size );
    let normalizedValues = new Uint8Array(size);
    const offset = 1;
    
    if (index == dataDepth){
        index = 127;
    }
   let subTypedArray = typedArray.slice((index)*size,(index+1)*size)

    var count = 0
    for ( var i = 0; i <= size; i ++ ) {
        if (i > 0){
            var arrayValue = subTypedArray[i * offset]
        }else{
            var arrayValue = subTypedArray[i]
        }
        var normalizedValue = (arrayValue - minOfTypedArray) / (maxOfTypedArray - minOfTypedArray)
        var r = Math.floor( normalizedValue * 255 );
        normalizedValues[i] = r;
        //var g = Math.floor( normalizedValue * 255 );
        //var b = Math.floor( normalizedValue * 255 );
        count = i;
    }

    for (var i = 0; i < size; i ++){

        var stride = i * 3;

        data[ stride ] = normalizedValues[i]
        data[ stride + 1 ] = normalizedValues[i]
        data[ stride + 2 ] = normalizedValues[i]

    }
    
    return data
}

function getYSlice(index){
    var data = new Uint8Array( 3 * size );
    var normalizedValues = new Uint8Array(size);
    let subTypedArray = typedArray

    var count = 0
    for ( var i = 0; i < typedArray.length; i+=size) {
        if (index==dataWidth){
            index = dataWidth - 1
        }
        var arrayValues = subTypedArray.slice(i+(index*dataWidth), (i + (index*dataWidth) ) + dataWidth)
        
    for (var j = 0; j < arrayValues.length; j++){

        var arrayValue = arrayValues[j]
        var normalizedValue = (arrayValue - minOfTypedArray) / (maxOfTypedArray - minOfTypedArray)
        var r = Math.floor( normalizedValue * 255 );
        
        if(i > 0){
            var stride = j + (count * dataWidth)
        }else{
            var stride = j
        }
        

        normalizedValues[stride] = r;
        //var g = Math.floor( normalizedValue * 255 );
        //var b = Math.floor( normalizedValue * 255 );
        
    }
    count += 1
   
}

    for (var i = 0; i < size; i ++){

        var stride = i * 3;

        data[ stride ] = normalizedValues[i]
        data[ stride + 1 ] = normalizedValues[i]
        data[ stride + 2 ] = normalizedValues[i]

    }
    
    return data
}





var xIndex = dataWidth/2;
var yIndex = dataWidth/2;
var zIndex = dataWidth/2; 

var axisX = new THREE.Vector3( 0, 0, 1 );

var axisY = new THREE.Vector3( 0, 0, 1 );

var axisZ = new THREE.Vector3( 0, 0, 1 );

// used the buffer to create a DataTexture
var planeY = 0;
var planeX = 0;
var planeZ = 0;

function renderZ(zIndex){

    if(STYLE == 1){
        var zData = getZSlice(zIndex)
    }else{
        var zData = getXSlice(zIndex)
    }
    
    let texture = new THREE.DataTexture( zData, dataWidth, dataHeight, THREE.RGBFormat);
    let geometry = new THREE.PlaneBufferGeometry(dataHeight,dataWidth);


    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });
        
    planeZ = new THREE.Mesh( geometry, material );
    if(STYLE == 1){
        planeZ.rotateX(-Math.PI/2)
        planeZ.translateOnAxis(axisZ, dataWidth/2 - zIndex)
    }else{
        planeZ.rotateX(-Math.PI/2)
        planeZ.rotateZ(Math.PI/2)
        planeZ.translateOnAxis(axisZ, dataWidth/2 - zIndex)
    }
    
    scene.add(planeZ)

}




// used the buffer to create a DataTexture

function renderX(xIndex){
    
    if(STYLE == 1){
        var xData = getXSlice(xIndex)
    }else{
        var xData = getZSlice(zIndex)
    }

    let texture = new THREE.DataTexture( xData, dataWidth, dataHeight, THREE.RGBFormat);
    let geometry = new THREE.PlaneBufferGeometry(dataWidth, dataHeight);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });

    planeX = new THREE.Mesh( geometry, material );

    if(STYLE == 1){
        planeX.rotateZ(-Math.PI/2)
        planeX.translateOnAxis(axisX, dataWidth/2 - xIndex)
    }else{
        planeX.rotateZ(Math.PI)
        planeX.translateOnAxis(axisX, dataWidth/2 - xIndex)
        
    }

    scene.add(planeX)
}



    

function renderY(yIndex){
    if(STYLE == 1){
        var yData = getYSlice(yIndex)
    }else{
        var yData = getYSlice(zIndex)
    }
    
    let texture = new THREE.DataTexture(yData, dataWidth, dataHeight, THREE.RGBFormat);
    let geometry = new THREE.PlaneBufferGeometry(dataWidth, dataHeight);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });

    planeY = new THREE.Mesh( geometry, material);
    
    if(STYLE == 1){
        planeY.rotateY(Math.PI/2)
        planeY.rotateZ(-Math.PI/2)
        planeY.translateOnAxis(axisY,  yIndex - dataWidth/2)
    }else{
        planeY.rotateY(-Math.PI/2)
        planeY.rotateZ(Math.PI)
        planeY.translateOnAxis(axisY,  yIndex - dataWidth/2)
    }

    scene.add(planeY)
}



renderX(xIndex);
renderY(yIndex);
renderZ(zIndex);

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
    }

    let renderRequested = false;

    function render() {
    renderRequested = undefined;


    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    controls.update();
    renderer.render(scene, camera);
    }
    render();

    function requestRenderIfNotRequested() {
    if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
        }
    }




    controls.addEventListener('change', requestRenderIfNotRequested);
    window.addEventListener('resize', requestRenderIfNotRequested);


    var sliderX = document.getElementById("xRange");
    var outputX = document.getElementById("xval");
    outputX.innerHTML = sliderX.value;
    
    var sliderY = document.getElementById('yRange');
    var outputY = document.getElementById("yval");
    outputY.innerHTML = sliderY.value;


    var sliderZ = document.getElementById('zRange')
    var outputZ = document.getElementById("zval");
    outputZ.innerHTML = sliderZ.value;

    sliderX.addEventListener('input', function() {
        
        if(document.getElementById('xcheck').checked){
        xIndex = parseInt(this.value);
        outputX.innerHTML = xIndex;
        deleteSlice(planeX)

        //console.log('event X firing: ', xIndex)
        renderX(xIndex)
        requestRenderIfNotRequested();
        }else{
            xIndex = parseInt(this.value);
            outputX.innerHTML = xIndex;
        }
    });

    sliderY.addEventListener('input', function() {
        if(document.getElementById('ycheck').checked){
            yIndex = parseInt(this.value);
            outputY.innerHTML = yIndex;
            deleteSlice(planeY)
            
            //console.log('event Y firing: ', yIndex)
            renderY(yIndex)
            requestRenderIfNotRequested();
        }else{
            yIndex = parseInt(this.value);
            outputY.innerHTML = yIndex;
        }

    });

    sliderZ.addEventListener('input',function(){
        if(document.getElementById('zcheck').checked){
            zIndex = parseInt(this.value);
            outputZ.innerHTML = zIndex
            //console.log(planeZ)
            deleteSlice(planeZ)
            
            //console.log('firing Z event: ', zIndex)
            renderZ(zIndex)
            requestRenderIfNotRequested();
        }else{
            zIndex = parseInt(this.value);
            outputZ.innerHTML = zIndex
        }

    });
    
    document.getElementById('resetCameraBtn').addEventListener('click',function(){
        yIndex = dataWidth/2; xIndex = dataWidth/2; zIndex = dataWidth/2;
        
        deleteSlice(planeX);deleteSlice(planeY);deleteSlice(planeZ);  
        renderX(xIndex); renderY(yIndex); renderZ(zIndex);

        updateAllSliders(xIndex,yIndex,zIndex)

        requestRenderIfNotRequested();
        //console.log('fire')
    })

    document.getElementById('xcheck').addEventListener('change', function(){
        if (this.checked){
            deleteSlice(planeX)
            renderX(xIndex)    
        }else{
            deleteSlice(planeX)
        }
        requestRenderIfNotRequested();
    });
    document.getElementById('ycheck').addEventListener('change', function(){
        if (this.checked){
            deleteSlice(planeY)
            renderY(yIndex)    
        }else{
            deleteSlice(planeY)
        }
        requestRenderIfNotRequested();
    });

    document.getElementById('zcheck').addEventListener('change', function(){
        if (this.checked){
            deleteSlice(planeZ)
            renderZ(zIndex)    
        }
        else{
            deleteSlice(planeZ)
        }
        requestRenderIfNotRequested(); 
    });


    
function updateAllSliders(x,y,z){
    sliderX.value = x; sliderY.value = y; sliderZ.value = z;
    outputX.innerHTML = x; outputY.innerHTML = y; outputZ.innerHTML = z;
}
    

}

main();