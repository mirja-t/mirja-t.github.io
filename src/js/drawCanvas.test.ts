import {afterEach, beforeEach, describe, expect, test} from '@jest/globals';
import {DrawCanvas} from './drawCanvas';

let drawCanvas: DrawCanvas | null;
let canvas: HTMLCanvasElement;

beforeEach(() => {
    jest.mock('../../bundle-loader', () => ({
        importFiles: jest.fn(() => ({
                'image1.png': 'mocked/path/image1.png',
                'image2.jpg': 'mocked/path/image2.jpg',
            })
        ),
    }));
    const bundleLoader = require('../../bundle-loader');
    bundleLoader.importFiles.mockReturnValue({});
    
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        arc: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        scale: jest.fn(),
        rotate: jest.fn(),
        translate: jest.fn(),
        transform: jest.fn(),
        setLineDash: jest.fn(),
        strokeRect: jest.fn(),
        clip: jest.fn(),
    })) as unknown as HTMLCanvasElement['getContext'];
    canvas = document.createElement('canvas');
    drawCanvas = new DrawCanvas(1600, 900, canvas, [], 1, 1.1);
    drawCanvas.circles = [
        {x: 450, y: 150, r: 150, name: ''},
        {x: 205.051025722, y: 100, r: 100, name: ''},
        {x: 694.948974278, y: 100, r: 100, name: ''},
        {x: 100, y: 270.18895967352199071, r: 100, name: ''},
        {x: 304.2617, y: 414.3318, r: 150, name: ''}
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
            {x: 100, y: 100, r: 100, name: ''},
            {x: 400, y: 400, r: 100, name: ''}
        ]
        let touchingPoints = drawCanvas?.getTouchingPoints(circles[0], circles[1]);
        expect(touchingPoints).toEqual([]);

        // return array with one object if circles are touching but not overlapping
        circles = [
            {x: 100, y: 100, r: 100, name: ''},
            {x: 300, y: 100, r: 100, name: ''}
        ]
        touchingPoints = drawCanvas?.getTouchingPoints(circles[0], circles[1]);
        expect(touchingPoints).toEqual([{x: 200, y: 100}]);

        // return array with one object if circles are overlapping
        circles = [
            {x: 100, y: 100, r: 100, name: ''},
            {x: 200, y: 100, r: 100, name: ''}
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
        expect(mostLeftBottomCircle).toEqual({x: 100, y: 270.18895967352199071, r: 100, name: ''});

        // when there are multiple rows of circles
        let circles = [
            {x: 200, y: 400, r: 200, name: ''},
            {x: 600, y: 450, r: 300, name: ''}
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        mostLeftBottomCircle = drawCanvas?.getLeftBottomMostCircle(120);
        expect(mostLeftBottomCircle).toEqual({x: 200, y: 400, r: 200, name: ''});
    });
    test('getStartingPoint -- return starting point for the next circle', () => {
        const startingPoint = drawCanvas?.getStartingPoint(20, {x: 100, y: 270.18895967352199071, r: 100, name: ''});
        const y = Math.sqrt(120**2 - 80**2) + 270.18895967352199071;
        expect(startingPoint?.x).toEqual(20);
        expect(startingPoint?.y).toBeCloseTo(y);
    });
    test('getNextTurningPoint -- return 2nd touchingPoint of current circle', () => {
        // getNextTurningPoint(currentCircle: Circle, startingPoint: Coordinate, r: number)
        let circles = [
            {x: 100, y: 100, r: 100, name: ''},
            {x: 300, y: 100, r: 100, name: ''}
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        let y = Math.sqrt(120**2 - 80**2) + 100;
        let y2 = Math.sqrt(120**2 - 100**2) + 100;
        let startingPoint = {x: 20, y};
        let firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
        expect(firstTurningPoint?.turningPoint).toEqual({x: 200, y: y2});

        // when circle hits the top of the canvas
        circles = [
            {x: 100, y: 100, r: 100, name: ''},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        y = Math.sqrt(120**2 - 80**2) + 100;
        startingPoint = {x: 20, y};
        firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
        expect(firstTurningPoint?.touchingCircle).toBeUndefined();
        expect(firstTurningPoint?.turningPoint).toEqual({x: Math.sqrt(120**2 - 80**2) + 100, y: 20});

        // when turningPoint.x is smaller than currentCircle.x + currentCircle.r
        circles = [
            {x: 100, y: 100, r: 100, name: ''},
            {x: Math.sqrt(120**2 - 80**2) + 100, y: 20, r: 20, name: ''}
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
            {x: 455, y: 154, r: 154, name: ''},
            {x: 200, y: 400, r: 200, name: ''},
            {x: 600, y: 450, r: 300, name: ''},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        if(drawCanvas) startingPoint = drawCanvas?.getStartingPoint(20, circles[1]);
        firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[1], startingPoint, 200);
        expect(firstTurningPoint?.touchingCircle).toEqual({x: 600, y: 450, r: 300, name: ''});

        // when turningPoint.x is larger than this.width - currentCircle.r
        circles = [
            {x: 900, y: 705, r: 300, name: ''},
            {x: 1100, y: 300, r: 300, name: ''},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        startingPoint = {x: 900, y: 1005};
        y = Math.sqrt(500**2 - 300**2) + 300;
        let turningPoint = drawCanvas?.getNextTurningPoint(circles[1], startingPoint, 200);
        expect(turningPoint?.turningPoint.x).toBeCloseTo(1400, 1);
        expect(turningPoint?.turningPoint.y).toBeCloseTo(y, 1);

        // when touchingPoint is below 0
    });

    test('getStartingPoint -- return starting point for the next circle', () => {
        // getStartingPoint(r: number, mostBottomLeftCircle: Circle): Coordinate 

        // when there are multiple rows of circles
        let circles = [
            {x: 200, y: 200, r: 200, name: ''},
            {x: 600, y: 200, r: 200, name: ''},
            {x: 1000, y: 200, r: 200, name: ''},
            {x: 1400, y: 200, r: 200, name: ''},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        let y1 = Math.sqrt(400**2 - 200**2) + 200;
        let startingPoint = drawCanvas?.getStartingPoint(200, circles[0]);
        expect(startingPoint).toEqual({x: 200, y: 600});
        const lastCircle = {x: 400, y: y1, r: 200, name: ''};
        if(drawCanvas) drawCanvas.lastCircle = lastCircle;

        let y2 = Math.sqrt(350**2 - 250**2) + lastCircle.y;
        startingPoint = drawCanvas?.getStartingPoint(150, lastCircle);
        expect(startingPoint).toEqual({x: 150, y: y2});
    });
    // test('getCirclePosition', () => {
    //     // if first circle
    //     let circles = []
    //     const currentCircle = drawCanvas?.getCirclePosition({r: 100, name: ''});
    //     expect(currentCircle).toEqual({x: 100, y: 100, r: 100, name: ''});
    // });
});