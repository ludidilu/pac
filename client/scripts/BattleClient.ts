class BattleClient extends egret.DisplayObjectContainer {

    private battleObj:battle;

    private heroArr:{[key:string]:egret.DisplayObjectContainer} = {};

    private mapWidth:number = 500;

    private tweenTime:number = 500;

    private obstacleWidth:number = 0.1;

    private lastGetServerDataTime:number = 0;

    private bgContainer:egret.DisplayObjectContainer;

    private mapConainer:egret.DisplayObjectContainer;

    private heroContainer:egret.DisplayObjectContainer;

    public init(battleObj:battle){

        this.battleObj = battleObj;

        this.initContainer();

        this.initBg();

        this.initMap();
    }

    private initContainer(){

        this.bgContainer = new egret.DisplayObjectContainer();

        this.addChild(this.bgContainer);

        this.mapConainer = new egret.DisplayObjectContainer();

        this.addChild(this.mapConainer);

        this.heroContainer = new egret.DisplayObjectContainer();

        this.addChild(this.heroContainer);
    }

    private initBg(){

        var container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        var tmpWidth = this.battleObj.mapWidth * this.battleObj.mapUnitWidth;

        container.scaleX = container.scaleY = tmpWidth / this.mapWidth;

        this.scaleX = this.mapWidth / tmpWidth;

        this.scaleY = this.scaleX;

        this.bgContainer.addChild(container);

        var sprite:egret.Sprite = new egret.Sprite();

        container.addChild(sprite);

        sprite.graphics.beginFill(0x808080);

        sprite.graphics.drawRect(0,0,this.mapWidth, this.mapWidth * this.battleObj.mapHeight / this.battleObj.mapWidth);

        sprite.graphics.endFill();

        var cellWidth = this.mapWidth / this.battleObj.mapWidth;

        sprite = new egret.Sprite();

        container.addChild(sprite);

        sprite.graphics.beginFill(0x505050);
                
        for(var i:number = 0 ; i < this.battleObj.mapWidth ; i++){

            for(var m:number = 0 ; m < this.battleObj.mapHeight ; m++){

                if(i % 2 == m % 2){

                    continue;
                }

                sprite.graphics.drawRect(cellWidth * i, cellWidth * m, cellWidth, cellWidth);
            }
        }

        sprite.graphics.endFill();
    }

    private initMap(){

        var key;

        var obstacleWidth = this.battleObj.mapUnitWidth * this.obstacleWidth;

        if(this.battleObj.obstacle.v){

            for(key in this.battleObj.obstacle.v){

                var n:number = key;

                var x = n % this.battleObj.mapWidth;

                var y = Math.floor(n / this.battleObj.mapWidth);

                var sprite:egret.Sprite = new egret.Sprite();

                sprite.graphics.beginFill(0xff0000);

                sprite.graphics.drawRect(0, 0, this.battleObj.mapUnitWidth, obstacleWidth);

                sprite.graphics.endFill();

                sprite.x = x * this.battleObj.mapUnitWidth;

                sprite.y = (y + 1) * this.battleObj.mapUnitWidth - obstacleWidth * 0.5;

                this.mapConainer.addChild(sprite);
            }
        }

        if(this.battleObj.obstacle.h){

            for(key in this.battleObj.obstacle.h){

                n = key;

                x = n % this.battleObj.mapWidth;

                y = Math.floor(n / this.battleObj.mapWidth);

                sprite = new egret.Sprite();

                sprite.graphics.beginFill(0xff0000);

                sprite.graphics.drawRect(0, 0, obstacleWidth, this.battleObj.mapUnitWidth);

                sprite.graphics.endFill();

                sprite.x = (x + 1) * this.battleObj.mapUnitWidth - obstacleWidth * 0.5;

                sprite.y = y * this.battleObj.mapUnitWidth;

                this.mapConainer.addChild(sprite);
            }
        }

        this.mapConainer.cacheAsBitmap = true;
    }

    public gameUpdate(){

        this.lastGetServerDataTime = Timer.getTime();

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

                        bitmap.scaleX = this.battleObj.mapUnitWidth / bitmap.width;

                        bitmap.scaleY = this.battleObj.mapUnitWidth / bitmap.height;

                        bitmap.x = -0.5 * bitmap.width * bitmap.scaleX;

                        bitmap.y = -0.5 * bitmap.height * bitmap.scaleY;

                        c.addChild(bitmap);
                    }

                    var imgLoader:egret.ImageLoader = new egret.ImageLoader;
                    imgLoader.once( egret.Event.COMPLETE, getImg, this ); 
                    imgLoader.load( "resource/assets/red_point.png" );
                }
                
                dele.bind(this)();

                container.x = heroObj.x;

                container.y = heroObj.y;

                this.heroContainer.addChild(container);

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

    public updateHero(){

        for(var key in this.battleObj.heroArr){

            var hero = this.heroArr[key];

            var heroObj = this.battleObj.heroArr[key];

            var percent:number;

            if(heroObj.dir == 0){

                percent = (Timer.getTime() - this.lastGetServerDataTime) / this.tweenTime;

                hero.x = hero.x + (heroObj.x - hero.x) * percent;

                hero.y = hero.y + (heroObj.y - hero.y) * percent;

            }else{

                var serverMoveDistance = this.battleObj.moveSpeed * this.tweenTime;

                var serverPos:Array<vector2> = this.battleObj.getHeroPos(heroObj.x, heroObj.y, heroObj.dir, serverMoveDistance);

                var serverFinalPos:vector2 = serverPos[serverPos.length - 1];

                var distance = Math.abs(heroObj.x - serverFinalPos.x) + Math.abs(heroObj.y - serverFinalPos.y);

                if(distance < serverMoveDistance){

                    //hit wall
                    var clientMoveDistance = this.battleObj.moveSpeed * Timer.getDeltaTime();

                    var needMoveDistance =  Math.abs(hero.x - serverFinalPos.x) + Math.abs(hero.y - serverFinalPos.y);

                    if(clientMoveDistance > needMoveDistance){

                        hero.x = serverFinalPos.x;

                        hero.y = serverFinalPos.y;
                    }
                    else{

                        percent = clientMoveDistance / needMoveDistance;

                        var fixPos:vector2 = this.getPos(hero.x, hero.y, serverFinalPos.x, serverFinalPos.y, heroObj.dir, percent);
                    
                        hero.x = fixPos.x;

                        hero.y = fixPos.y;
                    }
                }
                else{

                    percent = Timer.getDeltaTime() / (this.lastGetServerDataTime + this.tweenTime - Timer.getTime());

                    var fixPos:vector2 = this.getPos(hero.x, hero.y, serverFinalPos.x, serverFinalPos.y, heroObj.dir, percent);
                    
                    hero.x = fixPos.x;

                    hero.y = fixPos.y;
                }
            }
        }
    }

    private getPos(nowX:number, nowY:number, serverX:number, serverY:number, dir:number, percent:number){

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
}