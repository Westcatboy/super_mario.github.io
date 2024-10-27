class Entity{
    constructor(audioBoard) {
        this.audio=audioBoard;
        this.pos=new Vec2(0,0);
        this.vel=new Vec2(0,0);
        this.size=new Vec2(0,0)
        this.offset=new Vec2(0,0);
        this.traits=[];
        this.sounds = new Set();
        this.bounds=new BoundingBox(this.pos,this.size,this.offset);
        this.lifeTime=0;
    }

    addTrait(trait){
        this.traits.push(trait);
        this[trait.NAME]=trait;
    }
    update(gameContext,level){
        this.traits.forEach(trait=>{
            trait.update(this,gameContext,level);
        })
        this.playSound(this.audio,gameContext.audioContext);
        this.lifeTime+=gameContext.deltaTime;
    }
    obstruct(side,match){
        this.traits.forEach(trait=>{
            trait.obstruct(this,side,match);
        })
    }
    draw(){

    }
    playSound(audioBoard, audioContext) {
        this.sounds.forEach(sound => {
            audioBoard.getAudio(sound, audioContext);
        })
        this.sounds.clear();
    }
    collides(candidate){
        this.traits.forEach(trait=>{
            trait.collides(this,candidate);
        })
    }
    finalize(){
        this.traits.forEach(trait=>{
            trait.finalize();
        })
    }

}


