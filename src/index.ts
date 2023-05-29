// @ts-nocheck
/// Zappar for ThreeJS Examples
/// Instant Tracking 3D Model

// In this example we track a 3D model using instant world tracking

import * as THREE from "three";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import Stats from "three/examples/jsm/libs/stats.module";

const model = new URL("../assets/Stadium/Cricket.glb", import.meta.url).href;

import "./index.css";

// The SDK is supported on many different browsers, but there are some that
// don't provide camera access. This function detects if the browser is supported
// For more information on support, check out the readme over at
// https://www.npmjs.com/package/@zappar/zappar-threejs
if (ZapparThree.browserIncompatible()) {
  // The browserIncompatibleUI() function shows a full-page dialog that informs the user
  // they're using an unsupported browser, and provides a button to 'copy' the current page
  // URL so they can 'paste' it into the address bar of a compatible alternative.
  ZapparThree.browserIncompatibleUI();

  // If the browser is not compatible, we can avoid setting up the rest of the page
  // so we throw an exception here.
  throw new Error("Unsupported browser");
}

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded. You can use this if it's helpful, or use
// your own loading UI - it's up to you :-)
const manager = new ZapparThree.LoadingManager();

// ==================== Selectings dom elemets ====================
const canvas = document.querySelector("canvas.webgl");
const button_six = document.querySelector(".six");
const button_four = document.querySelector(".four");

// Construct our ThreeJS renderer and scene as usual
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
const scene = new THREE.Scene();
// document.body.appendChild(renderer.domElement);

// As with a normal ThreeJS scene, resize the canvas if the window resizes

// Create a Zappar camera that we'll use instead of a ThreeJS camera
const camera = new ZapparThree.Camera();

// In order to use camera and motion data, we need to ask the users for permission
// The Zappar library comes with some UI to help with that, so let's use it
ZapparThree.permissionRequestUI().then((granted) => {
  // If the user granted us the permissions we need then we can start the camera
  // Otherwise let's them know that it's necessary with Zappar's permission denied UI
  if (granted) camera.start();
  else ZapparThree.permissionDeniedUI();
});

// The Zappar component needs to know our WebGL context, so set it like this:
ZapparThree.glContextSet(renderer.getContext());

// Set the background of our scene to be the camera background texture
// that's provided by the Zappar camera
scene.background = camera.backgroundTexture;

// Create an InstantWorldTracker and wrap it in an InstantWorldAnchorGroup for us
// to put our ThreeJS content into
const instantTracker = new ZapparThree.InstantWorldTracker();
const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
  camera,
  instantTracker
);

// Add our instant tracker group into the ThreeJS scene
scene.add(instantTrackerGroup);

// THREE-JS CODE STARTS HERE

// ==================== Creating custom movement using rayCaster ====================

const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(),
  new THREE.Vector3(),
  0.25,
  0xffff00
);
instantTrackerGroup.add(arrowHelper);

const material = new THREE.MeshNormalMaterial();

const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const coneGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);

const raycaster = new THREE.Raycaster();
const sceneMeshes: THREE.Object3D[] = [];

// Load a 3D model to place within our group (using ThreeJS's GLTF loader)
// Pass our loading manager in to ensure the progress bar works correctly
const gltfLoader = new GLTFLoader(manager);

const start = gltfLoader.load(
  model,
  (gltf) => {
    console.log(gltf);
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    gltf.scene.position.y = -1;

    // Now the model has been loaded, we can add it to our instant_tracker_group
    instantTrackerGroup.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (err) => {
    console.log("An error ocurred loading the GLTF model", err);
  }
);

canvas.addEventListener("dblclick", onDoubleClick, false);
canvas.addEventListener("mousemove", onMouseMove, false);

const mouse = new THREE.Vector2();

function onMouseMove(event: MouseEvent) {
  console.log("started");
  mouse.set(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  );

  console.log(mouse.x, mouse.y);
  camera.position.x += 1;
  camera.position.y += 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);
  console.log(intersects);
  if (intersects.length > 0) {
    // console.log(sceneMeshes.length + " " + intersects.length)
    // console.log(intersects[0])
    // console.log(intersects[0].object.userData.name + " " + intersects[0].distance + " ")
    // console.log((intersects[0].face as THREE.Face).normal)
    // line.position.set(0, 0, 0)
    // line.lookAt((intersects[0].face as THREE.Face).normal)
    // line.position.copy(intersects[0].point)

    const n = new THREE.Vector3();
    n.copy((intersects[0].face as THREE.Face).normal);
    n.transformDirection(intersects[0].object.matrixWorld);

    arrowHelper.setDirection(n);
    arrowHelper.position.copy(intersects[0].point);
  }
}

function onDoubleClick(event: MouseEvent) {
  mouse.set(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  camera.position.z += 10;
  camera.position.y += 10;

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    const n = new THREE.Vector3();
    n.copy((intersects[0].face as THREE.Face).normal);
    n.transformDirection(intersects[0].object.matrixWorld);

    // const cube = new THREE.Mesh(boxGeometry, material)
    const cube = new THREE.Mesh(coneGeometry, material);

    cube.lookAt(n);
    cube.rotateX(Math.PI / 2);
    cube.position.copy(intersects[0].point);
    cube.position.addScaledVector(n, 0.1);

    instantTrackerGroup.add(cube);
    sceneMeshes.push(cube);
  }
}

console.log(sceneMeshes);

// ==================== Function to create a 3D Sphere ====================
const CreateSphere = (x, y, z, color) => {
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshBasicMaterial({ color: color })
  );
  sphereMesh.scale.set(0.1, 0.1, 0.1);
  sphereMesh.position.set(x, y, z);
  instantTrackerGroup.add(sphereMesh);
};

// ===================== Logic for marking a boundary ======================
CreateSphere(-0.125, 0.02, 0.02, "red");
CreateSphere(
  0.65 * Math.cos(Math.PI / 2) - 0.125,
  0.09,
  0.65 * Math.sin(Math.PI / 2) + 0.02,
  "green"
);
CreateSphere(
  0.68 * Math.cos(Math.PI * 1.8) - 0.125,
  0.09,
  0.68 * Math.sin(Math.PI * 1.8) + 0.02,
  "green"
);
CreateSphere(
  0.7 * Math.cos(Math.PI * 1.5) - 0.125,
  0.09,
  0.7 * Math.sin(Math.PI * 1.5) + 0.02,
  "green"
);

// =====================  Sleep Function ======================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =====================  Animation of TubeGeometry Function ======================
async function animate(points, mesh) {
  for (let i = 2; i < points.length; i++) {
    let curve = new THREE.CatmullRomCurve3(points.slice(0, i));
    mesh.geometry = new THREE.TubeGeometry(curve, 64, 0.007, 8, false);
    await sleep(25);
  }
}

// =====================  Function for creating a curve ======================
const CreateCurve = (x, y, z, run) => {
  let v1 = new THREE.Vector3(-0.125, 0.02, 0.02); // pos of batsman
  let v2 = new THREE.Vector3(x, y, z); // endpoint of the ball
  let points = [];
  if (run == 6) {
    for (let i = 0; i <= 50; i++) {
      let p = new THREE.Vector3().lerpVectors(v1, v2, i / 50);

      p.y = p.y + 0.2 * Math.sin((Math.PI * i) / 50);
      points.push(p);
    }
    let curve = new THREE.CatmullRomCurve3(points.slice(0, 2));
    const geometry = new THREE.TubeGeometry(curve, 64, 0.007, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: "red" });
    const mesh = new THREE.Mesh(geometry, material);
    instantTrackerGroup.add(mesh);
    animate(points, mesh);
  } else if (run == 4) {
    for (let i = 0; i <= 50; i++) {
      let p = new THREE.Vector3().lerpVectors(v1, v2, i / 50);
      p.y = p.y + 0.01 * Math.sin((Math.PI * i) / 50);
      points.push(p);
    }
    console.log(points);
    let curve = new THREE.CatmullRomCurve3(points.slice(0, 2));
    const geometry = new THREE.TubeGeometry(curve, 64, 0.007, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: "blue" });
    const mesh = new THREE.Mesh(geometry, material);
    instantTrackerGroup.add(mesh);
    animate(points, mesh);
  }
};

// =====================  Event Listeners and Calling the CreateCurve Function ======================
button_six.addEventListener("click", () => {
  CreateCurve(
    0.65 * Math.cos(Math.PI / 2) - 0.125,
    0.09,
    0.65 * Math.sin(Math.PI / 2) + 0.02,
    6
  );
  CreateCurve(
    0.7 * Math.cos(Math.PI * 2.3) - 0.125,
    0.09,
    0.7 * Math.sin(Math.PI * 2.3) + 0.02,
    6
  );
});

button_four.addEventListener("click", () => {
  CreateCurve(
    0.68 * Math.cos(Math.PI * 1.8) - 0.125,
    0.05,
    0.68 * Math.sin(Math.PI * 1.8) + 0.02,
    4
  );
  CreateCurve(
    0.7 * Math.cos(Math.PI * 1.5) - 0.125,
    0.05,
    0.7 * Math.sin(Math.PI * 1.5) + 0.02,
    4
  );
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  // camera._updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Let's add some lighting, first a directional light above the model pointing down
const directionalLight = new THREE.DirectionalLight("white", 0.8);
directionalLight.position.set(0, 5, 0);
directionalLight.lookAt(0, 0, 0);
instantTrackerGroup.add(directionalLight);

// And then a little ambient light to brighten the model up a bit
const ambientLight = new THREE.AmbientLight("white", 0.4);
instantTrackerGroup.add(ambientLight);

/**
 * Camera
 */
// Base camera
// const camera2 = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   100
// );
camera.position.set(0, 10, 1);
// scene.add(camera2);

// Controls !!!!! NOT WORKING , ZAPPAR CAMERA NOT USABLE WITH ORBITAL CONTROLS !!!!

// const controls = new OrbitControls(camera, canvas);
// // controls.autoRotate();
// controls.enableDamping = true;
// console.log(controls);
// controls.update();

//TRYING FLY CONTROLS

// controls = new FlyControls(camera, canvas);
// controls.movementSpeed = 100;
// controls.rollSpeed = Math.PI / 24;
// controls.autoForward = false;
// controls.dragToLook = true;

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// const clock = new THREE.Clock();
// When the experience loads we'll let the user choose a place in their room for
// the content to appear using setAnchorPoseFromCameraOffset (see below)
// The user can confirm the location by tapping on the screen
let hasPlaced = false;
const placeButton =
  document.getElementById("tap-to-place") || document.createElement("div");
placeButton.addEventListener("click", () => {
  hasPlaced = true;
  placeButton.remove();
});

console.log(instantTrackerGroup);

const clock = new THREE.Clock();
let delta = 0;
// Use a function to render our scene as usual
function render(): void {
  if (!hasPlaced) {
    // If the user hasn't chosen a place in their room yet, update the instant tracker
    // to be directly in front of the user
    instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -5);
  }

  // The Zappar camera must have updateFrame called every frame
  camera.updateFrame(renderer);

  // Draw the ThreeJS scene in the usual way, but using the Zappar camera
  renderer.render(scene, camera);
  // controls.update(0.01);
  delta = clock.getDelta();

  // camera.position.y += 1;
  console.log(camera.position);
  // Call render() again next frame

  requestAnimationFrame(render);
}

// Start things off
render();
