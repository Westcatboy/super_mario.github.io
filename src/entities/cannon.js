function loadCannon(audioContext,entityFactories) {

    return loadAudioBoard("cannon", audioContext)
            .then(audioBoard => {
                return CannonFactory(audioBoard,entityFactories);
            });
}


function CannonFactory(audioBoard,entityFactories) {
    function emitBullet(entity, level) {
        let dir=1;
        for (const player of findPlayer(level)) {
            if (player.pos.x<entity.pos.x){
                dir=-1;
            }
        }
        let bullet=entityFactories.bullet();
        entity.sounds.add("shoot");
        bullet.vel.set(80*dir, 0);
        bullet.pos.set(entity.pos.x,entity.pos.y)
        level.entities.add(bullet);

    }
    return function createCannon() {
        // 新建对象
        const cannon = new Entity();
        cannon.audio=audioBoard;
        // cannon.audio = audioBoard;
        let emitter = new Emitter();
        emitter.emitters.push(emitBullet);
        cannon.addTrait(emitter)
        return cannon;
    }
}


function* findPlayer(level){
    for (const entity of level.entities) {
        if (entity.stomper){
            yield entity;
        }
    }
}
