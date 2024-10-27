// 保证关卡和马里奥同时加载完成
function createPlayerEnv(playerEntity){
    const playerEnv=new Entity();
    const playerControl=new PlayerController();
    playerControl.checkPoint.set(100,64);
    playerControl.setPlayer(playerEntity);
    playerEnv.addTrait(playerControl)
    return playerEnv;
}
async function main(canvas) {
    const context = canvas.getContext("2d");
    const audioContext=new AudioContext();
    const [factory,font] =await Promise.all([ loadEntities(audioContext),loadFont()]);
    const level = await loadFactory(factory)("1-1");
    //创建镜头
    const camera = new Camera();
    const mario = factory.mario();


    // 关卡中实体添加马里奥
    const playerEnv=createPlayerEnv(mario);

    level.entities.add(playerEnv);

    // level.comp.layers.push(createCollisionLayer(level));

    // level.comp.layers.push( createCameraLayer(camera));
    level.comp.layers.push(createDashBoardLayer(font,playerEnv));
    //  挂载马里奥按键控制
    const input = setUpKeyboard(mario);
    // 监听按键
    input.listenTo();
    setUpMouseControl(canvas, mario, camera);

    const gameContext={
        audioContext,
        factory,
        deltaTime:null,
    }

    // 初始化计时器，以六十帧计算
    const timer = new Timer(1 / 60);
    // 时间更新函数
    timer.update = function update(deltaTime) {
        //层级绘画,将所有需要画的精灵绘画到canvas上
        gameContext.deltaTime=deltaTime;
        context.clearRect(0, 0, canvas.width, canvas.height)
        //设置时间延迟,在level中遍历实体,绘画实体动作等
        level.update(gameContext,level);
        camera.pos.x =Math.max(0,mario.pos.x - 350);
        level.comp.draw(context, camera);
    }
    // 开始循环
    timer.start();
    level.music.playerTrack("main")
}
const canvas = document.getElementById("screen");
const start=()=>{
    main(canvas);
document.removeEventListener("click",start)
}
document.addEventListener("click",start)



class AudioBoard{
    constructor() {
        this.buffer=new Map();
    }
    addAudio(name,buffer){
        this.buffer.set(name,buffer)
    }
    getAudio(name,context){
        const  source=context.createBufferSource();
        source.connect(context.destination);
        source.buffer=this.buffer.get(name);
        source.start(0);
    }
}
 function  loadAudioBoard(name,audioContext){
    const loadAudio=createAudioLoader(audioContext);
   return  loadJSON(`../sounds/${name}.json`)
        .then(audioSheet=>{
            const audioBoard=new AudioBoard(audioContext);
            const fx=audioSheet.fx;
            const jobs=[];
            Object.keys(fx).forEach(name=>{
               const job=loadAudio(`${fx[name].url}`).then(buffer=> {
                   audioBoard.addAudio(name, buffer)
               })
               jobs.push(job);
            })
           return Promise.all(jobs).then(()=>audioBoard)
        })
}

//键盘按键挂载函数
function setUpKeyboard(mario) {
    const input = new KeyboardState();
    input.addMapping('Space', keyState => {
        if (keyState) {
            mario.jump.start();
        } else {
            mario.jump.cancel();
        }
    })
    input.addMapping("ShiftLeft", keyState => {
        mario.turbo(keyState);

    })
    input.addMapping("KeyD", keyState => {
        mario.go.dir += keyState ? 1 : -1;

    })
    input.addMapping("KeyA", keyState => {
        mario.go.dir += keyState ? -1 : 1;

    })
    return input;
}


// function createCollisionLayer(level) {
//     const tileResolver = level.tileCollider.tiles;
//     const tileSize = tileResolver.tileSize;
//     const resolvedTiles = [];
//     const getByIndexOriginal = tileResolver.getByIndex;
//     tileResolver.getByIndex = function getByIndexFake(x, y) {
//         resolvedTiles.push({x, y})
//         return getByIndexOriginal.call(tileResolver, x, y)
//     }
//     return function drawCollision(context) {
//         context.strokeStyle = "blue";
//         resolvedTiles.forEach(({x, y}) => {
//             context.beginPath();
//             context.rect(x * tileSize, y * tileSize, tileSize, tileSize);
//             context.stroke();
//         })
//         context.strokeStyle = "red";
//         level.entities.forEach(entity => {
//             context.beginPath();
//             context.rect(entity.pos.x, entity.pos.y, entity.size.x, entity.size.y);
//             context.stroke();
//         })
//         resolvedTiles.length = 0;
//     }
// }
