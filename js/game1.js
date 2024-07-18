//variable declaration section
const TIME_LIMIT = 20;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let shot = true;
let points = 0, start_positions = [], tmpPos = new THREE.Vector3();
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null;
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
let textureLoader, sound, sound_win, sound_loose;

const STATE = { DISABLE_DEACTIVATION : 4 }

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

//Ammojs Initialization
Ammo().then(start)



function start (){
    
    tmpTrans = new Ammo.btTransform();
    setupEventHandlers();
    
    document.getElementById('score1').style.display = 'grid';
    camera_par = [100, window.innerWidth / window.innerHeight, 0.2, 5000];  
    setupGraphics(0, 30, 70, camera_par);
    setupPhysicsWorld();
    createPlane('../immages/kids_floor.jpg');
    createWall();
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
    '../immages/toy_room.jpg',
    () => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
    });
    
    camera = new THREE.PerspectiveCamera(camera_par[0], camera_par[1], camera_par[2], camera_par[3]);
    camera.position.set(camerax, cameray, cameraz);
    scene.add(camera);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Create a global audio source
    sound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('../sounds/throw_ball.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
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
    
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        const name = objThree.name
        
        if (typeof(rigidBodies[i].name) != 'number'){
            break;
        }
        
        if( objThree.position.y > 0 && Math.abs(objThree.position.y - start_positions[name].y) > 10){
            if(shot){
                points++;
                start_positions[name] = objThree.position;
                document.getElementById('points').innerHTML = "Points: " + points + "/130";
            } else {
                document.getElementById('points').innerHTML = "Points: 130/130";
            }
            
        }
    }
   
    if (points >= 130){
        shot = false;
        sound_win.play();
        setTimeout( function() {
            document.getElementById('win1').style.display = 'grid';
            }, 2000);
        
        
    }
    
    updatePhysics( deltaTime );
    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}

function startTimer() {
    timerInterval = setInterval(() => {
        if(shot){
        timePassed = timePassed += 1;
        }
        timeLeft = TIME_LIMIT - timePassed;
        
        document.getElementById("Countdown1").innerHTML = 'Coundown: ' + formatTimeLeft(timeLeft);
        
        if (timeLeft === 0 && points < 130) {
            sound_loose.play();
            document.getElementById("game_over1").style.display = 'grid';
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
    window.addEventListener( 'mousedown', onMouseDown, false );
    window.addEventListener( 'mousemove', onMouseMove, false);

}

function handleKeyDown(event){

    let keyCode = event.keyCode;

    switch(keyCode){
        
            
    }
}

function handleKeyUp(event){
    let keyCode = event.keyCode;

    switch(keyCode){
        
    }

}

function onMouseDown ( event ) {

    mouseCoords.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1
    );

    

    // Creates a ball and throws it
    if (shot){
        raycaster.setFromCamera( mouseCoords, camera );
        tmpPos.copy( raycaster.ray.direction );
        tmpPos.add( raycaster.ray.origin );


        let pos = {x: tmpPos.x, y: tmpPos.y, z: tmpPos.z};
        let radius = 1;
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass = 10;

        //threeJS Section
        let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: createRandomColor()}));

        ball.position.set(pos.x, pos.y, pos.z);

        ball.castShadow = true;
        ball.receiveShadow = true;

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

        physicsWorld.addRigidBody( body );

        tmpPos.copy( raycaster.ray.direction );
        tmpPos.multiplyScalar( 100 );

        body.setLinearVelocity( new Ammo.btVector3( tmpPos.x, tmpPos.y, tmpPos.z ) );

        ball.userData.physicsBody = body;
        rigidBodies.push(ball);
        if (sound.isPlaying) {
            sound.stop();
        }
        sound.play();
    } 
    

}

function onMouseMove(event){
    const width = window.innerWidth;
    const height = window.innerHeight;

    mouseCoords.x = (event.clientX / width * 2 - 1);
    mouseCoords.y = -(event.clientY / height) * 2 + 1;
}


function createPlane(texture){ //creates the plane
    
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 100, y: 2, z: 100};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    // //threeJS Section
    const material = new THREE.MeshPhongMaterial({color: 'grey'} );
    let blockPlane;
    blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 2), material);
    

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
    colShape = new Ammo.btBoxShape( new Ammo.btVector3(2* scale.x * 0.5, 2* scale.y * 0.5, 2* scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(2);

    physicsWorld.addRigidBody( body );

}


function createParalellepiped( sx, sy, sz, mass, pos, quat, material, index ) {

    const threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( 0.05 );
    threeObject.name = index;
    start_positions.push({ ...pos });

    createRigidBody( threeObject, shape, mass, pos, quat, index );

    return threeObject;

}

function createMaterial() {

    return new THREE.MeshPhongMaterial( { color: createRandomColor() } );

}

function createRandomColor() {

    return Math.floor( Math.random() * ( 1 << 24 ) );

}

function createRigidBody( threeObject, physicsShape, mass, pos, quat, index ) {

    threeObject.position.copy( pos );
    threeObject.quaternion.copy( quat );
    threeObject.name = index;

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

function createWall(){
    const brickMass = 0.5;
    const brickLength = 10;
    const brickDepth = 5;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = 6;
    const numBricksHeight = 8;
    let z0 = - numBricksLength * brickLength * 0.53;
    const pos = new THREE.Vector3();
	const quat = new THREE.Quaternion();
    pos.set( z0, brickHeight * 0.5, 0 ); 
    quat.set( 0, 0, 0, 1 );

    //WALL LEFT
    let count = 0;
    for ( let j = 0; j < numBricksHeight; j ++ ) {

        const oddRow = ( j % 2 ) == 1;

        pos.z = z0; 

        if ( oddRow ) {

            pos.z -= 0.25 * brickLength; 

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
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial(), count);
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.z += 0.75 * brickLength; 

            } else {

                pos.z += brickLength;
            }
            count++;

        }

        pos.y += brickHeight;

    }

    //WALL RIGHT
    z0 = -numBricksLength * brickLength * 0.5;
    pos.set( numBricksLength * brickLength *0.58, brickHeight, z0 );
    quat.set( 0, 0, 0, 1 );
    for ( let j = 0; j < numBricksHeight; j ++ ) {

        const oddRow = ( j % 2 ) == 1;

        pos.z = z0; 

        if ( oddRow ) {

            pos.z -= 0.25 * brickLength; 

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
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial(), count );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.z += 0.75 * brickLength;

            } else {

                pos.z += brickLength; 

            }
            count ++;

        }

        pos.y += brickHeight;

    }

    //WALL FRONT
    z0 = z0 - numBricksLength * brickLength * 0.1 ;
    let x0 = - numBricksLength * brickLength * 0.4 ;
    pos.set( x0, brickHeight, z0);
    quat.set( 0, 1, 0, 1 );
    for ( let j = 0; j < numBricksHeight; j ++ ) {

        const oddRow = ( j % 2 ) == 1;

        pos.x = x0;

        if ( oddRow ) {

            pos.x -= 0.25 * brickLength;

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
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial(), count );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.x += 0.75 * brickLength;

            } else {

                pos.x += brickLength;

            }
            count++;

        }

        pos.y += brickHeight;

    }

    // //WALL BACK
    z0 = numBricksLength * brickLength * 0.4;
    pos.set( 0.5, brickHeight, z0);
    quat.set( 0, 1, 0, 1 );
    for ( let j = 0; j < numBricksHeight; j ++ ) { 
        const oddRow = ( j % 2 ) == 1;

        pos.x = x0;

        if ( oddRow ) {

            pos.x -= 0.25 * brickLength;

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
            
            const brick = createParalellepiped( brickDepth, brickHeightCurrent, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial(), count );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                pos.x += 0.75 * brickLength;

            } else {

                pos.x += brickLength; 

            }
            count++;

        }

        pos.y += brickHeight;

    }
    
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