class TweenUnit{
    public obj:egret.DisplayObject;
    public startX:number;
    public endX:number;
    public startY:number;
    public endY:number;
}

class Main extends egret.DisplayObjectContainer {

    private socket:SocketIOClient.Socket;

    private battleObj:battle;

    private deltaTime:number = 20;

    private tagArr:Array<string> = ["refresh", "update"];

    private heroArr:{[key:string]:egret.DisplayObjectContainer} = {};

    private btArr:Array<egret.Sprite> = [];

    private tweenList:Array<TweenUnit> = [];

    private tweenID:number = -1;

    public constructor() {

        super();

        console.log("start");

        this.battleObj = fun();

        this.battleObj.init(this.deltaTime * 0.001);

        this.socket = io.connect("127.0.0.1:3000");

        this.socket.on("connect", this.connected.bind(this));

        var socket = this.socket;

        var tagArr = this.tagArr;

        var getMessage = this.getMessage.bind(this);

        for(var i:number = 0 ; i < tagArr.length ; i++){

            var dele = function(){

                var tag = tagArr[i];

                var dele2 = function(data){

                    getMessage(tag, data);
                }

                socket.on(tag, dele2);
            }

            dele();
        }

        egret.startTick(this.update, this);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage():void
    {
        this.initUi();
    }

    private initUi():void
    {
        var sprite:egret.Sprite = new egret.Sprite();
        sprite.graphics.beginFill(0x000000);
        sprite.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        sprite.graphics.endFill();
        this.addChild(sprite);

        


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 50;
        sprite.y = this.stage.stageHeight - 50 * 3;
        this.addChild(sprite);

        sprite.touchEnabled = true;

        this.btArr.push(sprite);

        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 50;
        sprite.y = this.stage.stageHeight - 50;
        this.addChild(sprite);

        sprite.touchEnabled = true;

        this.btArr.push(sprite);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 0;
        sprite.y = this.stage.stageHeight - 50 * 2;
        this.addChild(sprite);

        sprite.touchEnabled = true;

        this.btArr.push(sprite);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 100;
        sprite.y = this.stage.stageHeight - 50 * 2;
        this.addChild(sprite);

        sprite.touchEnabled = true;

        this.btArr.push(sprite);

        for(var i = 0 ; i < 4 ; i++){

            var dele2 = function(){

                var k = i;

                var dele = function(){

                    this.touchBegin(k + 1);
                }

                this.btArr[k].addEventListener(egret.TouchEvent.TOUCH_BEGIN, dele, this);

                this.btArr[k].addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);

                this.btArr[k].addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.touchEnd, this);
            }

            dele2.bind(this)();
        }
    }

    private touchBegin(index):void
    {
        this.btArr[index-1].alpha = 0.5;

        this.socket.emit("command", index);
    }

    private touchEnd():void
    {
        for(var i = 0 ; i < 4 ; i++){
            
            var sprite = this.btArr[i];

            sprite.alpha = 1;
        }

        this.socket.emit("command", 0);
    }

    private update(time):boolean
    {
        SuperTween.Instance.Update();

        return true;
    }

    private gameUpdate():void
    {
        if(this.tweenID != -1){

            SuperTween.Instance.Remove(this.tweenID, false);

            this.tweenID = -1;

            this.tweenList = [];
        }

        for(var id in this.battleObj.heroArr){

            var heroObj:hero = this.battleObj.heroArr[id];

            if(!this.heroArr[id]){

                var container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

                var sprite:egret.Sprite = new egret.Sprite();
                sprite.graphics.beginFill(0xff0000);
                sprite.graphics.drawRect(0, 0, 50, 50);
                sprite.graphics.endFill();

                sprite.x = -25;
                sprite.y = -25;

                container.addChild(sprite);

                container.x = heroObj.x;

                container.y = heroObj.y;

                this.addChild(container);

                this.heroArr[id] = container;
            }
        }

        var del:Array<string> = null;

        for(var id in this.heroArr){

            container = this.heroArr[id];

            if(!this.battleObj.heroArr[id]){

                this.removeChild(container);

                if(!del){

                    del = new Array<string>();
                }

                del.push(id);
            }
            else{

                heroObj = this.battleObj.heroArr[id];

                if(heroObj.x != container.x || heroObj.y != container.y){

                    if(heroObj.dir == 0){

                        var unit:TweenUnit = new TweenUnit();

                        unit.obj = container;

                        unit.startX = container.x;
                        unit.endX = heroObj.x;

                        unit.startY = container.y;
                        unit.endY = heroObj.y;

                        this.tweenList.push(unit);
                    }
                    else if(heroObj.dir == 1){

                        
                    }
                }

                container.x = heroObj.x;

                container.y = heroObj.y;
            }
        }

        if(del){

            for(var id in del){

                delete this.heroArr[id];
            }
        }
    }

    private getMessage(tag, data):void
    {
        if(tag == "refresh"){

            var arr: {[key:string]:hero} = JSON.parse(data);

            this.battleObj.setRefreshData(arr);
        }
        else if(tag == "update"){

            var roundData : roundData = JSON.parse(data);

            this.battleObj.clientUpdate(roundData);

            this.gameUpdate();
        }
    }

    private connected():void
    {
        var name = Math.floor(Math.random() * 100000000).toString();

        console.log("name:" + name);

        this.socket.emit("join", name);
    }
}