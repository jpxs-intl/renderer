import * as THREE from "three";
import { BlockFile } from "../typings/blockFile";
import BezierSurface from "./beizerSurface";
import { hud } from "../hud";


export default class BlockRenderer {

    public static renderBlock(block: BlockFile, blockName: string, group?: THREE.Group, textures?: string[] ,offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {

        if (!group) {
            const oldGroup = window.scene.getObjectByName("currentRender")
            if (oldGroup) {
                window.scene.remove(oldGroup)
            }

            group = new THREE.Group()
            group.name = "currentRender"
        }

        const colors = [
            0xff0000,
            0x00ff00,
            0x0000ff,
            0xffff00,
            0xff00ff,
            0x00ffff,
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
                    verts[vertIndex] = box.vertices[vertexId][0] + offset.x;
                    verts[vertIndex + 1] = box.vertices[vertexId][1] + offset.y;
                    verts[vertIndex + 2] = box.vertices[vertexId][2] + offset.z;
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


        }

        let surfaces = block.surfaces.map((surface) => {
            return BezierSurface.fromBlockSurface(surface, 0xffffff);
        });

        surfaces.forEach((surface) => {
            surface.position.add(offset);
            group!.add(surface);
        });

        window.scene.add(group);

        console.log(`Rendered block ${blockName}`);
    }
}
