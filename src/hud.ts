import Input from "./input";

export default class HUD {

    public canvas!: HTMLCanvasElement;
    public ctx!: CanvasRenderingContext2D;
    public lastFrame: number = 0;
    public workers: {
        [key: string]: {
            status: string,
            busy: boolean,
            lastUpdate?: number,
        }
    } = {};

    private _statusQueue: {
        text: string,
        addedAt: number,
    }[] = []

    constructor() {
        this.init();
    }

    public set status(value: string) {

        let lastTextValue = this._statusQueue[0]?.text;

        if (lastTextValue === value) {
            this._statusQueue[0].addedAt = Date.now();
            return;
        }

        this._statusQueue.unshift({
            text: value,
            addedAt: Date.now()
        });
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
        this.ctx.font = "10px monospace";
        this._statusQueue.forEach((status, index) => {
            if (Date.now() - status.addedAt > 5000) {
                this._statusQueue.pop();
                return;
            }

            const percentage = (Date.now() - status.addedAt) / 5000;
            const opacity = index > 20 ?
                (1 - ((index - 20) * 0.05)) * (percentage < 0.8 ? 1 : (1 - percentage) * 5)
                : percentage < 0.8 ? 1 : (1 - percentage) * 5;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity > 1 ? 1 : opacity})`;
            this.ctx.fillText(status.text, 10, window.innerHeight - 15 - (index * 15));
        })

        // workers
        this.ctx.font = "10px monospace";
        this.ctx.fillStyle = "#FFFFFF";
        let workerIndex = 0;
        for (const workerId in this.workers) {
            const worker = this.workers[workerId];

            this.ctx.fillStyle = worker.busy ? "#FF0000" : "#00FF00";
            this.ctx.fillText(`Worker ${workerId}: ${worker.status}`, window.innerWidth - 10 - this.ctx.measureText(`Worker ${workerId}: ${worker.status}`).width, window.innerHeight - 15 - (workerIndex * 15));

            if (worker.lastUpdate && Date.now() - worker.lastUpdate > 5000) {
                delete this.workers[workerId];
            }

            workerIndex++;
        }


        this.lastFrame = renderTime;
    }

    public updateWorkerStatus(workerId: string, status: string) {
        this.workers[workerId] = {
            status,
            busy: true,
        }
    }

    public clearWorkerStatus(workerId: string) {
        if (this.workers[workerId]) {
            this.workers[workerId].busy = false;
        }
    }

    public getWorkerId() {
        let id = 0;
        while (this.workers[id]) {
            id++;
        }
        this.workers[id.toString()] = {
            status: "idle",
            busy: false,
            lastUpdate: Date.now(),
        }
        return id.toString();
    }

    public deleteWorker(workerId: string) {
        delete this.workers[workerId];
    }

    public deleteAllWorkers() {
        this.workers = {};
    }

}

export const hud = new HUD();

