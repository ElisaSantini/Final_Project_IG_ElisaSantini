//import { PointerLockControls } from 'https://unpkg.com/three@0.133.0/examples//jsm/controls/PointerLockControls.js';







//variable declaration section
// const TIME_LIMIT = 5;
// let timePassed = 0;
// let timeLeft = TIME_LIMIT;
// let timerInterval = null;
// let GAME_STOP = true;
let NUM_ENEMY = 2, TOWELS = 4, dirty = [];
let left_enemy = NUM_ENEMY, left_towels = TOWELS;
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null, world, cloth1, cloth2, cloth3, cloth4;
let ballObject = null, moveDirection = { left: 0, right: 0, forward: 0, back: 0 , up : 0}, rotate = {left: 0, right: 0}, roll = {up : 0, down : 0};
let kObject = null, kMoveDirection = { left: 0, right: 0, forward: 0, back: 0 }, tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion();
let ammoTmpPos = null, ammoTmpQuat = null;
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
let textureLoader, ObjLoader; //, sphere
let transformAux1, avgVertexNormals_tot = [], positions = [];
let clothMesh1, clothMesh2, HitObjects = [], velocity, direction = new THREE.Vector3(), prevTime = performance.now();
const Nx = 15;
const Ny = 15;
const mass = 1;
const clothSize = 1;
const dist = 1; //clothSize / Nx
let clothGeometry1, clothGeometry2, clothGeometry3, clothGeometry4, particles;
let followCam = new THREE.Object3D();;
let running = false;
let run_game1 = false, run_game2 = false, run_game3 = false;
let Character = null;
var stopAnimate = false, baloons = [], hit_baloons = [];

//document.getElementById('instruction3').style.display = 'none';

const STATE = { DISABLE_DEACTIVATION : 4 }

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

//Ammojs Initialization
// Ammo().then(start)



// function start (){
//     // time = performance.now();
//     // prevTime = performance.now();
//     //run_game1 = true;
//     tmpTrans = new Ammo.btTransform();
//     ammoTmpPos = new Ammo.btVector3();
//     ammoTmpQuat = new Ammo.btQuaternion();
//     //console.log(run_game1, run_game2, run_game3);
//     // setupPhysicsWorld();
//     setupEventHandlers();
//     // setupGraphics();
//     // createPlane();
//     //console.log(run_game2);
//     if(run_game1){
//         document.getElementById('score1').style.display = 'grid';
//         document.getElementById('score2').style.display = 'none';
//         document.getElementById('score3').style.display = 'none';
//         camera_par = [100, window.innerWidth / window.innerHeight, 0.2, 5000];  
//         setupGraphics(0, 30, 70, camera_par, follow = '');
//         setupPhysicsWorld();
//         createPlane('./kids_floor.jpg');
//         createWall();
//         renderFrame();
//         //startTimer();
//         //console.log('start 1');
        
        
//     } else if (run_game2){

//         setupPhysicsWorld();
//         camera_par = [70, window.innerWidth / window.innerHeight, 0.1, 100];  
//         setupGraphics(0, 5, 10, camera_par, follow = ''); //ball
//         createPlane('./grass_prova.jpg');
//         createBall('./ball3.jpg');
//         createCloth();
//         //checkCollision();
//         // createCloth(30, 5, 30);
//         // createCloth(-30, 5, -10);
//         // createCloth(30, 5, -30);
//         //createCloth(-10, 5, 0);
//         renderFrame();
//         //startTimer();

//     } else if (run_game3){

//         camera_par = [70, window.innerWidth / window.innerHeight, 0.1, 100];  
//         setupGraphics(0, 5, 10, camera_par, follow = 'car');
//         setupPhysicsWorld();
//         createPlane('floor.avif');
//         createBaloon();
//         //createBall();
//         createCar();
//         renderFrame();
//         //startTimer();

//     }
    
//     // createBall();
//     // createKinematicBox();
//     // createCloth();
    

// }

// function setupPhysicsWorld(){

//    // let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
//     let collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
//         dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
//         overlappingPairCache    = new Ammo.btDbvtBroadphase(),
//         solver                  = new Ammo.btSequentialImpulseConstraintSolver();

//     // physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
//     // physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
    
// 	// 			const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
// 	// 			const broadphase = new Ammo.btDbvtBroadphase();
// 	// 			const solver = new Ammo.btSequentialImpulseConstraintSolver();
// 	const softBodySolver = new Ammo.btDefaultSoftBodySolver();
//     physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration, softBodySolver );
//     physicsWorld.setGravity( new Ammo.btVector3( 0, -9.8, 0 ) );
//     physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, -9.8, 0 ) );

//     transformAux1 = new Ammo.btTransform();

//     world = new CANNON.World({
//         gravity: new CANNON.Vec3(0, -9.81, 0)
//     });

// }

// function setupGraphics(camerax, cameray, cameraz, camera_par, follow){

//     //create clock for timing
//     clock = new THREE.Clock();
    

//     //create the scene
//     scene = new THREE.Scene();
//     const loader = new THREE.TextureLoader();
//     // if (GAME_STOP){
//     //     run_game1 = false;
//     //     run_game2 = false;
//     //     run_game3 = false;
//     //     //console.log('here');
//     // }
//     if(run_game1){
//         const texture = loader.load(
//         'toy_room.jpg',
//         () => {
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         texture.colorSpace = THREE.SRGBColorSpace;
//         scene.background = texture;
//         });
//     } else if (run_game2){
//         const texture = loader.load(
//             'sky.jpg',
//             () => {
//             texture.mapping = THREE.EquirectangularReflectionMapping;
//             texture.colorSpace = THREE.SRGBColorSpace;
//             scene.background = texture;
//             });

//     } else {
//         const texture = loader.load(
//             'party.jpg',
//             () => {
//             texture.mapping = THREE.EquirectangularReflectionMapping;
//             texture.colorSpace = THREE.SRGBColorSpace;
//             scene.background = texture;
//             });
//     }
    

//     //scene.background = new THREE.Color( 0xbfd1e5 );

//     //create camera
//     // camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
//     // camera.position.set( 0, 30, 20 );
//     // camera.lookAt(new THREE.Vector3(0, 0, 0));

//     camera = new THREE.PerspectiveCamera(camera_par[0], camera_par[1], camera_par[2], camera_par[3]);
//     camera.position.set(camerax, cameray, cameraz);
//     scene.add(camera);

//     // camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

//     // scene = new THREE.Scene();
//     // scene.background = new THREE.Color( 0xbfd1e5 );

//     //camera.position.set( - 12, 7, 4 );


//     if (follow == 'ball'){
//         followCam.position.copy(camera.position);
//         scene.add(followCam);
//         followCam.parent = ballObject;
//     } else if (follow == 'car'){
//         followCam.position.copy(camera.position);
//         scene.add(followCam);
//         followCam.parent = Character;
//     }
    

//     //Add hemisphere light
//     let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
//     hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
//     hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
//     hemiLight.position.set( 0, 50, 0 );
//     scene.add( hemiLight );

//     //Add directional light
//     let dirLight = new THREE.DirectionalLight( 0xffcc00 , 1);
//     dirLight.color.setHSL( 1,1,1 ); //0.1, 1, 0.95
//     if(run_game3){
//         dirLight.position.set( 0, 10, 0 ); //-1, 1.75, 1
//         dirLight.position.multiplyScalar( 100 );
//     } else {
//         dirLight.position.set( 1, 1, 1 ); //-1, 1.75, 1
//         dirLight.position.multiplyScalar( 100 );
//     }
    
    
//     scene.add( dirLight );

//     dirLight.castShadow = true;

//     dirLight.shadow.mapSize.width = 2048;
//     dirLight.shadow.mapSize.height = 2048;

//     let d = 50;

//     dirLight.shadow.camera.left = -d;
//     dirLight.shadow.camera.right = d;
//     dirLight.shadow.camera.top = d;
//     dirLight.shadow.camera.bottom = -d;

//     dirLight.shadow.camera.far = 13500;

//     textureLoader = new THREE.TextureLoader();

//     //Setup the renderer
//     renderer = new THREE.WebGLRenderer( { antialias: true } );
//     renderer.setClearColor( 0xbfd1e5 );
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setSize( window.innerWidth, window.innerHeight );
//     document.body.appendChild( renderer.domElement );

//     renderer.gammaInput = true;
//     renderer.gammaOutput = true;

//     renderer.shadowMap.enabled = true;
//     //if (run_game1 || run_game2){
//         const controls = new THREE.OrbitControls( camera, renderer.domElement );
//         //controls.target.set( 0, 1, 0 );
//         controls.update();
//         controls.enableDampling = true;
//         console.log('initialized');
//     //} else {
//         // controls = new PointerLockControls( camera, document.body );
//         // velocity = new THREE.Vector3();
//         // document.addEventListener('click', () => {
//         //     controls.lock();
//         //     console.log('qui');
//         // });
//         // controls.addEventListener( 'lock', function () {
//         //     console.log('Pointer locked')
//         //     // instructions.style.display = 'none';
//         //     // blocker.style.display = 'none';

//         // } );

//         // controls.addEventListener( 'unlock', function () {
//         //     console.log('Pointer unlocked')
//         //     // blocker.style.display = 'block';
//         //     // instructions.style.display = '';

//         // } );

//         //scene.add( controls.getObject() );

//     //}


// }

// function renderFrame(){
    
//     let deltaTime = clock.getDelta();
//     // let time = performance.now();
//     // let deltaTime = (time - prevTime) / 1000;
//     if (run_game2){
//         moveBall(); 
//         camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.085);
//         //camera.lookAt(ballObject.position.x, ballObject.position.y + .5, ballObject.position.z);
//         camera.position.set(ballObject.position.x, ballObject.position.y + 10, ballObject.position.z + 10);
//         //checkCollision();
//         if(left_towels == 0 ){
//             document.getElementById('game_over').style.display = 'grid';
//             run_game2 = false;
//         }
//     } else if (run_game3){
//         //console.log('game3');
//         //moveCar();
//         moveBall(); 
//         camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.085);
//         //camera.lookAt(ballObject.position.x, ballObject.position.y + .5, ballObject.position.z);
//         camera.position.set(Character.position.x, Character.position.y + 10, Character.position.z + 10);
//         // const time = performance.now();
//         // const delta = (time - prevTime) / 1000;        
//         // if (controls.isLocked == true){
//         //     // raycaster.ray.origin.copy( controls.getObject().position );
//         //     // //console.log(controls.getObject().position);
//         //     // //console.log(raycaster);
//         //     // //cacca
//         //     // raycaster.ray.origin.y -= 10;

//         //     // const intersections = raycaster.intersectObjects( scene.children, false );
            

//         //     // const onObject = intersections.length > 0;
//         //     //console.log(onObject);

//         //     //const delta = ( time - prevTime ) / 1000;
//         //     //console.log(delta);
//         //     velocity.x -= velocity.x * 10.0 * deltaTime;
//         //     velocity.z -= velocity.z * 10.0 * deltaTime;

//         //     velocity.y -= 9.8 * 100.0 * deltaTime; // 100.0 = mass
//         //     //console.log(moveDirection.forward - moveDirection.backward);
//         //     direction.z = moveDirection.forward - moveDirection.back;
//         //     //console.log(direction.z);
//         //     direction.x = moveDirection.right - moveDirection.left;
//         //     direction.normalize(); // this ensures consistent movements in all directions

//         //     if ( moveDirection.forward || moveDirection.back ){
//         //         //console.log('avanti');
//         //         velocity.z -= direction.z * 400.0 * deltaTime;

//         //         //console.log(direction.z);
//         //     } 
//         //     if ( moveDirection.left || moveDirection.right ){
//         //         //console.log('di lato');
//         //         velocity.x -= direction.x * 400.0 * deltaTime;
//         //         //console.log(velocity.x);
//         //     } 

//         //     // if ( onObject === true ) {

//         //     //     velocity.y = Math.max( 0, velocity.y );
//         //     //     canJump = true;

//         //     // }

//         //     controls.moveRight( - velocity.x * deltaTime );
//         //     controls.moveForward( - velocity.z * deltaTime );

//         //     //controls.getObject().position.y += ( velocity.y * deltaTime ); // new behavior

//         //     // if ( controls.getObject().position.y < 10 ) {

//         //     //     velocity.y = 0;
//         //     //     controls.getObject().position.y = 10;

//         //     //     canJump = true;

//         //     // }
//         // }
        
//         //prevtime = performance.now();
				
//         //camera.rotation.set(Character.rotation.x, Character.rotation.y, Character.rotation.z);
//         if (hit_baloons.length != 0 && !stopAnimate) {
//             //console.log(deltaTime);
//             setTimeout( function() {
//                 stopAnimate = true;
//               }, 100);
//             explode(hit_baloons[0].geometry);
        
//         } else {
//            let baloon = hit_baloons.pop()
//            scene.remove(baloon);
//            stopAnimate = false;
           
//         }

//         if (left_enemy === 0){
//             document.getElementById('game_over').style.display = 'grid';
//             run_game3 = false;
//         }
//         //prevTime = performance.now();
//         //explode();
//     }
    
//     //moveKinematic();
//     updatePhysics( deltaTime );
//     //explode();

//     renderer.render( scene, camera );

//     requestAnimationFrame( renderFrame );

// }

// // function startTimer() {
// //     timerInterval = setInterval(() => {
// //         timePassed = timePassed += 1;
// //         timeLeft = TIME_LIMIT - timePassed;
// //         if(run_game1){
// //             document.getElementById("Countdown1").innerHTML = 'Coundown: ' + formatTimeLeft(timeLeft);
// //         } else if (run_game2){
// //             document.getElementById("Countdown2").innerHTML = 'Coundown: ' + formatTimeLeft(timeLeft);
// //         } else if (run_game3){
// //             document.getElementById("Countdown3").innerHTML = 'Coundown: ' + formatTimeLeft(timeLeft);
// //         }
        
// //         // setCircleDasharray();
// //         // setRemainingPathColor(timeLeft);
    
// //         if (timeLeft === 0) {
// //             //GAME_STOP = true;
// //             // run_game1 = false;
// //             // run_game2 = false;
// //             // run_game3 = false;
// //             document.getElementById("game_over").style.display = 'grid';
// //             timePassed = 0;
// //             timeLeft = TIME_LIMIT;
            
// //             //start();
// //             // while(scene.children.length > 0){ 
// //             //     scene.remove(scene.children[0]); 
// //             // }
            
// //         }
// //     }, 1000);
// // }

// // function formatTimeLeft(time) {
// //     // The largest round integer less than or equal to the result of time divided being by 60.
// //     const minutes = Math.floor(time / 60);
    
// //     // Seconds are the remainder of the time divided by 60 (modulus operator)
// //     let seconds = time % 60;
    
// //     // If the value of seconds is less than 10, then display seconds with a leading zero
// //     if (seconds < 10) {
// //       seconds = `0${seconds}`;
// //     }
  
// //     // The output in MM:SS format
// //     return `${minutes}:${seconds}`;
// //   }


// function setupEventHandlers(){

//     window.addEventListener( 'keydown', handleKeyDown, false);
//     window.addEventListener( 'keyup', handleKeyUp, false);
//     window.addEventListener( 'mousedown', onMouseDown, false );
//     window.addEventListener( 'mousemove', onMouseMove, false);

// }

// function handleKeyDown(event){

//     let keyCode = event.keyCode;

//     switch(keyCode){

//         case 87: //W: FORWARD
//             moveDirection.forward = 1
//             break;
            
//         case 83: //S: BACK
//             moveDirection.back = 1
//             break;
            
//         case 65: //A: LEFT
//             moveDirection.left = 1
//             break;
            
//         case 68: //D: RIGHT
//             moveDirection.right = 1
//             break;

//         // case 73: //↑: FORWARD
//         //     kMoveDirection.forward = 1
//         //     break;
            
//         // case 75: //↓: BACK
//         //     kMoveDirection.back = 1
//         //     break;
            
//         case 74: //J: LEFT
//             rotate.left = 1;//0.1
//             break;
            
//         case 76: //L: RIGHT
//             rotate.right = 1;//0.1
//             break;

//         case 75: //K: LEFT
//             roll.down = 1;//0.1
//             break;
            
//         case 73: //I: RIGHT
//             roll.up = 1;//0.1
//             break;

//         case 32: //: SPACE
//             if (run_game3){
//                 checkCollision();
//             } else if (run_game2){
//                 moveDirection.up = 1;
//                 checkCollision();
//             }
//             break;
        
            
//     }
// }

// function handleKeyUp(event){
//     let keyCode = event.keyCode;

//     switch(keyCode){
//         case 87: //FORWARD
//             moveDirection.forward = 0
//             break;
            
//         case 83: //BACK
//             moveDirection.back = 0
//             break;
            
//         case 65: //LEFT
//             moveDirection.left = 0
//             break;
            
//         case 68: //RIGHT
//             moveDirection.right = 0
//             break;

//         // case 73: //↑: FORWARD
//         //     kMoveDirection.forward = 0
//         //     break;
            
//         // case 75: //↓: BACK
//         //     kMoveDirection.back = 0
//         //     break;
            
//         case 74: //←: LEFT
//             rotate.left = 0
//             break;
            
//         case 76: //→: RIGHT
//             rotate.right = 0
//             break;

//         case 75: //K: LEFT
//             roll.down = 0
//             break;
            
//         case 73: //I: RIGHT
//             roll.up = 0
//             break;

//         case 32: //: SPACE
//             if (run_game2){
//                 moveDirection.up = -1;
//             }
//             break;
//     }

// }

function onMouseDown ( event ) {

    // document.getElementById('start-button').onclick = () => {
    //     running = true;
    //     document.getElementById('intro-panel').style.display = 'none';
    //     alert("Instructions for Game 3: \n\n1. Do this.\n2. Do that.\n3. Win the game!");
    //     start();
    // };

    document.getElementById('game1-button').onclick = () => {
        //run_game1 = false;
        document.getElementById('intro-panel').style.display = 'none';
        document.getElementById('instruction1').style.display = 'grid';
        //start();
    };

    document.getElementById('game2-button').onclick = () => {
        //run_game2 = false;
        document.getElementById('intro-panel').style.display = 'none';
        document.getElementById('instruction2').style.display = 'grid';
        //start();
    };

    document.getElementById('game3-button').onclick = () => {
        //run_game3 = false;
        document.getElementById('intro-panel').style.display = 'none';
        document.getElementById('instruction3').style.display = 'grid';
        //start();
    };
    // document.getElementById('start1-button').onclick = () => {
    //     run_game1 = true;
    //     GAME_STOP = false;
    //     document.getElementById('intro-panel').style.display = 'none';
    //     document.getElementById('instruction1').style.display = 'none';
    //     document.getElementById('score1').style.display = 'grid';
    //     document.getElementById('score2').style.display = 'none';
    //     document.getElementById('score3').style.display = 'none';
    //     start();
    // };
    // document.getElementById('start2-button').onclick = () => {
    //     run_game2 = true;
    //     GAME_STOP = false;
    //     document.getElementById('intro-panel').style.display = 'none';
    //     document.getElementById('instruction2').style.display = 'none';
    //     document.getElementById('score2').style.display = 'grid';
    //     document.getElementById('score3').style.display = 'none';
    //     document.getElementById('score1').style.display = 'none';
    //     start();
    // };
    // document.getElementById('start3-button').onclick = () => {
    //     run_game3 = true;
    //     GAME_STOP = false;
    //     document.getElementById('intro-panel').style.display = 'none';
    //     document.getElementById('instruction3').style.display = 'none';
    //     document.getElementById('score2').style.display = 'none';
    //     document.getElementById('score3').style.display = 'grid';
    //     document.getElementById('score1').style.display = 'none';
    //     start();
    // };

    document.getElementById('Back1-button').onclick = () => {
        run_game1 = false;
        run_game2 = false;
        run_game3 = false;
        GAME_STOP = true;
        document.getElementById('intro-panel').style.display = 'grid';
        document.getElementById('instruction1').style.display = 'none';
        //start();
    };

    document.getElementById('Back2-button').onclick = () => {
        run_game1 = false;
        run_game2 = false;
        run_game3 = false;
        GAME_STOP = true;
        document.getElementById('intro-panel').style.display = 'grid';
        document.getElementById('instruction2').style.display = 'none';
        //start();
    };

    document.getElementById('Back3-button').onclick = () => {
        run_game1 = false;
        run_game2 = false;
        run_game3 = false;
        GAME_STOP = true;
        document.getElementById('intro-panel').style.display = 'grid';
        document.getElementById('instruction3').style.display = 'none';
        //start();
    };
//     document.getElementById('again1-button').onclick = () => {
//         run_game1 = true;
//         run_game2 = false;
//         run_game3 = false;
//         GAME_STOP = false;
//         document.getElementById('intro-panel').style.display = 'none';
//         document.getElementById('instruction1').style.display = 'none';
//         document.getElementById('score1').style.display = 'grid';
//         document.getElementById('score2').style.display = 'none';
//         document.getElementById('score3').style.display = 'none';
//         document.getElementById('game_over').style.display = 'none';
//         start();
//     };

//     document.getElementById('back-again-button').onclick = () => {
//         run_game1 = false;
//         run_game2 = false;
//         run_game3 = false;
//         GAME_STOP = false;
//         document.getElementById('intro-panel').style.display = 'grid';
//         document.getElementById('instruction1').style.display = 'none';
//         document.getElementById('score1').style.display = 'none';
//         document.getElementById('score2').style.display = 'none';
//         document.getElementById('score3').style.display = 'none';
//         document.getElementById('game_over').style.display = 'none';
//         //start();
//     };

//     mouseCoords.set(
//         ( event.clientX / window.innerWidth ) * 2 - 1,
//         - ( event.clientY / window.innerHeight ) * 2 + 1
//     );

    

//     // Creates a ball and throws it
//     if (run_game1){
//         raycaster.setFromCamera( mouseCoords, camera );
//         tmpPos.copy( raycaster.ray.direction );
//         tmpPos.add( raycaster.ray.origin );


//         let pos = {x: tmpPos.x, y: tmpPos.y, z: tmpPos.z};
//         let radius = 1;
//         let quat = {x: 0, y: 0, z: 0, w: 1};
//         let mass = 10;

//         //threeJS Section
//         let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: createRandomColor()}));

//         ball.position.set(pos.x, pos.y, pos.z);

//         ball.castShadow = true;
//         ball.receiveShadow = true;

//         scene.add(ball);


//         //Ammojs Section
//         let transform = new Ammo.btTransform();
//         transform.setIdentity();
//         transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
//         transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
//         let motionState = new Ammo.btDefaultMotionState( transform );

//         let colShape = new Ammo.btSphereShape( radius );
//         colShape.setMargin( 0.05 );

//         let localInertia = new Ammo.btVector3( 0, 0, 0 );
//         colShape.calculateLocalInertia( mass, localInertia );

//         let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
//         let body = new Ammo.btRigidBody( rbInfo );

//         physicsWorld.addRigidBody( body );

//         tmpPos.copy( raycaster.ray.direction );
//         tmpPos.multiplyScalar( 100 );

//         body.setLinearVelocity( new Ammo.btVector3( tmpPos.x, tmpPos.y, tmpPos.z ) );

//         ball.userData.physicsBody = body;
//         rigidBodies.push(ball);
//     } 
    

// }

// function onMouseMove(event){
//     const width = window.innerWidth;
//     const height = window.innerHeight;

//     mouseCoords.x = (event.clientX / width * 2 - 1);
//     mouseCoords.y = -(event.clientY / height) * 2 + 1;
    //console.log(mouseCoords);
}

function checkCollision(){

    // if (GAME_STATUS != GAME_STATE.PLAYING) {
    //     return;
    // }
    if(run_game3){
        const dir = new THREE.Vector3();
        const e = Character.matrixWorld.elements;
        //console.log(e);
        let dx =new THREE.Vector3();
        let dy =new THREE.Vector3();
        let dz =new THREE.Vector3();
        dx.set(e[0], e[1], e[2])
        //console.log(dx);
        dx = dx.normalize()
        dy.set(e[8], e[9], e[10])
        //dy = dy.normalize()
        dz.set(e[4], e[5], e[6])
        dz = dz.normalize()
        // 
        //console.log(dx, dy, dz);
        //const up = new THREE.Vector3();
        //up.copy( Character.up ).applyMatrix4( Character.matrixWorld ).normalize();
        //console.log((Character.up).applyMatrix4( Character.matrixWorld ));
        // console.log(up);
        // const forward = new THREE.Vector3();
        // forward = (Character.forward).applyMatrix4( Character.matrixWorld ).normalize();
        // console.log(forward);
        // const right = new THREE.Vector3();
        // right.crossVectors( forward, up ).normalize();
        // console.log(forward);

    //     Character.getWorldDirection(dir);
    //     const rot_mat = [[1, 0, 0],
    //     [0, 0, -1],
    //     [0, 1, 0],
    //   ];    
    //     let dir_rot = math.multiply(rot_mat, [dir.x, dir.y, dir.z]);
    //     console.log(dir_rot);

        raycaster.set(Character.position, new THREE.Vector3(-dz.x, dz.y, -dz.z), 10, 50);

        //console.log(raycaster);
        const intersects = raycaster.intersectObjects(scene.children);
        //console.log(intersects);

        // if (sound_lazer.isPlaying) {
        //     sound_lazer.stop();
        // }

        //GUN_STATUS = GUN_STATE.FIRING;
        //sound_lazer.play();

        for (let i = 0; i < intersects.length; i++) {
            
            if (intersects[i].object.type === "Points") {
                //console.log(intersects[i].object.position)
                //console.log('enemy');

                //if (GAME_STATUS == GAME_STATE.PLAYING) {
                    
                    //explode();
                    
                    
                    intersects[i].object.isHit = true;
                    if (intersects[i].object.isHit){
                        hit_baloons.push(intersects[i].object);
                        //hit_spheres.push()
                    }
                    left_enemy--;
                    document.getElementById('points3').innerHTML = 'Baloons left: '+ left_enemy;
                    // const physicsBody = intersects[i].object.userData.physicsBody;
                    // physicsBody.applyForce(new Ammo.btVector3(0, 500, 0))

                    // if (!intersects[i].object.isHit) {
                    //     intersects[i].object.material.color.setHex(0xff0000);
                    //     //BALLS_COUNTER -= 1;
                    //     intersects[i].object.isHit = true;
                    //     //intersects[i].object.hitSound.play();
                    // }
                    // else {
                    //     intersects[i].object.material.color.setHex(colorArray[Math.floor(Math.random() * colorArray.length)]);
                    //     //BALLS_COUNTER += 1;
                    //     intersects[i].object.isHit = false;
                    //     //intersects[i].object.errorSound.play();
                    // }
                    //remainingBalls.innerHTML = BALLS_COUNTER
                //}

                // if (BALLS_COUNTER === 0) {
                //     //GAME_STATUS = GAME_STATE.GAME_OVER;
                //     //sound_gameover.play();
                // }

                break;
            }
        }
    } else if (run_game2){
        //console.log(ballObject);
        const dir = new THREE.Vector3();
        const e = ballObject.matrixWorld.elements;
        //console.log(e);
        let dx =new THREE.Vector3();
        let dy =new THREE.Vector3();
        let dz =new THREE.Vector3();
        dx.set(e[0], e[1], e[2]);
        
        //dx = dx.normalize();
        //console.log(dx);
        dz.set(e[8], e[9], e[10]);
        
        dz = dz.normalize();
        //console.log(dz);
        dy.set(e[4], e[5], e[6]);
        dy = dy.normalize();

        const up = new THREE.Vector3();
        up.copy( ballObject.up ).applyMatrix4( ballObject.matrixWorld ).normalize();
        //console.log(dy);
        //let directionVector = [dx, dz, -dx, -dz, dy];
        //console.log(directionVector.length)
        // for (var rays = 0; rays < directionVector.length; rays++)
        //     {       
                var ray = new THREE.Raycaster( ballObject.position, new THREE.Vector3(0, 1, 0) );
                //console.log(ray);
                var collisionResults = ray.intersectObjects( scene.children );
                //console.log(collisionResults);
                for (let i = 0; i < collisionResults.length; i++){
                    //console.log((collisionResults[i].object.name).split('_'));
                    if ( (collisionResults[i].object.name).split('_') != [] && (collisionResults[i].object.name).split('_')[0] == 'cloth' ) 
                        {
                            console.log('update');
                            updateTexture(collisionResults[i].object);
                            
                        }
                }
                
           // }
    }

}


function explode(sphere) {
    
    // for(let scale = 0; scale < 11; scale ++){
    var count = 0;
    //var stop = false;
    id = Number((sphere.name).split('_')[1]);
    sphere.vertices.forEach(function (v) {
        v.x += (avgVertexNormals_tot[id][count].x * v.velocity * 0.5);
        v.y += (avgVertexNormals_tot[id][count].y * v.velocity * 0.5);
        v.z += (avgVertexNormals_tot[id][count].z * v.velocity * 0.5);
        count++;
        // if (Math.abs(v.x) > 1000){
        //     stop = true;
        //     return stop;
        // }
            
    });
   // }
    
    sphere.verticesNeedUpdate = true;
    //return stop;
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
    if (run_game1){
        blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 2), material);
    } else if (run_game2 || run_game3){
        blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), material);
        if (run_game3) blockPlane.visible = false;
    }
    

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
            if (run_game3){
                texture.repeat.set( 1, 2);
            } else if (run_game2){
                texture.repeat.set( 5, 5);
            }
            // texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
            blockPlane.material.map = texture;
            blockPlane.material.needsUpdate = true;
    
        } );
    }

    // const pos = new THREE.Vector3();
    // const quat = new THREE.Quaternion();

    // // Ground
    // pos.set( 0, - 0.5, 0 );
    // quat.set( 0, 0, 0, 1 );
    // const ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    // ground.castShadow = true;
    // ground.receiveShadow = true;
    // textureLoader.load( 'textures/grid.png', function ( texture ) {

    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.repeat.set( 40, 40 );
    //     ground.material.map = texture;
    //     ground.material.needsUpdate = true;

	// } );

    


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );
    let colShape;
    if(run_game1){
        colShape = new Ammo.btBoxShape( new Ammo.btVector3(2* scale.x * 0.5, 2* scale.y * 0.5, 2* scale.z * 0.5 ) );
    } else {
        colShape = new Ammo.btBoxShape( new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    }
    //let colShape = new Ammo.btBoxShape( new Ammo.btVector3(2* scale.x * 0.5, 2* scale.y * 0.5, 2* scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(2);

    physicsWorld.addRigidBody( body );

    if (run_game2 || run_game3){ //getRandomInt(-70, 70)
        let material_w = new THREE.MeshStandardMaterial({ color: "yellow" });
        if (run_game3){
            material_w = new THREE.MeshStandardMaterial({ color: "yellow", transparent: true, opacity: 0 });
        }
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

        if (run_game2){
            textureLoader.load( 'staccionata.jpg', function ( texture ) {
    
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 10, 2 );
                wall1.material.map = texture;
                wall1.material.needsUpdate = true;
        
            } );
        }
    
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
    
        
        // body_w1.setFriction(4);
        // body_w1.setRollingFriction(10);
    
        physicsWorld.addRigidBody( body_w1 );
    
        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 20, 100), //30.5
            material_w
        );
        wall2.position.y = 0;
        wall2.position.x = -50;
        wall2.position.z = 0;
        wall2.castShadow = true;
        wall2.name = "wall";
        scene.add(wall2);

        if (run_game2){
            textureLoader.load( 'staccionata.jpg', function ( texture ) {
    
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 10, 2 );
                wall2.material.map = texture;
                wall2.material.needsUpdate = true;
        
            } );
        }
    
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
            new THREE.BoxGeometry(100, 20, 0.5), //30.5
            material_w
        );
        wall3.position.y = 0;
        wall3.position.x = 0;
        wall3.position.z = -50;
        wall3.castShadow = true;
        wall3.name = "wall";
        scene.add(wall3);

        if (run_game2){
            textureLoader.load( 'staccionata.jpg', function ( texture ) {
    
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 10, 2 );
                wall3.material.map = texture;
                wall3.material.needsUpdate = true;
        
            } );
        }
    
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
            new THREE.BoxGeometry(100, 20, 0.5), //30.5
            material_w
        );
        wall4.position.y = 0;
        wall4.position.x = 0;
        wall4.position.z = 50;
        wall4.castShadow = true;
        wall4.name = "wall";
    
        // wall4.castShadow = true;
        // wall4.receiveShadow = true;
    
        scene.add(wall4);
        if (run_game2){
            textureLoader.load( 'staccionata.jpg', function ( texture ) {
    
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 10, 2 );
                wall4.material.map = texture;
                wall4.material.needsUpdate = true;
        
            } );
        }
    
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
    
        
        // body_w4.setFriction(4);
        // body_w4.setRollingFriction(10);
    
        body_w4.setActivationState( STATE.DISABLE_DEACTIVATION );
        body_w4.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );
    
        physicsWorld.addRigidBody( body_w4 );
        wall4.userData.physicsBody = body_w4;
        //rigidBodies.push(wall4);

    }
    // const wall1 = new THREE.Mesh(
    //     new THREE.BoxGeometry(0.5, 20, 100), //30.5
    //     new THREE.MeshStandardMaterial({ color: "red" })
    // );
    // wall1.position.y = 0;
    // wall1.position.x = 100;
    // wall1.position.z = 0;
    // wall1.castShadow = true;
    // wall1.name = "wall";
    // scene.add(wall1);

    // let wall1Shape = new Ammo.btBoxShape(new Ammo.btVector3( 0.25, 10, 50 ));
    // wall1Shape.setMargin(0.05);

    // var transform_w1 = new Ammo.btTransform();
    // transform_w1.setIdentity();
    // transform_w1.setOrigin(new Ammo.btVector3(wall1.position.x, wall1.position.y, wall1.position.z));
    // transform_w1.setRotation(new Ammo.btQuaternion(wall1.quaternion.x, wall1.quaternion.y, wall1.quaternion.z, wall1.quaternion.w));

    // let localInertia_w1 = new Ammo.btVector3( 0, 0, 0 );
    // wall1Shape.calculateLocalInertia( mass, localInertia_w1 );

    // var motionState_w1 = new Ammo.btDefaultMotionState(transform_w1);
    // let w1_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w1, wall1Shape, localInertia_w1 );
    // let body_w1 = new Ammo.btRigidBody( w1_info );

    
    // // body_w1.setFriction(4);
    // // body_w1.setRollingFriction(10);

    // physicsWorld.addRigidBody( body_w1 );

    // const wall2 = new THREE.Mesh(
    //     new THREE.BoxGeometry(0.5, 20, 100), //30.5
    //     new THREE.MeshStandardMaterial({ color: "red" })
    // );
    // wall2.position.y = 0;
    // wall2.position.x = -50;
    // wall2.position.z = 0;
    // wall2.castShadow = true;
    // wall2.name = "wall";
    // scene.add(wall2);

    // let wall2Shape = new Ammo.btBoxShape(new Ammo.btVector3( 0.25, 10, 50));
    // wall2Shape.setMargin(0.05);

    // var transform_w2 = new Ammo.btTransform();
    // transform_w2.setIdentity();
    // transform_w2.setOrigin(new Ammo.btVector3(wall2.position.x, wall2.position.y, wall2.position.z));
    // transform_w2.setRotation(new Ammo.btQuaternion(wall2.quaternion.x, wall2.quaternion.y, wall2.quaternion.z, wall2.quaternion.w));

    // let localInertia_w2 = new Ammo.btVector3( 0, 0, 0 );
    // wall2Shape.calculateLocalInertia( mass, localInertia_w2 );

    // var motionState_w2 = new Ammo.btDefaultMotionState(transform_w2);
    // let w2_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w2, wall2Shape, localInertia_w2 );
    // let body_w2 = new Ammo.btRigidBody( w2_info );

    
    // body_w2.setFriction(4);
    // body_w2.setRollingFriction(10);

    // physicsWorld.addRigidBody( body_w2 );

    // const wall3 = new THREE.Mesh(
    //     new THREE.BoxGeometry(100, 20, 0.5), //30.5
    //     new THREE.MeshStandardMaterial({ color: "red" })
    // );
    // wall3.position.y = 0;
    // wall3.position.x = 0;
    // wall3.position.z = -50;
    // wall3.castShadow = true;
    // wall3.name = "wall";
    // scene.add(wall3);

    // let wall3Shape = new Ammo.btBoxShape(new Ammo.btVector3( 50, 10, 0.25 ));
    // wall3Shape.setMargin(0.05);

    // var transform_w3 = new Ammo.btTransform();
    // transform_w3.setIdentity();
    // transform_w3.setOrigin(new Ammo.btVector3(wall3.position.x, wall3.position.y, wall3.position.z));
    // transform_w3.setRotation(new Ammo.btQuaternion(wall3.quaternion.x, wall3.quaternion.y, wall3.quaternion.z, wall3.quaternion.w));

    // let localInertia_w3 = new Ammo.btVector3( 0, 0, 0 );
    // wall3Shape.calculateLocalInertia( mass, localInertia_w3 );

    // var motionState_w3 = new Ammo.btDefaultMotionState(transform_w3);
    // let w3_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w3, wall3Shape, localInertia_w3 );
    // let body_w3 = new Ammo.btRigidBody( w3_info );

    
    // body_w3.setFriction(4);
    // body_w3.setRollingFriction(10);

    // physicsWorld.addRigidBody( body_w3 );
    

    // let wall4 = new THREE.Mesh(
    //     new THREE.BoxGeometry(100, 20, 0.5), //30.5
    //     new THREE.MeshStandardMaterial({ color: "red" })
    // );
    // wall4.position.y = 0;
    // wall4.position.x = 0;
    // wall4.position.z = 50;
    // wall4.castShadow = true;
    // wall4.name = "wall";

    // // wall4.castShadow = true;
    // // wall4.receiveShadow = true;

    // scene.add(wall4);

    // let wall4Shape = new Ammo.btBoxShape(new Ammo.btVector3( 50, 10, 0.25 ));
    // wall4Shape.setMargin(0.05);

    // var transform_w4 = new Ammo.btTransform();
    // transform_w4.setIdentity();
    // transform_w4.setOrigin(new Ammo.btVector3(wall4.position.x, wall4.position.y, wall4.position.z));
    // transform_w4.setRotation(new Ammo.btQuaternion(wall4.quaternion.x, wall4.quaternion.y, wall4.quaternion.z, wall4.quaternion.w));

    // let localInertia_w4 = new Ammo.btVector3( 0, 0, 0 );
    // wall4Shape.calculateLocalInertia( mass, localInertia_w4 );

    // var motionState_w4 = new Ammo.btDefaultMotionState(transform_w4);
    // let w4_info = new Ammo.btRigidBodyConstructionInfo( mass, motionState_w4, wall4Shape, localInertia_w4 );
    // let body_w4 = new Ammo.btRigidBody( w4_info );

    
    // // body_w4.setFriction(4);
    // // body_w4.setRollingFriction(10);

    // body_w4.setActivationState( STATE.DISABLE_DEACTIVATION );
    // body_w4.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );

    // physicsWorld.addRigidBody( body_w4 );
    // wall4.userData.physicsBody = body_w4;
    // //rigidBodies.push(wall4);

}

function createBall(texture){
    
    let pos = {x: 0, y: 2, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 100;

    
    
    //threeJS Section
    const material = new THREE.MeshPhongMaterial({color: 'red'}); //new THREE.IcosahedronGeometry( 15, 8 )
    let ball = ballObject = new THREE.Mesh(new THREE.IcosahedronGeometry( radius, 5 )); //new THREE.SphereBufferGeometry(radius), material)           new THREE.MeshPhongMaterial({color: 0xff0505})

    ball.position.set(pos.x, pos.y, pos.z);
    ball.name = "ball";
    
    ball.castShadow = true;
    ball.receiveShadow = true;
    if (texture){
        textureLoader.load( texture, function ( texture ) {

            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            //texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
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

function createCar(){
    // const characterGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    // const characterMaterial = new THREE.MeshPhongMaterial({ color: "blue" });
    // Character = new THREE.Mesh(characterGeometry, characterMaterial);
    // Character.castShadow = true;
    // Character.receiveShadow = true;
    // Character.name = "player";
    // //Character.position.set(1, 1, 1);

    // const gunGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.2);
    // const gunMaterial = new THREE.MeshPhongMaterial({ color: "gold" });
    // const gun = new THREE.Mesh(gunGeometry, gunMaterial);
    // gun.castShadow = true;
    // gun.receiveShadow = true;
    // gun.position.set(0, 0, -0.2);
    // ObjLoader = new THREE.GLTFLoader();
    // const Cannon = ObjLoader.load(
    //     './party_cannon/scene.gltf',
    //     function ( gltf ) {

    //         scene.add( gltf.scene );
    
    //         gltf.animations; // Array<THREE.AnimationClip>
    //         gltf.scene; // THREE.Group
    //         gltf.scenes; // Array<THREE.Group>
    //         gltf.cameras; // Array<THREE.Camera>
    //         gltf.asset; // Object
    
    //     },
    
    // );

    // Cannon.scale.set(1.15, 1.15, 1.15);
    // Cannon.position.y = 2;
    // Cannon.rotation.y = Math.PI/2;
    // scene.add(Cannon);


    const radiusTop = 0.2, radiusBottom = 0.4, height = 5, radialSegments = 64, heightSegments = 1, openEnded = true;
    const characterGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
    const characterMaterial = new THREE.MeshPhongMaterial({ color: "white" });
    Character = new THREE.Mesh(characterGeometry, characterMaterial);
    Character.castShadow = true;
    Character.receiveShadow = true;
    Character.name = "player";
    //Character.position.set(1, 1, 1);

    //Character.add(gun);

    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 1, y: 0, z: 0, w: 1 };
    let mass = 1;
    let scale = { x: 0.3, y: 0.3, z: 0.3 };

    Character.position.set(pos.x, pos.y, pos.z);
    Character.quaternion.set(quat.x, quat.y, quat.z);
    //scene.add(Character);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    const playerBody = createRigidBody(Character, colShape, mass, pos, quat);
    playerBody.setAngularFactor(0, 0, 0);
}

function createBaloon() {
    // const totalEnemies = 25
    // for (let i = 0; i < totalEnemies; i++) {
    //     let pos = { x: getRandomInt(-50, 50), y: 0, z: getRandomInt(-50, 50) };
    //     let radius = getRandomInt(3, 5);
    //     let quat = { x: 0, y: 0, z: 0, w: 1 };
    //     let mass = 1;

    //     let baloon = new THREE.Mesh(new THREE.IcosahedronGeometry( radius, 5 ), new THREE.MeshPhongMaterial({ color: createRandomColor() }));

    //     baloon.position.set(pos.x, pos.y, pos.z);
    //     baloon.name = "enemy"
    //     baloon.castShadow = true;
    //     baloon.receiveShadow = true;
    //     baloon.isHit = false;
    //     // ball.hitSound = sound_hit;
    //     // ball.errorSound = sound_error;

    //     // if (baloon.position.z < 0 && baloon.position.x > 0){
    //     //     console.log(baloon.position);
    //     // }

    //     let colShape = new Ammo.btSphereShape(radius);
    //     colShape.setMargin(0.05);

    //     createRigidBody(baloon, colShape, mass, pos, quat);
        

    //}

    // remainingBalls.innerHTML = totalEnemies;
    // BALLS_COUNTER = totalEnemies;

    totalEnemies = NUM_ENEMY;
    for (let i = 0; i < totalEnemies; i++) {
        let radius = getRandomInt(1, 6);
        let y_p;
        
        let pos = { x: getRandomInt(-50, 50), y: 0, z: getRandomInt(-50, 50) };
        
        
        // let quat = { x: 0, y: 0, z: 0, w: 1 };
        // let mass = 1;

        // let baloon = new THREE.Mesh(new THREE.IcosahedronGeometry( radius, 5 ), new THREE.MeshPhongMaterial({ color: createRandomColor() }));

        // baloon.position.set(pos.x, pos.y, pos.z);
        // baloon.name = "enemy"
        // baloon.castShadow = true;
        // baloon.receiveShadow = true;
        // baloon.isHit = false;
        // // ball.hitSound = sound_hit;
        // // ball.errorSound = sound_error;

        // // if (baloon.position.z < 0 && baloon.position.x > 0){
        // //     console.log(baloon.position);
        // // }

        // let colShape = new Ammo.btSphereShape(radius);
        // colShape.setMargin(0.05);

        // createRigidBody(baloon, colShape, mass, pos, quat);

        let sphere = new THREE.IcosahedronGeometry(radius, 5);
        // let baloon = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({ color: createRandomColor() }));

        // baloon.position.set(10, 10, 10);
        // baloon.name = "enemy"
        // baloon.castShadow = true;
        // baloon.receiveShadow = true;
        // baloon.isHit = false;
        //sphere.position.set(-5, 0, 5);
        sphere.vertices.forEach(function (v) {
                v.velocity = Math.random();
            });
        sphere.name = 'id_' + i;
        createParticleSystemFromGeometry(sphere, pos.x, pos.y, pos.z);
        

    }

    document.getElementById('points3').innerHTML = 'Baloons left: '+ left_enemy;
    // BALLS_COUNTER = totalEnemies;
    // let pos = { x: getRandomInt(-50, 50), y: 5, z: getRandomInt(-50, 50) };
    // let radius = getRandomInt(3, 5);
    // sphere = new THREE.IcosahedronGeometry(radius, 5);
    // // let baloon = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({ color: createRandomColor() }));

    // // baloon.position.set(10, 10, 10);
    // // baloon.name = "enemy"
    // // baloon.castShadow = true;
    // // baloon.receiveShadow = true;
    // // baloon.isHit = false;
    // //sphere.position.set(-5, 0, 5);
    // sphere.vertices.forEach(function (v) {
    //         v.velocity = Math.random();
    //     });
    // createParticleSystemFromGeometry(sphere, pos.x, pos.y, pos.z);

}

function createParticleSystemFromGeometry(geom, x, y, z) {
    var psMat = new THREE.PointsMaterial({ size: 0.3, color: createRandomColor() });
    //psMat.map = THREE.ImageUtils.loadTexture("grass.jpg");
    //psMat.blending = THREE.SubtractiveBlending;
    psMat.transparent = false;
    //psMat.opacity = 1;
    psMat.shadowSide = THREE.DoubleSide;
    var ps = new THREE.Points(geom, psMat);
    //console.log(ps.geometry);
    ps.position.set(x, y, z);
    ps.sortParticles = true;
    //baloons.push(geom);
    scene.add(ps);

    //console.log(sphere.vertices.length);
    // for (var i = 0; i < sphere.vertices.length; i++) {
    //     avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
    //     avgVertexCount.push(0);
    // }
    // //console.log(avgVertexNormals.size);

    // // first add all the normals
    // sphere.faces.forEach(function (f) {
    //     var vA = f.vertexNormals[0];
    //     var vB = f.vertexNormals[1];
    //     var vC = f.vertexNormals[2];

    //     // update the count
    //     avgVertexCount[f.a] += 1;
    //     avgVertexCount[f.b] += 1;
    //     avgVertexCount[f.c] += 1;
    //     //console.log(f.a);
    //     // add the vector
    //     avgVertexNormals[f.a].add(vA);
    //     avgVertexNormals[f.b].add(vB);
    //     avgVertexNormals[f.c].add(vC);
    // });


    // // then calculate the average
    // for (var i = 0; i < avgVertexNormals.length; i++) {
    //     avgVertexNormals[i].divideScalar(avgVertexCount[i]);
    // }

    let avgVertexNormals = [];
    let avgVertexCount = [];
    for (var i = 0; i < geom.vertices.length; i++) {
        avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
        avgVertexCount.push(0);
    }
    //console.log(avgVertexNormals.size);

    // first add all the normals
    geom.faces.forEach(function (f) {
        var vA = f.vertexNormals[0];
        var vB = f.vertexNormals[1];
        var vC = f.vertexNormals[2];

        // update the count
        avgVertexCount[f.a] += 1;
        avgVertexCount[f.b] += 1;
        avgVertexCount[f.c] += 1;
        //console.log(f.a);
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

function createKinematicBox(){//scatola
    
    let pos = {x: 40, y: 6, z: 5};
    let scale = {x: 10, y: 10, z: 10};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    kObject = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x30ab78}));

    kObject.position.set(pos.x, pos.y, pos.z);
    kObject.scale.set(scale.x, scale.y, scale.z);

    kObject.castShadow = true;
    kObject.receiveShadow = true;

    scene.add(kObject);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(20);
    
    body.setActivationState( STATE.DISABLE_DEACTIVATION );
    body.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );


    physicsWorld.addRigidBody( body );
    kObject.userData.physicsBody = body;

}

function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {

    const threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( 0.05 );

    createRigidBody( threeObject, shape, mass, pos, quat );

    return threeObject;

}

function createMaterial() {

    return new THREE.MeshPhongMaterial( { color: createRandomColor() } );

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

    // body.setFriction(4);
    // body.setRollingFriction(2);

    threeObject.userData.physicsBody = body;

    scene.add( threeObject );

    if ( mass > 0) { // || threeObject.name == 'player

        rigidBodies.push( threeObject );
        // console.log('qui');
        // Disable deactivation
        body.setActivationState( 4 );

    }

    physicsWorld.addRigidBody( body );

    return body;

}

function createWall(){
    // const brickMass = 0.5;
    // const brickLength = 1.2;
    // const brickDepth = 0.6;
    // const brickHeight = brickLength * 0.5;
    // const numBricksLength = 6;
    // const numBricksHeight = 8;
    // let z0 = - numBricksLength * brickLength * 0.5;
    // const pos = new THREE.Vector3();
	// const quat = new THREE.Quaternion();
    // pos.set( 0, brickHeight, z0 );
    // quat.set( 0, 0, 0, 1 );
    const brickMass = 0.5;
    const brickLength = 10;
    const brickDepth = 5;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = 6;
    const numBricksHeight = 8;
    let z0 = - numBricksLength * brickLength * 0.5;
    const pos = new THREE.Vector3();
	const quat = new THREE.Quaternion();
    // let pos = {x: 0, y: 0, z: 0};
    // let scale = {x: 100, y: 2, z: 100};
    // let quat = {x: 0, y: 0, z: 0, w: 1};
    pos.set( z0, brickHeight * 0.5, 0 ); //pos.set( 0, brickHeight * 0.5, z0 );
    quat.set( 0, 0, 0, 1 );
    //WALL1
    for ( let j = 0; j < numBricksHeight; j ++ ) {

        const oddRow = ( j % 2 ) == 1;

        pos.z = z0; //pos.x = z0;

        if ( oddRow ) {

            pos.z -= 0.25 * brickLength; //pos.x -= 0.25 * brickLength;

        }
        

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for ( let i = 0; i < nRow; i ++ ) {

            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            let brickHeightCurrent = brickHeight;
            

            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {

                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;

            }

            if (j == numBricksHeight -1 && (i % 2 != 0)){
                brickHeightCurrent += brickHeight;
            }
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial() );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.z += 0.75 * brickLength; //pos.x += 0.75 * brickLength;

            } else {

                pos.z += brickLength; //pos.x += brickLength;

            }

        }

        pos.y += brickHeight;

    }

    //WALL2
    //z0 = numBricksLength * brickLength * 0.5;
    pos.set( numBricksLength * brickLength * 0.5, brickHeight, z0);
    quat.set( 0, 0, 0, 1 );
    for ( let j = 0; j < numBricksHeight; j ++ ) {

        const oddRow = ( j % 2 ) == 1;

        pos.z = z0; //pos.x = z0;

        if ( oddRow ) {

            pos.z -= 0.25 * brickLength; //pos.x -= 0.25 * brickLength;

        }

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for ( let i = 0; i < nRow; i ++ ) {

            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            let brickHeightCurrent = brickHeight;
            

            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {

                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;

            }

            if (j == numBricksHeight -1 && (i % 2 != 0)){
                brickHeightCurrent += brickHeight;
            }
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial() );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.z += 0.75 * brickLength; //pos.x += 0.75 * brickLength;

            } else {

                pos.z += brickLength; //pos.x += brickLength;

            }

        }

        pos.y += brickHeight;

    }

    // //WALL3
    //z0 =  numBricksLength * brickLength * 0.5 - 0.3;
    //let x0 = 0.5; //numBricksLength * brickLength * 0;
    //pos.set( 0.5, brickHeight, z0);
    z0 = z0 - numBricksLength * brickLength * 0.1 ;
    let x0 = - numBricksLength * brickLength * 0.4 ;
    pos.set( x0, brickHeight, z0);
    quat.set( 0, 1, 0, 1 );
    for ( let j = 0; j < numBricksHeight; j ++ ) { //numBricksHeight

        const oddRow = ( j % 2 ) == 1;

        pos.x = x0; //pos.x = z0;

        if ( oddRow ) {

            pos.x -= 0.25 * brickLength; //pos.x -= 0.25 * brickLength;

        }

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for ( let i = 0; i < nRow; i ++ ) {

            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            let brickHeightCurrent = brickHeight;
            

            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {

                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;

            }

            if (j == numBricksHeight -1 && (i % 2 != 0)){
                brickHeightCurrent += brickHeight;
            }
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial() );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.x += 0.75 * brickLength; //pos.x += 0.75 * brickLength;

            } else {

                pos.x += brickLength; //pos.x += brickLength;

            }

        }

        pos.y += brickHeight;

    }

    // //WALL4
    z0 = numBricksLength * brickLength * 0.4;
    //x0 = 0.5; //numBricksLength * brickLength * 0;
    pos.set( 0.5, brickHeight, z0);
    quat.set( 0, 1, 0, 1 );
    for ( let j = 0; j < numBricksHeight; j ++ ) { //numBricksHeight

        const oddRow = ( j % 2 ) == 1;

        pos.x = x0; //pos.x = z0;

        if ( oddRow ) {

            pos.x -= 0.25 * brickLength; //pos.x -= 0.25 * brickLength;

        }

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for ( let i = 0; i < nRow; i ++ ) {

            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            let brickHeightCurrent = brickHeight;
            

            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {

                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;

            }

            if (j == numBricksHeight -1 && (i % 2 != 0)){
                brickHeightCurrent += brickHeight;
            }
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial() );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.x += 0.75 * brickLength; //pos.x += 0.75 * brickLength;

            } else {

                pos.x += brickLength; //pos.x += brickLength;

            }

        }

        pos.y += brickHeight;

    }
    
}

function updateTexture(cloth){
    // let cloth;
    // for (let obj = 0; obj < scene.children.length; obj++){
    //     if (scene.children[obj].name == name){
    //         cloth = scene.children[obj];
    //         break;
    //     } 
    // }
    if(!dirty.includes(cloth)){
        left_towels--;
        // moveBall(); 
        document.getElementById('points2').innerHTML = 'Towels left: ' + left_towels;
        dirty.push(cloth);
    }
    textureLoader.load( './cloth_dirty.avif', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 25, 30 );
        cloth.material.map = texture;
        cloth.material.needsUpdate = true;
        cloth.material.name = 'dirty';

    } );
    //console.log('update number');
    

    

}

// console.log(cloth.geometry);

    // const shape = new CANNON.Particle();

    // particles = [];

    // for(let i = 0; i < Nx + 1; i++) {
    //     particles.push([]);
    //     for(let j = 0; j < Ny + 1; j++) {
    //         const particle = new CANNON.Body({
    //             mass: j=== Ny ? 0 : mass,
    //             shape,
    //             position: new CANNON.Vec3((i - Nx * 0.5) * dist, (j - Ny * 0.5) * dist + 15, 0),
    //             velocity: new CANNON.Vec3(0, 0, -0.1 * (Ny - j))
    //         });
    //         particles[i].push(particle);
    //         world.addBody(particle);
    //     }
    // }

    // //console.log(particles);

    // function connect(i1, j1, i2, j2) {
    //     world.addConstraint(new CANNON.DistanceConstraint(
    //         particles[i1][j1],
    //         particles[i2][j2],
    //         dist
    //     ));
    // }

    // for(let i = 0; i < Nx + 1; i++) {
    //     for(let j = 0; j < Ny + 1; j++) {
    //         if(i < Nx)
    //             connect(i, j, i + 1, j);
    //         if(j < Ny)
    //             connect(i, j, i, j + 1);
    //         //console.log('connected');
    //     }
    // }

    // clothGeometry = new THREE.PlaneBufferGeometry(1, 1, Nx, Ny);
    // //clothGeometry.addAttribute( 'position');
    // //console.log(clothGeometry.attributes);

    // const clothMat = new THREE.MeshPhongMaterial({
    // side: THREE.DoubleSide,
    // //wireframe: true,
    // map: new THREE.TextureLoader().load('./texture.webp')
    // });

    // const clothMesh = new THREE.Mesh(clothGeometry, clothMat);
    // scene.add(clothMesh);
function createCloth(){
    const clothWidth = 5;
    const clothHeight = 6;
    const clothNumSegmentsZ = clothWidth * 5;
    const clothNumSegmentsY = clothHeight * 5;
    const margin = 0.05;

    let clothPos = new THREE.Vector3(0, 5, 20 ); //- 3, 5, -3 
    //const clothPos = new THREE.Vector3( -10, 5, 0);
    

    clothGeometry1 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    //clothGeometry.rotateZ(Math.PI); //Math.PI * 0.5
    clothGeometry1.translate( clothPos.x   - clothWidth * 0.5, clothPos.y + clothHeight * 0.5, clothPos.z ); //clothPos.z - clothWidth * 0.5
    clothGeometry1.lookAt(-10,0,0);

    const clothMaterial1 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth1 = new THREE.Mesh( clothGeometry1, clothMaterial1 );
    cloth1.castShadow = true;
    cloth1.receiveShadow = true;
    cloth1.name = 'cloth_1';
    scene.add( cloth1 );
    //console.log(cloth1);
    textureLoader.load( './texture.webp', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
        cloth1.material.map = texture;
        cloth1.material.needsUpdate = true;

    } );

    // Cloth physic object
    const softBodyHelpers = new Ammo.btSoftBodyHelpers();
    const clothCorner00 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
    const clothCorner01 = new Ammo.btVector3( clothPos.x - clothWidth, clothPos.y + clothHeight, clothPos.z ); //clothPos.z - clothWidth 
    const clothCorner10 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
    const clothCorner11 = new Ammo.btVector3( clothPos.x - clothWidth, clothPos.y, clothPos.z );//clothPos.z - clothWidth 
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







    clothPos = new THREE.Vector3(30, 5, 40 ); //- 3, 5, -3 
    console.log(clothPos);
    //const clothPos = new THREE.Vector3( -10, 5, 0);
    

    clothGeometry2 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    
    //clothGeometry.rotateZ(Math.PI); //Math.PI * 0.5
    clothGeometry2.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z  - clothWidth * 0.5 ); //clothPos.z - clothWidth * 0.5
    clothGeometry2.lookAt(-10,0,0);

    const clothMaterial2 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth2 = new THREE.Mesh( clothGeometry2, clothMaterial2 );
    

    cloth2.castShadow = true;
    cloth2.receiveShadow = true;
    cloth2.name = 'cloth_2';
    scene.add( cloth2 );
    
    //console.log(cloth1);
    textureLoader.load( './texture.webp', function ( texture ) {

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        //texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
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
    //console.log(clothPos);
    //const clothPos = new THREE.Vector3( -10, 5, 0);
    

    clothGeometry3 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    
    //clothGeometry.rotateZ(Math.PI); //Math.PI * 0.5
    clothGeometry3.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z  - clothWidth * 0.5 ); //clothPos.z - clothWidth * 0.5
    clothGeometry3.lookAt(-10,0,0);

    const clothMaterial3 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth3 = new THREE.Mesh( clothGeometry3, clothMaterial3 );
    

    cloth3.castShadow = true;
    cloth3.receiveShadow = true;
    cloth3.name = 'cloth_3';
    scene.add( cloth3 );
    
    //console.log(cloth1);
    textureLoader.load( './texture.webp', function ( texture ) {

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



    clothPos = new THREE.Vector3(30, 5, -30 ); //- 3, 5, -3 
    console.log(clothPos);
    //const clothPos = new THREE.Vector3( -10, 5, 0);
    

    clothGeometry4 = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    
    //clothGeometry.rotateZ(Math.PI); //Math.PI * 0.5
    clothGeometry4.translate( clothPos.x  - clothWidth * 0.5 , clothPos.y + clothHeight * 0.5, clothPos.z ); //clothPos.z - clothWidth * 0.5
    clothGeometry4.lookAt(-10,0,0);

    const clothMaterial4 = new THREE.MeshLambertMaterial( { color: 'white', side: THREE.DoubleSide } );
    cloth4 = new THREE.Mesh( clothGeometry4, clothMaterial4 );
    

    cloth4.castShadow = true;
    cloth4.receiveShadow = true;
    cloth4.name = 'cloth_4';
    scene.add( cloth4 );
    
    //console.log(cloth1);
    textureLoader.load( './texture.webp', function ( texture ) {

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

function moveCar(){
    let scalingFactor = 0.1;
    const movementSpeed = 6;
    const rotationSpeed = 3;

    let moveX =  (moveDirection.right - moveDirection.left) * scalingFactor;
    let moveZ =  (moveDirection.back - moveDirection.forward) * scalingFactor;
    let moveY =  0; 

    let Rotate = (rotate.left - rotate.right) * scalingFactor;
    let Roll = (roll.up - roll.down) * scalingFactor;
    // Character.position += THREE.Vector3(moveX, moveY, moveZ);
    // console.log(Character.position);
    Character.translateX( moveX );
    Character.translateY(moveZ);
    Character.rotateZ(-Rotate);
    Character.rotateX(Roll);
}
function moveBall(){

    let scalingFactor = 20;
    const movementSpeed = 6;
    const rotationSpeed = 3;

    let moveX =  moveDirection.right - moveDirection.left;
    //console.log(moveX);
    let moveZ =  moveDirection.back - moveDirection.forward;
    let moveY =  moveDirection.up; 

    let Rotate = rotate.left - rotate.right;
    let Roll = roll.up - roll.down;
    //console.log(Rotate);
    

    //if( moveX == 0 && moveY == 0 && moveZ == 0) return;

    let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
    resultantImpulse.op_mul(scalingFactor);
    //console.log(resultantImpulse.x);

    let physicsBody;
    //console.log(run_game3);

    if(run_game2){
        physicsBody = ballObject.userData.physicsBody;
        
    } else if (run_game3){
        //console.log('game3');
        physicsBody = Character.userData.physicsBody;
        //console.log(physicsBody);
        physicsBody.setAngularVelocity(0, 0, 0);


        // if (moveZ || moveX) {
        //     //movement
        //     console.log('movement');
        //     const temporaryEuler = new THREE.Vector3(moveX * movementSpeed, 0, moveZ * movementSpeed).applyQuaternion(Character.quaternion)
        //     physicsBody.applyForce(new Ammo.btVector3(temporaryEuler.x, temporaryEuler.y, temporaryEuler.z))
        // }

        //console.log(mouseCoords);
        //if (mouseCoords.y) {
            const resultantImpulseRotation = new Ammo.btVector3(Roll, Rotate, 0); 
            resultantImpulseRotation.op_mul(rotationSpeed);
            physicsBody.setAngularVelocity(resultantImpulseRotation);
            // resultantImpulseRotation = new Ammo.btVector3(0, 0, 0); 
            // resultantImpulseRotation.op_mul(rotationSpeed);
            //physicsBody.setAngularVelocity(0,0,0);
            
        //}
    }
    //console.log(resultantImpulse.x(), resultantImpulse.z());
    physicsBody.setLinearVelocity( resultantImpulse );
    
   

}

function moveKinematic(){

    let scalingFactor = 0.3;

    let moveX =  kMoveDirection.right - kMoveDirection.left;
    let moveZ =  kMoveDirection.back - kMoveDirection.forward;
    let moveY =  0;


    let translateFactor = tmpPos.set(moveX, moveY, moveZ);

    translateFactor.multiplyScalar(scalingFactor);

    kObject.translateX(translateFactor.x);
    kObject.translateY(translateFactor.y);
    kObject.translateZ(translateFactor.z);
    
    kObject.getWorldPosition(tmpPos);
    kObject.getWorldQuaternion(tmpQuat);

    let physicsBody = kObject.userData.physicsBody;

    let ms = physicsBody.getMotionState();
    if ( ms ) {

        ammoTmpPos.setValue(tmpPos.x, tmpPos.y, tmpPos.z);
        ammoTmpQuat.setValue( tmpQuat.x, tmpQuat.y, tmpQuat.z, tmpQuat.w);

        
        tmpTrans.setIdentity();
        tmpTrans.setOrigin( ammoTmpPos ); 
        tmpTrans.setRotation( ammoTmpQuat ); 

        ms.setWorldTransform(tmpTrans);

    }

}

function updateParticules(){
    //console.log('update');
    for(let i = 0; i < Nx + 1; i++) {
        for(let j = 0; j < Ny + 1; j++) {
            const index = j * (Nx + 1) + i;

            const positionAttribute = clothGeometry.attributes.position;;

            const position = particles[i][Ny - j].position;

            positionAttribute.setXYZ(index, position.x, position.y, position.z);

            positionAttribute.needsUpdate = true;
        }
    }
}

function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );
    //console.log(rigidBodies.length);

    if (run_game2){
    // Update cloth
        const softBody = cloth1.userData.physicsBody;
        const clothPositions = clothGeometry1.attributes.position.array;
        const numVerts = clothPositions.length / 3;
        const nodes = softBody.get_m_nodes();
        let indexFloat = 0;

        for ( let i = 0; i < numVerts; i ++ ) {

            const node = nodes.at( i );
            const nodePos = node.get_m_x();
            clothPositions[ indexFloat ++ ] = nodePos.x();
            clothPositions[ indexFloat ++ ] = nodePos.y();
            clothPositions[ indexFloat ++ ] = nodePos.z();

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
            clothPositions2[ indexFloat2 ++ ] = nodePos.x();
            clothPositions2[ indexFloat2 ++ ] = nodePos.y();
            clothPositions2[ indexFloat2 ++ ] = nodePos.z();

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
            clothPositions3[ indexFloat3 ++ ] = nodePos.x();
            clothPositions3[ indexFloat3 ++ ] = nodePos.y();
            clothPositions3[ indexFloat3 ++ ] = nodePos.z();

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
            clothPositions4[ indexFloat4 ++ ] = nodePos.x();
            clothPositions4[ indexFloat4 ++ ] = nodePos.y();
            clothPositions4[ indexFloat4 ++ ] = nodePos.z();

        }

        cloth4.geometry.computeVertexNormals();
        clothGeometry4.attributes.position.needsUpdate = true;
        clothGeometry4.attributes.normal.needsUpdate = true;


        var ray = new THREE.Raycaster( ballObject.position, new THREE.Vector3(0, 1, 0) );
                //console.log(ray);
                var collisionResults = ray.intersectObjects( scene.children );
                //console.log(collisionResults);
                for (let i = 0; i < collisionResults.length; i++){
                    //console.log((collisionResults[i].object.name).split('_'));
                    if ( (collisionResults[i].object.name).split('_') != [] && (collisionResults[i].object.name).split('_')[0] == 'cloth' ) 
                        {
                            console.log('update');
                            updateTexture(collisionResults[i].object);
                            
                        }
                }
    }
    //updateParticules();

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