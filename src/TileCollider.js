class TileCollider {
    constructor() {
        // 将关卡的格子
        this.resolvers = [];
    }

    addGrid(tileMatrix) {
        this.resolvers.push(new TileResolver(tileMatrix))
    }

    checkX(entity,gameContext,level) {

        for (const resolver of this.resolvers) {
            const matches = resolver.searchByRange(entity.bounds.left, entity.bounds.right, entity.bounds.top, entity.bounds.bottom);
            matches.forEach(match => {
                this.handleCoin(resolver,match,entity)
                if (match.tile.type !== 'ground') {
                    return;
                }
                if (entity.vel.x > 0) {
                    if (entity.bounds.right > match.x1) {
                        entity.obstruct("right", match);
                    }
                } else if (entity.vel.x < 0) {
                    if (entity.bounds.left < match.x2) {
                        entity.obstruct("left", match);
                    }
                }
            })
        }
    }

    checkY(entity,gameContext,level) {
        for (const resolver of this.resolvers) {
            const matches = resolver.searchByRange(entity.bounds.left, entity.bounds.right, entity.bounds.top, entity.bounds.bottom);
            matches.forEach(match => {
                this.handleCoin(resolver,match,entity)
                if (match.tile.type !== 'ground') {
                    return;
                }
                if (entity.vel.y > 0) {
                    if (entity.bounds.bottom > match.y1) {
                        entity.obstruct("bottom", match);
                    }
                } else if (entity.vel.y < 0) {
                    if (entity.bounds.top < match.y2) {
                        if (match.tile.name==="bricks"){
                            const grid=resolver.matrix;
                            grid.delete(match.indexX,match.indexY);
                            const koopa=gameContext.factory.koopa();
                            koopa.vel.set(50,-400);
                            koopa.pos.set(match.x1,match.y1-10);
                            level.entities.add(koopa)
                        }
                        entity.obstruct("top", match);
                    }
                }
            })
        }
    }

    handleCoin(resolver, match,entity){
        if (match.tile.type==='coin'&&entity.go){
            const grid=resolver.matrix;
            grid.delete(match.indexX,match.indexY);
            entity.go.events.emit("coin",entity);
        }
    }

}

// 背景块解析
class TileResolver {
    constructor(matrix, tileSize = 16) {
        // 网格
        this.matrix = matrix;
        // 默认大小为16
        this.tileSize = tileSize;
    }

    // 传入x1或y1
    toIndex(pos) {
        // 返回当前格子的下标
        return Math.floor(pos / this.tileSize);
    }


    // 传入x1,x2或y1,y2
    toIndexRange(pos1, pos2) {
        // 将x2或y2取整，然后乘格子大小可得出格子的边界值
        const pMax = Math.ceil(pos2 / this.tileSize) * this.tileSize;
        const range = [];
        let pos = pos1;
        do {
            // 推入当前格子的下标
            range.push(this.toIndex(pos));
            pos += this.tileSize;
        } while (pos < pMax);
        return range;
    }

    getByIndex(indexX, indexY) {
        // 将背景块从网格中获取出来
        const tile = this.matrix.get(indexX, indexY);
        if (tile) {
            // 设置left
            const x1 = indexX * this.tileSize;
            // 设置right
            const x2 = x1 + this.tileSize;
            // 设置top
            const y1 = indexY * this.tileSize;
            // 设置bottom
            const y2 = y1 + this.tileSize;
            return {
                tile,
                x1,
                indexX,
                indexY,
                x2,
                y1,
                y2,
            }
        }
    }


    searchByRange(x1, x2, y1, y2) {
        const matches = [];
        this.toIndexRange(x1, x2).forEach(indexX => {
            this.toIndexRange(y1, y2).forEach(indexY => {
                const match = this.getByIndex(indexX, indexY);
                if (match) {
                    matches.push(match);
                }
            })
        })
        return matches;
    }
}

