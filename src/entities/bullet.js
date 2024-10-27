function loadBullet() {
    // 先将马里奥将元素集上切下来，然后
    return loadSpriteSheet('bullet').then(bulletFactory)
}


function bulletFactory(sprite) {
    function drawBullet(context) {
        sprite.draw("bullet", context, 0, 0, this.vel.x>0)
    }

    return function createBullet() {
        // 新建对象
        const bullet = new Entity();
        // 设置初始位置
        bullet.pos.set(220, 100);
        bullet.size.set(14, 16);
        // 设置上可执行的动作
        bullet.addTrait(new Velocity());
        bullet.addTrait(new BulletBehavior());
        bullet.addTrait(new Killable());
        // 将马里奥画上去
        bullet.draw = drawBullet;
        // 返回对象
        return bullet
    }
}
