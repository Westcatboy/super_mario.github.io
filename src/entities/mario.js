const FAST_DRAG = 1 / 5000;
const LOW_DRAG = 1 / 1000;

function loadMario(audioContext) {
    return Promise.all([
        loadAudioBoard("mario",audioContext)
        ,loadSpriteSheet('mario')])
        .then(([audioBoard,sprite])=>{
            return MarioFactory(sprite,audioBoard);
        })
}


function MarioFactory(sprite,audioBoard) {

    const runAnim = sprite.animations.get("run");
    function routeFrame(mario) {
        if (mario.jump.ready < 0) {
            return "jump";
        }
        if (mario.go.distance > 0) {
            if ((mario.vel.x > 0 && mario.go.dir < 0) || (mario.vel.x < 0 && mario.go.dir > 0)) {
                return 'break';
            }
            return runAnim(mario.go.distance)
        }
        return 'idle';
    }
    function drawMario(context) {
        sprite.draw(routeFrame(this), context, 0, 0, this.go.heading < 0)
    }
    function setTurboState(turbo) {
        this.go.dragFactor = turbo ? FAST_DRAG : LOW_DRAG;
    }

    return function createMario() {
        // 新建对象
        const mario = new Entity(audioBoard);
        // 设置初始位置
        mario.size.set(14, 16);
        // 给马里奥设置上可执行的动作
        mario.addTrait(new Physics());
        mario.addTrait(new Go());
        mario.addTrait(new Jump());
        mario.addTrait(new Stomper());
        mario.addTrait(new Killable());
        mario.killable.deadAfter=0;
        mario.turbo = setTurboState
        // 将马里奥画上去
        mario.draw = drawMario;
        mario.turbo(false);
        // 返回对象
        return mario
    }
}


function createAnim(frames, frameLen) {
    return function resolveFrame(distance) {
        const frameIndex = Math.floor(distance / frameLen) % frames.length;
        const frameName = frames[frameIndex];
        return frameName;
    }
}
