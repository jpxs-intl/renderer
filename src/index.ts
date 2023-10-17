import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import AssetManager from "./assetManager";
import { hud } from "./hud";
import DebugTools from "./debugTools";

window.scene = new THREE.Scene();
window.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({ antialias: true });

export const controls = new MapControls(camera, renderer.domElement);
export let currentBlock: string = "";


// enable debug info

renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const pointLight = new THREE.DirectionalLight(0xffffff, 2);
pointLight.position.set(0, 3, 3)
pointLight.target.position.set(0, 0, 0)
pointLight.castShadow = true;


const overheadLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
overheadLight.position.set(0, 4, 0);
scene.add(overheadLight);


camera.position.z = 5;

const animate: FrameRequestCallback = (delta) => {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);

   hud.updateDebugInfo(delta);
};


hud.init();
DebugTools.init();

AssetManager.downloadCSXFiles()

animate(0);

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
