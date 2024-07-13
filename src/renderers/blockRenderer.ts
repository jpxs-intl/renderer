import * as THREE from "three";
import { BlockFile } from "../typings/blockFile";
import BezierSurface from "./beizerSurface";
import { hud } from "../hud";
import AssetManager from "../assetManager";


export default class BlockRenderer {

    public static renderBlock(block: BlockFile, blockName: string, rotation: number, edgeX?: number, edgeZ?: number, group?: THREE.Group, textures?: string[], offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0), name?: string) {

        if (!group) {
            const oldGroup = window.scene.getObjectByName("currentRender")
            if (oldGroup) {
                window.scene.remove(oldGroup)
            }

            group = new THREE.Group()
            group.name = "currentRender"

            window.scene.add(group)
        }

        const rotationTable = [
            0, 270, 180, 90
        ]

        const blockGroup = new THREE.Group();

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

            const planeColors = [
                0xff0000,
                0x00ff00,
                0x0000ff,
                0xffff00,
                0xff00ff,
                0x00ffff
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
                const planeMaterial = textures ? new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    map: AssetManager.textures.get(textures[index])
                }) : new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    color: planeColors[index],
                });

                const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                planeMesh.name = `p: ${index} | b: ${blockName}${name ? ` | ${name}` : ""}`;
                boxGroup.add(planeMesh);
            })

            blockGroup.add(boxGroup);
        }

        let surfaces = block.surfaces.map((surface) => {
            return BezierSurface.fromBlockSurface(surface, 0xffffff);
        });

        surfaces.forEach((surface) => {
            //surface.position.add(offset);
            //surface.position.add(newVec);
            //surface.rotation.y = rotationTable[rotation] * (Math.PI / 180);
            blockGroup!.add(surface);
        });

        console.log(block)

        let newVec = new THREE.Vector3();
        const bBox = new THREE.Box3();
        bBox.setFromObject(blockGroup);

        let newX = bBox.max.x
        let newZ = bBox.min.z
        if (edgeX) {
            //newX = bBox.max.x + edgeX;
            //newZ = bBox.min.z - (edgeX / 2);
        }

        if (edgeZ) {
            //newZ = bBox.min.z - edgeZ;
            //newX = bBox.max.x + (edgeZ / 2);
        }

        newVec.set(newX, bBox.max.y, newZ)

        newVec.multiplyScalar(-1);
        blockGroup.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.translate(newVec.x, newVec.y, newVec.z);
            }
        });
        blockGroup.position.add(offset);
        blockGroup.position.add(new THREE.Vector3(edgeX! * 2, 0, edgeZ!));

        blockGroup.position.sub(newVec);
        blockGroup.rotation.y = rotationTable[rotation] * (Math.PI / 180);

        group.add(blockGroup);
        window.scene.add(group);

        console.log(`Rendered block ${blockName}`);
    }
}
