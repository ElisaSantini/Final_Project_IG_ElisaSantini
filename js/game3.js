//variable declaration section
const TIME_LIMIT = 60;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let NUM_ENEMY = 20;
let left_enemy = NUM_ENEMY;
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null;
let moveDirection = { left: 0, right: 0, forward: 0, back: 0 , up : 0}, rotate = {left: 0, right: 0}, roll = {up : 0, down : 0};
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
let textureLoader, sound, sound_win, sound_loose, audioLoader, listener; 
let avgVertexNormals_tot = [];
let velocity;
let followCam = new THREE.Object3D();;
let Character = null;
var stopAnimate = false, hit_baloons = [], hit_lines = [];

const STATE = { DISABLE_DEACTIVATION : 4 }
const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

//Ammojs Initialization
Ammo().then(start)



function start (){
    tmpTrans = new Ammo.btTransform();
    setupEventHandlers();

    document.getElementById('score3').style.display = 'grid';
    camera_par = [70, window.innerWidth / window.innerHeight, 0.1, 100];  
    setupGraphics(0, 5, 10, camera_par);
    setupPhysicsWorld();
    createPlane('floor.avif');
    createCilinder();
    createBaloon();
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

function setupGraphics(camerax, cameray, cameraz, camera_par){

    //create clock for timing
    clock = new THREE.Clock();
    

    //create the scene
    scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();
    
    const texture = loader.load(
        '../immages/party.jpg',
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
    followCam.parent = Character;
    
    listener = new THREE.AudioListener();
    camera.add(listener);

    // Create a global audio source
    sound = new THREE.Audio(listener);

    audioLoader = new THREE.AudioLoader();
    audioLoader.load('../sounds/balloon_pop.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        //sound.stop();
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
    
    dirLight.position.set( 0, 10, 0 );
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
    
    moveCilinder(); 
    camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.085);
    camera.position.set(Character.position.x, Character.position.y + 10, Character.position.z + 10);
    
    if (hit_baloons.length != 0 && !stopAnimate) {
        setTimeout( function() {
            stopAnimate = true;
            }, 100);
        explode(hit_baloons[0].geometry);
        
    
    } else {
        let baloon = hit_baloons.pop();
        let line = hit_lines.pop();
        scene.remove(line);
        scene.remove(baloon);
        stopAnimate = false;
        
    }

    if (left_enemy === 0){
        sound_win.play();
        setTimeout( function() {
            document.getElementById('win3').style.display = 'grid';
            }, 1000);
        
    }
    
    updatePhysics( deltaTime );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        
        document.getElementById("Countdown3").innerHTML = 'Countdown: ' + formatTimeLeft(timeLeft);
        
    
        if (timeLeft === 0 && left_enemy > 0) {
            sound_loose.play();
            document.getElementById("game_over3").style.display = 'grid';
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
            break;
            
        case 83: //S: BACK
            moveDirection.back = 1
            break;
            
        case 65: //A: LEFT
            moveDirection.left = 1
            break;
            
        case 68: //D: RIGHT
            moveDirection.right = 1
            break;
            
        case 74: //J: LEFT
            rotate.left = 1;
            break;
            
        case 76: //L: RIGHT
            rotate.right = 1;
            break;

        case 75: //K: LEFT
            roll.down = 1;
            break;
            
        case 73: //I: RIGHT
            roll.up = 1;
            break;

        case 32: //: SPACE
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
            
        case 74: //←: LEFT
            rotate.left = 0
            break;
            
        case 76: //→: RIGHT
            rotate.right = 0
            break;

        case 75: //K: LEFT
            roll.down = 0
            break;
            
        case 73: //I: RIGHT
            roll.up = 0
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
    const e = Character.matrixWorld.elements;
    let dz =new THREE.Vector3();
    dz.set(e[4], e[5], e[6]);
    dz = dz.normalize();

    raycaster.set(Character.position, new THREE.Vector3(-dz.x, dz.y, -dz.z), 10, 50);
    const intersects = raycaster.intersectObjects(scene.children);
    for (let i = 0; i < intersects.length; i++) {
        
        if (intersects[i].object.type === "Points") {
                
                intersects[i].object.isHit = true;
                if (intersects[i].object.isHit){
                    hit_baloons.push(intersects[i].object);
                    const name = intersects[i].object.name;
                    const index = name.split('_')[1];
                    for (var j in scene.children){
                        const elem = scene.children[j];
                        if (elem.name && elem.name.split('_')[1] == index)
                            hit_lines.push(elem);
                    }
                    if (sound.isPlaying) {
                        sound.stop();
                    }
                    sound.play();
                }
                left_enemy--;
                document.getElementById('points3').innerHTML = 'Baloons left: '+ left_enemy;
                
            break;
        }
    }

}


function explode(sphere) {   
    var count = 0;
    id = Number((sphere.name).split('_')[1]);
    sphere.vertices.forEach(function (v) {
        v.x += (avgVertexNormals_tot[id][count].x * v.velocity * 0.5);
        v.y += (avgVertexNormals_tot[id][count].y * v.velocity * 0.5);
        v.z += (avgVertexNormals_tot[id][count].z * v.velocity * 0.5);
        count++;
          
    });

    sphere.verticesNeedUpdate = true;
}


function createPlane(texture){ //creates the plane
    
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 100, y: 2, z: 100};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    // //threeJS Section
    const material = new THREE.MeshPhongMaterial({color: 'grey'} );
    let blockPlane;
    blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), material);
    blockPlane.visible = false;
    

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
            texture.repeat.set( 1, 2);
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

    material_w = new THREE.MeshStandardMaterial({ color: "yellow", transparent: true, opacity: 0 });
    
    const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 20, 100),
        material_w
    );
    wall1.position.y = 0;
    wall1.position.x = 50;
    wall1.position.z = 0;
    wall1.castShadow = true;
    wall1.name = "wall";
    scene.add(wall1);

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

function createCilinder(){
    const radiusTop = 0.2, radiusBottom = 0.4, height = 5, radialSegments = 64, heightSegments = 1, openEnded = true;
    const characterGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
    const characterMaterial = new THREE.MeshPhongMaterial({ color: "white" });
    Character = new THREE.Mesh(characterGeometry, characterMaterial);
    Character.castShadow = true;
    Character.receiveShadow = true;
    Character.name = "player";

    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 1, y: 0, z: 0, w: 1 };
    let mass = 1;
    let scale = { x: 0.3, y: 0.3, z: 0.3 };

    Character.position.set(pos.x, pos.y, pos.z);
    Character.quaternion.set(quat.x, quat.y, quat.z);
    let colShape = new Ammo.btCylinderShape(radiusTop, radiusBottom, height);//new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)
    colShape.setMargin(0.05);

    const playerBody = createRigidBody(Character, colShape, mass, pos, quat);
    playerBody.setAngularFactor(0, 0, 0);

}

function createBaloon() {
    totalEnemies = NUM_ENEMY;
    for (let i = 0; i < totalEnemies; i++) {
        let radius = getRandomInt(1, 6);
        
        let pos = { x: getRandomInt(-50, 50), y: 0, z: getRandomInt(-50, 50) };

        let sphere = new THREE.IcosahedronGeometry(radius, 5);
        
        sphere.vertices.forEach(function (v) {
                v.velocity = Math.random();
            });
        sphere.name = 'Sphere_' + i;

        let geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        for(let j = 0; j < 20; j ++){
            if (j % 2 == 0)
                geometry.vertices.push(new THREE.Vector3(pos.x - 0.5, pos.y - j, pos.z));
            else    
                geometry.vertices.push(new THREE.Vector3(pos.x + 0.5, pos.y - j, pos.z));
        }
        
        material = new THREE.LineBasicMaterial( { color: createRandomColor(), linewidth: 3 , map: new THREE.TextureLoader().load("../immages/baloons_line.jpg")} );
        line = new THREE.Line(geometry, material);
        line.name = 'Line_' + i;
        scene.add(line);
        createParticleSystemFromGeometry(sphere, pos.x, pos.y, pos.z, i);        

    }

    document.getElementById('points3').innerHTML = 'Baloons left: '+ left_enemy;

}

function createParticleSystemFromGeometry(geom, x, y, z, index) {
    var psMat = new THREE.PointsMaterial({ size: 0.3, color: createRandomColor(), map: new THREE.TextureLoader().load("../immages/baloon.jpg") });
    psMat.transparent = false;
    psMat.shadowSide = THREE.DoubleSide;
    var ps = new THREE.Points(geom, psMat);
    ps.position.set(x, y, z);
    ps.sortParticles = true;
    ps.name = 'Baloon_' + index;
    scene.add(ps);

    let avgVertexNormals = [];
    let avgVertexCount = [];
    for (var i = 0; i < geom.vertices.length; i++) {
        avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
        avgVertexCount.push(0);
    }

    // first add all the normals
    geom.faces.forEach(function (f) {
        var vA = f.vertexNormals[0];
        var vB = f.vertexNormals[1];
        var vC = f.vertexNormals[2];

        // update the count
        avgVertexCount[f.a] += 1;
        avgVertexCount[f.b] += 1;
        avgVertexCount[f.c] += 1;

        // add the vector
        avgVertexNormals[f.a].add(vA);
        avgVertexNormals[f.b].add(vB);
        avgVertexNormals[f.c].add(vC);
    });


    // then calculate the average
    for (var i = 0; i < avgVertexNormals.length; i++) {
        avgVertexNormals[i].divideScalar(avgVertexCount[i]);
    }

    avgVertexNormals_tot.push(avgVertexNormals);

}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    result = Math.floor(Math.random() * (max - min) + min);
    return result
}

function createRandomColor() {

    return Math.floor( Math.random() * ( 1 << 24 ) );

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
        body.setActivationState( 4 );

    }

    physicsWorld.addRigidBody( body );

    return body;

}

function moveCilinder(){

    let scalingFactor = 20;
    const rotationSpeed = 3;

    let moveX =  moveDirection.right - moveDirection.left;
    let moveZ =  moveDirection.back - moveDirection.forward;
    let moveY =  moveDirection.up; 

    let Rotate = rotate.left - rotate.right;
    let Roll = roll.up - roll.down;
    
    let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
    resultantImpulse.op_mul(scalingFactor);

    let physicsBody;
        
    physicsBody = Character.userData.physicsBody;
    physicsBody.setAngularVelocity(0, 0, 0);
    const resultantImpulseRotation = new Ammo.btVector3(Roll, Rotate, 0); 
    resultantImpulseRotation.op_mul(rotationSpeed);
    physicsBody.setAngularVelocity(resultantImpulseRotation);
            
    physicsBody.setLinearVelocity( resultantImpulse );
    
   

}

function updatePhysics( deltaTime ){
    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

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