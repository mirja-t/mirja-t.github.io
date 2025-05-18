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
    test('getTurningPoints', () => {
        // getTurningPoints(r: number) {
        let circles = [
            {x: 200, y: 200, r: 200, name: ''},
            {x: 600, y: 200, r: 200, name: ''},
            {x: 1000, y: 200, r: 200, name: ''},
            {x: 1400, y: 200, r: 200, name: ''},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        const turningPoints = drawCanvas?.getTurningPoints(200);
        expect(turningPoints).toEqual(
            [{ x: 400, y: 548, r: 200, name: '' },
            { x: 800, y: 548, r: 200, name: '' },
            { x: 1200, y: 548, r: 200, name: '' }],
        );
    })
    // test('getNextTurningPoint -- return 2nd touchingPoint of current circle', () => {
    //     // getNextTurningPoint(currentCircle: Circle, startingPoint: Coordinate, r: number)
    //     let circles = [
    //         {x: 100, y: 100, r: 100, name: ''},
    //         {x: 300, y: 100, r: 100, name: ''}
    //     ]
    //     if(drawCanvas) drawCanvas.circles = circles;
    //     let y = Math.sqrt(120**2 - 80**2) + 100;
    //     let y2 = Math.sqrt(120**2 - 100**2) + 100;
    //     let startingPoint = {x: 20, y};
    //     let firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
    //     expect(firstTurningPoint?.turningPoint).toEqual({x: 200, y: y2});

    //     // when circle hits the top of the canvas
    //     circles = [
    //         {x: 100, y: 100, r: 100, name: ''},
    //     ]
    //     if(drawCanvas) drawCanvas.circles = circles;
    //     y = Math.sqrt(120**2 - 80**2) + 100;
    //     startingPoint = {x: 20, y};
    //     firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
    //     expect(firstTurningPoint?.touchingCircle).toBeUndefined();
    //     expect(firstTurningPoint?.turningPoint).toEqual({x: Math.sqrt(120**2 - 80**2) + 100, y: 20});

    //     // when turningPoint.x is smaller than currentCircle.x + currentCircle.r
    //     circles = [
    //         {x: 100, y: 100, r: 100, name: ''},
    //         {x: Math.sqrt(120**2 - 80**2) + 100, y: 20, r: 20, name: ''}
    //     ]
    //     if(drawCanvas) drawCanvas.circles = circles;
    //     y = Math.sqrt(120**2 - 80**2) + 100;
    //     let alpha1 = Math.acos(80/120)
    //     let alpha2 = Math.acos((120 ** 2 + 120 ** 2 - 40 ** 2) / (2 * 120 * 120));
    //     let x2 = 120 * Math.sin(alpha1+alpha2) + 100;
    //     y2 = 100 - Math.sqrt(120**2 - (x2-100)**2);
    //     startingPoint = {x: 20, y};
    //     firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[0], startingPoint, 20);
    //     expect(firstTurningPoint?.turningPoint).toEqual({x: x2, y: y2});

    //     // when there are multiple rows
    //     circles = [
    //         {x: 455, y: 154, r: 154, name: ''},
    //         {x: 200, y: 400, r: 200, name: ''},
    //         {x: 600, y: 450, r: 300, name: ''},
    //     ]
    //     if(drawCanvas) drawCanvas.circles = circles;
    //     if(drawCanvas) startingPoint = drawCanvas?.getStartingPoint(20, circles[1]);
    //     firstTurningPoint = drawCanvas?.getNextTurningPoint(circles[1], startingPoint, 200);
    //     expect(firstTurningPoint?.touchingCircle).toEqual({x: 600, y: 450, r: 300, name: ''});

    //     // when turningPoint.x is larger than this.width - currentCircle.r
    //     circles = [
    //         {x: 900, y: 705, r: 300, name: ''},
    //         {x: 1100, y: 300, r: 300, name: ''},
    //     ]
    //     if(drawCanvas) drawCanvas.circles = circles;
    //     startingPoint = {x: 900, y: 1005};
    //     y = Math.sqrt(500**2 - 300**2) + 300;
    //     let turningPoint = drawCanvas?.getNextTurningPoint(circles[1], startingPoint, 200);
    //     expect(turningPoint?.turningPoint.x).toBeCloseTo(1400, 1);
    //     expect(turningPoint?.turningPoint.y).toBeCloseTo(y, 1);

    //     // when touchingPoint is below 0
    // });
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
    test('getNeighbouringCircles -- return neighbouring circles of current circle', () => {

        // if there are no neighbouring circles
        let circles = [
            {x: 200, y: 200, r: 200, name: 'circle1'},
        ]
        if(drawCanvas) drawCanvas.circles = circles;
        let [leftNeighbouringCircle, rightNeighbouringCircle] = drawCanvas?.getNeighbouringCircles(circles[0]) || [];
        expect(leftNeighbouringCircle).toEqual({x: 0, y: 0, r: 0, name: ''});

        // if there is no right neighbour
        const circle2 = {x: 546, y: 150, r: 150, name: 'circle2'};
        const circle3 = {x: 846, y: 150, r: 150, name: ''};
        if(drawCanvas) drawCanvas.circles.push(circle2);
        if(drawCanvas) drawCanvas.circles.push(circle3);

        [leftNeighbouringCircle, rightNeighbouringCircle] = drawCanvas?.getNeighbouringCircles(circle3) || [];
        expect(leftNeighbouringCircle.name).toBe('circle2');
        expect(rightNeighbouringCircle).toEqual({x: 1600, y: 0, r: 0, name: ''});

        // if there is no left neighbour
        const circle4 = {x: 1046, y: 100, r: 100, name: ''};
        const circle5 = {x: 1246, y: 100, r: 100, name: ''};
        const circle6 = {x: 1446, y: 100, r: 100, name: 'circle6'};
        const circle7 = {x: 1500, y: 292, r: 100, name: 'circle7'};
        if(drawCanvas) drawCanvas.circles.push(circle4);
        if(drawCanvas) drawCanvas.circles.push(circle5);
        if(drawCanvas) drawCanvas.circles.push(circle6);
        if(drawCanvas) drawCanvas.circles.push(circle7);

        [leftNeighbouringCircle, rightNeighbouringCircle] = drawCanvas?.getNeighbouringCircles(circle7) || [];
        expect(leftNeighbouringCircle).toEqual(circle6);
        expect(rightNeighbouringCircle).toEqual({x: 1600, y: 0, r: 0, name: ''});

        // if there are both neighbours

        const circle8 = {x: 441, y: 377, r: 100, name: ''};
        if(drawCanvas) drawCanvas.circles.push(circle8);

        [leftNeighbouringCircle, rightNeighbouringCircle] = drawCanvas?.getNeighbouringCircles(circle8) || [];
        expect(leftNeighbouringCircle.name).toBe('circle1');
        expect(rightNeighbouringCircle.name).toBe('circle2');
    });
    // test('getNewCoordOfTargetCircle -- return position of new circle', () => {
    //     // getCoordOfNextCircle(circle1: Circle, circle2: Circle, r3: number) 
    //     const x2 = Math.sqrt(500**2 - 100**2) + 200;
    //     let circles = [
    //         {x: 200, y: 200, r: 200, name: ''},
    //         {x: x2, y: 300, r: 300, name: ''},
    //         {x: 1400, y: 200, r: 200, name: ''}
    //     ]
    //     if(drawCanvas) drawCanvas.circles = circles;
    //     const [r1, r2, r3] = [circles[0].r, circles[1].r, 100];
    //     const [xy1xy2, xy1xy3, xy2xy3] = [(r1+r2), (r1+r3), (r2+r3)];
    //     // angle between xy1/xy2 and xy1/xy2
    //     const alpha1 = Math.atan2(100, x2-200);
    //     // angle between xy1/xy2 and xy1/xy3
    //     const alpha2 = Math.acos((xy1xy2 ** 2 + xy1xy3 ** 2 - xy2xy3 ** 2) / (2 * xy1xy2 * xy1xy3));
    //     const alpha = alpha1 + alpha2;
    //     // cos(alpha) = Ankathete / Hypothenuse
    //     // Ankathete = cos(alpha) * Hypothenuse
    //     const x1x3 = Math.cos(alpha) * xy1xy3;
    //     const y1y3 = Math.sin(alpha) * xy1xy3;

    //     const coordOfNextCircle = drawCanvas?.getNewCoordOfCurrentCircle(circles[0], circles[1], {x: 0, y: 0, r: 100, name: ''});
    //     expect(coordOfNextCircle).toEqual({x: x1x3+200, y: y1y3+200});

    //     // if there is no neightbouring left circle but there is a left boundary
    //     const x3 = 100;
    //     const y3 = Math.sqrt(300**2 - 100**2) + 200;
    //     const coordOfNextCircleWithoutLeftNeighbour = drawCanvas?.getNewCoordOfCurrentCircle({x: 0, y: 0, r: 0, name: ''}, circles[0], {x: 0, y: 0, r: 100, name: ''});
    //     expect(coordOfNextCircleWithoutLeftNeighbour).toEqual({x: x3, y: y3});

    //     // if there is no neightbouring right circle but there is a right boundary
    //     const distX4 = (drawCanvas?.width || 1600) - 1400 - 100; // 1500
    //     const y4 = Math.sqrt(300**2 - distX4**2) + circles[2].y; // 482.842712474619
    //     const coordOfNextCircleWithoutRightNeighbour = drawCanvas?.getNewCoordOfCurrentCircle(circles[2], {x: 1600, y: 0, r: 0, name: ''}, {x: 0, y: 0, r: 100, name: ''});
    //     expect(coordOfNextCircleWithoutRightNeighbour).toEqual({x: 1500, y: y4});

    //     // // if there are no neightbouring circles
    //     // const coordOfNextCircleWithoutNeighbour = drawCanvas?.getCoordOfNextCircle({x: 0, y: 0, r: 0, name: ''}, {x: 1920, y: 0, r: 0, name: ''}, 100);
    //     // expect(coordOfNextCircleWithoutNeighbour).toEqual({x: 100, y: 100});
    // });
});