import * as THREE from "three";
import { BuildingFile } from "../typings/buildingFile";
import BlockRenderer from "./blockRenderer";
import AssetManager from "../assetManager";

export default class BuildingRenderer {

    public static renderBuilding(building: BuildingFile, name: string, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {

        const oldGroup = window.scene.getObjectByName("currentRender")
        if (oldGroup) {
            window.scene.remove(oldGroup)
        }

        const group = new THREE.Group()
        group.name = "currentRender"

        for (let h = 0; h < building.height; h++) {
            for (let l = 0; l < building.length; l++) {
                for (let w = 0; w < building.width; w++) {
                    const tile = building.tiles[h][l][w];
                    if (!tile) return;

                    if (tile.block && typeof tile.block === "string") {
                        const blockFile = AssetManager.blocks.get(tile.block);
                        if (blockFile) {
                            BlockRenderer.renderBlock(blockFile, tile.block, group, building.textures, new THREE.Vector3(w, h, l).add(offset), `${blockFile} | eX: ${tile.edgeX} | eZ: ${tile.edgeZ}`);
                        }
                    }

                    if (tile.interiorBlock && typeof tile.interiorBlock === "string") {
                        const blockFile = AssetManager.blocks.get(tile.interiorBlock);
                        if (blockFile) {
                            BlockRenderer.renderBlock(blockFile, tile.interiorBlock, group, building.textures, new THREE.Vector3(w, h, l).add(offset), ` eX: ${tile.edgeX} | eZ: ${tile.edgeZ}`);
                            console.log(`Tile ${w} ${l} ${h} | Block: ${tile.block} | Interior Block: ${tile.interiorBlock} | Edge: ${tile.edgeX} ${tile.edgeZ} `)
                        }
                    }

                }
            }
        }

        building.specialBlocks.forEach((block, index) => {
            console.log(`Special Block ${index}: ${block}`)
        })

    }
}