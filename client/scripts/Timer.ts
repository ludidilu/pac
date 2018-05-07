class Timer
{
    private static scale:number = 1;

    private static lastTime:number = 0;

    private static nowTime:number;

    static update(nowTime:number){
        Timer.nowTime = nowTime;
    }

    static getUnscaledTime() {
        return Timer.nowTime;
    }

    static getTime(){
        return Timer.lastTime + (Timer.nowTime - Timer.lastTime) * Timer.scale;
    }

    static setTimeScale(scale:number){
        Timer.lastTime = Timer.lastTime + (Timer.nowTime - Timer.lastTime) * Timer.scale;
        Timer.scale = scale;
    }
}