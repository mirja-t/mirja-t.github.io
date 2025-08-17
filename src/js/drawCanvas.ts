// @ts-ignore
import ICONS from "./icons.js";
import { getFilledSvgUrl } from "./modifySvg";

type Item = { name: string; r: number };
type Coordinate = { x: number; y: number };
type TurningPoint = {
    x: number;
    y: number;
    r: number;
};

export class Circle {
    id: string;
    data: {
        x: number;
        y: number;
        r: number;
        name: string;
    };
    edges: Record<string, boolean>;
    constructor(x: number, y: number, radius: number, name: string) {
        this.data = {
            x: x,
            y: y,
            r: radius,
            name: name,
        };
        this.edges = {};
    }
    addEdge(id: string) {
        this.edges[id] = true;
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
        this.items = items.sort((a, b) => b.r - a.r); // sort items by radius descending
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
        this.circles.forEach(async (circle) =>
            this.drawCircle(circle, "red", true)
        );
        // this.canvas.addEventListener("click", this.handleClickedCircle);
        // this.drawLine(this.toRadians(this.tilt));
    }

    setCanvasSize() {
        console.log("setCanvasSize");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createCircles() {
        console.log("createCircles");
        const initCircles = (idx: number) => {
            if (idx > this.count - 1) return;
            const currentItem = this.items.shift();
            if (!currentItem) return;
            const currentCircle = this.getPositionedCircle(currentItem);
            this.lastCircle = currentCircle;

            initCircles(idx + 1);
        };

        initCircles(0);
    }

    getPositionedCircle(currentItem: Item): Circle {
        console.log("getPositionedCircle", currentItem);
        this.currentItem = currentItem;

        const initialCircle = this.getInitialCircle(currentItem);

        // return initial circle when item is first
        if (this.circles.length === 0) {
            return initialCircle;
        }

        // return 2nd circle
        if (this.circles.length === 1) {
            const distX = Math.sqrt(
                (initialCircle.data.r + currentItem.r) ** 2 -
                    (initialCircle.data.r - currentItem.r) ** 2
            );
        }

        const radius = currentItem.r;
        // const setLineEnd = (angle, start = 0, dir = 1) => {
        //     const line = document.getElementById("rad");

        //     const startRad = Math.PI * start;
        //     const alpha = ((angle / 180) * Math.PI + startRad) * dir;
        //     const x1 = parseFloat(line.getAttribute("x1"));
        //     const y1 = parseFloat(line.getAttribute("y1"));
        //     const x = 50 * Math.cos(alpha) + x1;
        //     const y = 50 * Math.sin(alpha) + y1;
        //     line.setAttribute("x2", x);
        //     line.setAttribute("y2", y);
        // };

        // const angle = 90;
        // const start = -3 / 4;
        // setLineEnd(angle, start, -1);

        // const turningPoints = this.getTurningPoints(radius);

        // const nextTurningPoint = turningPoints.reduce(
        //     (tp1, tp2) => {
        //         // return the turning point with the y coordinate closest to the baseline
        //         if (this.gravity[1] === -1) {
        //             return tp1.y > tp2.y ? tp1 : tp2;
        //         }
        //         return tp2.y < tp1.y ? tp2 : tp1;
        //     },
        //     {
        //         x: this.width - radius,
        //         y: this.gravity[1] === 1 ? this.height - radius : radius,
        //     }
        // );
        // const currentCircle = new Circle(
        //     nextTurningPoint.x,
        //     nextTurningPoint.y,
        //     radius,
        //     currentItem.name
        // );

        // return currentCircle;
    }

    createInitialRightCircle = (r: number, counterCircle: Circle): Circle => {
        console.log("createInitialRightCircle", r, counterCircle);
        const { x: counterX, y: counterY, r: counterR } = counterCircle.data;
        let y =
            this.gravity[1] === 1 ? counterY : this.canvas.height - counterY; // set initial y position to top or bottom of canvas depending on gravity
        const initialX =
            counterX +
            Math.sqrt(
                // distX
                Math.abs(
                    (counterR + r) ** 2 - // hypothenuse --> C²
                        Math.abs((y - r) ** 2) // offset center countercircle and initial Circle
                )
            );
        let x = initialX;
        y = this.gravity[1] === 1 ? 0 : this.canvas.height; // set initial y position to top or bottom of canvas depending on gravity
        if (counterX + counterR + r * 2 > this.canvas.width) {
            const hypothenuse = counterR + r;
            const a = this.canvas.width - r - counterX;
            const h = Math.sqrt(hypothenuse ** 2 - a ** 2);
            x = this.canvas.width;
            y = counterY + h * this.gravity[1]; // adjust y position based on hypothenuse
        }
        return new Circle(x, y, 0, "");
    };

    createInitialOuterCircles = (r: number, currentCircle: Circle): Circle => {
        console.log("createInitialOuterCircles", r, currentCircle);
        const { x: currentX, y: currentY, r: currentR } = currentCircle.data;

        // initially set the position to gravity
        let y = this.height / 2 - (this.height / 2) * this.gravity[1]; // set initial y position to top or bottom of canvas depending on gravity
        let x = this.width / 2 - (this.width / 2) * this.gravity[0];

        const offset =
            Math.sqrt(
                // distX
                Math.abs(
                    (currentR + r) ** 2 - // hypothenuse --> C²
                        Math.abs(currentR - r) ** 2
                )
            ) * this.gravity[0]; // set initial x position to right or left of counterCircle depending on gravity
        this.drawCircle(new Circle(currentX + offset, y, 5, "")); // x
        this.drawCircle(new Circle(x, currentY + offset, 5, "")); // y
        return new Circle(x, y, 0, "");
    };

    createInitialTurningPoint = (outmostLeftCircle: Circle, r: number) => {
        console.log("createInitialTurningPoint", outmostLeftCircle, r);
        const {
            x: outmostX,
            y: outmostY,
            r: outmostR,
        } = outmostLeftCircle.data;
        const dist = outmostR + r;
        const a = Math.abs(outmostX - r);
        const h = Math.sqrt(dist ** 2 - a ** 2);
        const y = this.gravity[1] === 1 ? outmostY + h : outmostY - h;
        return {
            x: r,
            y,
            r,
            name: "",
        };
    };

    getInitialCircle = (item: Item) => {
        console.log("getInitialCircle", item);
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

    getNextCircle(
        currentCircle: Circle,
        r: number,
        circles: Circle[] = this.circles
    ): Circle {
        console.log("getNextCircle", currentCircle, r, circles);
        const { x: currentCircleX, y: currentCircleY } = currentCircle.data;
        const neighbouringRight = circles
            .filter((c) => {
                // filter out Circles that are left of current Circle
                return c.data.x > currentCircle.data.x;
            })
            .filter((c) => {
                // filter the neighbouring Circles that stop the incoming Circle from dropping through
                const maxDist = currentCircle.data.r + r * 2 + c.data.r;
                const dist = Math.sqrt(
                    Math.abs(c.data.x - currentCircleX) ** 2 +
                        Math.abs(c.data.y - currentCircleY) ** 2
                );
                return dist <= maxDist + 1;
            });

        const nextCircle = neighbouringRight.reduce(
            (outmost: Circle, current: Circle) => {
                const turningPointCurrent = this.getTurningPoint(
                    r,
                    currentCircle,
                    current
                );
                const turningPointOutmost = this.getTurningPoint(
                    r,
                    currentCircle,
                    outmost
                );
                const angleCurrent = Math.atan2(
                    turningPointCurrent.y - currentCircleY,
                    turningPointCurrent.x - currentCircleX
                );
                const angleOutmost = Math.atan2(
                    turningPointOutmost.y - currentCircleY,
                    turningPointOutmost.x - currentCircleX
                );
                if (this.gravity[1] === -1) {
                    return angleOutmost < angleCurrent ? outmost : current;
                }
                return angleOutmost > angleCurrent ? outmost : current; // return the Circle with the biggest radians from currentCircle center point
            },
            // if there is no neighbouring Circle, create a new one
            this.createInitialRightCircle(r, currentCircle)
        );

        return nextCircle;
    }

    getTurningPoint(
        r: number,
        leftCircle: Circle,
        rightCircle: Circle
    ): Coordinate {
        console.log("getTurningPoint", r, leftCircle, rightCircle);
        const {
            x: leftCircleX,
            y: leftCircleY,
            r: leftCircleR,
        } = leftCircle.data;
        const {
            x: rightCircleX,
            y: rightCircleY,
            r: rightCircleR,
        } = rightCircle.data;
        const distX = rightCircleX - leftCircleX; // always positive
        const distY = rightCircleY - leftCircleY;
        const angleAtC = Math.atan2(distY, distX); // angle between a (dist c1-c2 center points) and x axis in radians
        const a = Math.sqrt(distX ** 2 + Math.abs(distY) ** 2); // distance between Circle1 and Circle2 center points
        const b = leftCircleR + r; // distance between Circle1 center point and incoming Circle center point
        const c = rightCircleR + r; // distance between Circle2 center point and incoming Circle center point
        const gamma = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b)); // angle between a and b at left Circle center point (in radians)

        // right triangle
        // a = x
        // b = y
        // a = c * sin(α)
        const absRad =
            this.gravity[1] === 1 ? angleAtC + gamma : angleAtC - gamma;
        // const absRad = gamma + angleAtC; // angle between x axis and line from Circle1 center point to incoming Circle center point
        let x = b * Math.cos(absRad) + leftCircleX; // x coordinate of incoming Circle center point
        let y = b * Math.sin(absRad) + leftCircleY;

        if (x < r) {
            // if the x coordinate is less than the radius, set it to the radius
            // this prevents the Circle from being drawn outside of the canvas
            x = r;
            y =
                rightCircleY +
                Math.sqrt(c ** 2 - (rightCircleX - r) ** 2) * this.gravity[1]; // recalculate y position based on x position
        }
        return { x, y };
    }

    // getTurningPoints(r: number): TurningPoint[] {
    //     console.log("getTurningPoints", r);
    //     let circles: Circle[] = this.circles;
    //     const initialCircle = this.getInitialCircle(r);
    //     let currentCircle: Circle | undefined = initialCircle.data.name
    //         ? initialCircle
    //         : undefined;
    //     console.log("initialCircle", initialCircle);
    //     // let currentCircle: Circle | undefined =
    //     // this.circles[0] ||
    //     // new Circle(
    //     //     this.gravity[0] === -1
    //     //         ? this.width - r
    //     //         : this.gravity[0] === 1
    //     //         ? r
    //     //         : this.width / 2,
    //     //     this.gravity[1] === -1
    //     //         ? this.height - r
    //     //         : this.gravity[1] === 1
    //     //         ? r
    //     //         : this.height / 2,
    //     //     r,
    //     //     ""
    //     // );

    //     const turningPoints: TurningPoint[] = [];
    //     if (!currentCircle) {
    //         return turningPoints;
    //     }
    //     let nextCircle = this.getNextCircle(currentCircle, r, circles);
    //     do {
    //         const turningPoint = this.getTurningPoint(
    //             r,
    //             currentCircle,
    //             nextCircle
    //         );
    //         turningPoints.push({
    //             ...turningPoint,
    //             r: currentCircle.data.r,
    //         });
    //         currentCircle = nextCircle;
    //         nextCircle = this.getNextCircle(currentCircle, r, circles);
    //     } while (!!currentCircle.data.name);

    //     const nonOverlappingTPs = turningPoints.filter((tp) => {
    //         // filter out overlapping turning points
    //         return this.circles.every((c) => {
    //             // why is the current item already in the Circles?
    //             const distY = Math.abs(tp.y - c.data.y);
    //             const distX = Math.abs(tp.x - c.data.x);
    //             const dist = Math.sqrt(distX ** 2 + distY ** 2);
    //             return dist + 1 > r + c.data.r; // +1 to prevent floating point errors
    //         });
    //     });
    //     return nonOverlappingTPs;
    // }

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
            return this.circles.forEach((c) => this.drawImage(c));
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

    drawCircle(circle: Circle, color: string = "black", outline = false) {
        console.log("drawCircle", circle, color, outline);
        if (!this.ctx) return;
        const { x, y, r } = circle.data;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        outline ? this.ctx.stroke() : this.ctx.fill();
        this.ctx.closePath();
    }

    async drawImage(circle: Circle, scale: number = 1) {
        console.log("drawImage", circle, scale);
        const img = new Image();
        const {
            x: circleX,
            y: circleY,
            r: circleR,
            name: circleName,
        } = circle.data;
        img.onload = () => {
            if (this.ctx)
                this.ctx.drawImage(
                    img,
                    circleX - circleR,
                    circleY - circleR,
                    circleR * 2 * scale,
                    circleR * 2 * scale
                );
            URL.revokeObjectURL(img.src);
        };
        try {
            img.src = await getFilledSvgUrl(ICONS, circleName, "hotpink");
        } catch (error) {
            console.log("Error loading image:", error);
            img.src = "";
        }
    }

    clearRect() {
        console.log("clearRect");
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawLine(alpha: number = 90, dist: number = this.width) {
        console.log("drawLine", alpha, dist);
        this.ctx.beginPath();

        // Set a start-point
        const startX = this.width / 2 - (this.width / 2) * this.gravity[0];
        const startY = this.height / 2 - (this.height / 2) * this.gravity[1];
        this.ctx.moveTo(startX, startY);

        const endX = startX + dist * this.gravity[0] * Math.sin(alpha);
        const endY = startY + dist * this.gravity[1] * Math.cos(alpha);

        // Set an end-point
        this.ctx.lineTo(endX, endY);

        // Stroke it (Do the Drawing)
        this.ctx.strokeStyle = "blue";
        this.ctx.stroke();
    }

    toRadians(degrees: number) {
        console.log("toRadians", degrees);
        return degrees * (Math.PI / 180);
    }
    getOffset(alpha: number, chord: number): number {
        console.log("getOffset", alpha, chord);
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
        console.log("getChord", alpha, r);
        return 2 * r * Math.cos(this.toRadians(alpha) / 2);
    }

    // window.addEventListener('resize', setCanvasSize);
}
