// @ts-ignore
import ICONS from './icons.js';
import { getFilledSvgUrl } from './modifySvg';


type Item = {name: string, r: number};
type Circle = {x: number, y: number, r: number, name: string};
type Coordinate = {x: number, y: number};

export class DrawCanvas {   
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    scale: number;
    ctx: CanvasRenderingContext2D | null;
    items: {name: string, r: number}[];
    count: number;
    lastClickedCircleName: string | undefined;
    circles: Circle[];
    redrawnCircles: Circle[];

    constructor(width: number, height: number, canvas: HTMLCanvasElement, items: Item[], count: number, scale: number) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.scale= scale;
        this.count = count;
        this.ctx = this.canvas.getContext('2d');
        this.items = items.sort((a, b) => b.r - a.r);
        this.circles = [];
        this.redrawnCircles = [];
        this.lastClickedCircleName;
        this.init();
    }

    init () {
        console.log('init')
        this.setCanvasSize();
        this.createCircles();
        this.circles.forEach(async(circle) => await this.drawImage(circle));
        this.canvas.addEventListener('click', this.handleClickedCircle);
    }

    handleClickedCircle = (e: MouseEvent) => {
        const {offsetX, offsetY} = e;
        const factor = this.canvas.offsetWidth / this.width;
        const x = offsetX / factor;
        const y = offsetY / factor;
        const clickedCircle = this.circles.find(c => Math.abs(x - c.x)**2 + Math.abs(y - c.y)**2 <= c.r**2);
        if(!clickedCircle) return;

        const recalculatedCircle = this.recalculateCircle(clickedCircle);
        const indexOfClickedCircle = this.circles.indexOf(clickedCircle);

        this.clearRect();
        this.redrawnCircles = [];
        this.circles.slice(0, indexOfClickedCircle).forEach(circle => this.redrawnCircles.push(circle));
        this.redrawnCircles.push(recalculatedCircle);
        this.circles.slice(indexOfClickedCircle+1).forEach(circle => {
            const recalculatedCircle = this.recalculateCircle(circle, this.redrawnCircles, 1);
            this.redrawnCircles.push(recalculatedCircle)
        });
        this.redrawnCircles.forEach(circle => this.drawImage(circle));
    }

    getNeighbouringCircles(circle: Circle, source = this.circles) {
        const threshold = 0.1;
        const circleIdx = source.indexOf(circle);
        const prevCircles = source.slice(0, circleIdx);

        const isCircleTouching = (currentCircle: Circle) => {
            // theorem of Pythagoras

            // a = horizonal line from center of target circle to center of current circle
            const a = Math.abs(circle.x - currentCircle.x);

            // b = vertical line from center of target circle to center of current circle
            const b = Math.abs(circle.y - currentCircle.y);

            // c = distance between center of target circle and center of current circle

            // d = radius of target circle + radius of current circle
            const d = circle.r + currentCircle.r;

            // if c <= d, the circles are touching
            return Math.sqrt(a**2 + b**2) <= Math.sqrt(d**2 + threshold)
        };

        const leftNeighbouringCircle = prevCircles.reduce((prevCircle, currentCircle) => {
            const isLeftOfTarget = currentCircle.x < circle.x;
            const isFurtherRightThanPrev = currentCircle.x > prevCircle.x;

            return isFurtherRightThanPrev && isLeftOfTarget && isCircleTouching(currentCircle) ? currentCircle : prevCircle;
        }, {x: 0, y: 0, r: 0, name: ''});

        const rightNeighbouringCircle = prevCircles.reduce((prevCircle, currentCircle) => {
            const isRightOfTarget = currentCircle.x > circle.x;
            const isFurtherLeftThanPrev = currentCircle.x < prevCircle.x;

            return isFurtherLeftThanPrev && isRightOfTarget && isCircleTouching(currentCircle) ? currentCircle : prevCircle;
        }, {x: this.width, y: 0, r: 0, name: ''});

        return [leftNeighbouringCircle, rightNeighbouringCircle];
    }

    recalculateCircle(clickedCircle: Circle, source = this.circles = this.circles, scale = this.scale) {
        const [leftNeighbouringCircle, rightNeighbouringCircle] = this.getNeighbouringCircles(clickedCircle, source);
        const newPosition = this.getNewCoordOfTargetCircle(leftNeighbouringCircle, rightNeighbouringCircle, clickedCircle, scale);
        // console.log(leftNeighbouringCircle, rightNeighbouringCircle);
        return {x: newPosition.x, y: newPosition.y, r: clickedCircle.r*scale, name: clickedCircle.name};
    }

    getCirclePosition(currentItem: Item): Circle {
        const radius = currentItem.r;
        const turningPoints = this.getTurningPoints(radius);
        const nextTurningPoint = turningPoints.reduce((tp1, tp2) => tp1.y < tp2.y ? tp1 : tp2,{x: this.width, y: this.height});
        const currentCircle = {x: nextTurningPoint.x, y: nextTurningPoint.y, r: radius, name: currentItem.name};

        return currentCircle;
    }

    createCircles(clickedCircle?: Circle) {
        const initCircles = (idx: number) => {
            if(idx > this.count-1) return;
            const currentItem = this.items.shift();
            if(!currentItem) return;
            const currentCircle = this.getCirclePosition(currentItem);
            this.lastCircle = currentCircle;
            if(clickedCircle?.name===currentCircle.name) {
                this.drawCircle(currentCircle, 'orange');
            }
            
            initCircles(idx+1);
        }
        
        initCircles(0);
    }

    getNewCoordOfTargetCircle(leftCircle: Circle, rightCircle: Circle, targetCircle: Circle, scale = this.scale) {
        const r3 = targetCircle.r*scale;

        // distance between left and target circle, distance between right and target circle
        const [dist_1_3, dist_2_3] = [leftCircle.r+r3, rightCircle.r+r3];
        let distX = rightCircle.x - leftCircle.x;

        // distance between left and right circle
        // calculated with theorem of Pythagoras
        // dist x of left and right neighbouring circles
        // dist y of left and right neighbouring circles
        const distY = Math.abs(leftCircle.y - rightCircle.y);
        // dist_1_2 = distance between left and right neighbouring circles
        let dist_1_2 = Math.sqrt(distX**2 + distY**2);

        // angle between xy1/xy2 and xy1/xy2
        const alpha1 = Math.atan2(rightCircle.y-leftCircle.y, distX);

        // law of Cosines
        const cosineOfAlpha2 = (dist_1_2 ** 2 + dist_1_3 ** 2 - dist_2_3 ** 2) / (2 * dist_1_2 * dist_1_3);
        // angle between xy1/xy2 and xy1/xy3
        const alpha2 = Math.acos(Math.min(1, cosineOfAlpha2));
        const alpha = alpha1 + alpha2;
        // cos(alpha) = Ankathete / Hypothenuse
        // Ankathete = cos(alpha) * Hypothenuse
        const x1x3 = Math.cos(alpha) * dist_1_3;
        const y1y3 = Math.sin(alpha) * dist_1_3;

        let x = x1x3 + leftCircle.x;
        let y = y1y3 + leftCircle.y;

        // if first circle
        if(leftCircle.r === 0 && rightCircle.r === 0) {
            x = r3; 
            y = r3;
        }
        else if(rightCircle.r === 0) {
            distX = Math.sqrt((leftCircle.r + r3) ** 2 - Math.abs(r3 - leftCircle.y) ** 2);
            x = leftCircle.x + distX;
            y = r3;
            if(x + r3 > this.width) {
                x = this.width - r3;
                distX = Math.abs(x - leftCircle.x);
                y = Math.sqrt((leftCircle.r + r3) ** 2  - distX ** 2) + leftCircle.y;
            }
        }
        else if(leftCircle.r === 0) {
            const distY = Math.sqrt((rightCircle.r + r3) ** 2 - Math.abs(rightCircle.x -r3) ** 2);
            x = r3;
            y = rightCircle.y + distY;
        }

        return { 
            x,
            y
        }
    }

    get lastCircle() {
        return this.circles[this.circles.length-1];
    }

    set lastCircle(circle) {
        this.circles.push(circle);
    }

    get canvasSize() {
        return Math.min(this.width, this.height);
    }

    getLeftBottomMostCircle(r: number = 0) {
        return this.circles.filter(c => c.x - c.r <= r*2)
        .reduce((outmost: Circle, current: Circle) => {
            return current.y > outmost.y ? current : outmost;
        }, {x: 0, y: 0, name: '', r: 0});
    }

    getTouchingPoints(circle1: Circle, circle2: Circle) {
        const [leftCircle, rightCircle] = circle1.x < circle2.x ? [circle1, circle2] : [circle2, circle1];
        const distX = rightCircle.x - leftCircle.x;
        const distY = rightCircle.y - leftCircle.y;
        const angle = Math.atan2(distY, distX);
        const h = Math.sqrt(distX**2 + distY**2);
        const angle2 = Math.acos((leftCircle.r**2 + h**2 - rightCircle.r**2) / (2 * leftCircle.r * h));
        const x1 = leftCircle.x + Math.cos(angle+angle2) * leftCircle.r;
        const y1 = leftCircle.y + Math.sin(angle+angle2) * leftCircle.r; 
        const x2 = leftCircle.x + Math.cos(angle-angle2) * leftCircle.r;
        const y2 = leftCircle.y + Math.sin(angle-angle2) * leftCircle.r; 

        const item1 = !isNaN(x1 + y1) ? [{x: x1, y: y1}] : [];
        const item2 = !isNaN(x2 + y2) && (x1 !== x2 || y1 !== y2) ? [{x: x2, y: y2}] : [];
        return [...item1, ...item2];
    }

    getTurningPoints(r: number) {
        if(this.circles.length === 0) return [{x: r, y: r}];
        const turningPoints: Coordinate[] = [];
        const leftMostCircle = this.getLeftBottomMostCircle(r);
        let currentCircle: Circle = leftMostCircle;
        const getTurningPoint = (circle1: Circle, circle2: Circle) => {
            const distX = circle2.x - circle1.x;
            const distY = Math.abs(circle2.y - circle1.y);
            const angle1 = Math.atan2(distY, distX);
            const h = Math.sqrt(distX**2 + distY**2);
            const angle2 = Math.acos((circle1.r**2 + h**2 - circle2.r**2) / (2 * circle1.r * h));
            const angle = angle1 + angle2;
            const x = circle1.x + Math.cos(angle) * h;
            const y = circle1.x + Math.sin(angle) * h;
            
            return {x, y};
        };
        const findNextCircle = (circle: Circle) => this.circles.filter(c => {
            // console.log(c, circle);
            const dist = Math.sqrt((c.x - circle.x)**2 + (c.y - circle.y)**2);
            return dist < c.r + circle.r + r;
        })
        .reduce((outmost: Circle, current: Circle) => {
            return getTurningPoint(current, currentCircle).y > getTurningPoint(outmost, currentCircle).y ? current : outmost;
        }, leftMostCircle);
        let nextCircle = findNextCircle(currentCircle);
        let counter = 0;
        while(nextCircle) {
            if(counter++ > 10) break;
            turningPoints.push(getTurningPoint(currentCircle, nextCircle));
            // console.log(currentCircle, nextCircle);
            currentCircle = nextCircle;
            nextCircle = findNextCircle(currentCircle);
        }
        // console.log(turningPoints);
        // let startingPoint: Coordinate = this.getStartingPoint(r, currentCircle);
        // let {touchingCircle, turningPoint} = this.getNextTurningPoint(currentCircle, startingPoint, r);
        // turningPoints.push(startingPoint);
        // turningPoints.push(turningPoint);
        // while(touchingCircle) {
        //     startingPoint = turningPoint;
        //     currentCircle = touchingCircle;
        //     if(!currentCircle || !startingPoint) break;
        //     let nextTurningPoint = this.getNextTurningPoint(currentCircle, startingPoint, r);
        //     touchingCircle = nextTurningPoint.touchingCircle;
        //     turningPoint = nextTurningPoint.turningPoint;
        //     turningPoints.push(turningPoint);
        // }

        return turningPoints;
    }

    // getNextTurningPoint(currentCircle: Circle, startingPoint: Coordinate, r: number) {
        
    //     // const angle = Math.atan2(currentCircle.y - startingPoint.y, currentCircle.x - startingPoint.x);
    //     // allgemeine Kreisgleichung
    //     // (x – xM)² + (y – yM)² = r²
    //     // (y – yM)² = r² - (x – xM)²
    //     // y = √(r² - (x – xM)²) + yM

    //     const getNextXY = (radians: number): [number, number] => [
    //         currentCircle.x + (currentCircle.r+r) * Math.sin(radians),
    //         currentCircle.y + (currentCircle.r+r) * Math.cos(radians),
    //     ]; 
    //     let [x,y] = [startingPoint.x, startingPoint.y];
    //     let nextTouchingCircle;
    //     let radians = Math.atan2(x-currentCircle.x, y-currentCircle.y);
    //     while(
    //         !nextTouchingCircle 
    //         && radians-Math.atan2(x-currentCircle.x, y-currentCircle.y) < Math.PI*2 
    //         && y > r
    //         && x < this.width - r
    //     ) {
    //         radians+=0.05;
    //         let nextXY = getNextXY(radians);
    //         [x,y] = nextXY;
    //         nextTouchingCircle = this.getNextTouchingCircle({x, y},r-1);
    //     }
    //     const x1 = currentCircle.x + Math.sqrt((currentCircle.r+r)**2 - (currentCircle.r-r)**2);
    //     const y1 = r;
    //     const x2 = this.width - r;
    //     const y2 = currentCircle.y + Math.sqrt((currentCircle.r + r)**2 - (x2 - currentCircle.x)**2);
    //     const exceedsCanvasWidth = x1 > this.width - r;
    //     let touchingPoints: Coordinate[] = [
    //         {
    //             x: exceedsCanvasWidth ? x2 : x1, 
    //             y: exceedsCanvasWidth ? y2 : y1
    //         }
    //     ];
    //     if(nextTouchingCircle) touchingPoints = this.getTouchingPoints(this.extendCircle(currentCircle,r), this.extendCircle(nextTouchingCircle, r));
    //     return {
    //         touchingCircle: nextTouchingCircle,
    //         turningPoint: touchingPoints[0]
    //     }
    // }

    getStartingPoint(r: number, mostBottomLeftCircle: Circle): Coordinate {
        const y = Math.sqrt((mostBottomLeftCircle.r+r)**2 - (mostBottomLeftCircle.x-r)**2) + mostBottomLeftCircle.y;
        return {x: r, y};
    }

    calculateRadiansWithCosine(a: number, b: number, c: number, angle: 'alpha' | 'beta' | 'gamma' = 'alpha') {
        
        // law of Cosines
        const angles = {
            alpha: Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c)),
            beta: Math.acos((a ** 2 + c ** 2 - b ** 2) / (2 * a * c)),
            gamma: Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b))
        }
        
        return angles[angle];
    }

    getNextTouchingCircle(coord: Coordinate, r: number = 0) {
        // allgemeine Kreisgleichung
        // (x – xM)² + (y – yM)² < r²
        const {x,y} = coord; 
        const nextTouchingCircle = this.circles.find(c => (x - c.x)**2 + (y - c.y)**2 <= (c.r+r)**2);
        return nextTouchingCircle;
    }

    extendCircle(circle: Circle, r: number) {
        return {...circle, r: circle.r + r};
    }

    getDist(a: number, b: number) { 
        const sorted = [a, b].sort((a, b) => b - a);
        return sorted[0] - sorted[1];
    }

    toRadians(deg: number) {
        return deg * Math.PI / 180;
    }

    toDegrees(radians: number) {
        return radians * (180 / Math.PI);
    }

    setCanvasSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    drawCircle(circle: Circle, color: string = 'black', outline = false) {
        if(!this.ctx) return;
        const {x, y, r} = circle;
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
            if(this.ctx) this.ctx.drawImage(img, circle.x-circle.r, circle.y-circle.r, circle.r*2*scale, circle.r*2*scale);
            URL.revokeObjectURL(img.src);
        };
        img.onerror = (e) => {
            console.error("Image failed to load", e);
        };
        img.src = await getFilledSvgUrl(ICONS, circle.name, 'hotpink');
    }

    drawArc(x: number, y: number, r: number, start: number, end: number) {
        if(!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, start, end, true);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    clearRect() {
        if(!this.ctx) return;
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }

    // window.addEventListener('resize', setCanvasSize);

}