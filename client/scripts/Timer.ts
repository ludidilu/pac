class Timer
{
    private static scale:number = 1;

    private static lastSetScaleTime:number = 0;

    private static nowTime:number;

    private static lastTime:number;

    private static startTime = new Date().getTime();

    static update(nowTime:number){

        Timer.lastTime = Timer.nowTime;

        Timer.nowTime = nowTime;
    }

    static getUnscaledTime() {

        return Timer.nowTime;
    }

    static getTime(){

        return Timer.lastSetScaleTime + (Timer.nowTime - Timer.lastSetScaleTime) * Timer.scale;
    }

    static getDeltaTime(){
        
        return (Timer.nowTime - Timer.lastTime) * Timer.scale;
    }

    static getUnscaledDeltaTime(){

        return Timer.nowTime - Timer.lastTime;
    }

    static getRealTime(){

        return new Date().getTime() - Timer.startTime;
    }

    static setTimeScale(scale:number){
        
        Timer.lastSetScaleTime = Timer.lastSetScaleTime + (Timer.nowTime - Timer.lastSetScaleTime) * Timer.scale;

        Timer.scale = scale;
    }
}