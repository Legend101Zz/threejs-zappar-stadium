import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const init = () => {
  // Canvas
  const canvas = document.querySelector("canvas.webgl");

  // Scene
  const scene = new THREE.Scene();

  /**
   * Textures
   */
  const textureLoader = new THREE.TextureLoader();

  const gltfLoader = new GLTFLoader();

  const button_six = document.querySelector(".six");
  const button_four = document.querySelector(".four");

  gltfLoader.load("../assets/Stadium/Cricket.glb", (gltf) => {
    gltf.scene.position.set(0, -0.75, 0);
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    scene.add(gltf.scene);
  });

  // ==================== Function to create a 3D Sphere ====================
  const CreateSphere = (x, y, z, color) => {
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshBasicMaterial({ color: color })
    );
    sphereMesh.scale.set(0.1, 0.1, 0.1);
    sphereMesh.position.set(x, y, z);
    scene.add(sphereMesh);
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
      scene.add(mesh);
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
      scene.add(mesh);
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
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  const light = new THREE.AmbientLight(0x404040); // soft white light
  light.intensity = 4;
  light.position.set(0, 2, 0);
  scene.add(light);

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(0, 3, 1);
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  //

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
   * Animate
   */
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // shaderMaterial.uniforms.uTime.value = elapsedTime;
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
};

const moduleExports = {
  init,
};

export default moduleExports;
