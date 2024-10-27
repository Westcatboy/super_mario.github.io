class Level{
    constructor() {
        // 创建新的黏合器对象
        this.comp=new Compositor();
        // 实体创建，每个实体都是个体
        this.entities=new Set();
        // 重力为2000
        this.gravity = 1980;
        // 背景块为新矩阵，方便调用
        this.tiles=new Matrix();
        this.music=null;
        //新建碰撞对象
        this.tileCollider=null;
        this.entityCollider=new EntityCollider(this.entities);
        this.totalTime=0;
        this.tileCollider=new TileCollider();

    }




    // 更新位置，根据timer循环，更新每个实体的位置；
    update(gameContext,level) {
        this.entities.forEach(entity=>{
            this.entityCollider.check(entity);
        })
        this.entities.forEach(entity => {
            entity.update(gameContext,level);
        });
        this.entities.forEach(entity=>{
            entity.finalize()
        })
        this.totalTime += gameContext.deltaTime;
    }
}
