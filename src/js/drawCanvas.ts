type Item = { name: string; r: number };
type Coordinate = { x: number; y: number };

export class Circle {
    id: string;
    data: {
        x: number;
        y: number;
        r: number;
        name: string;
    };
    edges: Record<string, number>;
    constructor(x: number, y: number, radius: number, name: string) {
        this.data = {
            x: x,
            y: y,
            r: radius,
            name: name,
        };
        this.id = name;
        this.edges = {};
    }
    addEdge(id: string, angle: number = 0) {
        this.edges[id] = angle;
    }
}

type GravityOptions =
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

export class DrawCanvas {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    scale: number;
    ctx: CanvasRenderingContext2D | null;
    items: { name: string; r: number }[];
    count: number;
    circles: Circle[];
    gravity: [number, number];
    dir: -1 | 1; // 1 = clockwise, -1 = counter-clockwise
    tilt: number; // angle of the canvas in degrees
    // debug
    currentItem: Item | null = null;

    constructor(
        width: number,
        height: number,
        canvas: HTMLCanvasElement,
        items: Item[],
        scale: number,
        gravity: GravityOptions = "top-left"
    ) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.count = items.length;
        this.ctx = this.canvas.getContext("2d");
        this.items = items; //.sort((a, b) => b.r - a.r); // sort items by radius descending
        this.circles = [];
        this.gravity = [
            gravity.split("-").includes("right")
                ? -1
                : gravity.split("-").includes("left")
                ? 1
                : 0,
            gravity.split("-").includes("bottom")
                ? -1
                : gravity.split("-").includes("top")
                ? 1
                : 0,
        ];
        this.dir = 1;
        this.tilt = 90; // default tilt angle in degrees
        this.currentItem = null;
        this.init(gravity);
    }

    private target = new EventTarget();

    dispatchCustomEvent(data: any) {
        const event = new CustomEvent("activeCircleChanged", { detail: data });
        this.target.dispatchEvent(event);
    }

    on(callback: (event: CustomEvent) => void) {
        this.target.addEventListener("activeCircleChanged", callback);
    }

    off(callback: (event: CustomEvent) => void) {
        this.target.removeEventListener("activeCircleChanged", callback);
    }

    init(gravity: GravityOptions) {
        console.log("init", gravity);
        switch (gravity) {
            case "left":
                this.gravity = [1, 0];
                this.dir = 1;
                break;
            case "right":
                this.gravity = [-1, 0];
                this.dir = -1;
                break;
            case "top":
                this.gravity = [0, 1];
                this.dir = 1;
                break;
            case "bottom":
                this.gravity = [0, -1];
                this.dir = 1;
                break;
            case "center":
                this.gravity = [0, 0];
                this.dir = 1;
                break;
            case "top-left":
                this.gravity = [1, 1];
                this.dir = 1;
                break;
            case "top-right":
                this.gravity = [-1, 1];
                this.dir = -1;
                break;
            case "bottom-left":
                this.gravity = [1, -1];
                this.dir = -1;
                break;
            case "bottom-right":
                this.gravity = [-1, -1];
                this.dir = 1;
                break;
            default:
                this.gravity = [0, 0];
                this.dir = 1;
        }
        this.setCanvasSize();
        this.createCircles();
        this.circles.forEach(async (circle) => {
            this.drawCircle(circle, "purple");
        });
        // this.canvas.addEventListener("click", this.handleClickedCircle);
        // this.drawLine(this.toRadians(this.tilt));
    }

    setCanvasSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createCircles() {
        for (let item of this.items) {
            const currentCircle = this.getPositionedCircle(item);
            this.lastCircle = currentCircle;
        }
    }

    getPositionedCircle(currentItem: Item): Circle {
        let currentCircle = this.lastCircle;
        if (!currentCircle) {
            currentCircle = this.getInitialCircle(currentItem);
            return currentCircle;
        }

        // return 2nd circle --> centered
        if (this.circles.length === 1) {
            const secondCircle = new Circle(
                currentCircle.data.x + currentCircle.data.r + currentItem.r,
                currentCircle.data.y,
                currentItem.r,
                currentItem.name
            );
            secondCircle.addEdge(
                currentCircle.id,
                Math.atan2(
                    currentCircle.data.y - secondCircle.data.y,
                    currentCircle.data.x - secondCircle.data.x
                )
            );
            currentCircle.addEdge(
                secondCircle.id,
                Math.atan2(
                    secondCircle.data.y - currentCircle.data.y,
                    secondCircle.data.x - currentCircle.data.x
                )
            );
            return secondCircle;
        }
        const nextCircle = this.getNextCircle(currentCircle, currentItem);
        return nextCircle;
    }

    getInitialCircle = (item: Item) => {
        const { r, name } = item;
        const x =
            this.width / 2 -
            (this.width / 2) * this.gravity[0] +
            r * this.gravity[0];
        const y = this.height / 2 - (this.height / 2) * this.gravity[1];

        const chord = this.getChord(this.tilt, r);
        const offset = this.getOffset(this.tilt, chord);

        const initialCircle = new Circle(
            x,
            y + offset * this.gravity[1],
            r,
            name
        );
        return initialCircle;
    };

    getCoordinates(circle1: Circle, circle2: Circle, r: number) {
        const [xA, yA] = [circle1.data.x, circle1.data.y];
        const [xB, yB] = [circle2.data.x, circle2.data.y];

        const initialAngle = Math.atan2(yB - yA, xB - xA);

        const a = circle2.data.r + r;
        const b = circle1.data.r + r;
        const c = Math.sqrt(Math.abs(xB - xA) ** 2 + Math.abs(yB - yA) ** 2);

        // law of cosines

        // a**2 = b**2+c**2-2*b*c * cos(alpha)
        // a**2 + 2*b*c * cos(alpha) = b**2+c**2
        // 2*b*c * cos(alpha) = b**2+c**2 - a**2
        // cos(alpha) = (b**2+c**2 - a**2) / (2*b*c)
        // alpha = acos(b**2+c**2 - a**2) / (2*b*c)

        const alpha = Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c));

        const [xC, yC] = [
            xA + b * Math.cos(initialAngle + alpha),
            yA + b * Math.sin(initialAngle + alpha),
        ];
        return [xC, yC];
    }

    getNextCircle(currentCircle: Circle, currentItem: Item): Circle {
        const counterCircles = this.circles.filter((c) => {
            return c.edges[currentCircle.id] !== undefined;
        });
        let counterCircle = counterCircles.reduce((last, c) => {
            return last.edges[currentCircle.id] > last.edges[currentCircle.id]
                ? c
                : last;
        }, counterCircles[0]);

        const neighbouringCircles = Object.keys(counterCircle.edges).map((id) =>
            this.circles.find((c) => c.id === id)
        );
        const stopper = neighbouringCircles
            .filter((c) => c.id !== currentCircle.id)
            .reduce((last, c) => {
                const currentDiff = this.radToPositive(
                    counterCircle.edges[currentCircle.id]
                );
                return currentDiff +
                    this.radToPositive(counterCircle.edges[last.id]) <
                    currentDiff + this.radToPositive(counterCircle.edges[c.id])
                    ? last
                    : c;
            }, neighbouringCircles[0]);
        console.log("currentItem", currentItem.name);
        console.log(
            "currentCircle",
            currentCircle.id,
            this.radToPositive(counterCircle.edges[currentCircle.id])
        );
        console.log("counterCircle", counterCircle.id);
        console.log(
            "counterCircle.edges",
            Object.entries(counterCircle.edges)
                .map(([id, v]) => `${id}: ${this.radToPositive(v)}`)
                .join(", ")
        );
        console.log("stopper", stopper.id);
        console.log("__________________________________");
        const { name, r } = currentItem;

        let [xC, yC] = this.getCoordinates(counterCircle, currentCircle, r);
        const distXNewStopper = xC - stopper.data.x;
        const distYNewStopper = yC - stopper.data.y;
        const colliding =
            Math.sqrt(distXNewStopper ** 2 + distYNewStopper ** 2) <
            r + stopper.data.r;
        if (colliding) {
            counterCircle = stopper;
            [xC, yC] = this.getCoordinates(counterCircle, currentCircle, r);
        }
        const nextCircle = new Circle(xC, yC, r, name);
        nextCircle.addEdge(
            currentCircle.id,
            Math.atan2(
                currentCircle.data.y - nextCircle.data.y,
                currentCircle.data.x - nextCircle.data.x
            )
        );
        currentCircle.addEdge(
            nextCircle.id,
            Math.atan2(
                nextCircle.data.y - currentCircle.data.y,
                nextCircle.data.x - currentCircle.data.x
            )
        );
        nextCircle.addEdge(
            counterCircle.id,
            Math.atan2(
                counterCircle.data.y - nextCircle.data.y,
                counterCircle.data.x - nextCircle.data.x
            )
        );
        counterCircle.addEdge(
            nextCircle.id,
            Math.atan2(
                nextCircle.data.y - counterCircle.data.y,
                nextCircle.data.x - counterCircle.data.x
            )
        );
        return nextCircle;
    }

    handleClickedCircle = (e: MouseEvent) => {
        console.log("handleClickedCircle", e);
        // this.clearRect();

        const factor = this.width / this.canvas.offsetWidth;
        const clickedCircle = this.circles.find((c) => {
            const distX = Math.abs(c.data.x - e.offsetX * factor);
            const distY = Math.abs(c.data.y - e.offsetY * factor);
            const dist = Math.sqrt(distX ** 2 + distY ** 2);
            return dist < c.data.r;
        });
        if (!clickedCircle)
            return this.circles.forEach((c) => this.drawCircle(c, "purple"));
        this.dispatchCustomEvent({ target: clickedCircle.data.name });
    };

    get lastCircle() {
        return this.circles[this.circles.length - 1];
    }

    set lastCircle(circle) {
        this.circles.push(circle);
    }

    get canvasSize() {
        return Math.min(this.width, this.height);
    }

    drawCircle(circle: Circle, outline: string = "black") {
        if (!this.ctx) return;
        const { x, y, r, name } = circle.data;

        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, r - 4, 0, Math.PI * 2);
        this.ctx.strokeStyle = outline;
        this.ctx.lineWidth = 8;
        this.ctx.stroke();
        this.ctx.font = "72px serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = outline;
        this.ctx.fillText(name, x, y);
        this.ctx.closePath();
    }

    clearRect() {
        console.log("clearRect");
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawLine(start: Coordinate, end: Coordinate) {
        console.log("drawLine", start, end);
        this.ctx.beginPath();
        this.ctx.moveTo(start[0], start[1]);

        // Set an end-point
        this.ctx.lineTo(end[0], end[1]);

        // Stroke it (Do the Drawing)
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    toRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }
    toDegrees(radians: number) {
        return radians * (180 / Math.PI);
    }
    radToPositive(radians: number) {
        return (2 * Math.PI + radians) % (2 * Math.PI);
    }
    getOffset(alpha: number, chord: number): number {
        /** SINUSSATZ
         *
         *   a       b
         * ––––– = –––––
         * sin(α)  sin(β)
         *
         * b = (sin(β) / sin(α)) * a
         */
        const beta = 90;
        return (
            (Math.sin(this.toRadians(beta)) /
                Math.sin(this.toRadians(alpha) / 2)) *
            (chord / 2)
        );
    }

    getChord(alpha: number, r: number) {
        return 2 * r * Math.cos(this.toRadians(alpha) / 2);
    }

    // window.addEventListener('resize', setCanvasSize);
}
