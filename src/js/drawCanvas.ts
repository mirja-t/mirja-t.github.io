type Item = { id: string; name: string; r: number };
type Coordinate = { x: number; y: number };

class Trigonometry {
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
}
export class Circle extends Trigonometry {
    id: string;
    data: {
        x: number;
        y: number;
        r: number;
        name: string;
    };
    private _edges: Record<string, number>;
    constructor(
        id: string,
        x: number,
        y: number,
        radius: number,
        name: string
    ) {
        super();
        this.data = {
            x: x,
            y: y,
            r: radius,
            name: name,
        };
        this.id = id;
        this._edges = {};
    }
    addEdge(circle: Circle) {
        const angle = Math.atan2(
            circle.data.y - this.data.y,
            circle.data.x - this.data.x
        );
        this._edges[circle.id] = this.radToPositive(angle);
    }
    get edges() {
        return this._edges;
    }
    set edges(edges: Record<string, number>) {
        this._edges = edges;
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

export class DrawCanvas extends Trigonometry {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    scale: number;
    ctx: CanvasRenderingContext2D | null;
    items: { id: string; name: string; r: number }[];
    count: number;
    circles: Circle[];
    circlesSnapshot: Circle[];
    clickedCircleId: string | null;
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
        super();
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.count = items.length;
        this.ctx = this.canvas.getContext("2d");
        this.items = items; //.sort((a, b) => b.r - a.r); // sort items by radius descending
        this.circles = [];
        this.circlesSnapshot = [];
        this.clickedCircleId = null;
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
        this.canvas.addEventListener("click", this.handleClickedCircle);
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
                currentItem.id,
                currentCircle.data.x + currentCircle.data.r + currentItem.r,
                currentCircle.data.y,
                currentItem.r,
                currentItem.name
            );
            secondCircle.addEdge(currentCircle);
            currentCircle.addEdge(secondCircle);
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
            item.id,
            x,
            y + offset * this.gravity[1],
            r,
            name
        );
        return initialCircle;
    };

    getCoordinates(
        circle1: Circle,
        circle2: Circle,
        r: number,
        dir: 1 | -1 = 1
    ) {
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
        const angle = initialAngle + alpha * dir;

        const [xC, yC] = [xA + b * Math.cos(angle), yA + b * Math.sin(angle)];
        return [xC, yC];
    }

    getNextCircle(currentCircle: Circle, currentItem: Item): Circle {
        // find circles that have an edge to currentCircle
        const counterCircles = this.circles.filter((c) => {
            return c.edges[currentCircle.id] !== undefined;
        });

        // find edge circle with the smallest angle to currentCircle
        let counterCircle = counterCircles.reduce((last, c) => {
            return last.edges[currentCircle.id] > last.edges[currentCircle.id]
                ? c
                : last;
        }, counterCircles[0]);

        const neighbouringCircles = Object.keys(counterCircle.edges).map((id) =>
            this.circles.find((c) => c.id === id)
        );

        // find circle that interferes with the new position (mostly when circles have been placed around currentCircle with almost 360degrees)
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
        const { name, r } = currentItem;

        let [xC, yC] = this.getCoordinates(counterCircle, currentCircle, r);
        const distXNewStopper = xC - stopper.data.x;
        const distYNewStopper = yC - stopper.data.y;
        const colliding =
            Math.sqrt(distXNewStopper ** 2 + distYNewStopper ** 2) + 1 < // add 1px tolerance
            r + stopper.data.r;
        if (colliding) {
            counterCircle = stopper;
            [xC, yC] = this.getCoordinates(counterCircle, currentCircle, r);
        }
        const nextCircle = new Circle(currentItem.id, xC, yC, r, name);
        nextCircle.addEdge(currentCircle);
        currentCircle.addEdge(nextCircle);
        nextCircle.addEdge(counterCircle);
        counterCircle.addEdge(nextCircle);
        return nextCircle;
    }

    repositionCircle = (
        baseCircle: Circle,
        nextCircle: Circle,
        stack: Circle[]
    ) => {
        // get the next position based on base circle and circle just pushed onto stack
        const recentEdges = [
            ...new Set(
                [baseCircle].concat(stack.filter((c) => nextCircle.edges[c.id]))
            ),
        ];

        if (recentEdges.length < 2) return recentEdges;

        const [cx, cy] = this.getCoordinates(
            recentEdges[0],
            recentEdges[1],
            nextCircle.data.r
        );
        nextCircle.data.x = cx;
        nextCircle.data.y = cy;

        return recentEdges;
    };

    getNextBaseCircle = (stack: Circle[], rest: Circle[]) => {
        let newBaseCircle = rest.reduce((last, c) => {
            const edgesInStack = Object.keys(c.edges).filter((id) => {
                return stack.find((circle) => circle.id === id);
            });
            return edgesInStack.length >
                Object.keys(last.edges).filter((id) => {
                    return stack.find((circle) => circle.id === id);
                }).length
                ? c
                : last;
        }, rest[0]);
        const baseCircleIndex = rest.findIndex(
            (c) => c.id === newBaseCircle.id
        );
        if (baseCircleIndex > -1) rest.splice(baseCircleIndex, 1);
        // const nextCircle = getEdgesFromStack(baseCircle.edges);
        let newAdjacentCircles = stack.filter((c) => {
            return newBaseCircle.edges[c.id];
        });
        // reposition new base circle
        const dir =
            newBaseCircle.data.x > newAdjacentCircles[0].data.x ? -1 : 1;

        // find adjacent circles in stack that hold newBaseCircle in place
        newAdjacentCircles = newAdjacentCircles
            .sort((a, b) => a.data.x - b.data.x)
            .filter((c, idx, arr) => {
                let nextC = arr[idx + 1];
                if (idx === arr.length - 1) nextC = arr[idx - 1];
                const gap =
                    Math.sqrt(
                        Math.abs(c.data.x - nextC.data.x) ** 2 +
                            Math.abs(c.data.y - nextC.data.y) ** 2
                    ) -
                    (c.data.r + nextC.data.r);
                return gap < newBaseCircle.data.r * 2;
            });

        const [x, y] = this.getCoordinates(
            newAdjacentCircles[0],
            newAdjacentCircles[1],
            newBaseCircle.data.r,
            dir
        );
        newBaseCircle.data.x = x;
        newBaseCircle.data.y = y;

        return {
            baseCircle: newBaseCircle,
            adjacentCircles: newAdjacentCircles,
        };
    };

    // remove all edges of current base circle from rest and add them to currentEdges
    shiftEdgesFromRest = (edges: Record<string, number>, rest: Circle[]) => {
        return (
            Object.entries(edges)
                // .sort(
                //     // sort by angle from base circle
                //     ([, valA], [, valB]) =>
                //         this.radToPositive(valA) - this.radToPositive(valB)
                // )
                .filter(([id]) => {
                    return rest.find((c) => c.id === id);
                })
                .map(([id]) => {
                    const indexOfCircle = rest.findIndex((c) => c.id === id);
                    if (indexOfCircle > -1) {
                        const c = rest.splice(indexOfCircle, 1);
                        return this.copyCircle(c[0]);
                    }
                })
        );
    };

    handleClickedCircle = (e: MouseEvent) => {
        this.circlesSnapshot = this.circles.map((c) => {
            return this.copyCircle(c);
        });
        const factor = this.width / this.canvas.offsetWidth;
        const clickedCircleCopy = this.circles.find((c) => {
            const distX = Math.abs(c.data.x - e.offsetX * factor);
            const distY = Math.abs(c.data.y - e.offsetY * factor);
            const dist = Math.sqrt(distX ** 2 + distY ** 2);
            return dist < c.data.r;
        });
        if (!clickedCircleCopy) {
            this.clearRect();
            return this.circles.forEach((c) => this.drawCircle(c, "purple"));
        }

        /**
         * reposition circles
         */

        let baseCircle: Circle = clickedCircleCopy;

        // scale clicked circle
        clickedCircleCopy.data.r = clickedCircleCopy.data.r * this.scale;

        // copy all circles except clicked circle
        const rest: Circle[] = this.circles
            .filter((c) => c.id !== clickedCircleCopy.id)
            .map((c) => this.copyCircle(c));
        const stack: Circle[] = [baseCircle];

        let adjacentCircles = this.shiftEdgesFromRest(baseCircle.edges, rest);
        let nextAdjacentCircles: Circle[] = [];

        let counter = 0;
        while (rest.length || adjacentCircles.length) {
            counter++;
            console.log("---- new loop ----", rest.length);
            console.log(adjacentCircles.map((c) => c.id));
            adjacentCircles.forEach((circle) => {
                baseCircle = stack.find((c) => circle.edges[c.id]);
                console.log("baseCircle", baseCircle?.id, " --> " + circle.id);
                if (!baseCircle) return;
                const alpha = baseCircle.edges[circle.id];
                const newX =
                    baseCircle.data.x +
                    (baseCircle.data.r + circle.data.r) * Math.cos(alpha);
                const newY =
                    baseCircle.data.y +
                    (baseCircle.data.r + circle.data.r) * Math.sin(alpha);
                circle.data.x = newX;
                circle.data.y = newY;
                const nextEdges = this.shiftEdgesFromRest(circle.edges, rest);
                nextAdjacentCircles.push(...nextEdges);
                stack.push(circle);
            });
            adjacentCircles = nextAdjacentCircles.map((c) =>
                this.copyCircle(c)
            );

            nextAdjacentCircles = [];
            console.log("---- rest.length ----", rest.length);
            if (counter > 20) break; // safety break
        }
        /*
        while (adjacentCircles.length) {
            // if there are no circles to position around base circle, position the first circle by its angle

            if (!stack.length) {
                const alpha = baseCircle.edges[nextCircle.id];
                const newX =
                    baseCircle.data.x +
                    (baseCircle.data.r + nextCircle.data.r) * Math.cos(alpha);
                const newY =
                    baseCircle.data.y +
                    (baseCircle.data.r + nextCircle.data.r) * Math.sin(alpha);
                nextCircle.data.x = newX;
                nextCircle.data.y = newY;
            }

            // push positioned circle onto stack
            // get next circle from rest
            stack.push(nextCircle);
            nextCircle = adjacentCircles.shift();

            const recentEdges = this.repositionCircle(
                baseCircle,
                nextCircle,
                stack
            );

            if (recentEdges.length < 2) {
                console.log(
                    "!!!!!!!!!!!!!!!!!!!!!!BREAK",
                    "recentEdges.length < 2",
                    recentEdges[0].id
                );

                break;
            }

            if (adjacentCircles.length === 0) {
                // push last adjacent circle onto stack
                stack.push(nextCircle);
                // push previous base circle onto stack
                stack.push(baseCircle);
                // get next base circle from rest which has the most edges in stack
                ({ baseCircle, adjacentCircles } = this.getNextBaseCircle(
                    stack,
                    rest
                ));
                stack.push(baseCircle);
                console.log(
                    "*----------------adjacentCircles.length === 0" +
                        "\n" +
                        "new baseCircle.id: " +
                        baseCircle.id
                );
                break;
            }
        }
        */

        // this.clickedCircleId = clickedCircleCopy.id;
        this.clearRect();
        rest.forEach(async (circle) => {
            this.drawCircle(circle, "#cccccc");
        });
        stack.forEach(async (circle) => {
            this.drawCircle(circle, "purple");
        });
        this.dispatchCustomEvent({ target: clickedCircleCopy.id });
        this.circles = this.circlesSnapshot;
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
        this.ctx.font = "24px serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = outline;
        this.ctx.fillText(
            `${name},\n ${x.toFixed(0)},\n ${y.toFixed(0)}`,
            x,
            y
        );
        this.ctx.closePath();
    }

    clearRect() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawLine(start: Coordinate, end: Coordinate) {
        this.ctx.beginPath();
        this.ctx.moveTo(start[0], start[1]);

        // Set an end-point
        this.ctx.lineTo(end[0], end[1]);

        // Stroke it (Do the Drawing)
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    copyCircle(circle: Circle): Circle {
        const copy = new Circle(
            circle.id,
            circle.data.x,
            circle.data.y,
            circle.data.r,
            circle.data.name
        );
        copy.edges = { ...circle.edges };
        return copy;
    }

    // window.addEventListener('resize', setCanvasSize);
}
