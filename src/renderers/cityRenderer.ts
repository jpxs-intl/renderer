import * as THREE from "three";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { CityFile } from "../typings/cityFile";
import AssetManager from "../assetManager";
import BuildingRenderer from "./buildingRenderer";
import { hud } from "../hud";

export default class CityRenderer {

    public static renderCity(city: CityFile) {
        const oldGroup = window.scene.getObjectByName("currentRender")
        if (oldGroup) {
            window.scene.remove(oldGroup)
        }

        const group = new THREE.Group()
        group.name = "currentRender"

        hud.status = `Rendering city... (${city.buildings.length} buildings)`;
        let buildingIndex = 0;
        // stagger rendering buildings to prevent blocking the main thread

        const renderBuilding = () => {
            if (buildingIndex < city.buildings.length) {
                hud.status = `Rendering building ${buildingIndex + 1} of ${city.buildings.length}`;
                const building = city.buildings[buildingIndex];
                const buildingFile = AssetManager.buildings.get(building.name);
                if (buildingFile) {
                    BuildingRenderer.renderBuilding(buildingFile, building.name, group, new THREE.Vector3(building.position[0], building.position[1], building.position[2]), building.rotation);
                    // window.camera.position.set(building.position[0], building.position[1] + 40, building.position[2]);
                    // window.camera.lookAt(building.position[0], building.position[1], building.position[2]);
                }
                buildingIndex++;
                setTimeout(renderBuilding, 0);
            } else {
                const exporter = new OBJExporter();
                const obj = exporter.parse(scene)
                const blob = new Blob([obj], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "city.obj";
                a.click();
            }
        }

        renderBuilding();

    }

}