import * as THREE from "three";
import { hud } from "./hud";

export default class DebugTools {

    public static raycaster = new THREE.Raycaster();
    public static mouse = new THREE.Vector2();

    public static init() {

        window.addEventListener("mousemove", (e) => {
            const intersections = DebugTools.castMousePosition(e);
            if (intersections[0] && intersections[0].object.name !== "") {
                hud.status = intersections[0].object.name;
            }
        });

    }

    public static castMousePosition(event: MouseEvent): THREE.Intersection[] {
        DebugTools.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        DebugTools.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        DebugTools.raycaster.setFromCamera(DebugTools.mouse, window.camera);
        return DebugTools.raycaster.intersectObjects(window.scene.children);
    }

}
