import * as THREE from "three";
import { BlockFile } from "../typings/blockFile";
import BezierSurface from "./beizerSurface";
import { hud } from "../hud";
import AssetManager from "../assetManager";


export default class BlockRenderer {

    public static renderBlock(block: BlockFile, blockName: string, rotation: number, group?: THREE.Group, textures?: string[], offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0), name?: string) {

        if (!group) {
            const oldGroup = window.scene.getObjectByName("currentRender")
            if (oldGroup) {
                window.scene.remove(oldGroup)
            }

            group = new THREE.Group()
            group.name = "currentRender"
        }

        const rotationTable = [
           0, 270, 180 , 90 
        ]

        for (const box of block.boxes) {

            // use the 8 vertices to create 6 plane geometries

            const planeIds = [
                [
                    2, 1, 3, 0 // red
                ],
                [
                    6, 5, 7, 4 // green
                ],
                [
                    0, 1, 4, 5 // blue
                ],
                [
                    2, 3, 6, 7 // yellow
                ],
                [
                    0, 3, 4, 7 // magenta
                ],
                [
                    1, 2, 5, 6 // cyan
                ]
            ]

            const planeGeometries = planeIds.map((planeId) => {
                const planeGeometry = new THREE.PlaneGeometry(1, 1);

                const verts = new Float32Array(12);
                let vertIndex = 0;
                planeId.forEach((vertexId) => {
                    verts[vertIndex] = box.vertices[vertexId][0];
                    verts[vertIndex + 1] = box.vertices[vertexId][1];
                    verts[vertIndex + 2] = box.vertices[vertexId][2];
                    vertIndex += 3;
                })
                planeGeometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
                return planeGeometry;
            });
            
            const boxGroup = new THREE.Group();

            planeGeometries.forEach((planeGeometry, index) => {
                const planeMaterial = new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    map: textures ? AssetManager.textures.get(textures[index]) : undefined
                });
                const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                planeMesh.name = `p: ${index} | b: ${blockName} | ${name}`;

                boxGroup.add(planeMesh);
            })

            boxGroup.position.add(offset);
            boxGroup.rotation.y = rotationTable[rotation] * (Math.PI / 180);

            group.add(boxGroup);

        }

        let surfaces = block.surfaces.map((surface) => {
            return BezierSurface.fromBlockSurface(surface, 0xffffff);
        });

        surfaces.forEach((surface) => {
            surface.position.add(offset);
            surface.rotation.y = rotationTable[rotation] * (Math.PI / 180);
            group!.add(surface);
        });

        window.scene.add(group);

        console.log(`Rendered block ${blockName}`);
    }
}
