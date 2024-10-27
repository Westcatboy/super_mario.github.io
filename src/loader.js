//  加载元素集图片
function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        }
        image.src = url;
    })
}


function loadJSON(url) {
    return fetch(url)
        .then(r => r.json())
}

function setUpBackground(level, levelSpec, backgroundSprites) {
    levelSpec.layers.forEach(layer => {
        const grid = createGrid(layer.tiles, levelSpec.patterns);
        // 创建背景精灵层
        const backgroundLayer = createBackgroundLayer(level, grid, backgroundSprites);
        // 关卡粘合器层数添加背景
        level.comp.layers.push(backgroundLayer);
        level.tileCollider.addGrid(grid);
    })
}


function setUpEntities(levelSpec, level, entityFactory) {
    levelSpec.entities.forEach(({name, pos: [x, y]}) => {
        const factory = entityFactory[name];
        const entity = factory();
        entity.pos.set(x, y);
        level.entities.add(entity);
    })
    // 创建实体精灵层
    const spriteLayer = createSpriteLayer(level.entities);
    // 关卡粘合器层数添加实体
    level.comp.layers.push(spriteLayer);
}


// 加载关卡

function loadFactory(entityFactory) {
    return function loadLevel(name) {
        return loadJSON(`https://westcatboy.github.io/super_mario.github.io/levels/${name}.json`)
            .then(levelSpec => Promise.all([
                    levelSpec,
                    loadSpriteSheet(levelSpec.spriteSheet),
                    loadMusicSheet(levelSpec.musicSheet),
                ])
            ).then(([levelSpec, backgroundSprites, bgm]) => {
                //新建关卡对象
                const level = new Level();
                level.music=bgm;
                setUpBackground(level, levelSpec, backgroundSprites)
                setUpEntities(levelSpec, level, entityFactory);
                // 返回关卡
                return level;
            })
    }
}


function loadMusicSheet(name) {
    return loadJSON(`https://westcatboy.github.io/super_mario.github.io/music/${name}.json`)
        .then((musicSpec) => {
            const musicPlayer = new MusicPlayer();
            for (const [name, track] of Object.entries(musicSpec)){
                musicPlayer.addTrack(name,track.url)
            }
            console.log(musicPlayer.tracks);
            return musicPlayer;
        })
}

function createGrid(tiles, patterns) {
    const grid = new Matrix();

    for (const {tile, x, y} of expandTiles(tiles, patterns)) {
        grid.set(x, y, tile);
    }

    return grid;
}


function loadSpriteSheet(name) {
    return loadJSON(`https://westcatboy.github.io/super_mario.github.io/sprites/${name}.json`)
        .then(sheetSpec => Promise.all([
            sheetSpec,
            loadImage(sheetSpec.imageURL),
        ])).then(([sheetSpec, image]) => {
            // 定义背景图块的大小
            const sprites = new SpriteSheet(image, sheetSpec.tileW, sheetSpec.tileH);
            if (sheetSpec.tiles) {
                sheetSpec.tiles.forEach(tile => {
                    // 定义新画布的名字，以及图片在原图的位置
                    sprites.define(tile.name, tile.index[0], tile.index[1]);
                })
            }
            if (sheetSpec.frames) {
                sheetSpec.frames.forEach(frameSpec => {
                    sprites.define(frameSpec.name, ...frameSpec.rect);
                })
            }
            if (sheetSpec.animations) {
                sheetSpec.animations.forEach(animSpec => {
                    const animation = createAnim(animSpec.frames, animSpec.frameLen)
                    sprites.defineAnim(animSpec.name, animation);
                })
            }
            return sprites;
        })
}

function loadEntities(audioContext) {
    function addas(name) {
        return factory => entityFactories[`${name}`] = factory
    }

    const entityFactories = {};
    return Promise.all([
        loadMario(audioContext).then(addas("mario")),
        loadGoomba(audioContext).then(addas("goomba")),
        loadKoopa(audioContext).then(addas("koopa")),
        loadBullet(audioContext).then(addas("bullet")),
        loadCannon(audioContext, entityFactories).then(addas("cannon")),
    ]).then(() => entityFactories)


}


function createAudioLoader(context) {
    return function loadAudio(url) {
        return fetch(url)
            .then(response => {
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                return context.decodeAudioData(arrayBuffer);
            })
    }
}


const CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

function loadFont() {
    return loadImage("https://westcatboy.github.io/super_mario.github.io/img/font.png")
        .then(image => {
            const fontSprite = new SpriteSheet(image);
            const size = 1;
            const rowLen = image.width / 8;
            for (let [index, char] of [...CHARS].entries()) {
                const x = index * size % rowLen;
                const y = Math.floor(index * size / rowLen) * size;
                fontSprite.define(char, x, y, 8, 8)
            }
            return new Font(fontSprite, 8);
        })
}

class Font {
    constructor(sprites, size) {
        this.sprites = sprites;
        this.size = size;
    }

    print(text, context, x, y) {
        // 將字符串解構出來，變成數組
        [...text].forEach((char, index) => {
            this.sprites.draw(char, context, x + this.size * index, y)
        })
    }
}
