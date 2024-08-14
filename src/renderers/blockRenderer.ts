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

        const blockGroup = new THREE.Group();

        for (const box of block.boxes) {


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
                planeMesh.name = `s: ${block.size0}, ${block.size1}, ${block.size2} | p: ${index} | b: ${blockName}${name ? ` | ${name}` : ""}`;
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


        // floor
        if (block.floor) {
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(block.size0, block.size2), new THREE.MeshStandardMaterial({ color: planeColors[0] }));
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(block.size0 / 2, 0, block.size2 / 2)
            blockGroup.add(floor);
            floor.name = `floor: ${blockName}${name ? ` | ${name}` : ""}`;
        }

        // ceiling
        if (block.ceiling) {
            const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(block.size0, block.size2), new THREE.MeshStandardMaterial({ color: planeColors[1] }));
            ceiling.rotation.x = Math.PI / 2;
            ceiling.position.set(block.size0 / 2, block.size1, block.size2 / 2)
            blockGroup.add(ceiling);
            ceiling.name = `ceiling: ${blockName}${name ? ` | ${name}` : ""}`;
        }

        // wall1 (positive x)
        if (block.wall1) {
            const wall1 = new THREE.Mesh(new THREE.PlaneGeometry(block.size1, block.size2), new THREE.MeshStandardMaterial({ color: planeColors[2] }));
            wall1.rotation.y = Math.PI / 2;
            wall1.position.set(block.size0, block.size1 / 2, block.size2 / 2)
            blockGroup.add(wall1);
            wall1.name = `wall1: ${blockName}${name ? ` | ${name}` : ""}`;
        }

        // wall2 (positive z)
        if (block.wall2) {
            const wall2 = new THREE.Mesh(new THREE.PlaneGeometry(block.size0, block.size1), new THREE.MeshStandardMaterial({ color: planeColors[3] }));
            wall2.position.set(block.size0 / 2, block.size1 / 2, 0)
            blockGroup.add(wall2);
            wall2.name = `wall2: ${blockName}${name ? ` | ${name}` : ""}`;
        }

        // wall3 (negative x)
        if (block.wall3) {
            const wall3 = new THREE.Mesh(new THREE.PlaneGeometry(block.size1, block.size2), new THREE.MeshStandardMaterial({ color: planeColors[4] }));
            wall3.rotation.y = -Math.PI / 2;
            wall3.position.set(0, block.size1 / 2, block.size2 / 2)
            blockGroup.add(wall3);
            wall3.name = `wall3: ${blockName}${name ? ` | ${name}` : ""}`;
        }

        // wall4 (negative z)
        if (block.wall4) {
            const wall4 = new THREE.Mesh(new THREE.PlaneGeometry(block.size0, block.size1), new THREE.MeshStandardMaterial({ color: planeColors[5] }));
            wall4.rotation.y = Math.PI;
            wall4.position.set(block.size0 / 2, block.size1 / 2, block.size2)
            blockGroup.add(wall4);
            wall4.name = `wall4: ${blockName}${name ? ` | ${name}` : ""}`;
        }


        console.log(block)

        let newVec = new THREE.Vector3();
        const bBox = new THREE.Box3();
        bBox.setFromObject(blockGroup);

        switch (rotationTable[rotation]) {
            case 0:
                newVec.set(0, bBox.min.y, 0)
                break;
            case 90:
                newVec.set(block.size0, bBox.min.y, 0)
                break;
            case 180:
                newVec.set(block.size0, bBox.min.y, block.size2)
                break;
            case 270:
                newVec.set(0, bBox.min.y, block.size2)
                break;
        }



        blockGroup.position.add(offset);
        blockGroup.rotation.y = rotationTable[rotation] * (Math.PI / 180);

        newVec.multiplyScalar(-1);
        blockGroup.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.translate(newVec.x, newVec.y, newVec.z);
            }
        });

        group.add(blockGroup);
        window.scene.add(group);

        console.log(`Rendered block ${blockName}`);
    }
}
