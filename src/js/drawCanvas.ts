// @ts-ignore
import ICONS from '../../dist/assets/images/design/icons.js';
import { getFilledSvgUrl } from './modifySvg';

// const images = require.context('../../dist/assets/images/design', false, /\.(png|jpe?g|svg)$/);
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

    constructor(width: number, height: number, canvas: HTMLCanvasElement, items: Item[], count: number, scale: number) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.scale= scale;
        this.count = count;
        this.ctx = this.canvas.getContext('2d');
        this.items = items.sort((a, b) => b.r - a.r);
        this.circles = [];
        this.lastClickedCircleName;
        this.init();
    }

    init () {
        
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
        const indexOfClickedCircle = this.circles.indexOf(clickedCircle);
        const indexOfLastClickedCircle = this.circles.findIndex(c => c.name === this.lastClickedCircleName);
        const redrawIdx = Math.max(0, Math.min(indexOfClickedCircle, indexOfLastClickedCircle));
        this.items = this.circles.slice(redrawIdx).map((c, i) => ({
            name: c.name, 
            r: (c.name===clickedCircle.name && clickedCircle.name !== this.lastClickedCircleName) ? c.r*this.scale : 
                (c.name===this.lastClickedCircleName && clickedCircle.name !== this.lastClickedCircleName) || (c.name===this.lastClickedCircleName && clickedCircle.name === this.lastClickedCircleName) ? c.r/this.scale : 
                c.r
        }));
        this.circles = this.circles.slice(0, redrawIdx);

        this.clearRect();
        this.createCircles(clickedCircle.name !== this.lastClickedCircleName ? clickedCircle : undefined);
        this.circles.forEach(circle => this.drawImage(circle));

        this.lastClickedCircleName = clickedCircle.name !== this.lastClickedCircleName ? clickedCircle.name : undefined;
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
                this.drawCircle(currentCircle.x, currentCircle.y, currentCircle.r, false, 'orange');
            }
            
            initCircles(idx+1);
        }
        
        initCircles(0);
    }

    getCoord(circle1: Circle, circle2: Circle, r3: number) {
        // Extract coordinates and radii
        const { x: x1, y: y1, r: r1 } = circle1;
        const { x: x2, y: y2, r: r2 } = circle2;
      
        // Calculate the distance between the centers of circle1 and circle2 (Hypotenuse)
        const distABX = x2 > x1 ? x2-x1 : x1-x2 
        const distABY = y2 > y1 ? y2-y1 : y1-y2
        const hypotenuse = Math.sqrt(distABX ** 2 + distABY ** 2);
      
        // Calculate angles
        const sinAlpha = (r3 + r2) / hypotenuse;
        const sinAlpha2 = distABY / hypotenuse;
        const alpha = Math.asin(sinAlpha);
        const alpha2 = Math.asin(sinAlpha2);
      
        // Calculate offsets
        const b = Math.sin(alpha - alpha2) * (r1 + r3);
        const a = Math.cos(alpha - alpha2) * (r1 + r3);
      
        // Calculate coordinates of circle3
        const x3 = x1 + a;
        const y3 = y1 + b;
      
        return { x: x3, y: y3 };
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
        let currentCircle: Circle = this.getLeftBottomMostCircle(r);
        let startingPoint: Coordinate = this.getStartingPoint(r, currentCircle);
        let {touchingCircle, turningPoint} = this.getNextTurningPoint(currentCircle, startingPoint, r);
        turningPoints.push(startingPoint);
        turningPoints.push(turningPoint);
        while(touchingCircle) {
            startingPoint = turningPoint;
            currentCircle = touchingCircle;
            if(!currentCircle || !startingPoint) break;
            let nextTurningPoint = this.getNextTurningPoint(currentCircle, startingPoint, r);
            touchingCircle = nextTurningPoint.touchingCircle;
            turningPoint = nextTurningPoint.turningPoint;
            turningPoints.push(turningPoint);
        }
        return turningPoints;
    }

    getNextTurningPoint(currentCircle: Circle, startingPoint: Coordinate, r: number) {
        
        // const angle = Math.atan2(currentCircle.y - startingPoint.y, currentCircle.x - startingPoint.x);
        // allgemeine Kreisgleichung
        // (x – xM)² + (y – yM)² = r²
        // (y – yM)² = r² - (x – xM)²
        // y = √(r² - (x – xM)²) + yM

        const getNextXY = (radians: number): [number, number] => [
            currentCircle.x + (currentCircle.r+r) * Math.sin(radians),
            currentCircle.y + (currentCircle.r+r) * Math.cos(radians),
        ]; 
        let [x,y] = [startingPoint.x, startingPoint.y];
        let nextTouchingCircle;
        let radians = Math.atan2(x-currentCircle.x, y-currentCircle.y);
        while(
            !nextTouchingCircle 
            && radians-Math.atan2(x-currentCircle.x, y-currentCircle.y) < Math.PI*2 
            && y > r
            && x < this.width - r
        ) {
            radians+=0.05;
            let nextXY = getNextXY(radians);
            [x,y] = nextXY;
            nextTouchingCircle = this.getNextTouchingCircle({x, y},r-1);
        }
        const x1 = currentCircle.x + Math.sqrt((currentCircle.r+r)**2 - (currentCircle.r-r)**2);
        const y1 = r;
        const x2 = this.width - r;
        const y2 = currentCircle.y + Math.sqrt((currentCircle.r + r)**2 - (x2 - currentCircle.x)**2);
        const exceedsCanvasWidth = x1 > this.width - r;
        let touchingPoints: Coordinate[] = [
            {
                x: exceedsCanvasWidth ? x2 : x1, 
                y: exceedsCanvasWidth ? y2 : y1
            }
        ];
        if(nextTouchingCircle) touchingPoints = this.getTouchingPoints(this.extendCircle(currentCircle,r), this.extendCircle(nextTouchingCircle, r));
        return {
            touchingCircle: nextTouchingCircle,
            turningPoint: touchingPoints[0]
        }
    }

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

    drawCircle(x: number, y: number, r: number, outline = false, color: string = 'black') {
        if(!this.ctx) return;
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
        img.src = await getFilledSvgUrl(ICONS, circle.name, 'white');
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