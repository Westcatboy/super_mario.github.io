class Timer{
    constructor(deltaTime=1/60) {
        let accumulatedTime=0;
        let lastTime=0;
        this.updateProxy=(time)=>{
            // 上次更新到现在的时间差,以秒为单位(除于1000);
            accumulatedTime+=(time-lastTime)/1000;
            if (accumulatedTime>1){
                accumulatedTime=0;
            }
            /*当时间差超过16毫秒进行更新*/
            while(accumulatedTime>deltaTime){
                // 更新操作
                this.update(deltaTime);
                // 更新时间差
                accumulatedTime-=deltaTime;
            }
            // 最后一次操作时间设置为当前时间
            lastTime=time;
            requestAnimationFrame(this.updateProxy);
        }
    }
    enqueue(){
        requestAnimationFrame(this.updateProxy);
    }
    start(){
        this.enqueue();
    }
}
