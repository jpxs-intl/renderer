import * as THREE from "three";
import { BlockFile } from "../typings/blockFile";
import BezierSurface from "./beizerSurface";
import AssetManager from "../assetManager";
import { hud } from "../hud";
import boxMaterial from "./boxMaterial";


export default class BlockRenderer {

    public static init() {
    }

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

        const faceTriangles = [
            [
                2, 1, 3, 0, 3, 1
            ],
            [
                6, 5, 7, 4, 7, 5
            ],
            [
                0, 1, 4, 5, 4, 1
            ],
            [
                2, 3, 6, 7, 6, 3
            ],
            [
                0, 3, 4, 7, 4, 3
            ],
            [
                1, 2, 5, 6, 5, 2
            ]
        ]

        const blockGroup = new THREE.Group();

        for (const box of block.boxes) {
            const vertices = new Float32Array(box.vertices.flat());
            const newBoxGeometry = new THREE.BoxGeometry();
            newBoxGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
            newBoxGeometry.setIndex(faceTriangles.flat());
            newBoxGeometry.computeVertexNormals()

            const boxMesh = new THREE.Mesh(newBoxGeometry, boxMaterial);
            blockGroup.add(boxMesh);
        }

        block.surfaces.forEach((surface) => {
            const bezierSurf = BezierSurface.fromBlockSurface(surface, 0xffffff);
            blockGroup!.add(bezierSurf);
        });

        console.log(block);

        // modifiers 

        const wallgroup = new THREE.Group();

        // floor
        if (block.floor != 0) {
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(block.sizeX, block.sizeZ), AssetManager.materials.get(`planeColor_0`));
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(block.sizeX / 2, globalOffset, block.sizeZ / 2)
            wallgroup.add(floor);
            floor.name = `floor: ${blockName} | f: ${block.floor}${name ? ` | ${name}` : ""}`;
        }

        // ceiling
        if (block.ceiling != 0) {
            const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(block.sizeX, block.sizeZ), AssetManager.materials.get(`planeColor_1`));
            ceiling.rotation.x = Math.PI / 2;
            ceiling.position.set(block.sizeX / 2, block.sizeY - globalOffset, block.sizeZ / 2)
            wallgroup.add(ceiling);
            ceiling.name = `ceiling: ${blockName} | c: ${block.ceiling}${name ? ` | ${name}` : ""}`;
        }

        // neg x | "wallx_far"
        if (block.wallNX != 0) {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(block.sizeZ - (globalOffset * 2), block.sizeY), AssetManager.materials.get(`planeColor_5`));
            wall.rotation.y = Math.PI / 2;
            wall.position.set(globalOffset, block.sizeY / 2, block.sizeZ / 2)
            wallgroup.add(wall);
            wall.name = `wallnx: ${blockName} | v: ${block.wallNX}${name ? ` | ${name}` : ""}`;
        }

        // pos x | "wallx"
        if (block.wallPX != 0) {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(block.sizeZ - (globalOffset * 2), block.sizeY), AssetManager.materials.get(`planeColor_4`))
            wall.rotation.y = -Math.PI / 2;
            wall.position.set(block.sizeX - globalOffset, block.sizeY / 2, block.sizeZ / 2)
            wallgroup.add(wall);
            wall.name = `wallpx: ${blockName} | v: ${block.wallPX}${name ? ` | ${name}` : ""}`;
        }

        // neg z | "wallz_far"
        if (block.wallNZ != 0) {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(block.sizeX - (globalOffset * 2), block.sizeY), AssetManager.materials.get(`planeColor_2`))
            wall.position.set(block.sizeX / 2, block.sizeY / 2, globalOffset)
            wallgroup.add(wall);
            wall.name = `wallnz: ${blockName} | v: ${block.wallNZ}${name ? ` | ${name}` : ""}`;
        }

        // pos z | "wallz"
        if (block.wallPZ != 0) {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(block.sizeX - (globalOffset * 2), block.sizeY), AssetManager.materials.get(`planeColor_3`))
            wall.rotation.y = Math.PI;
            wall.position.set(block.sizeX / 2, block.sizeY / 2, block.sizeZ - globalOffset)
            wallgroup.add(wall);
            wall.name = `wallpz: ${blockName} | v: ${block.wallPZ}${name ? ` | ${name}` : ""}`;
        }

        let newVec = new THREE.Vector3();
        switch (rotationTable[rotation]) {
            case 0:
                newVec.set(0, 0, 0)
                break;
            case 90:
                newVec.set(block.sizeX, 0, 0)
                break;
            case 180:
                newVec.set(block.sizeX, 0, block.sizeZ)
                break;
            case 270:
                newVec.set(0, 0, block.sizeZ)
                break;
        }

        let wallNewVec = new THREE.Vector3();
        switch (rotationTable[rotation]) {
            case 0:
                wallNewVec.set(0, 0, 0)
                break;
            case 90:
                wallNewVec.set(0, 0, block.sizeX)
                break;
            case 180:
                wallNewVec.set(block.sizeX, 0, block.sizeZ)
                break;
            case 270:
                wallNewVec.set(block.sizeZ, 0, 0)
                break;
        }

        blockGroup.position.add(offset);
        blockGroup.rotation.y = rotationTable[rotation] * (Math.PI / 180);

        wallgroup.position.add(wallNewVec)
        wallgroup.position.add(offset);
        wallgroup.rotation.y = rotationTable[rotation] * (Math.PI / 180);

        newVec.multiplyScalar(-1);
        blockGroup.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.translate(newVec.x, newVec.y, newVec.z);
            }
        });

        group.add(wallgroup);
        group.add(blockGroup);
        window.scene.add(group);

        console.log(`Rendered block ${blockName}`);
    }
}
