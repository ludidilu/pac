class Main extends egret.DisplayObjectContainer {

    private socket:SocketIOClient.Socket;

    private tagArr:Array<string> = ["refresh", "update", "getLag"];

    private battleObj:battle;

    private bgContainer:egret.DisplayObjectContainer;

    private battleContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private fpsContainer:egret.DisplayObjectContainer;

    private battleClient:BattleClient;

    private joystick:Joystick;

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

        this.socket.on("connect", this.connected.bind(this));

        let getMessage = this.getMessage.bind(this);

        for(let i:number = 0 ; i < this.tagArr.length ; i++){

            let tag:string = this.tagArr[i];

            let dele2:(data:string)=>void = function(data:string){

                getMessage(tag, data);
            }

            this.socket.on(tag, dele2);
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

        this.fpsContainer = new egret.DisplayObjectContainer();

        this.addChild(this.fpsContainer);

        console.log("egret.Capabilities.renderMode:" + egret.Capabilities.renderMode);

        let sprite:egret.Sprite = new egret.Sprite();
        sprite.graphics.beginFill(0x000000);
        sprite.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        sprite.graphics.endFill();
        this.bgContainer.addChild(sprite);

        sprite.touchEnabled = true;
        
        this.joystick = new Joystick();

        this.joystick.init(sprite, this.uiContainer, this.joystickCallBack.bind(this));

        this.pingTf = new egret.TextField();

        this.fpsContainer.addChild(this.pingTf);
    }

    private joystickCallBack(index:number):void{

        if(index > -1){

            this.socket.emit("command", index);
        }
    }

    private update(time:number):boolean
    {
        Timer.update(time);

        SuperTween.Instance.Update();

        this.updateHero();

        this.updatePing();

        return true;
    }

    private lastPingTime:number = 0;

    private pingGap:number = 1000;

    private updatePing():void{

        if(Timer.getRealTime() - this.lastPingTime > this.pingGap){

            this.socket.emit("getLag", Timer.getRealTime());

            this.lastPingTime = Timer.getRealTime();
        }
    }

    private refreshData(refreshDataObj:refreshData):void{

        this.battleObj = fun();

        this.battleObj.init(refreshDataObj.mapScale, refreshDataObj.obstacle, refreshDataObj.deltaTime);

        this.battleObj.setRefreshData(refreshDataObj);

        this.battleClient = new BattleClient();

        this.battleClient.x = (this.stage.stageWidth - this.battleClient.mapWidth) * 0.5;

        this.battleClient.y = (this.stage.stageHeight - this.battleClient.mapWidth * this.battleObj.obstacle.mapHeight / this.battleObj.obstacle.mapWidth) * 0.5;

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
        let imgLoader:egret.ImageLoader = new egret.ImageLoader;
        imgLoader.crossOrigin = "anonymous";
        imgLoader.once( egret.Event.COMPLETE, (evt:egret.Event)=>{
           let loader:egret.ImageLoader = evt.currentTarget;
           let texture = new egret.Texture();
           texture.bitmapData = loader.data;
           textureObj["texture"] = texture;
        }, this ); 
        imgLoader.load(url);
    }

    private getMessage(tag:string, data:string):void
    {
        if(tag == "refresh"){

            let refreshDataObj:refreshData = JSON.parse(data);

            this.refreshData(refreshDataObj);

            this.gameUpdate();
        }
        else if(tag == "update"){

            let roundData:roundData = JSON.parse(data);

            this.battleObj.clientUpdate(roundData);

            for(var key in roundData.hitArr){

                console.log(roundData.hitArr[key][0] + "  " + roundData.hitArr[key][1]);
            }

            this.gameUpdate();
        }
        else if(tag == "getLag"){

            let time:number = parseInt(data);            

            let nowTime:number = Timer.getRealTime();

            this.pingTf.text = (nowTime - time).toString();
        }
    }

    private connected():void
    {
        let name:string = Math.floor(Math.random() * 100000000).toString();

        console.log("name:" + name);

        this.socket.emit("join", name);
    }
}