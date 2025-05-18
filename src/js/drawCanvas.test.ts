import {vi, afterEach, beforeEach, describe, expect, test} from 'vitest';
import {DrawCanvas} from './drawCanvas';

let drawCanvas: DrawCanvas | null;
let canvas: HTMLCanvasElement;

beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        transform: vi.fn(),
        setLineDash: vi.fn(),
        strokeRect: vi.fn(),
        clip: vi.fn(),
    })) as unknown as HTMLCanvasElement['getContext'];
    canvas = document.createElement('canvas');
    drawCanvas = new DrawCanvas(1600, 900, canvas, [], 1);
    drawCanvas.circles = [
        {x: 450, y: 150, r: 150},
        {x: 205.051025722, y: 100, r: 100},
        {x: 694.948974278, y: 100, r: 100},
        {x: 100, y: 270.18895967352199071, r: 100},
        {x: 304.2617, y: 414.3318, r: 150}
    ]
    drawCanvas.ctx = drawCanvas.canvas.getContext('2d');
});

afterEach(() => {
    drawCanvas = null;
    canvas.remove();
});

describe('DrawCanvas', () => {
    
    // test('getRadius -- return correct circle radius', () => {
    //     expect(radius).toBeCloseTo(150*scaleFactor, 6);
    // });
    test('getTouchingPoints -- return array of touching points', () => {
        // getTouchingPoints(circle1: Circle, circle2: Circle)
        // return empty array if circles are not touching
        let circles = [
            {x: 100, y: 100, r: 100},
            {x: 400, y: 400, r: 100}
        ]
        let touchingPoints = drawCanvas?.getTouchingPoints(circles[0], circles[1]);
        expect(touchingPoints).toEqual([]);

        // return array with one object if circles are touching but not overlapping
        circles = [
            {x: 100, y: 100, r: 100},
            {x: 300, y: 100, r: 100}
        ]
        touchingPoints = drawCanvas?.getTouchingPoints(circles[0], circles[1]);
        expect(touchingPoints).toEqual([{x: 200, y: 100}]);

        // return array with one object if circles are overlapping
        circles = [
            {x: 100, y: 100, r: 100},
            {x: 200, y: 100, r: 100}
        ]
        touchingPoints = drawCanvas?.getTouchingPoints(circles[0], circles[1]) || [];
        const y1 = Math.sqrt(100**2 - 50**2) + 100;
        const y2 = 100 - Math.sqrt(100**2 - 50**2);
        expect(touchingPoints[0].y).toBeCloseTo(y1);
        expect(touchingPoints[1].y).toBeCloseTo(y2);
        expect(touchingPoints[1].x).toEqual(150);
    });
    test('getLeftBottomMostCircle -- return left bottom most circle', () => {
        let mostLeftBottomCircle = drawCanvas?.getLeftBottomMostCircle(20);
        expect(mostLeftBottomCircle).toEqual({x: 100, y: 270.18895967352199071, r: 100});

        // when there are multiple rows of circles
        let circles = [
            {x: 200, y: 400, r: 200},
            {x: 600, y: 450, r: 300}
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        mostLeftBottomCircle = drawCanvas?.getLeftBottomMostCircle(120);
        expect(mostLeftBottomCircle).toEqual({x: 200, y: 400, r: 200});
    });
    test('getStartingPoint -- return starting point for the next circle', () => {
        const startingPoint = drawCanvas?.getStartingPoint(20);
        const y = Math.sqrt(120**2 - 80**2) + 270.18895967352199071;
        expect(startingPoint?.x).toEqual(20);
        expect(startingPoint?.y).toBeCloseTo(y);
    });
    test('getNextTurningPoint -- return 2nd touchingPoint of current circle', () => {
        // getNextTurningPoint(currentCircle: Circle, startingPoint: Coordinate, r: number)
        let circles = [
            {x: 100, y: 100, r: 100},
            {x: 300, y: 100, r: 100}
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        let y = Math.sqrt(120**2 - 80**2) + 100;
        let y2 = Math.sqrt(120**2 - 100**2) + 100;
        let startingPoint = {x: 20, y};
        let firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
        expect(firstTurningPoint?.turningPoint).toEqual({x: 200, y: y2});

        // when circle hits the top of the canvas
        circles = [
            {x: 100, y: 100, r: 100},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        y = Math.sqrt(120**2 - 80**2) + 100;
        startingPoint = {x: 20, y};
        firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
        expect(firstTurningPoint?.touchingCircle).toBeUndefined();
        expect(firstTurningPoint?.turningPoint).toEqual({x: Math.sqrt(120**2 - 80**2) + 100, y: 20});

        // when turningPoint.x is smaller than currentCircle.x + currentCircle.r
        circles = [
            {x: 100, y: 100, r: 100},
            {x: Math.sqrt(120**2 - 80**2) + 100, y: 20, r: 20}
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        y = Math.sqrt(120**2 - 80**2) + 100;
        let alpha1 = Math.acos(80/120)
        let alpha2 = Math.acos((120 ** 2 + 120 ** 2 - 40 ** 2) / (2 * 120 * 120));
        let x2 = 120 * Math.sin(alpha1+alpha2) + 100;
        y2 = 100 - Math.sqrt(120**2 - (x2-100)**2);
        startingPoint = {x: 20, y};
        firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
        expect(firstTurningPoint?.turningPoint).toEqual({x: x2, y: y2});

        // when there are multiple rows
        circles = [
            {x: 455, y: 154, r: 154},
            {x: 200, y: 400, r: 200},
            {x: 600, y: 450, r: 300},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        startingPoint = drawCanvas?.getStartingPoint(20) || {x: 0, y: 0};
        firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[1], startingPoint, 200);
        expect(firstTurningPoint?.touchingCircle).toEqual({x: 600, y: 450, r: 300});

        // when turningPoint.x is larger than this.width - currentCircle.r
        circles = [
            {x: 900, y: 705, r: 300},
            {x: 1100, y: 300, r: 300},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        startingPoint = {x: 900, y: 1005};
        y = Math.sqrt(500**2 - 300**2) + 300;
        let turningPoint = drawCanvas?.getNextTurningPoint(circles[1], startingPoint, 200);
        expect(turningPoint?.touchingCircle).toBeUndefined();
        expect(turningPoint?.turningPoint.x).toBeCloseTo(1400);
        expect(turningPoint?.turningPoint.y).toBeCloseTo(y);

        // when touchingPoint is below 0
    });

    test('getStartingPoint -- return starting point for the next circle', () => {
        // when there are multiple rows of circles
        let circles = [
            {x: 200, y: 200, r: 200},
            {x: 600, y: 200, r: 200},
            {x: 1000, y: 200, r: 200},
            {x: 1400, y: 200, r: 200},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        let y1 = Math.sqrt(500**2 - 200**2) + 200;
        let startingPoint = drawCanvas?.getStartingPoint(200);
        expect(startingPoint).toEqual({x: 200, y: 600});
        const lastCircle = {x: 400, y: y1, r: 200};
        if(drawCanvas) drawCanvas.lastCircle = lastCircle;

        let y2 = Math.sqrt(350**2 - 250**2) + lastCircle.y;
        startingPoint = drawCanvas?.getStartingPoint(150);
        expect(startingPoint).toEqual({x: 150, y: y2});
    });
});