'use strict'

// Global variables
let camera,
  scene,
  renderer,
  controls

let light,
  floor,
  player

let walls = {}
let boxes = {}
let obstacles = []

const height = window.innerHeight
const width = window.innerWidth
let movementSpeed = 0.2
const turnSpeed =  Math.PI * 0.01
const cameraHeight = 2
const cameraDistance = -3
const mapSize = 70
const roadWidth = 10
const roadHeight = 10

init()

function init () {
  // Create a scene
  scene = new THREE.Scene()

  // Create a renderer
  renderer = new THREE.WebGLRenderer()

  renderer.setSize(width, height)
  renderer.setClearColor(0x7EC0EE)
  renderer.shadowMap.enabled = true

  // Create a camera
  camera = new THREE.PerspectiveCamera(100, width / height, 1, 1000)

  // Positioning the camera
	camera.position.set(0,cameraHeight, cameraDistance)
	camera.lookAt(new THREE.Vector3(0, cameraHeight, 0))

  // Create elements
  light = getAmbientLight(2)
  floor = getFloor(mapSize)
  player = getBox(1, 1, 1, 0x00ff33)

  walls.leftOuter = getBox(1, roadHeight, mapSize )
  walls.leftInner = getBox(1, roadHeight, mapSize - roadWidth * 2)
  walls.frontOuter = getBox(mapSize/2 , roadHeight, 1)
  walls.frontInner = getBox(mapSize/2 - roadWidth * 2, roadHeight, 1)
  walls.rightOuter = getBox(1, roadHeight, mapSize/2 )
  walls.rightInner = getBox(1, roadHeight, mapSize/2 - roadWidth * 2)
  walls.backOuter = getBox(mapSize, roadHeight, 1)
  walls.backInner = getBox(mapSize - roadWidth * 2, roadHeight, 1)

  walls.firstCornerOuter = getBox(1, roadHeight, mapSize /2 )
  walls.firstCornerInner = getBox(1, roadHeight, mapSize / 2)
  walls.secondCornerOuter = getBox(mapSize /2, roadHeight, 1 )
  walls.secondCornerInner = getBox(mapSize /2, roadHeight, 1)

  boxes.firstBox = getBox(roadWidth/2, roadHeight/2, roadWidth/2)
  boxes.secondBox = getBox(roadWidth/2, roadHeight/2, roadWidth/2)
  boxes.thirdBox = getBox(roadWidth/2, roadHeight/2, roadWidth/2)
  boxes.fourthBox = getBox(roadWidth/2, roadHeight/2, roadWidth/2)
 
  // Positioning of the elements
  light.position.set(-2, 10, -10)
  floor.rotation.x = Math.PI / 2
  player.position.set((mapSize - roadWidth) / 2, player.geometry.parameters.height / 2, cameraDistance*5)

  walls.leftOuter.position.set(mapSize / 2,0,0)
  walls.leftInner.position.set(mapSize / 2 - roadWidth, 0, 0)
  walls.frontOuter.position.set(mapSize/4,0,mapSize / 2)
  walls.frontInner.position.set(mapSize/4,0,mapSize / 2 - roadWidth)
  walls.rightOuter.position.set(-mapSize / 2,0, -mapSize/4)
  walls.rightInner.position.set(-mapSize / 2 + roadWidth,0, -mapSize/4)
  walls.backOuter.position.set(0,0,-mapSize / 2)
  walls.backInner.position.set(0,0,-mapSize / 2 + roadWidth)

  walls.firstCornerOuter.position.set(0,0, mapSize/4)
  walls.firstCornerInner.position.set(roadWidth ,0, mapSize/4 - roadWidth)
  walls.secondCornerOuter.position.set(-mapSize/4,0, 0)
  walls.secondCornerInner.position.set(-mapSize/4 + roadWidth ,0, -roadWidth)

  boxes.firstBox.position.set(mapSize/2 - roadWidth + boxes.firstBox.geometry.parameters.width/2, boxes.firstBox.geometry.parameters.height/2, mapSize/5)
  boxes.secondBox.position.set(mapSize/2 - boxes.secondBox.geometry.parameters.width/2, boxes.secondBox.geometry.parameters.height/2, 0)
  boxes.thirdBox.position.set(mapSize/5, boxes.thirdBox.geometry.parameters.height/2, -mapSize/2 + boxes.thirdBox.geometry.parameters.width/2)
  boxes.fourthBox.position.set(0, boxes.fourthBox.geometry.parameters.height/2, -mapSize/2 - boxes.fourthBox.geometry.parameters.width/2 + roadWidth)


  // Camera follows player
  player.add(camera)

  // Add elements to scene
  scene.add(light)
  scene.add(floor)
  scene.add(player)

  for (let wall in walls) {
    scene.add(walls[wall])
    obstacles.push(walls[wall])
  }

  for (let box in boxes) {
    scene.add(boxes[box])
    obstacles.push(boxes[box])
  }

  document.body.appendChild(renderer.domElement)
  
  animate()
}

function animate () {
  renderer.render(scene, camera)

  requestAnimationFrame(animate)

  // Collision detection
  for (let i = 0; i < player.geometry.vertices.length; i++) {		
    // Position and direction vectors
    const localVertex = player.geometry.vertices[i].clone()
    const globalVertex = localVertex.applyMatrix4(player.matrix)
    const directionVector = globalVertex.sub(player.position)
    
    // Raycaster scanning in movement direction
    const raycaster = new THREE.Raycaster(player.position, directionVector.clone().normalize())
    const intersections = raycaster.intersectObjects(obstacles)
 
		if (intersections.length > 0 && intersections[0].distance < directionVector.length()) {
      // Move backwards or forwards
      if (i === 0 || i === 1 || i === 7) {
        player.translateZ(-movementSpeed)
      } else if (i === 3 || i === 4 || i === 5) {
        player.translateZ(movementSpeed)
      }
      // Move to left or right
      if (i === 1 || i === 2 || i === 3) {
        player.translateX(-movementSpeed)
      } else if (i === 5 || i === 6 || i === 7) {
        player.translateX(movementSpeed)
      }
    }
  }	

  // Player movement
	if (Key.isDown(Key.W)) {
		player.translateZ(movementSpeed)
	}

	if (Key.isDown(Key.S)) {
		player.translateZ(-movementSpeed)
	}

	if (Key.isDown(Key.A)) {
		player.translateX(movementSpeed)
	}

	if (Key.isDown(Key.D)) {
		player.translateX(-movementSpeed)
	}

	if (Key.isDown(Key.LR)) {
		player.rotation.y += turnSpeed
	}

	if (Key.isDown(Key.RR)) {
		player.rotation.y -= turnSpeed
  }
}

// Geometry helpers
function getBox (width, height, depth, color = 0x262626) {
  const box = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshPhongMaterial({ color })

  const mesh = new THREE.Mesh(box, material)
  mesh.castShadow = true

  return mesh
}

function getPlane (size) {
  const plane = new THREE.PlaneGeometry(size, size, size / 20, size / 20)
  const material = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide
  })

  const mesh = new THREE.Mesh(plane, material)
  mesh.receiveShadow = true

  return mesh
}

function getFloor (size) {
  const floorTexture = new THREE.ImageUtils.loadTexture('images/floor.png');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
  floorTexture.repeat.set(mapSize / 15, mapSize / 15);
  
  const floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture, side: THREE.DoubleSide
  })
  
  const floorGeometry = new THREE.PlaneGeometry(size, size, size / 20, size / 20)
  
  const mesh = new THREE.Mesh(floorGeometry, floorMaterial)
  mesh.receiveShadow = true

  return mesh
}

function getAmbientLight (intensity, color = 0xffffff) {
  return new THREE.AmbientLight(color, intensity)
}
