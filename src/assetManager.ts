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

        for (const file of files) {
            if (localStorage.getItem(file)) continue;

           hud.status = `Downloading ${file}...`;
            await fetch(`https://assets.jpxs.io/csx/${file}`)
                .then((response) => response.arrayBuffer())
                .then((buffer) => {
                    // HUD.status = `Parsing ${file}...`;
                   CSXFileParser.load(buffer, file)
                });
        }

        hud.status = `Done, loaded ${this.textures.size} textures, ${this.buildings.size} buildings, and ${this.blocks.size} Blocks.`
    }
}