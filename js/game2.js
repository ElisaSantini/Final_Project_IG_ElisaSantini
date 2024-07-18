//variable declaration section
const TIME_LIMIT = 30;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let TOWELS = 4, dirty = [];
let left_towels = TOWELS;
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null, cloth1, cloth2, cloth3, cloth4;
let ballObject = null, moveDirection = { left: 0, right: 0, forward: 0, back: 0 , up : 0};
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
let textureLoader, sound1, sound2, sound_win, sound_loose;
const Nx = 15;
const Ny = 15;
const mass = 1;
const clothSize = 1;
const dist = 1;
let clothGeometry1, clothGeometry2, clothGeometry3, clothGeometry4, particles;
let followCam = new THREE.Object3D();

const STATE = { DISABLE_DEACTIVATION : 4 }

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

//Ammojs Initialization
Ammo().then(start)



function start (){
    
    tmpTrans = new Ammo.btTransform();
    setupEventHandlers();
    
    document.getElementById('score2').style.display = 'grid';
    setupPhysicsWorld();
    camera_par = [70, window.innerWidth / window.innerHeight, 0.1, 100];  
    setupGraphics(0, 5, 10, camera_par, follow = 'ball'); //ball
    createPlane('../immages/grass_prova.jpg');
    createBall('../immages/ball3.jpg');
    createCloth();
    renderFrame();
    startTimer();

    

}

function setupPhysicsWorld(){

    let collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

	const softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration, softBodySolver );
    physicsWorld.setGravity( new Ammo.btVector3( 0, -9.8, 0 ) );
    physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, -9.8, 0 ) );

}

function setupGraphics(camerax, cameray, cameraz, camera_par, follow){

    //create clock for timing
    clock = new THREE.Clock();
    

    //create the scene
    scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
        '../immages/sky.jpg',
        () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
        });

    
    camera = new THREE.PerspectiveCamera(camera_par[0], camera_par[1], camera_par[2], camera_par[3]);
    camera.position.set(camerax, cameray, cameraz);
    scene.add(camera);

    followCam.position.copy(camera.position);
    scene.add(followCam);
    followCam.parent = ballObject;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Create a global audio source
    sound1 = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('../sounds/grass.mp3', function(buffer) {
        sound1.setBuffer(buffer);
        sound1.setLoop(false);
        sound1.setVolume(0.5);
    });

    sound2 = new THREE.Audio(listener);

    const audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load('../sounds/jump.mp3', function(buffer) {
        sound2.setBuffer(buffer);
        sound2.setLoop(false);
        sound2.setVolume(0.5);
    });

    sound_win = new THREE.Audio(listener);

    const audioLoader_win = new THREE.AudioLoader();
    audioLoader_win.load('../sounds/win.mp3', function(buffer) {
        sound_win.setBuffer(buffer);
        sound_win.setLoop(false);
        sound_win.setVolume(0.5);
    });

    sound_loose = new THREE.Audio(listener);

    const audioLoader_loose = new THREE.AudioLoader();
    audioLoader_loose.load('../sounds/lost.mp3', function(buffer) {
        sound_loose.setBuffer(buffer);
        sound_loose.setLoop(false);
        sound_loose.setVolume(0.5);
    });

    

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffcc00 , 1);
    dirLight.color.setHSL( 1,1,1 ); 
    dirLight.position.set( 1, 1, 1 ); 
    dirLight.position.multiplyScalar( 100 );
    
    
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    textureLoader = new THREE.TextureLoader();

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
    
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    
    controls.update();
    controls.enableDampling = true;


}

function renderFrame(){
    
    let deltaTime = clock.getDelta();
    
    moveBall(); 
    camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.085);
    camera.position.set(ballObject.position.x, ballObject.position.y + 10, ballObject.position.z + 10);
    if(left_towels == 0 ){
        sound_win.play();
        setTimeout( function() {
            document.getElementById('win2').style.display = 'grid';
            }, 2000);
        
    }
    
    updatePhysics( deltaTime );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        
        document.getElementById("Countdown2").innerHTML = 'Countdown: ' + formatTimeLeft(timeLeft);
        
        
    
        if (timeLeft === 0 && left_towels > 0) { 
            sound_loose.play();          
            document.getElementById("game_over2").style.display = 'grid';
            timePassed = 0;
            timeLeft = TIME_LIMIT;
            
        }
    }, 1000);
}

function formatTimeLeft(time) {
    // The largest round integer less than or equal to the result of time divided being by 60.
    const minutes = Math.floor(time / 60);
    
    // Seconds are the remainder of the time divided by 60 (modulus operator)
    let seconds = time % 60;
    
    // If the value of seconds is less than 10, then display seconds with a leading zero
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
  
    // The output in MM:SS format
    return `${minutes}:${seconds}`;
  }


function setupEventHandlers(){

    window.addEventListener( 'keydown', handleKeyDown, false);
    window.addEventListener( 'keyup', handleKeyUp, false);
    window.addEventListener( 'mousemove', onMouseMove, false);

}

function handleKeyDown(event){

    let keyCode = event.keyCode;

    switch(keyCode){

        case 87: //W: FORWARD
            moveDirection.forward = 1
            if (sound1.isPlaying) {
                sound1.stop();
            }
            sound1.play();
            break;
            
        case 83: //S: BACK
            moveDirection.back = 1
            if (sound1.isPlaying) {
                sound1.stop();
            }
            sound1.play();
            break;
            
        case 65: //A: LEFT
            moveDirection.left = 1
            if (sound1.isPlaying) {
                sound1.stop();
            }
            sound1.play();
            break;
            
        case 68: //D: RIGHT
            moveDirection.right = 1
            if (sound1.isPlaying) {
                sound1.stop();
            }
            sound1.play();
            break;

        case 32: //: SPACE
            
            moveDirection.up = 1;
            if (sound2.isPlaying) {
                sound2.stop();
            }
            sound2.play();
            checkCollision();
            
            break;
        
            
    }
}

function handleKeyUp(event){
    let keyCode = event.keyCode;

    switch(keyCode){
        case 87: //FORWARD
            moveDirection.forward = 0
            break;
            
        case 83: //BACK
            moveDirection.back = 0
            break;
            
        case 65: //LEFT
            moveDirection.left = 0
            break;
            
        case 68: //RIGHT
            moveDirection.right = 0
            break;

        // case 73: //↑: FORWARD
        //     kMoveDirection.forward = 0
        //     break;
            
        // case 75: //↓: BACK
        //     kMoveDirection.back = 0
        //     break;

        case 32: //: SPACE
           
            moveDirection.up = -1;
            
            break;
    }

}


function onMouseMove(event){
    const width = window.innerWidth;
    const height = window.innerHeight;

    mouseCoords.x = (event.clientX / width * 2 - 1);
    mouseCoords.y = -(event.clientY / height) * 2 + 1;
}

function checkCollision(){
        const up = new THREE.Vector3();
        up.copy( ballObject.up ).applyMatrix4( ballObject.matrixWorld ).normalize();    
        var ray = new THREE.Raycaster( ballObject.position, new THREE.Vector3(0, 1, 0) );
        var collisionResults = ray.intersectObjects( scene.children );
        for (let i = 0; i < collisionResults.length; i++){
            if ( (collisionResults[i].object.name).split('_') != [] && (collisionResults[i].object.name).split('_')[0] == 'cloth' ) 
                {
                    updateTexture(collisionResults[i].object);
                    
                }
        }

}


function createPlane(texture){ //creates the plane
    
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 100, y: 2, z: 100};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    // //threeJS Section
    const material = new THREE.MeshPhongMaterial({color: 'grey'} );//{ color: 'blue'}
    //let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 'grey'}));
    let blockPlane;
    blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), material);
    

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);

    if (texture){
        textureLoader.load( texture, function ( texture ) {

            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( 5, 5);
            blockPlane.material.map = texture;
            blockPlane.material.needsUpdate = true;
    
        } );
    }

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );
    let colShape;
    colShape = new Ammo.btBoxShape( new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(2);

    physicsWorld.addRigidBody( body );

    
    let material_w = new THREE.MeshStandardMaterial({ color: "yellow" });
    const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 20, 100), //30.5
        material_w
    );
    wall1.position.y = 0;
    wall1.position.x = 50;
    wall1.position.z = 0;
    wall1.castShadow = true;
    wall1.name = "wall";
    scene.add(wall1);

    
    textureLoader.load( '../immages/staccionata.jpg', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 10, 2 );
        wall1.material.map = texture;
        wall1.material.needsUpdate = true;

    } );
    

    let wall1Shape = new Ammo.btBoxShape(new Ammo.btVector3( 0.25, 10, 50 ));
    wall1Shape.setMargin(0.05);

    var transform_w1 = new Ammo.btTransform();
    transform_w1.setIdentity();
    transform_w1.setOrigin(new Ammo.btVector3(wall1.position.x, wall1.position.y, wall1.position.z));
    transform_w1.setRotation(new Ammo.btQuaternion(wall1.quaternion.x, wall1.quaternion.y, wall1.quaternion.z, wall1.quaternion.w));

    let localInertia_w1 = new Ammo.btVector3( 0, 0, 0 );
    wall1Shape.calculateLocalInertia( mass, localInertia_w1 );

    var motionState_w1 = new Ammo.btDefaultMotionState(transform_w1);
    let w1_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w1, wall1Shape, localInertia_w1 );
    let body_w1 = new Ammo.btRigidBody( w1_info );


    physicsWorld.addRigidBody( body_w1 );

    const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 20, 100),
        material_w
    );
    wall2.position.y = 0;
    wall2.position.x = -50;
    wall2.position.z = 0;
    wall2.castShadow = true;
    wall2.name = "wall";
    scene.add(wall2);

    
    textureLoader.load( '../immages/staccionata.jpg', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 10, 2 );
        wall2.material.map = texture;
        wall2.material.needsUpdate = true;

    } );
    

    let wall2Shape = new Ammo.btBoxShape(new Ammo.btVector3( 0.25, 10, 50));
    wall2Shape.setMargin(0.05);

    var transform_w2 = new Ammo.btTransform();
    transform_w2.setIdentity();
    transform_w2.setOrigin(new Ammo.btVector3(wall2.position.x, wall2.position.y, wall2.position.z));
    transform_w2.setRotation(new Ammo.btQuaternion(wall2.quaternion.x, wall2.quaternion.y, wall2.quaternion.z, wall2.quaternion.w));

    let localInertia_w2 = new Ammo.btVector3( 0, 0, 0 );
    wall2Shape.calculateLocalInertia( mass, localInertia_w2 );

    var motionState_w2 = new Ammo.btDefaultMotionState(transform_w2);
    let w2_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w2, wall2Shape, localInertia_w2 );
    let body_w2 = new Ammo.btRigidBody( w2_info );

    
    body_w2.setFriction(4);
    body_w2.setRollingFriction(10);

    physicsWorld.addRigidBody( body_w2 );

    const wall3 = new THREE.Mesh(
        new THREE.BoxGeometry(100, 20, 0.5),
        material_w
    );
    wall3.position.y = 0;
    wall3.position.x = 0;
    wall3.position.z = -50;
    wall3.castShadow = true;
    wall3.name = "wall";
    scene.add(wall3);

    
    textureLoader.load( '../immages/staccionata.jpg', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 10, 2 );
        wall3.material.map = texture;
        wall3.material.needsUpdate = true;

    } );
    

    let wall3Shape = new Ammo.btBoxShape(new Ammo.btVector3( 50, 10, 0.25 ));
    wall3Shape.setMargin(0.05);

    var transform_w3 = new Ammo.btTransform();
    transform_w3.setIdentity();
    transform_w3.setOrigin(new Ammo.btVector3(wall3.position.x, wall3.position.y, wall3.position.z));
    transform_w3.setRotation(new Ammo.btQuaternion(wall3.quaternion.x, wall3.quaternion.y, wall3.quaternion.z, wall3.quaternion.w));

    let localInertia_w3 = new Ammo.btVector3( 0, 0, 0 );
    wall3Shape.calculateLocalInertia( mass, localInertia_w3 );

    var motionState_w3 = new Ammo.btDefaultMotionState(transform_w3);
    let w3_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w3, wall3Shape, localInertia_w3 );
    let body_w3 = new Ammo.btRigidBody( w3_info );

    
    body_w3.setFriction(4);
    body_w3.setRollingFriction(10);

    physicsWorld.addRigidBody( body_w3 );
    

    let wall4 = new THREE.Mesh(
        new THREE.BoxGeometry(100, 20, 0.5), 
        material_w
    );
    wall4.position.y = 0;
    wall4.position.x = 0;
    wall4.position.z = 50;
    wall4.castShadow = true;
    wall4.name = "wall";

    scene.add(wall4);
    
    textureLoader.load( '../immages/staccionata.jpg', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 10, 2 );
        wall4.material.map = texture;
        wall4.material.needsUpdate = true;

    } );
    

    let wall4Shape = new Ammo.btBoxShape(new Ammo.btVector3( 50, 10, 0.25 ));
    wall4Shape.setMargin(0.05);

    var transform_w4 = new Ammo.btTransform();
    transform_w4.setIdentity();
    transform_w4.setOrigin(new Ammo.btVector3(wall4.position.x, wall4.position.y, wall4.position.z));
    transform_w4.setRotation(new Ammo.btQuaternion(wall4.quaternion.x, wall4.quaternion.y, wall4.quaternion.z, wall4.quaternion.w));

    let localInertia_w4 = new Ammo.btVector3( 0, 0, 0 );
    wall4Shape.calculateLocalInertia( mass, localInertia_w4 );

    var motionState_w4 = new Ammo.btDefaultMotionState(transform_w4);
    let w4_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w4, wall4Shape, localInertia_w4 );
    let body_w4 = new Ammo.btRigidBody( w4_info );


    body_w4.setActivationState( STATE.DISABLE_DEACTIVATION );
    body_w4.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );

    physicsWorld.addRigidBody( body_w4 );
    wall4.userData.physicsBody = body_w4;

    

}

function createBall(texture){
    
    let pos = {x: 0, y: 2, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 100;

    //threeJS Section
    ballObject = new THREE.Mesh(new THREE.IcosahedronGeometry( radius, 5 ), new THREE.MeshLambertMaterial({color: 'orange'}));
    let ball = ballObject;
    ball.position.set(pos.x, pos.y, pos.z);
    ball.name = "ball";
    
    ball.castShadow = true;
    ball.receiveShadow = true;
    if (texture){
        textureLoader.load( texture, function ( texture ) {

            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            ball.material.map = texture;
            ball.material.needsUpdate = true;
    
        } );
    }
    

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(1);
    body.setRollingFriction(1);

    body.setActivationState( STATE.DISABLE_DEACTIVATION )


    physicsWorld.addRigidBody( body );
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}


function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {

    const threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( 0.05 );

    createRigidBody( threeObject, shape, mass, pos, quat );

    return threeObject;

}


function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {

    threeObject.position.copy( pos );
    threeObject.quaternion.copy( quat );

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    const motionState = new Ammo.btDefaultMotionState( transform );

    const localInertia = new Ammo.btVector3( 0, 0, 0 );
    physicsShape.calculateLocalInertia( mass, localInertia );

    const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
    const body = new Ammo.btRigidBody( rbInfo );

    threeObject.userData.physicsBody = body;

    scene.add( threeObject );

    if ( mass > 0) {

        rigidBodies.push( threeObject );
        // Disable deactivation
        body.setActivationState( 4 );

    }

    physicsWorld.addRigidBody( body );

    return body;

}


function updateTexture(cloth){
    if(!dirty.includes(cloth)){
        left_towels--;
        document.getElementById('points2').innerHTML = 'Towels left: ' + left_towels;
        dirty.push(cloth);
    }
    textureLoader.load( '../immages/cloth_dirty.avif', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );
        cloth.material.map = texture;
        cloth.material.needsUpdate = true;
        cloth.material.name = 'dirty';

    } );
    

    

}

function createCloth(){
    const clothWidth = 5;
    const clothHeight = 6;
    const clothNumSegmentsZ = clothWidth * 5;
    const clothNumSegmentsY = clothHeight * 5;
    const margin = 0.05;

    //FRONTAL CLOTH
    let clothPos = new THREE.Vector3(0, 5, 20 );

    clothGeometry1 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    clothGeometry1.translate( clothPos.x - clothWidth * 0.5, clothPos.y + clothHeight * 0.5, clothPos.z );
    //clothGeometry1.lookAt(-10,0,0);

    const clothMaterial1 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth1 = new THREE.Mesh( clothGeometry1, clothMaterial1 );
    cloth1.castShadow = true;
    cloth1.receiveShadow = true;
    cloth1.name = 'cloth_1';
    scene.add( cloth1 );
    textureLoader.load( '../immages/texture.webp', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );
        cloth1.material.map = texture;
        cloth1.material.needsUpdate = true;

    } );

    // Cloth physic object
    const softBodyHelpers = new Ammo.btSoftBodyHelpers();
    const clothCorner00 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
    const clothCorner01 = new Ammo.btVector3( clothPos.x - clothWidth, clothPos.y + clothHeight, clothPos.z ); 
    const clothCorner10 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
    const clothCorner11 = new Ammo.btVector3( clothPos.x - clothWidth, clothPos.y, clothPos.z );
    const clothSoftBody = softBodyHelpers.CreatePatch( physicsWorld.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
    const sbConfig = clothSoftBody.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);

    clothSoftBody.setTotalMass( 0.1, false );
    Ammo.castObject( clothSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 3 );
    physicsWorld.addSoftBody( clothSoftBody, 1, - 1 );
    cloth1.userData.physicsBody = clothSoftBody;
    
    // Disable deactivation
    clothSoftBody.setActivationState( 4 );
    clothSoftBody.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );

    

    let pos = new THREE.Vector3();
    let quat = new THREE.Quaternion();
    const armMass = 2;
    const armLength = clothWidth;
    const pylonHeight = clothPos.y + clothHeight;
    const baseMaterial = new THREE.MeshPhongMaterial( { color: 0x606060 } );
    pos.set( clothPos.x  - armLength, 0.5 * pylonHeight, clothPos.z  );
    const pylon_l = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_l.castShadow = true;
    pylon_l.receiveShadow = true;

    pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z );
    const pylon_r = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_r.castShadow = true;
    pylon_r.receiveShadow = true;

    pos.set( clothPos.x - 0.5 * armLength, pylonHeight + 0.2, clothPos.z  );
    const arm = createParalellepiped( 0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial );
    arm.castShadow = true;
    arm.receiveShadow = true;

    const pivotA = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB = new Ammo.btVector3( 0, - 0.2, - armLength * 0.5 );
    const axis = new Ammo.btVector3( 0, 1, 0 );
    hinge = new Ammo.btHingeConstraint( pylon_l.userData.physicsBody, arm.userData.physicsBody, pivotA, pivotB, axis, axis, true );
    physicsWorld.addConstraint( hinge, true );


    const pivotA_r = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB_r = new Ammo.btVector3( 0, - 0.2, 0);
    const axis_r = new Ammo.btVector3( 0, 1, 0 );
    hinge_r = new Ammo.btHingeConstraint( pylon_r.userData.physicsBody, arm.userData.physicsBody, pivotA_r, pivotB_r, axis_r, axis_r, true );
    physicsWorld.addConstraint( hinge_r, true );

    // Glue the cloth to the arm
    const influence = 1;
    clothSoftBody.appendAnchor( 0, pylon_l.userData.physicsBody, false, influence );
    clothSoftBody.appendAnchor( clothNumSegmentsZ, pylon_r.userData.physicsBody, false, influence );







    clothPos = new THREE.Vector3(30, 5, 40 );    

    clothGeometry2 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    clothGeometry2.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z  - clothWidth * 0.5 ); //clothPos.z - clothWidth * 0.5
    clothGeometry2.lookAt(-10,0,0);

    const clothMaterial2 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth2 = new THREE.Mesh( clothGeometry2, clothMaterial2 );
    

    cloth2.castShadow = true;
    cloth2.receiveShadow = true;
    cloth2.name = 'cloth_2';
    scene.add( cloth2 );
    
    
    textureLoader.load( '../immages/texture.webp', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        cloth2.material.map = texture;
        cloth2.material.needsUpdate = true;

    } );

    // Cloth physic object
    const softBodyHelpers2 = new Ammo.btSoftBodyHelpers();
    
    const clothCorner002 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
    const clothCorner012 = new Ammo.btVector3( clothPos.x , clothPos.y + clothHeight, clothPos.z - clothWidth); //clothPos.z - clothWidth 
    const clothCorner102 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
    const clothCorner112 = new Ammo.btVector3( clothPos.x , clothPos.y, clothPos.z - clothWidth);//clothPos.z - clothWidth 
    const clothSoftBody2 = softBodyHelpers2.CreatePatch( physicsWorld.getWorldInfo(), clothCorner002, clothCorner012, clothCorner102, clothCorner112, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
    const sbConfig2 = clothSoftBody2.get_m_cfg();
    sbConfig2.set_viterations(10);
    sbConfig2.set_piterations(10);

    clothSoftBody2.setTotalMass( 0.1, false );
    Ammo.castObject( clothSoftBody2, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 3 );
    physicsWorld.addSoftBody( clothSoftBody2, 1, - 1 );
    cloth2.userData.physicsBody = clothSoftBody2;
    // Disable deactivation
    clothSoftBody2.setActivationState( 4 );
    clothSoftBody2.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );
    
    pos = new THREE.Vector3();
    quat = new THREE.Quaternion();
    pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z   - armLength);
    const pylon_l2 = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_l2.castShadow = true;
    pylon_l2.receiveShadow = true;

    pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z );
    const pylon_r2 = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_r2.castShadow = true;
    pylon_r2.receiveShadow = true;

    pos.set( clothPos.x , pylonHeight + 0.2, clothPos.z  - 0.5 * armLength);
    const arm2 = createParalellepiped( 0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial );
    arm2.castShadow = true;
    arm2.receiveShadow = true;

    const pivotA2 = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB2 = new Ammo.btVector3( 0, - 0.2, - armLength * 0.5 );
    const axis2 = new Ammo.btVector3( 0, 1, 0 );
    hinge2 = new Ammo.btHingeConstraint( pylon_l2.userData.physicsBody, arm2.userData.physicsBody, pivotA2, pivotB2, axis2, axis2, true );
    physicsWorld.addConstraint( hinge2, true );


    const pivotA_r2 = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB_r2 = new Ammo.btVector3( 0, - 0.2, 0);
    const axis_r2 = new Ammo.btVector3( 0, 1, 0 );
    hinge_r2 = new Ammo.btHingeConstraint( pylon_r2.userData.physicsBody, arm2.userData.physicsBody, pivotA_r2, pivotB_r2, axis_r2, axis_r2, true );
    physicsWorld.addConstraint( hinge_r2, true );

    // Glue the cloth to the arm
    clothSoftBody2.appendAnchor( 0, pylon_l2.userData.physicsBody, false, influence );
    clothSoftBody2.appendAnchor( clothNumSegmentsZ, pylon_r2.userData.physicsBody, false, influence );




    clothPos = new THREE.Vector3(-30, 5, -10 ); //- 3, 5, -3 
    
    clothGeometry3 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );    
    clothGeometry3.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z  - clothWidth * 0.5 ); //clothPos.z - clothWidth * 0.5
    clothGeometry3.lookAt(-10,0,0);

    const clothMaterial3 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth3 = new THREE.Mesh( clothGeometry3, clothMaterial3 );
    

    cloth3.castShadow = true;
    cloth3.receiveShadow = true;
    cloth3.name = 'cloth_3';
    scene.add( cloth3 );
    
    textureLoader.load( '../immages/texture.webp', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
        cloth3.material.map = texture;
        cloth3.material.needsUpdate = true;

    } );

    // Cloth physic object
    const softBodyHelpers3 = new Ammo.btSoftBodyHelpers();
    
    const clothCorner003 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
    const clothCorner013 = new Ammo.btVector3( clothPos.x , clothPos.y + clothHeight, clothPos.z - clothWidth); //clothPos.z - clothWidth 
    const clothCorner103 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
    const clothCorner113 = new Ammo.btVector3( clothPos.x , clothPos.y, clothPos.z - clothWidth);//clothPos.z - clothWidth 
    const clothSoftBody3 = softBodyHelpers3.CreatePatch( physicsWorld.getWorldInfo(), clothCorner003, clothCorner013, clothCorner103, clothCorner113, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
    const sbConfig3 = clothSoftBody3.get_m_cfg();
    sbConfig3.set_viterations(10);
    sbConfig3.set_piterations(10);

    clothSoftBody3.setTotalMass( 0.1, false );
    Ammo.castObject( clothSoftBody3, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 3 );
    physicsWorld.addSoftBody( clothSoftBody3, 1, - 1 );
    cloth3.userData.physicsBody = clothSoftBody3;
    // Disable deactivation
    clothSoftBody3.setActivationState( 4 );
    clothSoftBody3.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );
    
    pos = new THREE.Vector3();
    quat = new THREE.Quaternion();
    pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z   - armLength);
    const pylon_l3 = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_l3.castShadow = true;
    pylon_l3.receiveShadow = true;

    pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z );
    const pylon_r3 = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_r3.castShadow = true;
    pylon_r3.receiveShadow = true;

    pos.set( clothPos.x , pylonHeight + 0.2, clothPos.z  - 0.5 * armLength);
    const arm3 = createParalellepiped( 0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial );
    arm3.castShadow = true;
    arm3.receiveShadow = true;

    const pivotA3 = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB3 = new Ammo.btVector3( 0, - 0.2, - armLength * 0.5 );
    const axis3 = new Ammo.btVector3( 0, 1, 0 );
    hinge3 = new Ammo.btHingeConstraint( pylon_l3.userData.physicsBody, arm3.userData.physicsBody, pivotA3, pivotB3, axis3, axis3, true );
    physicsWorld.addConstraint( hinge3, true );


    const pivotA_r3 = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB_r3 = new Ammo.btVector3( 0, - 0.2, 0);
    const axis_r3 = new Ammo.btVector3( 0, 1, 0 );
    hinge_r3 = new Ammo.btHingeConstraint( pylon_r3.userData.physicsBody, arm3.userData.physicsBody, pivotA_r3, pivotB_r3, axis_r3, axis_r3, true );
    physicsWorld.addConstraint( hinge_r3, true );

    // Glue the cloth to the arm
    clothSoftBody3.appendAnchor( 0, pylon_l3.userData.physicsBody, false, influence );
    clothSoftBody3.appendAnchor( clothNumSegmentsZ, pylon_r3.userData.physicsBody, false, influence );



    clothPos = new THREE.Vector3(30, 5, -30 );
    console.log(clothPos);
    

    clothGeometry4 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );    
    clothGeometry4.translate( clothPos.x  - clothWidth * 0.5 , clothPos.y + clothHeight * 0.5, clothPos.z ); //clothPos.z - clothWidth * 0.5
    clothGeometry4.lookAt(-10,0,0);

    const clothMaterial4 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth4 = new THREE.Mesh( clothGeometry4, clothMaterial4 );
    

    cloth4.castShadow = true;
    cloth4.receiveShadow = true;
    cloth4.name = 'cloth_4';
    scene.add( cloth4 );
    
    textureLoader.load( '../immages/texture.webp', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
        cloth4.material.map = texture;
        cloth4.material.needsUpdate = true;

    } );

    // Cloth physic object
    const softBodyHelpers4 = new Ammo.btSoftBodyHelpers();
    
    const clothCorner004 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
    const clothCorner014 = new Ammo.btVector3( clothPos.x  - clothWidth, clothPos.y + clothHeight, clothPos.z); //clothPos.z - clothWidth 
    const clothCorner104 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
    const clothCorner114 = new Ammo.btVector3( clothPos.x  - clothWidth, clothPos.y, clothPos.z);//clothPos.z - clothWidth 
    const clothSoftBody4 = softBodyHelpers4.CreatePatch( physicsWorld.getWorldInfo(), clothCorner004, clothCorner014, clothCorner104, clothCorner114, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
    const sbConfig4 = clothSoftBody4.get_m_cfg();
    sbConfig4.set_viterations(10);
    sbConfig4.set_piterations(10);

    clothSoftBody4.setTotalMass( 0.1, false );
    Ammo.castObject( clothSoftBody4, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 3 );
    physicsWorld.addSoftBody( clothSoftBody4, 1, - 1 );
    cloth4.userData.physicsBody = clothSoftBody4;
    // Disable deactivation
    clothSoftBody4.setActivationState( 4 );
    clothSoftBody4.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );
    
    pos = new THREE.Vector3();
    quat = new THREE.Quaternion();
    pos.set( clothPos.x  - clothWidth, 0.5 * pylonHeight, clothPos.z );
    const pylon_l4 = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_l4.castShadow = true;
    pylon_l4.receiveShadow = true;

    pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z );
    const pylon_r4 = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
    pylon_r4.castShadow = true;
    pylon_r4.receiveShadow = true;

    pos.set( clothPos.x - 0.5 * armLength, pylonHeight + 0.2, clothPos.z  );
    const arm4 = createParalellepiped( 0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial );
    arm4.castShadow = true;
    arm4.receiveShadow = true;

    const pivotA4 = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB4 = new Ammo.btVector3( 0, - 0.2, - armLength * 0.5 );
    const axis4 = new Ammo.btVector3( 0, 1, 0 );
    hinge4 = new Ammo.btHingeConstraint( pylon_l4.userData.physicsBody, arm4.userData.physicsBody, pivotA4, pivotB4, axis4, axis4, true );
    physicsWorld.addConstraint( hinge4, true );


    const pivotA_r4 = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    const pivotB_r4 = new Ammo.btVector3( 0, - 0.2, 0);
    const axis_r4 = new Ammo.btVector3( 0, 1, 0 );
    hinge_r4 = new Ammo.btHingeConstraint( pylon_r4.userData.physicsBody, arm4.userData.physicsBody, pivotA_r4, pivotB_r4, axis_r4, axis_r4, true );
    physicsWorld.addConstraint( hinge_r4, true );

    // Glue the cloth to the arm
    clothSoftBody4.appendAnchor( 0, pylon_l4.userData.physicsBody, false, influence );
    clothSoftBody4.appendAnchor( clothNumSegmentsZ, pylon_r4.userData.physicsBody, false, influence );


    document.getElementById('points2').innerHTML = 'Towels left: ' + left_towels;
    console.log('towels_left');
    
}

function moveBall(){

    let scalingFactor = 20;
    const movementSpeed = 6;
    const rotationSpeed = 3;

    let moveX =  moveDirection.right - moveDirection.left;
    let moveZ =  moveDirection.back - moveDirection.forward;
    let moveY =  moveDirection.up; 
    

    let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
    resultantImpulse.op_mul(scalingFactor);

    let physicsBody;

    physicsBody = ballObject.userData.physicsBody;
    physicsBody.setLinearVelocity( resultantImpulse );
    
   

}


function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    
    // Update cloth
    const softBody = cloth1.userData.physicsBody;
    const clothPositions = clothGeometry1.attributes.position.array;
    const numVerts = clothPositions.length / 3;
    const nodes = softBody.get_m_nodes();
    let indexFloat = 0;

    for ( let i = 0; i < numVerts; i ++ ) {

        const node = nodes.at( i );
        const nodePos = node.get_m_x();
        clothPositions[ indexFloat ] = nodePos.x();
        indexFloat ++;
        clothPositions[ indexFloat ] = nodePos.y();
        indexFloat ++;
        clothPositions[ indexFloat ] = nodePos.z();
        indexFloat ++;

    }

    cloth1.geometry.computeVertexNormals();
    clothGeometry1.attributes.position.needsUpdate = true;
    clothGeometry1.attributes.normal.needsUpdate = true;

    const softBody2 = cloth2.userData.physicsBody;
    const clothPositions2 = clothGeometry2.attributes.position.array;
    const numVerts2 = clothPositions2.length / 3;
    const nodes2 = softBody2.get_m_nodes();
    let indexFloat2 = 0;

    for ( let i = 0; i < numVerts2; i ++ ) {

        const node = nodes2.at( i );
        const nodePos = node.get_m_x();
        clothPositions2[ indexFloat2 ] = nodePos.x();
        indexFloat2 ++;
        clothPositions2[ indexFloat2 ] = nodePos.y();
        indexFloat2 ++;
        clothPositions2[ indexFloat2 ] = nodePos.z();
        indexFloat2 ++;

    }

    cloth2.geometry.computeVertexNormals();
    clothGeometry2.attributes.position.needsUpdate = true;
    clothGeometry2.attributes.normal.needsUpdate = true;


    const softBody3 = cloth3.userData.physicsBody;
    const clothPositions3 = clothGeometry3.attributes.position.array;
    const numVerts3 = clothPositions3.length / 3;
    const nodes3 = softBody3.get_m_nodes();
    let indexFloat3 = 0;

    for ( let i = 0; i < numVerts3; i ++ ) {

        const node = nodes3.at( i );
        const nodePos = node.get_m_x();
        clothPositions3[ indexFloat3 ] = nodePos.x();
        indexFloat3 ++;
        clothPositions3[ indexFloat3 ] = nodePos.y();
        indexFloat3 ++;
        clothPositions3[ indexFloat3 ] = nodePos.z();
        indexFloat3 ++;

    }

    cloth3.geometry.computeVertexNormals();
    clothGeometry3.attributes.position.needsUpdate = true;
    clothGeometry3.attributes.normal.needsUpdate = true;

    const softBody4 = cloth4.userData.physicsBody;
    const clothPositions4 = clothGeometry4.attributes.position.array;
    const numVerts4 = clothPositions4.length / 3;
    const nodes4 = softBody4.get_m_nodes();
    let indexFloat4 = 0;

    for ( let i = 0; i < numVerts4; i ++ ) {

        const node = nodes4.at( i );
        const nodePos = node.get_m_x();
        clothPositions4[ indexFloat4 ] = nodePos.x();
        indexFloat4 ++;
        clothPositions4[ indexFloat4 ] = nodePos.y();
        indexFloat4 ++;
        clothPositions4[ indexFloat4 ] = nodePos.z();
        indexFloat4 ++;

    }

    cloth4.geometry.computeVertexNormals();
    clothGeometry4.attributes.position.needsUpdate = true;
    clothGeometry4.attributes.normal.needsUpdate = true;


    var ray = new THREE.Raycaster( ballObject.position, new THREE.Vector3(0, 1, 0) );
            var collisionResults = ray.intersectObjects( scene.children );
            for (let i = 0; i < collisionResults.length; i++){
                if ( (collisionResults[i].object.name).split('_') != [] && (collisionResults[i].object.name).split('_')[0] == 'cloth' ) 
                    {
                        updateTexture(collisionResults[i].object);  
                    }
            }
    

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
           
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        

        }
    }


}