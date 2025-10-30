import { describe, expect, test } from "vitest";
import { Circle, DrawCanvas } from "./drawCanvas";

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
        expect(drawCanvas?.width).toBe(1600);
        expect(drawCanvas?.height).toBe(900);
    });

    test("createCircles –– length of this.circles equals initial length of items", () => {
        drawCanvas.items = [
            { id: "js", name: "js", r: 100 },
            { id: "css", name: "css", r: 100 },
        ];
        drawCanvas.circles = [];
        drawCanvas.count = drawCanvas.items.length;
        drawCanvas.createCircles();
        expect(drawCanvas?.circles.length).toBe(2);
        expect(drawCanvas?.items.length).toBe(0);
    });

    test.only("getNextCircle -- place next circle below 1st and second circle", () => {
        const circle1 = new Circle("js", 800, 450, 100, "js");
        const circle2 = new Circle("css", 1000, 450, 100, "css");
        circle1.addEdge(circle2);
        circle2.addEdge(circle1);
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, 0]; // center
        const nextCircle = drawCanvas?.getNextCircle(circle1, {
            r: 100,
            id: "css",
            name: "css",
        });
        expect(nextCircle.data).toEqual({
            id: "css",
            name: "css",
            r: 100,
            x: 900,
            y: 623,
        });
    });

    test("getNextCircle bottom gravity -- get touching or close circle on the right. Returns point on baseline if there are no more circles", () => {
        const circle1 = new Circle("js", 100, 800, 100, "js");
        const circle2 = new Circle("css", 300, 800, 100, "css");
        drawCanvas.circles = [circle1, circle2];
        drawCanvas.gravity = [0, -1]; // bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, {
            r: 100,
            id: "css",
            name: "css",
        });
        expect(nextCircle.data).toEqual({ name: "", r: 0, x: 500, y: 900 });
    });

    test("getNextCircle -- get touching or close circle on the right. Returns 2nd circle", () => {
        const circle1 = new Circle("js", 100, 100, 100, "js");
        const circle2 = new Circle("css", 300, 100, 100, "css");
        const circle3 = new Circle("html", 500, 100, 100, "html");
        drawCanvas.circles = [circle1, circle2, circle3];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, {
            r: 100,
            id: "html",
            name: "html",
        });
        expect(nextCircle.data).toEqual(circle3.data);
    });
    test("getNextCircle -- get touching or close circle on the right. Returns last circle", () => {
        const circle1 = new Circle("js", 100, 100, 100, "js");
        const circle2 = new Circle("css", 300, 100, 100, "css");
        const circle3 = new Circle("html", 500, 100, 100, "html");
        const circle4 = new Circle("ts", 849, 300, 300, "ts");
        drawCanvas.circles = [circle1, circle2, circle3, circle4];
        drawCanvas.gravity = [0, 1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle3, {
            r: 300,
            id: "ts",
            name: "ts",
        });
        expect(nextCircle.data).toEqual(circle4.data);
    });
    test("getNextCircle bottom gravity -- get touching or close circle on the right. Returns 2nd circle", () => {
        const circle1 = new Circle("js", 100, 800, 100, "js");
        const circle2 = new Circle("css", 300, 800, 100, "css");
        const circle3 = new Circle("html", 500, 800, 100, "html");
        drawCanvas.circles = [circle1, circle2, circle3];
        drawCanvas.gravity = [0, -1]; // top to bottom
        const nextCircle = drawCanvas?.getNextCircle(circle2, {
            r: 100,
            id: "html",
            name: "html",
        });
        expect(nextCircle.data).toEqual(circle3.data);
    });

    test("getNextCircle -- get touching or close circle on the right. Returns bottom most circle", () => {
        const circle1 = new Circle("js", 100, 100, 100, "js");
        const circle2 = new Circle("css", 300, 100, 100, "css");
        const circle3 = new Circle("html", 300, 300, 50, "html");
        drawCanvas.circles = [circle1, circle2, circle3];
        drawCanvas.gravity = [0, 1];
        const nextCircle = drawCanvas?.getNextCircle(circle1, {
            r: 100,
            id: "html",
            name: "html",
        });
        expect(nextCircle.data).toEqual(circle3.data);
    });

    test("getNextCircle bottom gravity -- get touching or close circle on the right. Returns bottom most circle", () => {
        const circle1 = new Circle("js", 100, 800, 100, "js");
        const circle2 = new Circle("css", 300, 800, 100, "css");
        const circle3 = new Circle("html", 300, 600, 50, "html");
        drawCanvas.gravity = [0, -1];
        drawCanvas.circles = [circle1, circle2, circle3];
        const nextCircle = drawCanvas?.getNextCircle(circle1, {
            r: 100,
            id: "html",
            name: "html",
        });
        expect(nextCircle.data).toEqual(circle3.data);
    });
    test("getNextCircle -- omits circle on the right if the the outer bound prevent interference.", () => {
        const circle1 = new Circle("js", 15, 15, 15, "js");
        const leftCircle = new Circle(
            "initialLeftCircle",
            0,
            100,
            0,
            "initialLeftCircle"
        );
        const rightCircle = new Circle("", 100, 0, 0, "");
        drawCanvas.circles = [circle1];
        drawCanvas.gravity = [0, 1];
        const nextCircle = drawCanvas?.getNextCircle(leftCircle, {
            r: 100,
            id: "test",
            name: "test",
        });
        expect(nextCircle).toEqual(rightCircle);
    });
    test("getNextCircle bottom gravity -- omits circle on the right if the the outer bound prevent interference.", () => {
        const circle1 = new Circle("js", 15, 15, 15, "js");
        const leftCircle = new Circle(
            "initialLeftCircle",
            0,
            800,
            0,
            "initialLeftCircle"
        );
        const rightCircle = new Circle("", 100, 900, 0, "");
        drawCanvas.circles = [circle1];
        drawCanvas.gravity = [0, -1];
        const nextCircle = drawCanvas?.getNextCircle(leftCircle, {
            r: 100,
            id: "test",
            name: "test",
        });
        expect(nextCircle).toEqual(rightCircle);
    });

    test("getNextCircle -- expect next circle to be undefined", () => {
        const circle1 = new Circle("js", 100, 100, 100, "js");
        drawCanvas.circles = [circle1];
        const nextCircle = drawCanvas?.getNextCircle(circle1, {
            r: 10,
            id: "test",
            name: "test",
        });
        expect(nextCircle.data.name).toBe("");
    });

    test("getNextCircle -- expect next circle to be right touching neighbouring circle at 300, 100", () => {
        const circle1 = new Circle("js", 100, 100, 100, "js");
        const circle2 = new Circle("css", 300, 100, 100, "css");
        drawCanvas.circles = [circle1, circle2];
        const nextCircle = drawCanvas?.getNextCircle(circle1, {
            r: 10,
            id: "test",
            name: "test",
        });
        expect(nextCircle.data).toEqual(circle2.data);
    });

    test("getNextCircle -- expect next circle to be right not toching neighbouring circle at 300, 100", () => {
        const circle1 = new Circle("css", 300, 300, 300, "css");
        const circle2 = new Circle("react", 630, 50, 50, "react");
        drawCanvas.circles = [circle1, circle2];
        const nextCircle = drawCanvas?.getNextCircle(circle1, {
            r: 150,
            id: "test",
            name: "test",
        });
        expect(nextCircle.data.name).toBe("react");
    });

    test("getPositionedCircle -- expect first positioned circle to be 100, 100, 100", () => {
        drawCanvas.circles = [];
        drawCanvas.gravity = [0, 0]; // center
        const positionedCircle = drawCanvas?.getPositionedCircle({
            id: "js",
            name: "js",
            r: 100,
        });
        expect(positionedCircle.data.x).toBeCloseTo(800, 1);
        expect(positionedCircle.data.y).toBeCloseTo(450, 1);
    });
    test("getPositionedCircle -- expect 3rd positioned circle to be at x500, y100", () => {
        const circle1 = new Circle("js", 800, 450, 100, "js");
        const circle2 = new Circle("css", 1000, 450, 100, "css");
        drawCanvas.circles = [circle1, circle2];
        circle1.addEdge(circle2);
        circle2.addEdge(circle1);
        const positionedCircle = drawCanvas?.getPositionedCircle({
            id: "html",
            name: "html",
            r: 100,
        });
        expect(positionedCircle.data.x).toBeCloseTo(900, 1);
        expect(positionedCircle.data.y).toBeCloseTo(623.5, 0);
    });
});
