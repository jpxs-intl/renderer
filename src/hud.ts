import Input from "./input";

export default class HUD {

    public canvas!: HTMLCanvasElement;
    public ctx!: CanvasRenderingContext2D;
    public lastFrame: number = 0;
    public status: string = "";

    constructor() {
        this.init();
    }

    public init() {
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        document.body.appendChild(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return canvas;
    }

    public updateDebugInfo(renderTime: number) {

        this.ctx.font = "20px monospace";
        this.ctx.fillStyle = "#FFFFFF";

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillText(`FPS: ${(1000 / (renderTime - this.lastFrame)).toFixed(2)}`, 10, 30);

        // search suggestions
        this.ctx.fillText(Input.currentText, 10, 60);

        Input.currentSuggestions.forEach((suggestion, index) => {
            this.ctx.fillStyle = index === Input.currentSuggestionIndex ? "#00FF00" : "#FFFFFF";
            this.ctx.fillText(suggestion, 10, 90 + (index * 30));
        });

        this.ctx.fillStyle = "#FFFFFF";

        // mode
        Input.modeList.forEach((mode, index) => {
            this.ctx.fillStyle = mode === Input.currentMode ? "#00FF00" : "#FFFFFF";
            this.ctx.fillText(mode, window.innerWidth - 10 - this.ctx.measureText(mode).width, 30 + (index * 30));
        })

        this.ctx.fillStyle = "#FFFFFF";

        // status
        this.ctx.fillText(this.status, 10, this.canvas.height - 10);



        this.lastFrame = renderTime;
    }
}

export const hud = new HUD();

