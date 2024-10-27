function loadGoomba() {
    // 先将马里奥将元素集上切下来，然后
    return loadSpriteSheet('goomba').then(goombaFactory)
}


function goombaFactory(sprite) {

    const walkAnim = sprite.animations.get("walk");

    function routeAnim(goomba){
        if (goomba.killable.dead){
            return "flat";
        }
        return walkAnim(goomba.lifeTime);
    }
    function drawGoomba(context) {
        sprite.draw(routeAnim(this), context, 0, 0, this.vel.x<0)
    }

    return function createGoomba() {
        // 新建对象
        const goomba = new Entity();
        // 设置初始位置
        goomba.pos.set(220, 100);
        goomba.size.set(14, 16);
        // 设置上可执行的动作
        goomba.addTrait(new Physics());
        goomba.addTrait(new PendulumWalk());
        goomba.addTrait(new GoombaBehavior());
        goomba.addTrait(new Killable());
        // 将马里奥画上去
        goomba.draw = drawGoomba;
        // 返回对象
        return goomba
    }
}




