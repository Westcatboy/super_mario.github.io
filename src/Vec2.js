class Matrix {
    constructor() {
        this.grid = [];
    }
    // 重写forEach
    forEach(callback) {
        // 将所有背景遍历，column是当前下标元素，x是第一维下标
        this.grid.forEach((column, x) => {
            // 再次遍历当列数组，tile是当前背景块的名字，y是第二维下标
            column.forEach((tile, y) => {
                callback(tile, x, y)
            })
        })
    }
    // 获取当前格子的元素
    get(x, y) {
        const col = this.grid[x];
        if (col) {
            return col[y];
        }
        return undefined;
    }
    // 设置当前格子为指定元素
    set(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }
        this.grid[x][y] = value;
    }
    delete(x,y){
        const col = this.grid[x];
        if (col) {
            delete col[y];
        }
        return undefined;
    }
}
// 向量类
class Vec2 {
    constructor(x, y) {
        this.set(x, y);
    }
    // 设置对象的x,y
    set(x, y) {
        this.x = x;
        this.y = y;
    }
}
