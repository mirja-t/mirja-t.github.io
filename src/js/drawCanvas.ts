// @ts-ignore
import ICONS from "./icons.js";
import { getFilledSvgUrl } from "./modifySvg";

type Item = { name: string; r: number };
type Circle = { x: number; y: number; r: number; name: string };
type Coordinate = { x: number; y: number };
type TurningPoint = {
    x: number;
    y: number;
    leftbound: Circle;
    rightbound: Circle;
    r: number;
};

export class DrawCanvas {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    scale: number;
    ctx: CanvasRenderingContext2D | null;
    items: { name: string; r: number }[];
    count: number;
    circles: Circle[];
    circlesMap: Record<string, TurningPoint> = {};
    gravity: number;
    // debug
    currentItem: Item | null = null;

    constructor(
        width: number,
        height: number,
        canvas: HTMLCanvasElement,
        items: Item[],
        scale: number,
        gravity: "top" | "bottom" = "top"
    ) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.count = items.length;
        this.ctx = this.canvas.getContext("2d");
        this.items = items; //.sort((a, b) => b.r - a.r); // sort items by radius descending
        this.circles = [];
        this.gravity = gravity === "bottom" ? -1 : 1;
        this.circlesMap = {};
        this.currentItem = null;
        this.init();
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

    init() {
        this.setCanvasSize();
        this.createCircles();
        this.circles.forEach(async (circle) => await this.drawImage(circle));
        this.canvas.addEventListener("click", this.handleClickedCircle);
        console.log(this.circlesMap);
    }

    setCanvasSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createCircles() {
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
        this.currentItem = currentItem;
        const radius = currentItem.r;
        const turningPoints = this.getTurningPoints(radius);

        const nextTurningPoint = turningPoints.reduce(
            (tp1, tp2) => {
                // return the turning point with the y coordinate closest to the baseline
                if (this.gravity === -1) {
                    return tp1.y > tp2.y ? tp1 : tp2;
                }
                return tp2.y < tp1.y ? tp2 : tp1;
            },
            {
                x: this.width - radius,
                y: this.gravity === 1 ? this.height - radius : radius,
            }
        );
        const currentCircle = {
            x: nextTurningPoint.x,
            y: nextTurningPoint.y,
            r: radius,
            name: currentItem.name,
        };

        return currentCircle;
    }

    createInitialRightCircle = (r: number, counterCircle: Circle) => {
        let y =
            this.gravity === 1
                ? counterCircle.y
                : this.canvas.height - counterCircle.y; // set initial y position to top or bottom of canvas depending on gravity
        const initialX =
            counterCircle.x +
            Math.sqrt(
                // distX
                Math.abs(
                    (counterCircle.r + r) ** 2 - // hypothenuse --> C²
                        Math.abs((y - r) ** 2) // offset center countercircle and initial circle
                )
            );
        let x = initialX;
        y = this.gravity === 1 ? 0 : this.canvas.height; // set initial y position to top or bottom of canvas depending on gravity
        if (counterCircle.x + counterCircle.r + r * 2 > this.canvas.width) {
            const hypothenuse = counterCircle.r + r;
            const a = this.canvas.width - r - counterCircle.x;
            const h = Math.sqrt(hypothenuse ** 2 - a ** 2);
            x = this.canvas.width;
            y = counterCircle.y + h * this.gravity; // adjust y position based on hypothenuse
        }
        return { x, y, r: 0, name: "" };
    };

    createInitialTurningPoint = (outmostLeftCircle: Circle, r: number) => {
        const dist = outmostLeftCircle.r + r;
        const a = Math.abs(outmostLeftCircle.x - r);
        const h = Math.sqrt(dist ** 2 - a ** 2);
        const y =
            this.gravity === 1
                ? outmostLeftCircle.y + h
                : outmostLeftCircle.y - h;
        return {
            x: r,
            y,
            r,
            name: "",
        };
    };
    getInitialCircle = (r: number) => {
        const leftCircles = this.circles.filter((c) => {
            // find circles that hold the incoming circle to the left boundary
            return c.x - c.r <= r;
        });
        const initialLeftCircle = leftCircles.reduce(
            (outmost: Circle, current: Circle) => {
                if (this.gravity === -1) {
                    return current.y < outmost.y ? current : outmost;
                }
                return current.y > outmost.y ? current : outmost;
            },
            {
                x: r,
                y: this.gravity === 1 ? 0 : this.canvas.height,
                r: 0,
                name: "",
            }
        );
        return initialLeftCircle;
    };

    getNextCircle(
        currentCircle: Circle,
        r: number,
        circles: Circle[] = this.circles
    ): Circle {
        const neighbouringRight = circles
            .filter((c) => {
                // filter out circles that are left of current circle
                return c.x > currentCircle.x;
            })
            .filter((c) => {
                // filter the neighbouring circles that stop the incoming circle from dropping through
                const maxDist = currentCircle.r + r * 2 + c.r;
                const dist = Math.sqrt(
                    Math.abs(c.x - currentCircle.x) ** 2 +
                        Math.abs(c.y - currentCircle.y) ** 2
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
                    turningPointCurrent.y - currentCircle.y,
                    turningPointCurrent.x - currentCircle.x
                );
                const angleOutmost = Math.atan2(
                    turningPointOutmost.y - currentCircle.y,
                    turningPointOutmost.x - currentCircle.x
                );
                if (this.gravity === -1) {
                    return angleOutmost < angleCurrent ? outmost : current;
                }
                return angleOutmost > angleCurrent ? outmost : current; // return the circle with the biggest radians from currentCircle center point
            },
            // if there is no neighbouring circle, create a new one
            this.createInitialRightCircle(r, currentCircle)
        );

        return nextCircle;
    }

    getTurningPoint(
        r: number,
        leftCircle: Circle,
        rightCircle: Circle
    ): Coordinate {
        const distX = rightCircle.x - leftCircle.x; // always positive
        const distY = rightCircle.y - leftCircle.y;
        const angleAtC = Math.atan2(distY, distX); // angle between a (dist c1-c2 center points) and x axis in radians
        const a = Math.sqrt(distX ** 2 + Math.abs(distY) ** 2); // distance between circle1 and circle2 center points
        const b = leftCircle.r + r; // distance between circle1 center point and incoming circle center point
        const c = rightCircle.r + r; // distance between circle2 center point and incoming circle center point
        const gamma = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b)); // angle between a and b at left circle center point (in radians)

        // right triangle
        // a = x
        // b = y
        // a = c * sin(α)
        const absRad = this.gravity === 1 ? angleAtC + gamma : angleAtC - gamma;
        // const absRad = gamma + angleAtC; // angle between x axis and line from circle1 center point to incoming circle center point
        let x = b * Math.cos(absRad) + leftCircle.x; // x coordinate of incoming circle center point
        let y = b * Math.sin(absRad) + leftCircle.y;

        if (x < r) {
            // if the x coordinate is less than the radius, set it to the radius
            // this prevents the circle from being drawn outside of the canvas
            x = r;
            y =
                rightCircle.y +
                Math.sqrt(c ** 2 - (rightCircle.x - r) ** 2) * this.gravity; // recalculate y position based on x position
        }
        return { x, y };
    }

    getTurningPoints(r: number): TurningPoint[] {
        let circles: Circle[] = this.circles;
        const initialCircle = this.getInitialCircle(r);
        let currentCircle: Circle | undefined = initialCircle.name
            ? initialCircle
            : undefined;
        const turningPoints: TurningPoint[] = [
            {
                ...this.createInitialTurningPoint(initialCircle, r),
                leftbound: initialCircle,
                rightbound: undefined,
                r,
            },
        ];
        if (!currentCircle) {
            return turningPoints;
        }
        let nextCircle = this.getNextCircle(currentCircle, r, circles);
        let counter = 0;
        do {
            const turningPoint = this.getTurningPoint(
                r,
                currentCircle,
                nextCircle
            );
            turningPoints.push({
                ...turningPoint,
                leftbound: { ...currentCircle },
                rightbound: { ...nextCircle },
                r: currentCircle.r,
            });
            currentCircle = nextCircle;
            nextCircle = this.getNextCircle(currentCircle, r, circles);
            counter++;
        } while (currentCircle.name);

        const nonOverlappingTPs = turningPoints.filter((tp) => {
            // filter out overlapping turning points
            return this.circles.every((c) => {
                // why is the current item already in the circles?
                const distY = Math.abs(tp.y - c.y);
                const distX = Math.abs(tp.x - c.x);
                const dist = Math.sqrt(distX ** 2 + distY ** 2);
                return dist + 1 > r + c.r; // +1 to prevent floating point errors
            });
        });
        return nonOverlappingTPs;
    }

    getBounds(currentCircle: Circle) {
        const isClose = (left: Circle, right: Circle): boolean => {
            const maxDist = left.r + currentCircle.r * 2 + right.r;
            const dist = Math.sqrt(
                Math.abs(right.x - left.x) ** 2 +
                    Math.abs(right.y - left.y) ** 2
            );
            return dist <= maxDist + 1;
        };
        // find bounds
        const {
            leftbound: { name: leftboundName },
            rightbound: { name: rightboundName },
        } = this.circlesMap[currentCircle.name];
        let leftbound = this.circles.find((c) => c.name === leftboundName);
        let rightbound = this.circles.find((c) => c.name === rightboundName);
        leftbound =
            leftbound ||
            this.createInitialTurningPoint(
                this.getInitialCircle(currentCircle.r),
                currentCircle.r
            );
        rightbound =
            rightbound ||
            this.createInitialRightCircle(currentCircle.r, leftbound);

        if (isClose(leftbound, rightbound)) {
            return [leftbound, rightbound];
        }

        const bounds = [leftbound, rightbound];
        let currentLeft = leftbound;
        let currentRight = rightbound;
        do {
            currentLeft = this.circles.find(
                (c) =>
                    c.name === this.circlesMap[currentLeft.name].rightbound.name
            );
            currentRight = this.circles.find(
                (c) =>
                    c.name === this.circlesMap[currentRight.name].leftbound.name
            );
            if (!currentLeft || !currentRight) break;
            if (currentLeft.name !== currentRight.name)
                bounds.splice(Math.floor(bounds.length / 2), 0, currentRight);
            bounds.splice(Math.floor(bounds.length / 2), 0, currentLeft);
        } while (currentLeft.name !== currentRight.name); // loop until left and right bounds are the same

        return bounds;
    }

    handleClickedCircle = (e: MouseEvent) => {
        this.circles = Object.entries(this.circlesMap).map(
            ([name, { x, y, r }]) => ({
                name,
                x,
                y,
                r,
            })
        );
        this.clearRect();

        const factor = this.canvas.width / this.canvas.offsetWidth;
        const clickedCircle = this.circles.find((c) => {
            const distX = Math.abs(c.x - e.offsetX * factor);
            const distY = Math.abs(c.y - e.offsetY * factor);
            const dist = Math.sqrt(distX ** 2 + distY ** 2);
            return dist < c.r;
        });
        if (!clickedCircle)
            return this.circles.forEach((c) => this.drawImage(c));

        this.dispatchCustomEvent({ target: clickedCircle.name });

        const indexOfCurrentCircle = this.circles.indexOf(clickedCircle);

        const newCircle = {
            name: clickedCircle.name,
            r: clickedCircle.r * this.scale,
            x: clickedCircle.x,
            y: clickedCircle.y,
        };
        this.circles[indexOfCurrentCircle] = newCircle;
        this.circles.slice(indexOfCurrentCircle).forEach((c) => {
            this.recalculateCircle(c);
        });
    };

    recalculateCircle(currentCircle: Circle) {
        const indexOfCurrentCircle = this.circles.indexOf(currentCircle);

        const bounds = this.getBounds(currentCircle);

        let newCirclePos = {
            x: this.width + currentCircle.r * 2,
            y: this.height + currentCircle.y * 2,
        };
        for (let i = 1; i < bounds.length; i++) {
            const currentPosition = this.getTurningPoint(
                currentCircle.r,
                bounds[i - 1],
                bounds[i]
            );
            if (currentPosition.y < newCirclePos.y) {
                newCirclePos = currentPosition;
            }
        }
        const newCircle = {
            x: newCirclePos.x,
            y: newCirclePos.y,
            r: currentCircle.r,
            name: currentCircle.name,
        };
        this.circles[indexOfCurrentCircle] = newCircle;
    }

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
        if (!this.ctx) return;
        const { x, y, r } = circle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        outline ? this.ctx.stroke() : this.ctx.fill();
        this.ctx.closePath();
    }

    async drawImage(circle: Circle, scale: number = 1) {
        const img = new Image();
        img.onload = () => {
            if (this.ctx)
                this.ctx.drawImage(
                    img,
                    circle.x - circle.r,
                    circle.y - circle.r,
                    circle.r * 2 * scale,
                    circle.r * 2 * scale
                );
            URL.revokeObjectURL(img.src);
        };
        try {
            img.src = await getFilledSvgUrl(ICONS, circle.name, "hotpink");
        } catch (error) {
            console.log("Error loading image:", error);
            img.src = "";
        }
    }

    clearRect() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // window.addEventListener('resize', setCanvasSize);
}
