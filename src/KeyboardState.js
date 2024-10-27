class KeyboardState{
    constructor() {
        // 保存当前按下的键
        this.keyState=new Map();

        // 保存当前按下的键所指向的函数
        this.keyMap=new Map();
    }
    addMapping(code,callback){
        this.keyMap.set(code,callback);
    }
    handleEvent(event){
        const {code}=event;
        if (!this.keyMap.has(code)){
            return ;
        }
        event.preventDefault();
        const keyState=event.type==='keydown'?1:0;
        if (this.keyState.get(code)===keyState){
            return;
        }
        this.keyState.set(code,keyState);
        this.keyMap.get(code)(keyState);

    }
    listenTo(){
        document.addEventListener("keydown",event=>{
            event.preventDefault();
            this.handleEvent(event);
        })
        document.addEventListener("keyup",event=>{
            event.preventDefault();
            this.handleEvent(event);
        })
    }
}
