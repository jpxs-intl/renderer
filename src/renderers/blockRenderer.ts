import * as THREE from "three";
import { BlockFile } from "../typings/blockFile";
import BezierSurface from "./beizerSurface";
import { hud } from "../hud";


export default class BlockRenderer {

    public static renderBlock(block: BlockFile, blockName: string) {

        const oldGroup = window.scene.getObjectByName("currentRender")
        if (oldGroup) {
            window.scene.remove(oldGroup)
        }

        const group = new THREE.Group()
        group.name = "currentRender"

        const colors = [
            0xff0000,
            0x00ff00,
            0x0000ff,
            0xffff00,
            0xff00ff,
            0x00ffff,
            0x7f0000,
            0x007f00,
            0x00007f,
            0x7f7f00,
            0x7f007f,
            0x007f7f,
            0x7f7f7f,
        ]

        // for (const surface of block.surfaces) {
        //   for (let surfL = 0; surfL < 4; surfL++) {
        //     for (let surfW = 0; surfW < 4; surfW++) {
        //       const surfaceData = surface.data[surfL][surfW];
        //       const vertexMarker = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        //       const vertexMarkerMaterial = new THREE.MeshBasicMaterial({
        //         color: 0x00ff00,
        //       });
        //       const vertexMarkerMesh = new THREE.Mesh(vertexMarker, vertexMarkerMaterial);
        //       vertexMarkerMesh.position.set(
        //         adjustVec.x + surfaceData.vertex[0],
        //         adjustVec.y + surfaceData.vertex[1],
        //         adjustVec.z + surfaceData.vertex[2]
        //       );
        //       Main.scene.add(vertexMarkerMesh);
        //     }
        //   }
        // }


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
                    color: colors[index],
                    side: THREE.DoubleSide,
                });
                const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                boxGroup.add(planeMesh);
            })

            group.add(boxGroup);

            box.vertices.forEach((vertex) => {
                const vertexMarker = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const vertexMarkerMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                });
                const vertexMarkerMesh = new THREE.Mesh(vertexMarker, vertexMarkerMaterial);
                vertexMarkerMesh.position.set(
                    vertex[0],
                    vertex[1],
                    vertex[2]
                );
                // group.add(vertexMarkerMesh);
            })

            // let highestVertex = [-Infinity, -Infinity, -Infinity];
            // let lowestVertex = [Infinity, Infinity, Infinity];
            // for (const vertex of box.vertices) {
            //   if (vertex[0] > highestVertex[0] || vertex[1] > highestVertex[1] || vertex[2] > highestVertex[2]) {
            //     highestVertex = [...vertex];
            //   }
            //   if (vertex[0] < lowestVertex[0] || vertex[1] < lowestVertex[1] || vertex[2] < lowestVertex[2]) {
            //     lowestVertex = [...vertex];
            //   }
            // }
            // let minVec = new THREE.Vector3(lowestVertex[0], lowestVertex[1], lowestVertex[2]);
            // let maxVec = new THREE.Vector3(highestVertex[0], highestVertex[1], highestVertex[2]);
            // let dimensions = new THREE.Vector3().subVectors(maxVec, minVec);
            // //if(tile.buildBlock.search("stairwell") != -1)
            // //console.log(maxVec, minVec, tile.buildBlock)
            // const boxGeo = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
            // const matrix = new THREE.Matrix4().setPosition(
            //   dimensions.addVectors(minVec, maxVec).multiplyScalar(0.5).add(adjustVec)
            // );
            // boxGeo.applyMatrix4(matrix);
            // const material = new THREE.MeshBasicMaterial({
            //   color: Utils.getColorFromString(blockName),
            // });
            // const mesh = new THREE.Mesh(boxGeo, material);
            // Main.scene.add(mesh);
        }

        let surfaces = block.surfaces.map((surface) => {
            return BezierSurface.fromBlockSurface(surface, 0xffffff);
        });

        surfaces.forEach((surface) => {
            group.add(surface);
        });

        window.scene.add(group);

        console.log(`Rendered block ${blockName}`);
    }
}
