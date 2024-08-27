import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import AssetManager from "./assetManager";
import BlockRenderer from "./renderers/blockRenderer";
import BuildingRenderer from "./renderers/buildingRenderer";
import SBBFileParser from "./parsers/sbbFileParser";
import CityRenderer from "./renderers/cityRenderer";

export default class Input {

    public static currentText: string = "";
    public static currentSuggestions: string[] = [];
    public static currentSuggestionIndex: number = 0;
    public static currentMode: "block" | "building" | "map" = "block";
    public static modeList: ("block" | "building" | "map")[] = ["block", "building", "map"];
    public static rotation: number = 0;

    public static handleKeypress(e: KeyboardEvent) {

        if (e.ctrlKey) {
            if (e.key === "b") {
                // open file browser

                e.preventDefault();

                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = ".sbb";
                fileInput.click();

                fileInput.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files![0];
                    const buffer = await file.arrayBuffer();
                    const fileName = file.name.split(".")[0];
                    const building = SBBFileParser.load(buffer, fileName);
                    BuildingRenderer.renderBuilding(building, fileName);

                    console.log(building);
                }
            }

            if (e.key === "s") {
                // save to file
                e.preventDefault();

                const exporter = new GLTFExporter();
                exporter.parse(scene, (gltf) => {
                    const blob = new Blob([JSON.stringify(gltf)], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "model.gltf";
                    a.click();
                },
                    (error) => {
                        console.error(error);
                    });
            }
        }

        if (e.key.length > 1 && e.key != "Space" && e.key != "Backspace" && e.key != "Enter" && !e.key.includes("Arrow")) return;

        if (e.key === "Backspace") {
            Input.currentText = Input.currentText.slice(0, -1);
        } else if (e.key === "Space") {
            Input.currentText += " ";
        } else if (e.key == "Enter") {
            const result = Input.currentSuggestions[Input.currentSuggestionIndex];
            BlockRenderer.renderBlock(AssetManager.blocks.get(result)!, result, this.rotation);
            console.log(result);

        } else if (e.key.includes("Arrow")) {

            if (e.key === "ArrowLeft") {
                if (e.shiftKey) {
                    this.rotation = (this.rotation + 1) % 4;

                    const result = Input.currentSuggestions[Input.currentSuggestionIndex];
                    BlockRenderer.renderBlock(AssetManager.blocks.get(result)!, result, this.rotation);

                    console.log(this.rotation);
                    return
                } else {
                    Input.currentMode = Input.modeList[(Input.modeList.indexOf(Input.currentMode) - 1 + Input.modeList.length) % Input.modeList.length];
                    this.currentSuggestions = Input.getSuggestions(Input.currentText);
                    return
                }

            }

            if (e.key === "ArrowRight") {
                if (e.shiftKey) {
                    this.rotation = (Math.abs(this.rotation) - 1) % 4

                    const result = Input.currentSuggestions[Input.currentSuggestionIndex];
                    BlockRenderer.renderBlock(AssetManager.blocks.get(result)!, result, this.rotation);

                    console.log(this.rotation);
                    return
                } else {
                    Input.currentMode = Input.modeList[(Input.modeList.indexOf(Input.currentMode) + 1) % Input.modeList.length];
                    this.currentSuggestions = Input.getSuggestions(Input.currentText);
                    return
                }
            }

            if (e.key === "ArrowUp") {
                Input.currentSuggestionIndex--;
            }

            if (e.key === "ArrowDown") {
                Input.currentSuggestionIndex++;
            }

            if (Input.currentSuggestionIndex < 0) Input.currentSuggestionIndex = Input.currentSuggestions.length - 1;
            if (Input.currentSuggestionIndex > Input.currentSuggestions.length - 1) Input.currentSuggestionIndex = 0;

            const result = Input.currentSuggestions[Input.currentSuggestionIndex];
            switch (Input.currentMode) {
                case "block":
                    BlockRenderer.renderBlock(AssetManager.blocks.get(result)!, result, 0);
                    break;
                case "building":
                    BuildingRenderer.renderBuilding(AssetManager.buildings.get(result)!, result);
                    break;
                case "map":
                    CityRenderer.renderCity(AssetManager.maps.get(result)!);
                    break;
            }

        } else {
            Input.currentText += e.key;
        }

        this.currentSuggestions = Input.getSuggestions(Input.currentText);

    }

    public static getSuggestions(text: string): string[] {
        const keys = Array.from(AssetManager[`${Input.currentMode}s`].keys())
        return keys.filter((key) =>
            key &&
            key.toLowerCase().includes(text.toLowerCase())).splice(0, 25);
    }

}

window.addEventListener("keydown", Input.handleKeypress.bind(Input));
