class Timer
{
    private static scale:number = 1;

    private static lastTime:number = 0;

    static getUnscaledTime() {
        return egret.getTimer();
    }

    static getTime(){
        var time = egret.getTimer();
        return Timer.lastTime + (time - Timer.lastTime) * Timer.scale;
    }

    static setTimeScale(scale:number){
        var time = egret.getTimer();
        Timer.lastTime = Timer.lastTime + (time - Timer.lastTime) * Timer.scale;
        Timer.scale = scale;
    }
}