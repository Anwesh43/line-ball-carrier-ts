const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02
const strokeFactor : number = 90
const sizeFactor : number = 4.5
const nodes : number = 5
const foreColor : string = "green"
const backColor : string = "#bdbdbd"
const delay : number = 30

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
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

    static drawLineCircle(context : CanvasRenderingContext2D, size : number, scale : number, circle : boolean, next : boolean) {
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sf : number = ScaleUtil.sinify(scale, 1)
        const sf1 : number = ScaleUtil.sinify(sc1, 2)
        if (sf > 0) {
            DrawingUtil.drawLine(context, 0, 0, size * sf, 0)
        }
        if (circle) {
            DrawingUtil.drawCircle(context, size * sf1, 0, size / sizeFactor)
        }
        var lines = next ? 2 : 1
        for (var i = 0; i < lines; i++) {
            context.save()
            context.translate(size * i, 0)
            DrawingUtil.drawLine(context, -size / sizeFactor, size / sizeFactor, size / sizeFactor, size / sizeFactor)
            context.restore()
        }
    }

    static drawLBCNode(context : CanvasRenderingContext2D, i : number, scale : number, currI : number) {
        const gap : number = w / (nodes + 2)
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = foreColor
        context.fillStyle = foreColor
        context.save()
        context.translate(gap * (i + 1), h / 2)
        DrawingUtil.drawLineCircle(context, gap, scale, currI == i, i == nodes - 1)
        context.restore()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        console.log(this.scale)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            console.log("coming here")
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            console.log("stopping animator")
            clearInterval(this.interval)
        }
    }
}

class LBCNode {

    prev : LBCNode
    next : LBCNode
    state : State = new State()

    constructor(public i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LBCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D, currI : number) {
        DrawingUtil.drawLBCNode(context, this.i, this.state.scale, currI)
        if (this.next) {
            this.next.draw(context, currI)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LBCNode {
        var curr : LBCNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LineBallCarrier {

    root : LBCNode = new LBCNode(0)
    curr : LBCNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context, this.curr.i)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    lbc : LineBallCarrier = new LineBallCarrier()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.lbc.draw(context)
    }

    handleTap(cb : Function) {
        this.lbc.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.lbc.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
