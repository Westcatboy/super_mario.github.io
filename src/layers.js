// 绘画背景
function createBackgroundLayer(level, tiles, sprites) {
    const resolver = new TileResolver(tiles);
    // 将背景设置为一个离屏canvas
    const buffer = document.createElement("canvas");
    buffer.width = 640 + 16;
    buffer.height = 300;
    const context = buffer.getContext("2d");

    function redraw(startIndex, endIndex) {
        context.clearRect(0, 0, buffer.width, buffer.height)
        for (let x = startIndex; x <= endIndex; x++) {
            const col = tiles.grid[x];
            if (col) {
                // 将所有的背景画到这个canvas
                col.forEach((tile, y) => {
                    if (sprites.animations.has(tile.name)) {
                        sprites.drawAnim(tile.name, context, x - startIndex, y, level.totalTime);
                    } else {
                        sprites.drawTile(tile.name, context, x - startIndex, y)
                    }
                })
            }
        }
    }

    // 返回一个将背景canvas绘画到主canvas函数
    return function drawBackgroundLayer(context, camera) {
        const drawWidth = resolver.toIndex(camera.size.x);
        const drawFrom = resolver.toIndex(camera.pos.x);
        const drawTo = drawFrom + drawWidth;
        redraw(drawFrom, drawTo)
        context.drawImage(buffer,
            -camera.pos.x % 16,
            -camera.pos.y)
    }
}

// 绘画相机方法
function createCameraLayer(cameraToDraw) {
    return function drawCameraRect(context, fromCamera) {
        context.strokeStyle = 'purple';
        context.beginPath();
        context.rect(
            cameraToDraw.pos.x - fromCamera.pos.x,
            cameraToDraw.pos.y - fromCamera.pos.y,
            cameraToDraw.size.x,
            cameraToDraw.size.y);
        context.stroke();
    };
}


function* expandSpan(xStart, xLen, yStart, yLen) {
    const xEnd = xStart + xLen;
    const yEnd = yStart + yLen;
    for (let x = xStart; x < xEnd; x++) {
        for (let y = yStart; y < yEnd; y++) {
            yield {x, y};
        }
    }
}

function expandRange(range) {
    if (range.length === 4) {
        const [xStart, xLen, yStart, yLen] = range;
        return expandSpan(xStart, xLen, yStart, yLen);
    } else if (range.length === 3) {
        const [xStart, xLen, yStart] = range;
        return expandSpan(xStart, xLen, yStart, 1);
    } else if (range.length === 2) {
        const [xStart, yStart] = range;
        return expandSpan(xStart, 1, yStart, 1);
    }
}

function* expandRanges(ranges) {
    for (const range of ranges) {
       yield* expandRange(range);
    }
}

// 获取背景块函数
function* expandTiles(tiles, patterns) {
    //闭包函数
    function* walkTiles (tiles, offsetX, offsetY) {
        // 将背景遍历
        for (let tile of tiles) {
            // 每个背景的范围
            for (let {x, y} of expandRanges(tile.range)) {
                const derivedX = x + offsetX;
                const derivedY = y + offsetY;
                if (tile.pattern) {
                    const tiles_1 = patterns[tile.pattern].tiles;
                   yield* walkTiles(tiles_1, derivedX, derivedY)
                } else {
                        yield {
                            tile,
                            x: derivedX,
                            y: derivedY,
                        }
                }
            }
        }
    }

    yield* walkTiles(tiles, 0, 0);
}

// 绘画实体函数
function createSpriteLayer(entities, width = 64, height = 64) {
    const spriteBuffer = document.createElement("canvas");
    spriteBuffer.height = height;
    spriteBuffer.width = width;
    let spriteBufferContext = spriteBuffer.getContext("2d");
    // 返回一个将实体画到页面上的函数
    return function drawSpriteLater(context, camera) {
        entities.forEach(entity => {
            spriteBufferContext.clearRect(0, 0, width, height);
            entity.draw(spriteBufferContext)
            context.drawImage(spriteBuffer, entity.pos.x - camera.pos.x, entity.pos.y - camera.pos.y)
        })
    }
}







function createEntityLayer(entities) {
    return function drawBoundingBox(context, camera) {
        context.strokeStyle = 'red';
        entities.forEach(entity => {
            context.beginPath();
            context.rect(
                entity.bounds.left - camera.pos.x,
                entity.bounds.top - camera.pos.y,
                entity.size.x,
                entity.size.y);
            context.stroke();
        });
    };
}

function createTileCandidateLayer(tileResolver) {
    const resolvedTiles = [];
    const tileSize = tileResolver.tileSize;

    const getByIndexOriginal = tileResolver.getByIndex;
    tileResolver.getByIndex = function getByIndexFake(x, y) {
        resolvedTiles.push({x, y});
        return getByIndexOriginal.call(tileResolver, x, y);
    }

    return function drawTileCandidates(context, camera) {
        context.strokeStyle = 'blue';
        resolvedTiles.forEach(({x, y}) => {
            context.beginPath();
            context.rect(
                x * tileSize - camera.pos.x,
                y * tileSize - camera.pos.y,
                tileSize, tileSize);
            context.stroke();
        });

        resolvedTiles.length = 0;
    }
}

function createCollisionLayer(level) {
    const drawTileCandidates = level.tileCollider.resolvers.map(createTileCandidateLayer);
    const drawBoundingBoxes = createEntityLayer(level.entities);

    return function drawCollision(context, camera) {
        drawTileCandidates.forEach(draw=>draw(context, camera));
        drawBoundingBoxes(context, camera);
    };
}




function createDashBoardLayer(font,playerEnv){
    const LINE1=font.size;
    const LINE2=font.size*2;
    return function drawDashboard (context){
        const {score,time,coin,lives}=playerEnv.playerController;
        font.print("MARIO",context,16,LINE1);
        font.print(score.toString().padStart(6,'0'),context,16,LINE2);
        font.print("+"+lives.toString().padStart(2,'0'),context,300,LINE1);
        font.print( `@x `+coin.toString().padStart(3,'0'),context,300,LINE2);
        font.print("WORLD",context,480,LINE1);
        font.print("1-1",context,488,LINE2);
        font.print("TIME",context,590,LINE1);
        font.print(time.toFixed().toString().padStart(3,'0'),context,598,LINE2);
    }
}
