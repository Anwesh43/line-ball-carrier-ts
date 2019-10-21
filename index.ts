const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02
const strokeFactor : number = 90
const sizeFactor : number = 4.5
const nodes : number = 5
const foreColor : string = "#01579B"
const backColor : string = "#bdbdbd"

class Stage {

    canvas : HTMLCanvasElement
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number, n : number) : number {
        return Math.sin(scale * Math.PI / n)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawLineCircle(context : CanvasRenderingContext2D, size : number, scale : number) {
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sf : number = ScaleUtil.sinify(scale, 1)
        const sf1 : number = ScaleUtil.sinify(sc1, 2)
        DrawingUtil.drawLine(context, 0, 0, size * sf, 0)
        DrawingUtil.drawCircle(context, size * sf1, 0, size / sizeFactor)
    }

    static drawLCNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = w / (nodes + 2)
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = foreColor
        context.fillStyle = foreColor
        context.save()
        context.translate(gap * (i + 1), h / 2)
        DrawingUtil.drawLineCircle(context, gap, scale)
        context.restore()
    }
}
