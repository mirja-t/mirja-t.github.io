import { describe, expect, test } from "vitest";
import { DrawCanvas } from "./drawCanvas";

let drawCanvas: DrawCanvas | null;
let canvas: HTMLCanvasElement;

describe("DrawCanvas", () => {
    canvas = document.createElement("canvas");
    drawCanvas = new DrawCanvas(1600, 900, canvas, [], 10);
    test("constructor -- canvas is created", () => {
        expect(drawCanvas).toBeInstanceOf(DrawCanvas);
        expect(drawCanvas?.canvas).toBe(canvas);
    });

    test("setCanvasSize -- canvas width is 1600, canvas height is 900", () => {
        expect(drawCanvas?.canvas.width).toBe(1600);
        expect(drawCanvas?.canvas.height).toBe(900);
    });

    test("createCircles –– length of this.circles equals initial length of items", () => {
        drawCanvas.items = [
            { name: "js", r: 100 },
            { name: "css", r: 100 },
        ];
        drawCanvas.circles = [];
        drawCanvas.count = drawCanvas.items.length;
        drawCanvas.createCircles();
        expect(drawCanvas?.circles.length).toBe(2);
        expect(drawCanvas?.items.length).toBe(0);
    });

    test("createInitialTurningPoint -- expect initial left circle to be at x0, y100 for first circle", () => {
        drawCanvas.circles = [];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const initialLeftCircle = drawCanvas?.createInitialTurningPoint(
            { x: 100, y: 0, r: 0, name: "" },
            100
        );
        expect(initialLeftCircle).toEqual({ x: 100, y: 100, r: 100, name: "" });
    });
    test("createInitialTurningPoint bottom gravity -- expect initial left circle to be at x0, y800 for first circle", () => {
        drawCanvas.circles = [];
        drawCanvas.gravity = [0, -1];
        const initialLeftCircle = drawCanvas?.createInitialTurningPoint(
            { x: 100, y: 900, r: 0, name: "" },
            100
        );
        expect(initialLeftCircle).toEqual({ x: 100, y: 800, r: 100, name: "" });
    });
    test("createInitialTurningPoint -- expect initial left circle to be at x100, y300", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, 1];
        const initialLeftCircle = drawCanvas?.createInitialTurningPoint(
            circle1,
            100
        );
        expect(initialLeftCircle.x).toEqual(100);
        expect(initialLeftCircle.y).toBeCloseTo(300, 0);
    });
    test("createInitialTurningPoint bottom gravity -- expect initial left circle to be at x100, y600", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "css", r: 100, x: 300, y: 800 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, -1];
        const initialLeftCircle = drawCanvas?.createInitialTurningPoint(
            circle1,
            100
        );
        expect(initialLeftCircle.x).toEqual(100);
        expect(initialLeftCircle.y).toBeCloseTo(600, 0);
    });

    test("createInitialRightCircle -- expect initial right circle to be at x300, y100", () => {
        drawCanvas.gravity = [0, 1]; // top to bottom
        const initialRightCircle = drawCanvas?.createInitialRightCircle(100, {
            name: "js",
            r: 100,
            x: 500,
            y: 100,
        });
        expect(initialRightCircle).toEqual({ x: 700, y: 0, r: 0, name: "" });
    });

    test("createInitialRightCircle bottom gravity -- expect initial right circle to be at x300, y900", () => {
        drawCanvas.gravity = [0, -1]; // bottom to top
        const initialRightCircle = drawCanvas?.createInitialRightCircle(100, {
            name: "js",
            r: 100,
            x: 500,
            y: 800,
        });
        expect(initialRightCircle).toEqual({ x: 700, y: 900, r: 0, name: "" });
    });

    test("createInitialRightCircle bottom gravity -- expect initial right circle to be at x395, y900", () => {
        drawCanvas.circles = [{ name: "js", r: 150, x: 150, y: 750 }];
        drawCanvas.gravity = [0, -1]; // bottom to top
        const initialRightCircle = drawCanvas?.createInitialRightCircle(100, {
            name: "js",
            r: 150,
            x: 150,
            y: 750,
        });
        expect(initialRightCircle.x).toBeCloseTo(395, 0);
    });
    test("createInitialRightCircle -- expect initial right circle to be at x500, y900", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, 1];
        const initialRightCircle = drawCanvas?.createInitialRightCircle(
            100,
            circle2
        );
        expect(initialRightCircle.x).toBeCloseTo(500, 0);
    });
    test("createInitialRightCircle bottom gravity -- expect initial right circle to be at x500, y900", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "css", r: 100, x: 300, y: 800 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, -1];
        const initialRightCircle = drawCanvas?.createInitialRightCircle(
            100,
            circle2
        );
        expect(initialRightCircle.x).toBeCloseTo(500, 0);
        expect(initialRightCircle.y).toBeCloseTo(900, 0);
    });

    test("getNextCircle -- get touching or close circle on the right. Returns point on baseline if there are no more circles", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "js", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, 100);
        expect(nextCircle).toEqual({ name: "", r: 0, x: 500, y: 0 });
    });

    test("getNextCircle bottom gravity -- get touching or close circle on the right. Returns point on baseline if there are no more circles", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "js", r: 100, x: 300, y: 800 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, -1]; // bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, 100);
        expect(nextCircle).toEqual({ name: "", r: 0, x: 500, y: 900 });
    });

    test("getNextCircle -- get touching or close circle on the right. Returns 2nd circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        const circle3 = { name: "html", r: 100, x: 500, y: 100 };
        drawCanvas.circles = [circle1, circle2, circle3];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, 100);
        expect(nextCircle).toEqual(circle3);
    });
    test("getNextCircle -- get touching or close circle on the right. Returns last circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        const circle3 = { name: "html", r: 100, x: 500, y: 100 };
        const circle4 = { name: "ts", r: 300, x: 849, y: 300 };
        drawCanvas.circles = [circle1, circle2, circle3, circle4];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle3, 300);
        expect(nextCircle).toEqual(circle4);
    });
    test("getNextCircle bottom gravity -- get touching or close circle on the right. Returns 2nd circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "css", r: 100, x: 300, y: 800 };
        const circle3 = { name: "html", r: 100, x: 500, y: 800 };
        drawCanvas.circles = [circle1, circle2, circle3];
        drawCanvas.gravity = [0, -1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, 100);
        expect(nextCircle).toEqual(circle3);
    });

    test("getNextCircle -- get touching or close circle on the right. Returns bottom most circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        const circle3 = { name: "html", r: 50, x: 300, y: 300 };
        drawCanvas.circles = [circle1, circle2, circle3];
        drawCanvas.gravity = [0, 1];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 100);
        expect(nextCircle).toEqual(circle3);
    });

    test("getNextCircle bottom gravity -- get touching or close circle on the right. Returns bottom most circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "css", r: 100, x: 300, y: 800 };
        const circle3 = { name: "html", r: 50, x: 300, y: 600 };
        drawCanvas.gravity = [0, -1];
        drawCanvas.circles = [circle1, circle2, circle3];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 100);
        expect(nextCircle).toEqual(circle3);
    });
    test("getNextCircle -- omits circle on the right if the the outer bound prevent interference.", () => {
        const circle1 = { name: "js", r: 15, x: 15, y: 15 };
        const leftCircle = { x: 0, y: 100, r: 0, name: "initialLeftCircle" };
        const rightCircle = { name: "", r: 0, x: 100, y: 0 };
        drawCanvas.circles = [circle1];
        drawCanvas.gravity = [0, 1];
        const nextCircle = drawCanvas?.getNextCircle(leftCircle, 100);
        expect(nextCircle).toEqual(rightCircle);
    });
    test("getNextCircle bottom gravity -- omits circle on the right if the the outer bound prevent interference.", () => {
        const circle1 = { name: "js", r: 15, x: 15, y: 15 };
        const leftCircle = { x: 0, y: 800, r: 0, name: "initialLeftCircle" };
        const rightCircle = { name: "", r: 0, x: 100, y: 900 };
        drawCanvas.circles = [circle1];
        drawCanvas.gravity = [0, -1];
        const nextCircle = drawCanvas?.getNextCircle(leftCircle, 100);
        expect(nextCircle).toEqual(rightCircle);
    });

    test("getTurningPoint -- expect turning point to be between 2 equally sized circles at 200, 273.2", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1, circle2);
        expect(turningPoint.x).toBeCloseTo(200.0, 1);
        expect(turningPoint.y).toBeCloseTo(273.2, 1);
    });

    test("getTurningPoint bottom gravity -- expect turning point to be between 2 equally sized circles at 200, 626.8", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "css", r: 100, x: 300, y: 800 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, -1]; // bottom gravity
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1, circle2);
        expect(turningPoint.x).toBeCloseTo(200.0, 1);
        expect(turningPoint.y).toBeCloseTo(626.8, 1);
    });

    test("getTurningPoint -- expect turning point to be 274.45, 197.80 between 2 differently sized circles where the 2nd is smaller", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle3 = { name: "css", r: 50, x: 300, y: 50 };
        drawCanvas.circles = [circle1, circle3];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1, circle3);
        expect(turningPoint.x).toBeCloseTo(274.45, 1);
        expect(turningPoint.y).toBeCloseTo(197.8, 1);
    });

    test("getTurningPoint bottom gravity -- expect turning point y to be 603.5 between 2 differently sized circles where the 2nd is smaller", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle3 = { name: "css", r: 50, x: 300, y: 850 };
        drawCanvas.circles = [circle1, circle3];
        drawCanvas.gravity = [0, -1]; // top to bottom
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1, circle3);
        expect(turningPoint.x).toBeCloseTo(274.45, 1);
        expect(turningPoint.y).toBeCloseTo(702.19, 1);
    });

    test("getTurningPoint -- expect turning point to be right of single circle at 100, 300", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "js", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const turningPoint = drawCanvas?.getTurningPoint(100, circle2, {
            name: "initial",
            r: 0,
            x: 500,
            y: 0,
        });
        expect(turningPoint.x).toBeCloseTo(500, 1);
        expect(turningPoint.y).toBeCloseTo(100, 1);
    });

    test("getTurningPoint bottom gravity -- expect turning point to be right of single circle at 100, 300", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 800 };
        const circle2 = { name: "js", r: 100, x: 300, y: 800 };
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, -1]; // top to bottom
        const turningPoint = drawCanvas?.getTurningPoint(100, circle2, {
            name: "initial",
            r: 0,
            x: 500,
            y: 900,
        });
        expect(turningPoint.x).toBeCloseTo(500, 1);
        expect(turningPoint.y).toBeCloseTo(800, 1);
    });

    test("getTurningPoint -- expect turning point to be outside of left canvas bound", () => {
        drawCanvas.circles = [];
        drawCanvas.gravity = [0, 1];
        const turningPoint = drawCanvas?.getTurningPoint(
            100,
            {
                name: "initial",
                r: 100,
                x: -100,
                y: 100,
            },
            {
                name: "",
                r: 0,
                x: 100,
                y: 0,
            }
        );
        expect(turningPoint.x).toBeCloseTo(100, 1);
        expect(turningPoint.y).toBeCloseTo(100, 1);
    });

    test("getTurningPoint -- expect turning point to be outside of right canvas bound", () => {
        const turningPoint = drawCanvas?.getTurningPoint(
            100,
            {
                name: "left",
                r: 100,
                x: 1400,
                y: 100,
            },
            drawCanvas?.getNextCircle(
                {
                    name: "left",
                    r: 100,
                    x: 1400,
                    y: 100,
                },
                100
            )
        );
        expect(turningPoint.x).toBeCloseTo(1500, 1);
        expect(turningPoint.y).toBeCloseTo(273.2, 1);
    });

    test("getNextCircle -- expect next circle to be undefined", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        drawCanvas.circles = [circle1];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 10);
        expect(nextCircle.name).toBe("");
    });

    test("getNextCircle -- expect next circle to be right touching neighbouring circle at 300, 100", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 10);
        expect(nextCircle).toEqual(circle2);
    });

    test("getNextCircle -- expect next circle to be right not toching neighbouring circle at 300, 100", () => {
        const circle1 = { x: 300, y: 300, name: "css", r: 300 };
        const circle2 = { x: 630, y: 50, name: "react", r: 50 };
        drawCanvas.circles = [circle1, circle2];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 150);
        expect(nextCircle.name).toBe("react");
    });

    test("getTurningPoints -- expect turning points to be one item with topleft position if circles array is empty", () => {
        drawCanvas.circles = [];
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(1);
        expect(turningPoints[0].x).toBeCloseTo(50, 1);
        expect(turningPoints[0].y).toBeCloseTo(50, 1);
    });

    test("getTurningPoints bottom gravity -- expect turning points to be one item with topleft position if circles array is empty", () => {
        drawCanvas.circles = [];
        drawCanvas.gravity = [0, -1]; // bottom to top
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(1);
        expect(turningPoints[0].x).toBeCloseTo(50, 1);
        expect(turningPoints[0].y).toBeCloseTo(850, 1);
    });
    test("getTurningPoints -- expect turning points length to be 3", () => {
        drawCanvas.circles = [
            {
                name: "js",
                r: 100,
                x: 100,
                y: 100,
            },
            { name: "css", r: 100, x: 300, y: 100 },
            { name: "html", r: 100, x: 500, y: 100 },
        ];
        drawCanvas.gravity = [0, 1];
        const turningPoints = drawCanvas?.getTurningPoints(300);
        expect(turningPoints).toHaveLength(3);
    });
    test("getTurningPoints bottom gravity -- expect turning points length to be 3", () => {
        drawCanvas.circles = [
            {
                name: "js",
                r: 100,
                x: 100,
                y: 800,
            },
            { name: "css", r: 100, x: 300, y: 800 },
            { name: "html", r: 100, x: 500, y: 800 },
        ];
        drawCanvas.gravity = [0, -1];
        const turningPoints = drawCanvas?.getTurningPoints(300);
        expect(turningPoints).toHaveLength(3);
    });

    test("getTurningPoints -- expect turning points to be 2 points at 1 circle and left top bounds", () => {
        drawCanvas.circles = [{ name: "js", r: 100, x: 100, y: 100 }];
        drawCanvas.gravity = [0, 1];
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(2);
        expect(turningPoints[0].x).toBeCloseTo(50, 1);
        expect(turningPoints[0].y).toBeCloseTo(241.4, 1);
    });

    test("getTurningPoints bottom gravity -- expect turning points to be 2 points at 1 circle and left top bounds", () => {
        drawCanvas.circles = [{ name: "js", r: 100, x: 100, y: 800 }];
        drawCanvas.gravity = [0, -1];
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(2);
        expect(turningPoints[0].x).toBeCloseTo(50, 1);
        expect(turningPoints[0].y).toBeCloseTo(658.6, 1);
    });

    test("getTurningPoints -- expect turning points to be 3 points at 2 circles and left top bounds", () => {
        drawCanvas.circles = [
            { name: "js", r: 100, x: 100, y: 100 },
            { name: "css", r: 100, x: 300, y: 100 },
        ];
        drawCanvas.gravity = [0, 1];
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(3);
        expect(turningPoints[1].x).toBeCloseTo(200, 1);
    });
    test("getTurningPoints bottom gravity -- expect turning points to be 3 points at 2 circles and left top bounds", () => {
        drawCanvas.circles = [
            { name: "js", r: 100, x: 100, y: 800 },
            { name: "css", r: 100, x: 300, y: 800 },
        ];
        drawCanvas.gravity = [0, -1]; // bottom to top
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(3);
        expect(turningPoints[1].x).toBeCloseTo(200, 1);
    });

    test("getPositionedCircle -- expect first positioned circle to be 100, 100, 100", () => {
        drawCanvas.circles = [];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const positionedCircle = drawCanvas?.getPositionedCircle({
            name: "js",
            r: 100,
        });
        expect(positionedCircle.x).toBeCloseTo(100, 1);
        expect(positionedCircle.y).toBeCloseTo(100, 1);
    });
    test("getPositionedCircle -- expect 3rd positioned circle to be at x500, y100", () => {
        drawCanvas.circles = [
            { x: 100, y: 100, r: 100, name: "js" },
            { x: 300, y: 100, r: 100, name: "css" },
        ];
        const positionedCircle = drawCanvas?.getPositionedCircle({
            name: "html",
            r: 100,
        });
        expect(positionedCircle.x).toBeCloseTo(500, 1);
        expect(positionedCircle.y).toBeCloseTo(100, 1);
    });
    test("getPositionedCircle bottom gravity -- expect 3rd positioned circle to be at x500, y800", () => {
        drawCanvas.circles = [
            { x: 100, y: 800, r: 100, name: "js" },
            { x: 300, y: 800, r: 100, name: "css" },
        ];
        drawCanvas.gravity = [0, -1]; // bottom to top
        const positionedCircle = drawCanvas?.getPositionedCircle({
            name: "html",
            r: 100,
        });
        expect(positionedCircle.x).toBeCloseTo(500, 1);
        expect(positionedCircle.y).toBeCloseTo(800, 1);
    });
});
