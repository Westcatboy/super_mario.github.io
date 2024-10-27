class Trait {
    constructor(name) {
        this.NAME = name;
        this.tasks = [];
        this.events = new EventEmitter();

    }

    obstruct(entity, side, match) {

    }

    update() {

    }

    collides(us, collides) {

    }

    finalize() {
        this.tasks.forEach(task => task());
        this.tasks = [];
    }

    queue(task) {
        this.tasks.push(task);
    }

}


class PlayerController extends Trait {
    constructor() {
        super('playerController');
        this.player = null;
        this.checkPoint = new Vec2(0, 0);
        this.time = 300;
        this.hurryTime=100;
        this.COIN_LIFE_THRESHOLD=100;
        this.score = 0;
        this.lives=3;
        this.coin=0;
        this.isHurry=false;
    }

    setPlayer(entity) {
        this.player = entity;
        this.player.stomper.events.listen("stomp", () => {
            this.score += 10;
        })
        this.addCoin(1);
    }
    addCoin(count){
        this.player.go.events.listen("coin", (entity) => {
            this.coin+=count;
            entity.sounds.add("coin");
            if (this.coin>=this.COIN_LIFE_THRESHOLD){
                console.log(111)
                const lifeCount=Math.floor(this.coin/this.COIN_LIFE_THRESHOLD);
                this.addLive(lifeCount);
                this.coin=this.coin%lifeCount;
            }
        })
    }

    addLive(count){
        this.lives+=count;
    }
    update(entity, {deltaTime}, level) {
        if (!level.entities.has(this.player)) {
            this.player.killable.revive();
            this.player.pos.set(this.checkPoint.x, this.checkPoint.y);
            level.entities.add(this.player);
        } else {
            this.time -= deltaTime * 2;
        }
        if (this.time<=this.hurryTime&&!this.isHurry){
            this.hurry(level);
        }
    }

    hurry(level) {
        const audio = level.music.playerTrack("hurry");
        audio.loop = false;
        audio.addEventListener("ended", () => {
            level.music.playerTrack("main", 1.3)
        })
        this.isHurry = true;
    }
}

class Physics extends Trait {
    constructor() {
        super("solid");
        this.obstructs = true;
    }

    obstruct(entity, side, match) {
        if (!this.obstructs) {
            return;
        }
        if (side === "bottom") {
            entity.bounds.top = match.y1 - entity.size.y;
            entity.vel.y = 0;
        } else if (side === "right") {
            entity.bounds.left = match.x1 - entity.size.x;
            entity.vel.x = 0;
        } else if (side === "left") {
            entity.bounds.left = match.x2;
            entity.vel.x = 0;
        } else if (side === "top") {
            entity.bounds.top = match.y2;
            entity.vel.y = 0;
        }
    }

    update(entity, gameContext, level) {
        const {deltaTime}=gameContext;
        entity.pos.x += entity.vel.x * deltaTime;
        level.tileCollider.checkX(entity,gameContext,level);
        entity.pos.y += entity.vel.y * deltaTime;
        level.tileCollider.checkY(entity,gameContext,level);
        entity.vel.y += level.gravity * deltaTime;

    }
}


class Velocity extends Trait {
    constructor() {
        super("velocity");
        this.obstructs = true;
    }

    update(entity, {deltaTime}, level) {
        entity.pos.x += entity.vel.x * deltaTime;
        entity.pos.y += entity.vel.y * deltaTime;
    }
}

class Jump extends Trait {
    constructor() {
        super('jump');
        this.duration = 0.3;
        this.ready = 0;
        this.requestTime = 0;
        this.gracePeriod = 0.1;
        this.velocity = 200;
        this.speedBoost = 0.3;
        this.engageTime = 0;
    }

    start() {
        this.requestTime = this.gracePeriod;
    }

    cancel() {
        this.engageTime = 0;
    }

    obstruct(entity, side) {
        if (side === 'bottom') {
            this.ready = 1;
        } else if (side === 'top') {
            this.cancel();
        }
    }

    update(entity, {deltaTime}, level) {
        if (this.requestTime > 0) {
            if (this.ready > 0) {
                entity.sounds.add("jump");
                this.engageTime = this.duration;
                this.requestTime = 0;
            }
            this.requestTime -= deltaTime;
        }
        if (this.engageTime > 0) {
            entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost);
            this.engageTime -= deltaTime;
        }
        this.ready--;
    }
}

class Go extends Trait {
    constructor() {
        super('go');
        this.dir = 0;
        this.heading = 0;
        // 阻力
        this.dragFactor = 1 / 1000;
        // 加速度
        this.acceleration = 400;
        // 减速度
        this.deceleration = 300;
        this.distance = 0;
    }

    update(entity, {deltaTime}) {
        let absX = Math.abs(entity.vel.x); // 获取水平速度的绝对值
        // 如果有方向输入，更新速度
        if (this.dir !== 0) {
            entity.vel.x += this.acceleration * this.dir * deltaTime; // 根据方向和加速度更新速度
            if (entity.jump) {
                if (entity.jump.ready === 1) {
                    this.heading = this.dir;
                }
            } else {
                this.heading = this.dir;
            }

        } else if (entity.vel.x !== 0) {
            // 如果没有方向输入，但仍在移动，施加减速
            const decel = Math.min(absX, this.deceleration * deltaTime);
            entity.vel.x += entity.vel.x > 0 ? -decel : decel; // 根据当前速度方向施加减速
        } else {
            this.distance = 0; // 如果没有移动，距离重置为0
        }

        const drag = this.dragFactor * entity.vel.x * absX; // 计算阻力
        entity.vel.x -= drag; // 应用阻力，减小速度
        this.distance += absX * deltaTime; // 更新总移动距离
    }
}


const beHaviorHandlers={
    "bullet":(us,them)=>{
        them.killable.kill();
        them.vel.set(100, -200);
    },
    "goomba":(us,them)=>{
        them.killable.kill();
        them.pendulumwalk.speed = 0;
    },
    "koopa":(us,them)=>{
        them.behavior.handleStomp(them, us);

    }
}

class Stomper extends Trait {
    constructor() {
        super("stomper");
        this.bounceSpeed = 400;
    }

    bounce(us, them) {
        us.bounds.bottom = them.bounds.top;
        us.vel.y = -this.bounceSpeed;
    }

    collides(us, them) {
        if (!them.killable || them.killable.dead) {
            return;
        }
        if (us.vel.y > them.vel.y && us.vel.y > 33) {
            this.handle(us, them)
            this.bounce(us, them);
            us.sounds.add("stomp");
            this.events.emit("stomp", us, them);
        } else {
           them.behavior.handle(us,them)
        }

    }

    handle(us, them) {
        beHaviorHandlers[them?.behavior?.type](us,them);
    }



}

class Killable extends Trait {
    constructor() {
        super("killable");
        this.dead = false;
        this.deadTime = 0;
        this.deadAfter = 1.5;

    }

    kill() {
        this.queue(task => this.dead = true)
    }

    revive() {
        this.dead = false;
        this.deadTime = 0;
    }

    update(entity, {deltaTime}, level) {
        if (this.dead) {
            this.deadTime += deltaTime;
            if (this.deadTime > this.deadAfter) {
                this.queue(() => {
                    level.entities.delete(entity)
                })
            }
        }
    }
}

class PendulumWalk extends Trait {
    constructor(speed = -30) {
        super("pendulumwalk");
        this.speed = speed;
        this.enable = true;
    }

    obstruct(entity, side) {
        if (side === "right" || side === "left") {
            this.speed = -this.speed;
        }
    }

    update(entity, {deltaTime}) {
        if (this.enable) {
            entity.vel.x = this.speed;
        }
    }
}

class GoombaBehavior extends Trait {
    constructor() {
        super("behavior");
        this.type = 'goomba';
    }

    collides(us, them) {
    }
    handle(them, us) {
        them.killable.kill();
    }
}

class KoopaBehavior extends Trait {

    constructor() {
        super("behavior");
        this.state = 'walking';
        this.hideTime = 0;
        this.panicSpeed = 300;
        this.walkSpeed = null;
        this.hideDuration = 5;
        this.type = 'koopa';
    }

    collides(us, them) {
        if (!them.killable||them.killable.dead) return;
        if (this.state==='panic'&&!them.stomper){
            them.killable.kill();
            them.solid.obstructs = false;
            them.vel.set(100, -200);
        }
    }

    handle(them, us) {
        this.handleNudge(us, them)
    }
    handleNudge(us, them) {
        if (this.state === 'walking') {
            them.killable.kill();
        } else if (this.state === 'hiding') {
            this.panic(us, them);
        } else if (this.state === 'panic') {
            if (us.vel.x !== 0) {
                them.killable.kill();
            }
        }
    }

    handleStomp(us, them) {
        if (this.state === 'walking') {
            this.hide(us);
        } else if (this.state === 'hiding') {
            us.killable.kill();
            us.solid.obstructs = false;
            us.vel.set(100, -200);
        } else if (this.state === "panic") {
            this.hide(us);
        }
    }

    panic(us, them) {
        us.pendulumwalk.enable = true;
        us.pendulumwalk.speed = this.panicSpeed * Math.sign(them.vel.x);
        this.state = 'panic';
    }

    hide(us) {
        us.offset.y = 0;
        us.vel.x = 0;
        us.pendulumwalk.enable = false;
        if (!this.walkSpeed) this.walkSpeed = us.pendulumwalk.speed;
        this.state = 'hiding';
    }

    unhide(us) {
        us.pendulumwalk.enable = true;
        us.pendulumwalk.speed = this.walkSpeed
        this.state = 'walking';
        this.hideTime = 0;
        us.offset.y = 8;
    }

    update(us, {deltaTime}) {
        if (this.state === 'hiding' || this.state === 'panic') {
            this.hideTime += deltaTime;
            if (this.hideTime > this.hideDuration) {
                this.unhide(us);
            }
        }
    }
}


class BulletBehavior extends Trait {
    constructor() {
        super("behavior")
        this.type = 'bullet';
    }

    collides(us, them) {
        if (us.killable.dead) return;
        if (them.stomper) {

        }
    }
    handle(them,us){
        them.killable.kill();
    }

    update(entity, {deltaTime}, level) {
        if (entity.killable.dead) {
            entity.vel.y += level.gravity * deltaTime
        }
    }
}


class Emitter extends Trait {
    constructor() {
        super('emitter');
        this.emitters = [];
        this.coolDown = 2;
    }

    update(entity, {deltaTime}, level) {
        this.coolDown -= deltaTime;
        if (this.coolDown <= 0) {
            this.emitters.forEach(emitter => {
                emitter(entity, level);
            })
            this.coolDown = 2;
        }
    }

}
