class SuperTweenUnit
{
    public index:number;

    public tag:string;

    public startValue:number;
    public endValue:number;
    public time:number;
    public startTime:number;

    public endCallBack:()=>void;

    public dele:(value:number)=>void;

    public isFixed:boolean;

    public Init(_index:number, _startValue:number, _endValue:number, _time:number, _delegate:(value:number)=>void, _endCallBack:()=>void, _isFixed:boolean):void
    {
        this.index = _index;

        this.isFixed = _isFixed;

        this.startValue = _startValue;
        this.endValue = _endValue;
        this.time = _time * 1000;
        this.dele = _delegate;

        this.endCallBack = _endCallBack;

        this.tag = "";

        if(this.isFixed){

            this.startTime = Timer.getUnscaledTime();
        }
        else{

            this.startTime = Timer.getTime();
        }
    }
}

class SuperTweenScript
{
    private dic:{[key:number]:SuperTweenUnit} = {}

    private index:number;

    private endList:number[] = [];

    private toList:{[key:number]:number} = {};

    public To(_startValue:number, _endValue:number, _time:number, _delegate:(value:number)=>void, _endCallBack:()=>void, isFixed:boolean):number
    {
        var unit:SuperTweenUnit = this.GetUnit();

        var result:number = this.GetIndex();

        unit.Init(result, _startValue, _endValue, _time, _delegate, _endCallBack, isFixed);

        this.dic[result] = unit;

        return result;
    }

    public SetTag(_index:number, _tag:string):void
    {
        var unit:SuperTweenUnit = this.dic[_index];

        if (unit)
        {
            unit.tag = _tag;
        }
    }

    public Remove(_index:number, _toEnd:boolean):void
    {
        var unit:SuperTweenUnit = this.dic[_index];

        if (unit)
        {
            delete this.dic[_index];

            if (_toEnd)
            {
                if (unit.dele != null)
                {
                    unit.dele(unit.endValue);
                }

                if (unit.endCallBack != null)
                {
                    unit.endCallBack();
                }
            }

            this.ReleaseUnit(unit);
        }
    }

    public RemoveAll(_toEnd:boolean):void
    {
        var tmpDic = this.dic;

        this.dic = {};

        for(var key in tmpDic){

            var unit = tmpDic[key];

            if (_toEnd)
            {
                if (unit.dele != null)
                {
                    unit.dele(unit.endValue);
                }

                if (unit.endCallBack != null)
                {
                    unit.endCallBack();
                }
            }

            this.ReleaseUnit(unit);
        }
    }

    public RemoveWithTag(_tag:string, _toEnd:boolean):void
    {
        var list:SuperTweenUnit[] = [];

        for(var key in this.dic){
           
            var unit = this.dic[key];

            if (unit.tag == _tag)
            {
                list.push(unit);
            }
        }

        for (var i:number = 0; i < list.length; i++)
        {
            var unit = list[i];

            delete this.dic[unit.index];

            if (!_toEnd)
            {
                this.ReleaseUnit(unit);
            }
        }

        if (_toEnd)
        {
            for (var i:number = 0; i < list.length; i++)
            {
                var unit = list[i];

                if (unit.dele != null)
                {
                    unit.dele(unit.endValue);
                }

                if (unit.endCallBack != null)
                {
                    unit.endCallBack();
                }

                this.ReleaseUnit(unit);
            }
        }
    }

    public DelayCall(_time:number, _endCallBack:()=>void, _isFixed:boolean):number
    {
        var result = this.GetIndex();

        var unit = this.GetUnit();

        unit.Init(result, 0, 0, _time, null, _endCallBack, _isFixed);

        this.dic[result] = unit;

        return result;
    }

    public NextFrameCall(_endCallBack:()=>void):number
    {
        var result = this.GetIndex();

        var unit = this.GetUnit();

        unit.Init(result, 0, 0, 0, null, _endCallBack, false);

        this.dic[result] = unit;

        return result;
    }

    public Update():void
    {
        var nowTime = Timer.getTime();

        var nowUnscaleTime = Timer.getUnscaledTime();

        for(var key in this.dic){

            var unit = this.dic[key];

            var tempTime = 0;

            if (unit.isFixed)
            {
                tempTime = nowUnscaleTime;
            }
            else
            {
                tempTime = nowTime;
            }

            if (tempTime > unit.startTime + unit.time)
            {
                if (unit.dele != null)
                {
                    this.toList[unit.index] = unit.endValue;
                }

                this.endList.push(unit.index);
            }
            else if (unit.dele != null)
            {
                var value = unit.startValue + (unit.endValue - unit.startValue) * (tempTime - unit.startTime) / unit.time;

                this.toList[unit.index] = value;
            }
        }

        for(var key in this.toList){
            
            var unit = this.dic[key];

            if (unit)
            {
                unit.dele(this.toList[key]);
            }
        }

        this.toList = {};

        for (var i:number = 0; i < this.endList.length; i++)
        {
            var index = this.endList[i];

            var unit = this.dic[index];

            if (unit)
            {
                delete this.dic[index];

                if (unit.endCallBack != null)
                {
                    unit.endCallBack();
                }

                this.ReleaseUnit(unit);
            }
        }

        this.endList = [];
    }

    private GetIndex():number
    {
        var result = this.index;

        this.index++;

        return result;
    }

    private pool:SuperTweenUnit[] = [];

    private GetUnit():SuperTweenUnit
    {
        if (this.pool.length > 0)
        {
            return this.pool.pop();
        }
        else
        {
            return new SuperTweenUnit();
        }
    }

    private ReleaseUnit(_unit:SuperTweenUnit):void
    {
        this.pool.push(_unit);
    }
}


class SuperTween{

    private static _Instance:SuperTween;

    public static get Instance():SuperTween{
        
        if(!SuperTween._Instance){

            SuperTween._Instance = new SuperTween();
        }

        return SuperTween._Instance;
    }

    private script:SuperTweenScript = new SuperTweenScript();

    public To(_startValue:number, _endValue:number, _time:number, _delegate:(value:number)=>void, _endCallBack:()=>void, _isFixed:boolean):number
    {
        return this.script.To(_startValue, _endValue, _time, _delegate, _endCallBack, _isFixed);
    }

    public Remove(_index:number, _toEnd:boolean):void
    {
        this.script.Remove(_index, _toEnd);
    }

    public SetTag(_index:number, _tag:string):void
    {
        this.script.SetTag(_index, _tag);
    }

    public RemoveAll(_toEnd:boolean):void
    {
        this.script.RemoveAll(_toEnd);
    }

    public RemoveWithTag(_tag:string, _toEnd:boolean):void
    {
        this.script.RemoveWithTag(_tag, _toEnd);
    }

    public DelayCall(_time:number, _endCallBack:()=>void, _isFixed:boolean):number
    {
        return this.script.DelayCall(_time, _endCallBack, _isFixed);
    }

    public NextFrameCall(_endCallBack:()=>void):number
    {
        return this.script.NextFrameCall(_endCallBack);
    }

    public Update():void{
        
        this.script.Update();
    }
}