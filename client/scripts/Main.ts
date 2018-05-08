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

    private lastGetServerDataTime:number = 0;

    public constructor() {

        super();

        console.log("start");

        this.battleObj = fun();

        this.battleObj.init(16,16,50,{},3);

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
        console.log("egret.Capabilities.renderMode:" + egret.Capabilities.renderMode);

        var sprite:egret.Sprite = new egret.Sprite();
        sprite.graphics.beginFill(0x000000);
        sprite.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        sprite.graphics.endFill();
        this.addChild(sprite);

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
        this.addChild(sprite);

        this.btArr.push(sprite);

        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 50;
        sprite.y = this.stage.stageHeight - 50;
        this.addChild(sprite);

        this.btArr.push(sprite);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 0;
        sprite.y = this.stage.stageHeight - 50 * 2;
        this.addChild(sprite);

        this.btArr.push(sprite);


        sprite = new egret.Sprite();
        sprite.graphics.beginFill(0xffffff);
        sprite.graphics.drawRect(0, 0, 50, 50);
        sprite.graphics.endFill();
        sprite.x = 100;
        sprite.y = this.stage.stageHeight - 50 * 2;
        this.addChild(sprite);

        this.btArr.push(sprite);
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

        return true;
    }

    private gameUpdate():void
    {
        this.lastGetServerDataTime = Timer.getUnscaledTime();

        for(var id in this.battleObj.heroArr){

            var heroObj:hero = this.battleObj.heroArr[id];

            if(!this.heroArr[id]){

                var container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

                var dele = function(){

                    var c = container;

                    var getImg = function(event:egret.Event){

                        var loader:egret.ImageLoader = event.currentTarget;  

                        var tex:egret.Texture = new egret.Texture();

                        tex.bitmapData = loader.data;

                        var bitmap:egret.Bitmap = new egret.Bitmap(tex);

                        bitmap.x = -0.5 * bitmap.width;
                        bitmap.y = -0.5 * bitmap.height;

                        c.addChild(bitmap);
                    }

                    var imgLoader:egret.ImageLoader = new egret.ImageLoader;
                    imgLoader.once( egret.Event.COMPLETE, getImg, this ); 
                    imgLoader.load( "resource/assets/red_point.png" );
                }
                
                dele.bind(this)();

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
        }

        if(del){

            for(var id in del){

                delete this.heroArr[id];
            }
        }
    }

    private updateHero():void{

        for(var key in this.battleObj.heroArr){

            var hero = this.heroArr[key];

            var heroObj = this.battleObj.heroArr[key];

            if(heroObj.dir == 0){

                hero.x = heroObj.x;

                hero.y = heroObj.y;

            }else{

                var moveSpeed = this.battleObj.moveSpeed * (Timer.getUnscaledTime() - this.lastGetServerDataTime) / this.deltaTime;

                var pos:vector2 = this.battleObj.getHeroPos(heroObj.x, heroObj.y, heroObj.dir, moveSpeed);

                hero.x = pos.x;

                hero.y = pos.y;
            }
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

            this.battleObj.setRefreshData(refreshDataObj);
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