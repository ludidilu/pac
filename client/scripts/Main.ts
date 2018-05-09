class Main extends egret.DisplayObjectContainer {

    private socket:SocketIOClient.Socket;

    private tagArr:Array<string> = ["refresh", "update", "getLag"];

    private battleObj:battle;

    private bgContainer:egret.DisplayObjectContainer;

    private battleContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private battleClient:BattleClient;

    private btArr:Array<egret.Sprite> = [];

    private pingTf:egret.TextField;

    public constructor() {

        super();

        console.log("start");

        egret.startTick(this.update, this);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage():void
    {
        this.initSocket();

        this.initUi();
    }

    private initSocket():void{

        // this.socket = io.connect("106.75.222.192:1999");

        this.socket = io.connect("1.1.1.118:1999");

        var socket = this.socket;        

        this.socket.on("connect", this.connected.bind(this));

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
    }

    private initUi():void
    {
        this.bgContainer = new egret.DisplayObjectContainer();

        this.addChild(this.bgContainer);

        this.battleContainer = new BattleClient();

        this.addChild(this.battleContainer);

        this.uiContainer = new egret.DisplayObjectContainer();

        this.addChild(this.uiContainer);

        console.log("egret.Capabilities.renderMode:" + egret.Capabilities.renderMode);

        var sprite:egret.Sprite = new egret.Sprite();
        sprite.graphics.beginFill(0x000000);
        sprite.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        sprite.graphics.endFill();
        this.bgContainer.addChild(sprite);

        sprite.touchEnabled = true;

        var dele = function(e:egret.Event){

            var touch:egret.TouchEvent = <egret.TouchEvent>e;

            for(var i:number = 0 ; i < 4 ; i++){

                var bt:egret.Sprite = this.btArr[i];

                if(bt.getTransformedBounds(this).contains(touch.stageX, touch.stageY)){

                    this.touchBegin(i + 1);

                    return;
                }
            }

            this.touchEnd();
        }

        sprite.addEventListener(egret.TouchEvent.TOUCH_BEGIN, dele, this);

        sprite.addEventListener(egret.TouchEvent.TOUCH_MOVE, dele, this);

        sprite.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);

        sprite.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.touchEnd, this);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 50;
        sprite.y = this.stage.stageHeight - 50 * 3;
        this.uiContainer.addChild(sprite);

        this.btArr.push(sprite);

        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 50;
        sprite.y = this.stage.stageHeight - 50;
        this.uiContainer.addChild(sprite);

        this.btArr.push(sprite);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 0;
        sprite.y = this.stage.stageHeight - 50 * 2;
        this.uiContainer.addChild(sprite);

        this.btArr.push(sprite);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 100;
        sprite.y = this.stage.stageHeight - 50 * 2;
        this.uiContainer.addChild(sprite);

        this.btArr.push(sprite);



        this.pingTf = new egret.TextField();
        this.uiContainer.addChild(this.pingTf);
    }

    private touchBegin(index):void
    {
        for(var i = 0 ; i < 4 ; i++){

            if(i == index - 1){

                this.btArr[i].alpha = 0.5;
            }
            else{

                this.btArr[i].alpha = 1;
            }
        }

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
        Timer.update(time);

        SuperTween.Instance.Update();

        this.updateHero();

        this.updatePing();

        return true;
    }

    private lastPingTime:number = 0;

    private pingGap:number = 1000;

    private updatePing(){

        if(Timer.getRealTime() - this.lastPingTime > this.pingGap){

            this.socket.emit("getLag", Timer.getRealTime());

            this.lastPingTime = Timer.getRealTime();
        }
    }

    private refreshData(refreshDataObj:refreshData):void{

        this.battleObj = fun();

        this.battleObj.init(refreshDataObj.mapWidth, refreshDataObj.mapHeight, refreshDataObj.mapScale, refreshDataObj.obstacle, refreshDataObj.moveSpeed);

        this.battleObj.setRefreshData(refreshDataObj);

        this.battleClient = new BattleClient();

        this.battleContainer.addChild(this.battleClient);

        this.battleClient.init(this.battleObj);
    }

    private gameUpdate():void
    {
        this.battleClient.gameUpdate();
    }

    private updateHero():void{

        if(this.battleObj){

            this.battleClient.updateHero();
        }
    }

    public getNetImage(textureObj:any,url:string):void{
        var imgLoader:egret.ImageLoader = new egret.ImageLoader;
        imgLoader.crossOrigin = "anonymous";
        imgLoader.once( egret.Event.COMPLETE, (evt:egret.Event)=>{
           var loader:egret.ImageLoader = evt.currentTarget;
           var texture = new egret.Texture();
           texture.bitmapData = loader.data;
           textureObj["texture"] = texture;
        }, this ); 
        imgLoader.load(url);
    }

    private getMessage(tag:string, data:string):void
    {
        if(tag == "refresh"){

            var refreshDataObj : refreshData = JSON.parse(data);

            this.refreshData(refreshDataObj);

            this.gameUpdate();
        }
        else if(tag == "update"){

            var roundData : roundData = JSON.parse(data);

            this.battleObj.clientUpdate(roundData);

            this.gameUpdate();
        }
        else if(tag == "getLag"){

            var time : number = parseInt(data);            

            var nowTime = Timer.getRealTime();

            this.pingTf.text = (nowTime - time).toString();
        }
    }

    private connected():void
    {
        var name = Math.floor(Math.random() * 100000000).toString();

        console.log("name:" + name);

        this.socket.emit("join", name);
    }
}