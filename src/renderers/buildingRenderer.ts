import * as THREE from "three";
import { BuildingFile } from "../typings/buildingFile";
import BlockRenderer from "./blockRenderer";
import AssetManager from "../assetManager";
import boxMaterial from "./boxMaterial";

export default class BuildingRenderer {

    public static renderBuilding(building: BuildingFile, name: string, group?: THREE.Group, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0), rotation: number = 0) {

        if (!group) {
            const oldGroup = window.scene.getObjectByName("currentRender")
            if (oldGroup) {
                window.scene.remove(oldGroup)
            }

            group = new THREE.Group()
            group.name = "currentRender"

            window.scene.add(group)
        }

        let tileIter = 0;
        for (let h = 0; h < building.height; h++) {
            for (let l = 1; l <= building.length + 1; l++) {
                for (let w = 1; w <= building.width + 1; w++) {
                    const tile = building.tiles[h][l][w];
                    if (!tile) return;

                    if (tile.block && typeof tile.block === "string") {
                        const blockFile = AssetManager.blocks.get(tile.block);
                        if (blockFile) {
                            BlockRenderer.renderBlock(blockFile, tile.block, tile.rotationBlock as number, tile.edgeX, tile.edgeZ, group, building.textures, new THREE.Vector3(w, h, l).add(offset), ` eX: ${tile.edgeX} | eZ: ${tile.edgeZ} | number: ${tileIter} | rotation: ${tile.rotationBlock} | ${tileIter} ${l}x${w}x${h}`);
                        }
                    }

                    if (tile.interiorBlock && typeof tile.interiorBlock === "string") {
                        const blockFile = AssetManager.blocks.get(tile.interiorBlock);
                        if (blockFile) {
                            BlockRenderer.renderBlock(blockFile, tile.interiorBlock, tile.rotationInteriorBlock as number, tile.edgeX, tile.edgeZ, group, building.textures, new THREE.Vector3(w, h, l).add(offset), ` number: ${tileIter} | rotation: ${tile.rotationInteriorBlock} | ${tileIter} ${l}x${w}x${h}`);
                            console.log(`Tile ${w} ${l} ${h} | Block: ${tile.block} | Interior Block: ${tile.interiorBlock} | Edge: ${tile.edgeX} ${tile.edgeZ} `)
                        }
                    }

                    // if (tile.block || tile.interiorBlock) {
                    //     const debugCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
                    //     debugCube.position.set(w, h, l).add(offset).sub(new THREE.Vector3(0.5, 0.5, 0.5));
                    //     group.add(debugCube);
                    // }

                    // floor
                    if (tile.floor) {

                        const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), boxMaterial[0])
                        // rotate the floor
                        floor.rotation.x = -Math.PI / 2;
                        floor.position.set(w + 0.5, h + globalOffset - 0.001, l + 0.5).add(offset)

                        floor.name = `Floor ${tileIter} ${l}x${w}x${h} | Edge: ${tile.floor} ${tile.edgeX} ${tile.edgeZ}`

                        group.add(floor);
                    }

                    // positive x wall
                    if (tile.edgeX) {

                        const innerWallActive = (tile.edgeX & 0b01) == 0b01
                        const outerWallActive = (tile.edgeX & 0b10) == 0b10

                        if (innerWallActive) {
                            const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), boxMaterial[4])
                            wall.rotation.y = Math.PI
                            wall.position.set(w + 0.5 - globalOffset - 0.001, h + 0.5, l).add(offset)

                            wall.name = `InnerWall (x) ${tileIter} ${l}x${w}x${h} | Edge: ${tile.floor} ${tile.edgeX} ${tile.edgeZ}`

                            group.add(wall);
                        }


                        if (outerWallActive) {
                            const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), boxMaterial[4])
                            wall.rotation.y = Math.PI
                            wall.position.set(w + 0.5 - globalOffset - 0.001, h + 0.5, l).add(offset)

                            wall.name = `OuterWall (x) ${tileIter} ${l}x${w}x${h} | Edge: ${tile.floor} ${tile.edgeX} ${tile.edgeZ}`

                            group.add(wall);
                        }
                    }

                    // positive z wall
                    if (tile.edgeZ) {

                        const innerWallActive = (tile.edgeZ & 0b01) == 0b01
                        const outerWallActive = (tile.edgeZ & 0b10) == 0b10

                        if (innerWallActive) {
                            const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), boxMaterial[3])
                            wall.rotation.y = Math.PI / 2
                            wall.position.set(w, h + 0.5, l + 0.5 - globalOffset - 0.001).add(offset)

                            wall.name = `InnerWall (z) ${tileIter} ${l}x${w}x${h} | Edge: ${tile.floor} ${tile.edgeX} ${tile.edgeZ}`

                            group.add(wall);
                        }

                        if (outerWallActive) {
                            const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), boxMaterial[3])
                            wall.rotation.y = Math.PI / 2
                            wall.position.set(w, h + 0.5, l - 0.5 - globalOffset - 0.001).add(offset)

                            wall.name = `OuterWall (z) ${tileIter} ${l}x${w}x${h} | Edge: ${tile.floor} ${tile.edgeX} ${tile.edgeZ}`

                            group.add(wall);
                        }
                    }


                    tileIter++;
                }
            }
        }

        building.specialBlocks.forEach((block, index) => {
            console.log(`Special Block ${index}: ${block}`)
        })

    }
}