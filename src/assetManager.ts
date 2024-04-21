import * as THREE from "three";

import { BlockFile } from "./typings/blockFile";
import { BuildingFile } from "./typings/buildingFile";
import CSXFileParser from "./parsers/csxFileParser";
import { hud } from "./hud";

export default class AssetManager {

    public static textures: Map<string, THREE.Texture> = new Map();
    public static buildings: Map<string, BuildingFile> = new Map();
    public static blocks: Map<string, BlockFile> = new Map();

    private static textureLoader = new THREE.TextureLoader();

    public static loadTextureFromBuffer(buffer: ArrayBuffer, name: string): Promise<THREE.Texture | undefined> {
        return new Promise((resolve, reject) => {
            if (this.textures.has(name)) {
                resolve(this.textures.get(name));
            } else {
                this.textureLoader.load(
                    URL.createObjectURL(new Blob([buffer])),
                    (texture) => {
                        this.textures.set(name, texture);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            }
        });
    }

    public static async downloadCSXFiles() {
        const files = [
            "world.csx",
            "round.csx",
        ]

        const csxCache = await caches.open("csx")

        await Promise.all(files.map(async (file) => {

            const url = new URL(`https://assets.jpxs.io/csx/${file}`)
            const request = await csxCache.match(url)
            if (request) {
                hud.status = `Loading ${file} (cached) ...`;
                return new Promise<void>((resolve, reject) => {
                    request.arrayBuffer().then(async (buffer) => {
                        hud.status = `Parsing ${file}...`;
                        await CSXFileParser.load(buffer, file)
                        resolve();
                    });
                })
            } else {
                return new Promise<void>(async (resolve, reject) => {
                    hud.status = `Downloading ${file}...`;

                    await fetch(url)
                        .then((response) => response.arrayBuffer())
                        .then(async (buffer) => {

                            csxCache.put(url, new Response(buffer))

                            hud.status = `Parsing ${file}...`;
                            await CSXFileParser.load(buffer, file)
                            resolve();
                        });
                })
            }

        }))

        hud.deleteAllWorkers();

        hud.status = `Done, loaded ${this.textures.size} textures, ${this.buildings.size} buildings, and ${this.blocks.size} Blocks.`
    }
}
