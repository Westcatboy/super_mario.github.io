function loadKoopa() {
    // 先将马里奥将元素集上切下来，然后
    return loadSpriteSheet('koopa').then(koopaFactory)
}


function koopaFactory(sprite) {

    const walkAnim = sprite.animations.get("walk");
    const wakeAnim=sprite.animations.get("wake");
    function routeAnim(koopa){
        if (koopa.behavior.state==='hiding'){
            if (koopa.behavior.hideTime>3){
                return wakeAnim(koopa.lifeTime);
            }
            return 'hiding';
        }
        if (koopa.behavior.state==='panic'){
            return "hiding";
        }
        return walkAnim(koopa.lifeTime);
    }
    function drawKoopa(context) {
        sprite.draw(routeAnim(this), context, 0, 0, this.vel.x<0)
    }

    return function createGoomba() {
        // 新建对象
        const koopa = new Entity();
        // 设置初始位置
        koopa.pos.set(220, 100);
        koopa.size.set(16, 16);
        koopa.offset.y=8;
        // 设置上可执行的动作
        koopa.addTrait(new PendulumWalk(-35));
        koopa.addTrait(new Physics());
        koopa.addTrait(new Killable());
        koopa.addTrait(new KoopaBehavior());
        // 将马里奥画上去
        koopa.draw = drawKoopa;
        // 返回对象
        return koopa
    }
}
