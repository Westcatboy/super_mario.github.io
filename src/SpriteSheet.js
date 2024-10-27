// 精灵表类，在这里定义每个元素的类型和大小
class SpriteSheet {
    constructor(image, width = 16, height = 16) {
        this.image = image;
        this.height = height;
        this.width = width;
        this.tiles = new Map()
        this.animations = new Map();
    }

    define(name, x, y,width=this.width,height=this.height) {
        const buffers=[false,true].map(flip=> {
            // 创建一个离屏canvas
            const buffer = document.createElement("canvas");
            // 设置这个元素的大小
            buffer.width = width;
            buffer.height = height;
            const context = buffer.getContext("2d");
            if (flip){
                context.scale(-1,1);
                context.translate(-this.width,0);
            }
            // 将这个元素绘制到canvas上，切割出这个元素在元素集上的位置，绘制在canvas的哪个位置，元素高宽
            context.drawImage(this.image, x * width, y * height, width, height, 0, 0, width, height);
            return buffer;
        })
      // 最重要的一步，将这个元素设置到此类的键值对象上，方便后期调用
        this.tiles.set(name, buffers);
    }

    draw(name, context, x, y,flip=false) {
        // 绘画，将元素从此类键值对象中获取出来。
        const buffer = this.tiles.get(name)[flip?1:0];
        // 在主canvas中绘画出此离屏元素
        context.drawImage(buffer, x, y)
    }

    drawTile(name, context, x, y) {
        // 和draw相同
        this.draw(name, context, x * this.width, y * this.height)
    }

    drawAnim(name, context, x, y, distance) {
        const animation = this.animations.get(name);
        this.drawTile(animation(distance), context, x, y)
    }

    defineAnim(name, animation) {
        this.animations.set(name, animation)
    }
}
