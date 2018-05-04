class Main extends egret.DisplayObjectContainer {

    private socket:SocketIOClient.Socket;

    private battleObj:battle;

    private deltaTime:number = 20;

    private tagArr:Array<string> = ["refresh", "update"];

    private heroArr:{[key:string]:egret.Sprite} = {};

    private btArr:Array<egret.Sprite> = [];

    public constructor() {

        super();

        console.log("start");

        this.battleObj = fun();

        this.battleObj.init(this.deltaTime * 0.001);

        this.socket = io.connect("1.1.1.118:3000");

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

        var update = this.update.bind(this);

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            

            context.onUpdate = () => {

                update();
            }
        })

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(){

        this.initUi();
    }

    private initUi(){

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

    private touchBegin(index){

        this.btArr[index-1].alpha = 0.5;

        this.socket.emit("command", index);
    }

    private touchEnd(){
        
        for(var i = 0 ; i < 4 ; i++){
            
            var sprite = this.btArr[i];

            sprite.alpha = 1;
        }

        this.socket.emit("command", 0);
    }

    private update(){

        for(var id in this.battleObj.heroArr){

            if(!this.heroArr[id]){

                console.log("add hero!");

                var sprite:egret.Sprite = new egret.Sprite();
                sprite.graphics.beginFill(0xff0000);
                sprite.graphics.drawRect(0, 0, 50, 50);
                sprite.graphics.endFill();
                this.addChild(sprite);

                this.heroArr[id] = sprite;
            }
        }

        var del:Array<string> = null;

        for(var id in this.heroArr){

            var sprite = this.heroArr[id];

            if(!this.battleObj.heroArr[id]){

                this.removeChild(sprite);

                if(!del){

                    del = new Array<string>();
                }

                del.push(id);
            }
            else{

                var heroObj:hero = this.battleObj.heroArr[id];

                sprite.x = heroObj.x;

                sprite.y = heroObj.y;
            }
        }

        if(del){

            for(var id in del){

                delete this.heroArr[id];
            }
        }
    }

    private getMessage(tag, data){

        if(tag == "refresh"){

            var arr: {[key:string]:hero} = JSON.parse(data);

            this.battleObj.setRefreshData(arr);
        }
        else if(tag == "update"){

            var roundData : roundData = JSON.parse(data);

            this.battleObj.clientUpdate(roundData);
        }
    }

    private connected(){

        var name = Math.floor(Math.random() * 10000).toString();

        console.log("name:" + name);

        this.socket.emit("join", name);
    }
}