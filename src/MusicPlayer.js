class MusicPlayer{
    constructor() {
        this.tracks=new Map();
    }
    addTrack(name,url){
        const audio=new Audio();
        audio.loop=true;
        audio.src=url;
        this.tracks.set(name,audio);
    }
    playerTrack(name,speed=1){
        for (let audio of this.tracks.values()) {
            audio.pause();
        }
        const audio= this.tracks.get(name);
        audio.playbackRate=speed;
        audio.play();
        return audio;
    }
}
