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
        this.items = items;
        this.circles = [];
        this.redrawnCircles = [];
        this.lastClickedCircleName;
        this.init();
    }

    init () {
        this.setCanvasSize();
        this.createCircles();
        this.circles.forEach(async(circle) => await this.drawImage(circle));
        // this.canvas.addEventListener('click', this.handleClickedCircle);
    }

    setCanvasSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createCircles(clickedCircle?: Circle) {
        const initCircles = (idx: number) => {
            if(idx > this.count-1) return;
            const currentItem = this.items.shift();
            if(!currentItem) return;
            const currentCircle = this.getPositionedCircle(currentItem);
            this.lastCircle = currentCircle;
            if(clickedCircle?.name===currentCircle.name) {
                this.drawCircle(currentCircle, 'orange');
            }
            
            initCircles(idx+1);
        }
        
        initCircles(0);
    }

    getCornerCircleRadius(r: number): number {
        const hypothenuse = Math.sqrt(r**2 + r**2);
        return (hypothenuse - r) / 2;
    }

    getLeftBottomMostCircle(r: number): Circle {
        const leftOfIncoming = this.circles.filter(c => c.x - c.r <= r*2) // filter out circles that are right of incoming circle
        const largerThanCornerCircle = leftOfIncoming.filter(c => c.r > this.getCornerCircleRadius(r)); // filter out circles that are smaller than the corner circle
        const initCircle = largerThanCornerCircle[0] || {x: 0, y: r, r: 0, name: 'initialLeftCircle'};
        const lowestCircle = largerThanCornerCircle.reduce((outmost: Circle, current: Circle) => {
            return current.y + current.r > outmost.y + outmost.r ? current : outmost; // return lowest positioned circle
        }, initCircle);

        return lowestCircle.x > r ? this.createInitialLeftCircle(r, lowestCircle) : lowestCircle; 
    }

    createInitialRightCircle = (r: number, counterCircle: Circle) => {
        const initialX = counterCircle.x + Math.sqrt(Math.abs((counterCircle.r+r)**2 - Math.abs((counterCircle.y-r)**2)));
        let x = initialX;
        let y = 0;
        if(counterCircle.x + counterCircle.r + r*2 > this.canvas.width) {
            const hypothenuse = counterCircle.r + r;
            const a =  this.canvas.width - r - counterCircle.x;
            const h = Math.sqrt(hypothenuse**2 - a**2);
            x = this.canvas.width;
            y = counterCircle.y + h;
        }
        return {x, y, r: 0, name: ''};
    }

    createInitialLeftCircle = (r: number, counterCircle?: Circle) => {
        let y = r;
        if(counterCircle && counterCircle.r > r) { 
            const hypothenuse = counterCircle.r + r;
            const a =  counterCircle.x - r;
            const h = Math.sqrt(hypothenuse**2 - a**2);
            y = counterCircle.y + h;
        }
        return {x: 0, y, r: 0, name: 'initialLeftCircle'};
    }

    getNextCircle(currentCircle: Circle, r: number) {
        
        const neighbouringRight = this.circles.filter(c => { // filter out circles that are left of current circle
            return c.x > currentCircle.x;
        })
        .filter(c => { // filter the neighbouring circles that stop the incoming circle from dropping through
            const maxDist = currentCircle.r + r*2 + c.r;
            const dist = Math.sqrt(Math.abs(c.x - currentCircle.x)**2 + Math.abs(c.y - currentCircle.y)**2);
            return dist < maxDist;
        })
        const nextCircle = neighbouringRight.reduce((outmost: Circle, current: Circle) => {
            const turningPointCurrent = this.getTurningPoint(r, currentCircle, current);
            const turningPointOutmost = this.getTurningPoint(r, currentCircle, outmost);
            const angleCurrent = Math.atan2(turningPointCurrent.y - currentCircle.y, turningPointCurrent.x - currentCircle.x);
            const angleOutmost = Math.atan2(turningPointOutmost.y - currentCircle.y, turningPointOutmost.x - currentCircle.x);
            return angleOutmost > angleCurrent ? outmost : current; // return the circle with the biggest radians from currentCircle center point
        }, this.createInitialRightCircle(r, currentCircle));

        return nextCircle;
    }

    getTurningPoint(r: number, leftCircle: Circle, rightCircle?: Circle): Coordinate {
        
        rightCircle = rightCircle || this.createInitialRightCircle(r, leftCircle); // if no right circle is given, use a dummy circle at the right edge of the canvas
        
        const distX = rightCircle.x - leftCircle.x;
        const distY = rightCircle.y - leftCircle.y;
        const angleAtC = Math.atan2(distY, distX); // angle between a (dist c1-c2 center points) and x axis in radians
        const a = Math.sqrt(distX**2 + Math.abs(distY)**2); // distance between circle1 and circle2 center points
        const b = leftCircle.r + r; // distance between circle1 center point and incoming circle center point
        const c = rightCircle.r + r; // distance between circle2 center point and incoming circle center point
        const gamma = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b)); // angle between a and b at left circle center point
        
        // right triangle
        // a = x
        // b = y
        // a = c * sin(α)
        const absRad = gamma + angleAtC; // angle between x axis and line from circle1 center point to incoming circle center point
        const x = b * Math.cos(absRad) + leftCircle.x; // x coordinate of incoming circle center point
        const y = b * Math.sin(absRad) + leftCircle.y; // y coordinate of incoming circle center point

        return {x, y};
    };

    getTurningPoints(r: number): {x: number, y: number}[] { // get outline 
        const turningPoints: Coordinate[] = [];
        let currentCircle: Circle = this.getLeftBottomMostCircle(r);
        let nextCircle = this.getNextCircle(currentCircle, r);

        do {
            turningPoints.push(this.getTurningPoint(r, currentCircle, nextCircle));
            currentCircle = nextCircle;
            if(!currentCircle || !currentCircle.name) break;
            nextCircle = this.getNextCircle(currentCircle, r);
        }
        while(currentCircle)

        return turningPoints;
    }

    handleClickedCircle = (e: MouseEvent) => {
        // const {offsetX, offsetY} = e;
        // const factor = this.canvas.offsetWidth / this.width;
        // const x = offsetX / factor;
        // const y = offsetY / factor;
        // const clickedCircle = this.circles.find(c => Math.abs(x - c.x)**2 + Math.abs(y - c.y)**2 <= c.r**2);
        // if(!clickedCircle) return;

        // const recalculatedCircle = this.recalculateCircle(clickedCircle);
        // const indexOfClickedCircle = this.circles.indexOf(clickedCircle);

        // this.clearRect();
        // this.redrawnCircles = [];
        // this.circles.slice(0, indexOfClickedCircle).forEach(circle => this.redrawnCircles.push(circle));
        // this.redrawnCircles.push(recalculatedCircle);
        // this.circles.slice(indexOfClickedCircle+1).forEach(circle => {
        //     const recalculatedCircle = this.recalculateCircle(circle, this.redrawnCircles, 1);
        //     this.redrawnCircles.push(recalculatedCircle)
        // });
        // this.redrawnCircles.forEach(circle => this.drawImage(circle));
    }

    recalculateCircle(clickedCircle: Circle, source = this.circles = this.circles, scale = this.scale) {
        
    }

    getPositionedCircle(currentItem: Item): Circle {
        const radius = currentItem.r;
        const turningPoints = this.getTurningPoints(radius);
        const nextTurningPoint = turningPoints.reduce((tp1, tp2) => tp1.y < tp2.y ? tp1 : tp2,{x: this.width, y: this.height});
        const currentCircle = {x: nextTurningPoint.x, y: nextTurningPoint.y, r: radius, name: currentItem.name};

        return currentCircle;
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

    toRadians(deg: number) {
        return deg * Math.PI / 180;
    }

    toDegrees(radians: number) {
        return radians * (180 / Math.PI);
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