
class Entity {
    constructor(id, x, y){
        this.id = id;
        this.x = x;
        this.y = y;
    }
    update(){

    }
    render(){

    }
}
class Line {
    static ParallelOrConsistent = 0; //const
    constructor(p1, p2){
        this.x1 = p1.x;
        this.x2 = p2.x;
        this.y1 = p1.y;
        this.y2 = p2.y;
    }
}
class Wall extends Entity {
    constructor(x, y, w, h){
        super(Symbol(), x, y)
        this.w = w;
        this.h = h;

        RenderingEngine.lines.push(new Line(
            new Point(this.x - this.w / 2, this.y - this.h / 2),
            new Point(this.x + this.w / 2, this.y - this.h / 2)
        ))
        RenderingEngine.lines.push(new Line(
            new Point(this.x - this.w / 2, this.y + this.h / 2),
            new Point(this.x + this.w / 2, this.y + this.h / 2)
        ))
        RenderingEngine.lines.push(new Line(
            new Point(this.x - this.w / 2, this.y - this.h / 2),
            new Point(this.x - this.w / 2, this.y + this.h / 2)
        ))
        RenderingEngine.lines.push(new Line(
            new Point(this.x + this.w / 2, this.y - this.h / 2),
            new Point(this.x + this.w / 2, this.y + this.h / 2)
        ))

    }
    render(){
        RenderingEngine.ctx.save()
        RenderingEngine.ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h)
        RenderingEngine.ctx.restore()
    }
}
class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    findFarthestPoint(lines){
        return lines.reduce((far, cur) => {
            const which =  this.getDistance({
                x: cur.x1,
                y: cur.y1
            }) > this.getDistance({
                x: cur.x2,
                y: cur.y2
            }) ? new Point(cur.x1, cur.y1) : new Point(cur.x2, cur.y2);
            return this.getDistance(far) > this.getDistance(which) ? far : which;
        }, this.getDistance({
            x: lines[0].x1,
            y: lines[0].y1
        }) > this.getDistance({
            x: lines[0].x2,
            y: lines[0].y2
        }) ? new Point(lines[0].x1, lines[0].y1) : new Point(lines[0].x2, lines[0].y2));
    }
    getDistance(p2){
        return Math.sqrt((p2.x - this.x) ** 2 + (p2.y - this.y) ** 2);
    }
    rotationMatrix(origin, degree){
        const radian = (Math.PI / 180) * degree;
        const x = this.x - origin.x;
        const y = this.y - origin.y;
        this.x = Math.cos(radian) * x - Math.sin(radian) * y + origin.x;
        this.y = Math.sin(radian) * x + Math.cos(radian) * y + origin.y;
        
    }
}
class Physics2D {
    // 시계방향
    static TOP = 0;
    static DOWN = 180;
    static LEFT = 270;
    static RIGHT = 90;
    // 초과 범위 (광선 길이)
    static RAY_ADDITIONAL_LENGTH = 50;
    
    static getIntersectionPoint(line1, line2){
        const det = (line2.y1 - line2.y2) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y1 - line1.y2);
        if (det === 0) {
          return false;
        } else {
          const scala1 = ((line2.x2 - line2.x1) * (line2.y1 - line1.y1) + (line2.y1 - line2.y2) * (line2.x1 - line1.x1)) / det;
          const scala2 = ((line1.x2 - line1.x1) * (line2.y1 - line1.y1) + (line1.y1 - line1.y2) * (line2.x1 - line1.x1)) / det;
          if((0 < scala1 && scala1 < 1) && (0 < scala2 && scala2 < 1)){
            return new Point(
                line1.x1 + ((line1.x2 - line1.x1) * scala1), 
                line1.y1 + ((line1.y2 - line1.y1) * scala1)
            )
          } else {
              return false;
          }
        }
    }
    /**
     * @param {number} direction 
     * @param {Point} point 
     */
    static RayCast(direction, point){
        const farthest = point.findFarthestPoint(RenderingEngine.lines);
        const radius = farthest.y > farthest.x ? farthest.y : farthest.x - point.y;
        const deg0point = new Point(point.x, point.y - radius - Physics2D.RAY_ADDITIONAL_LENGTH);
        deg0point.rotationMatrix(point, direction);

        let ray = new Line(point, deg0point);

        let currentValidatePoint;
        let currentLine;
        for(const line of RenderingEngine.lines){

            const collisionPoint = Physics2D.getIntersectionPoint(ray, line);
            if(collisionPoint){
                if(!currentValidatePoint){
                    currentValidatePoint = collisionPoint;
                    currentLine = line;
                }
                else if(collisionPoint.getDistance(point) < currentValidatePoint.getDistance(point)){
                    currentValidatePoint = collisionPoint;
                    currentLine = line;
                }
            }
        }
        if(!currentValidatePoint){
            RenderingEngine.rays.push(ray)
            return {
                ray,
                point: currentValidatePoint,
                length: null
            };
        }
        ray = new Line(point, currentValidatePoint);
        RenderingEngine.rays.push(ray)

        return {
            ray,
            point: currentValidatePoint,
            length: currentValidatePoint.getDistance(point)
        };
    }
}
class RenderingEngine {
    static entities = [];
    static lines = [];
    static rays = [];
    static ctx = document.getElementById('stage').getContext('2d');
    static update(){
        _.arrayLoop(RenderingEngine.entities, e => {
            e.update()
        }) 
    }
    static loop(){
        RenderingEngine.update()
        RenderingEngine.render()
    }
    static render(){
        RenderingEngine.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        _.arrayLoop(RenderingEngine.entities, e => {
            e.render()
        })
        _.arrayLoop(RenderingEngine.rays, ray => {
            RenderingEngine.ctx.save()
            RenderingEngine.ctx.beginPath()
            RenderingEngine.ctx.strokeStyle = 'red';
            RenderingEngine.ctx.moveTo(ray.x1, ray.y1)
            RenderingEngine.ctx.lineTo(ray.x2, ray.y2)
            RenderingEngine.ctx.stroke()
            RenderingEngine.ctx.closePath()
            RenderingEngine.ctx.restore()
        })
    }
    static init(){
        document.getElementById('stage').width = window.innerWidth;
        document.getElementById('stage').height = window.innerHeight;

        RenderingEngine.entities.push(new Wall(750, 300, 200, 100))
        RenderingEngine.entities.push(new Wall(300, 200, 150, 100))
        RenderingEngine.entities.push(new Wall(1200, 400, 350, 100))
        RenderingEngine.entities.push(new Wall(1100, 100, 50, 300))
        RenderingEngine.entities.push(new Wall(1200, 100, 50, 300))
        RenderingEngine.entities.push(new Wall(1000, 100, 50, 300)) // Walls

        RenderingEngine.entities.push(new Wall(750, 500, 1400, 100)) //Ground
        _.createFrameLoop(this.loop)

        _.loop(360, i => {
            Physics2D.RayCast(i, new Point(500, 100))
        })
    }
}
RenderingEngine.init() //Entry