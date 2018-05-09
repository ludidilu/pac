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

    private tagArr:Array<string> = ["refresh", "update", "getLag"];

    private battleContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private heroArr:{[key:string]:egret.DisplayObjectContainer} = {};

    private btArr:Array<egret.Sprite> = [];

    private lastGetServerDataTime:number = 0;

    private pingTf:egret.TextField;

    private tweenTime:number = 500;

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
        this.battleContainer = new egret.DisplayObjectContainer();

        this.addChild(this.battleContainer);

        this.uiContainer = new egret.DisplayObjectContainer();

        this.addChild(this.uiContainer);

        console.log("egret.Capabilities.renderMode:" + egret.Capabilities.renderMode);

        var sprite:egret.Sprite = new egret.Sprite();
        sprite.graphics.beginFill(0x000000);
        sprite.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        sprite.graphics.endFill();
        this.battleContainer.addChild(sprite);

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

        if(Timer.getUnscaledTime() - this.lastPingTime > this.pingGap){

            this.socket.emit("getLag", Timer.getUnscaledTime());

            this.lastPingTime = Timer.getUnscaledTime();
        }
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

                this.battleContainer.addChild(container);

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

            var percent = (Timer.getUnscaledTime() - this.lastGetServerDataTime) / this.tweenTime;

            if(heroObj.dir == 0){

                hero.x = hero.x + (heroObj.x - hero.x) * percent;

                hero.y = hero.y + (heroObj.y - hero.y) * percent;

            }else{

                var serverMoveDistance = this.battleObj.moveSpeed * (Timer.getUnscaledTime() - this.lastGetServerDataTime) / this.deltaTime;

                var serverPos:Array<vector2> = this.battleObj.getHeroPos(heroObj.x, heroObj.y, heroObj.dir, serverMoveDistance);

                var clientMoveDistance = this.battleObj.moveSpeed * Timer.getUnscaledDeltaTime() / this.deltaTime;

                var clientPos:Array<vector2> = this.battleObj.getHeroPos(hero.x, hero.y, heroObj.dir, clientMoveDistance);

                var fixPos:vector2 = this.getPos(clientPos[clientPos.length - 1].x, clientPos[clientPos.length - 1].y, serverPos[serverPos.length - 1].x, serverPos[serverPos.length - 1].y, heroObj.dir, percent);

                hero.x = fixPos.x;

                hero.y = fixPos.y;
            }
        }
    }

    private getPos(nowX:number, nowY:number, serverX:number, serverY:number, dir:number, percent:number){

        // var pos:Array<vector2> = this.battleObj.getHeroPos(nowX, nowY, dir, moveDistance);

        // var pos2:Array<vector2> = this.battleObj.getHeroPos(serverX, serverY, dir, moveDistance);

        var result:vector2 = this.battleObj.getVector2();

        var xGap = Math.abs(nowX - serverX);

        var yGap = Math.abs(nowY - serverY);

        var dis = xGap + yGap;

        var fixDis = dis * percent;

        if(dir == 1 || dir == 2){

            if(xGap == 0){

                result.x = nowX;

                result.y = nowY + (serverY - nowY) * percent;
            }
            else{

                if(fixDis > xGap){

                    result.x = serverX;

                    var tmp = fixDis - xGap;

                    result.y = nowY + (serverY > nowY ? tmp : -tmp);
                }
                else{

                    result.x = nowX + (serverX > nowX ? fixDis : -fixDis);

                    result.y = nowY;
                }
            }
        }
        else{

            if(yGap == 0){

                result.x = nowX + (serverX - nowX) * percent;

                result.y = nowY;
            }
            else{

                if(fixDis > yGap){

                    result.y = serverY;

                    var tmp = fixDis - yGap;

                    result.x = nowX + (serverX > nowX ? tmp : -tmp);
                }
                else{

                    result.x = nowX;

                    result.y = nowY + (serverY > nowY ? fixDis : -fixDis);
                }
            }
        }

        return result;
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

            this.gameUpdate();
        }
        else if(tag == "update"){

            var roundData : roundData = JSON.parse(data);

            this.battleObj.clientUpdate(roundData);

            this.gameUpdate();
        }
        else if(tag == "getLag"){

            var time : number  = parseInt(data);            

            var nowTime = Timer.getUnscaledTime();

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