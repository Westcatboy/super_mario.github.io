class Compositor{
    constructor(){
        // 粘合数组
        this.layers=[];
    }
    // 绘画对象，在timer中循环绘画
    draw(context,camera){
        this.layers.forEach(layer=>{
            // 每个layer都是一个方法
            layer(context,camera);
        //     例如layer(context)其实就是drawBackgroundLayer（context）
        })
    }
}


