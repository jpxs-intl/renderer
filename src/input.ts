import * as THREE from "three";
import AssetManager from "./assetManager";
import BlockRenderer from "./renderers/blockRenderer";

export default class Input {

    public static currentText: string = "";
    public static currentSuggestions: string[] = [];
    public static currentSuggestionIndex: number = 0;

    public static handleKeypress(e: KeyboardEvent) {

        if (e.key.length > 1 && e.key != "Space" && e.key != "Backspace" && e.key != "Enter" && !e.key.includes("Arrow")) return;

        if (e.key === "Backspace") {
            Input.currentText = Input.currentText.slice(0, -1);
        } else if (e.key === "Space") {
            Input.currentText += " ";
        } else if (e.key == "Enter") {
            const result = Input.currentSuggestions[Input.currentSuggestionIndex];
            BlockRenderer.renderBlock(AssetManager.blocks.get(result)!, result);
            console.log(result);
            
        } else if (e.key.includes("Arrow")) {
            if (e.key === "ArrowUp") {
                Input.currentSuggestionIndex--;
            }

            if (e.key === "ArrowDown") {
                Input.currentSuggestionIndex++;
            }

            if (Input.currentSuggestionIndex < 0) Input.currentSuggestionIndex = Input.currentSuggestions.length - 1;
            if (Input.currentSuggestionIndex > Input.currentSuggestions.length - 1) Input.currentSuggestionIndex = 0;

            const result = Input.currentSuggestions[Input.currentSuggestionIndex];
            BlockRenderer.renderBlock(AssetManager.blocks.get(result)!, result);

        } else {
            Input.currentText += e.key;
        }

        this.currentSuggestions = Input.getSuggestions(Input.currentText);
        
    }

    public static getSuggestions(text: string): string[] {
        return Array.from(AssetManager.blocks.keys()).filter((key) => key.toLowerCase().includes(text.toLowerCase())).splice(0, 25);
    }

}

window.addEventListener("keydown", Input.handleKeypress.bind(Input));
