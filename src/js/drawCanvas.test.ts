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

    test("getLeftBottomMostCircle -- left bottom most circle has radius of 0 and x of 0 if circles are empty", () => {
        expect(drawCanvas?.getLeftBottomMostCircle(100)).toEqual({
            x: 0,
            y: 100,
            r: 0,
            name: "",
        });
    });

    test("getLeftBottomMostCircle -- expect left bottom most circle to be the only circle in array", () => {
        drawCanvas.circles = [{ name: "js", r: 100, x: 100, y: 100 }];
        expect(drawCanvas?.getLeftBottomMostCircle(100)).toEqual({
            name: "js",
            r: 100,
            x: 100,
            y: 100,
        });
    });

    test("getLeftBottomMostCircle -- expect left bottom most circle to be 100, 100, 100", () => {
        drawCanvas.circles = [
            { name: "js", r: 100, x: 100, y: 100 },
            { name: "css", r: 100, x: 300, y: 100 },
        ];
        expect(drawCanvas?.getLeftBottomMostCircle(100)).toEqual({
            name: "js",
            r: 100,
            x: 100,
            y: 100,
        });
    });

    test("getNextCircle -- get touching or close circle on the right. Returns point on baseline if there are no more circles", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        drawCanvas.circles = [circle1];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 100);
        expect(nextCircle).toEqual({ name: "", r: 0, x: 300, y: 0 });
    });

    test("getNextCircle -- get touching or close circle on the right. Returns 2nd circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 100);
        expect(nextCircle).toEqual(circle2);
    });

    test("getNextCircle -- get touching or close circle on the right. Returns bottom most circle", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        const circle3 = { name: "html", r: 50, x: 300, y: 300 };
        drawCanvas.circles = [circle1, circle2, circle3];
        const nextCircle = drawCanvas?.getNextCircle(circle1, 100);
        expect(nextCircle).toEqual(circle3);
    });
    test("getNextCircle -- omits circle on the right if the the outer bound prevent interference.", () => {
        const circle1 = { name: "js", r: 15, x: 15, y: 15 };
        const leftCircle = { x: 0, y: 100, r: 0, name: "initialLeftCircle" };
        const rightCircle = { name: "", r: 0, x: 100, y: 0 };
        drawCanvas.circles = [circle1];
        const nextCircle = drawCanvas?.getNextCircle(leftCircle, 100);
        expect(nextCircle).toEqual(rightCircle);
    });

    test("getTurningPoint -- expect turning point to be between 2 equally sized circles at 200, 273.2", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle2 = { name: "css", r: 100, x: 300, y: 100 };
        drawCanvas.circles = [circle1, circle2];
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1, circle2);
        expect(turningPoint.x).toBeCloseTo(200.0, 1);
        expect(turningPoint.y).toBeCloseTo(273.2, 1);
    });

    test("getTurningPoint -- expect turning point to be 274.45, 197.80 between 2 differently sized circles where the 2nd is larger", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        const circle3 = { name: "css", r: 50, x: 300, y: 50 };
        drawCanvas.circles = [circle1, circle3];
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1, circle3);
        expect(turningPoint.x).toBeCloseTo(274.45, 1);
        expect(turningPoint.y).toBeCloseTo(197.8, 1);
    });

    test("getTurningPoint -- expect turning point to be right of single circle at 100, 300", () => {
        const circle1 = { name: "js", r: 100, x: 100, y: 100 };
        drawCanvas.circles = [circle1];
        const turningPoint = drawCanvas?.getTurningPoint(100, circle1);
        expect(turningPoint.x).toBeCloseTo(300, 1);
        expect(turningPoint.y).toBeCloseTo(100, 1);
    });

    test("getTurningPoint -- expect turning point to be outside of left canvas bound", () => {
        drawCanvas.circles = [];
        const turningPoint = drawCanvas?.getTurningPoint(100, {
            name: "initial",
            r: 100,
            x: -100,
            y: 100,
        });
        expect(turningPoint.x).toBeCloseTo(100, 1);
        expect(turningPoint.y).toBeCloseTo(100, 1);
    });

    test("getTurningPoint -- expect turning point to be outside of right canvas bound", () => {
        const turningPoint = drawCanvas?.getTurningPoint(100, {
            name: "left",
            r: 100,
            x: 1400,
            y: 100,
        });
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

    test("getTurningPoints -- expect turning points to be 2 points at 1 circle and left top bounds", () => {
        drawCanvas.circles = [{ name: "js", r: 100, x: 100, y: 100 }];
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(2);
        expect(turningPoints[0].x).toBeCloseTo(50, 1);
        expect(turningPoints[0].y).toBeCloseTo(241.4, 1);
    });

    test("getTurningPoints -- expect turning points to be 3 points at 2 circles and left top bounds", () => {
        drawCanvas.circles = [
            { name: "js", r: 100, x: 100, y: 100 },
            { name: "css", r: 100, x: 300, y: 100 },
        ];
        const turningPoints = drawCanvas?.getTurningPoints(50);
        expect(turningPoints).toHaveLength(3);
        expect(turningPoints[0].x).toBeCloseTo(50, 1);
        expect(turningPoints[0].y).toBeCloseTo(241.4, 1);
    });

    test("getPositionedCircle -- expect first positioned circle to be 100, 100, 100", () => {
        drawCanvas.circles = [];
        const positionedCircle = drawCanvas?.getPositionedCircle({
            name: "js",
            r: 100,
        });
        expect(positionedCircle.x).toBeCloseTo(100, 1);
        expect(positionedCircle.y).toBeCloseTo(100, 1);
    });

    test("getPositionedCircle -- expect 2nd positioned circle to be 300, 100, 100", () => {
        drawCanvas.circles = [{ x: 100, y: 100, r: 100, name: "js" }];
        const positionedCircle = drawCanvas?.getPositionedCircle({
            name: "css",
            r: 100,
        });
        expect(positionedCircle.x).toBeCloseTo(300, 1);
        expect(positionedCircle.y).toBeCloseTo(100, 1);
    });
});
