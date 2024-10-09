import * as THREE from "three";

const planeColors = [
  0xff0000,
  0x00ff00,
  0x0000ff,
  0xffff00,
  0xff00ff,
  0x00ffff,
];

let boxMaterial: THREE.MeshBasicMaterial[] = []
for (let side = 0; side < 6; side++) {
  boxMaterial.push(new THREE.MeshBasicMaterial({color: planeColors[side], side: THREE.DoubleSide}))
}
export default boxMaterial;