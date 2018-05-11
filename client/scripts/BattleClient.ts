class BattleClient extends egret.DisplayObjectContainer {

    private battleObj:battle;

    private heroArr:{[key:string]:egret.DisplayObjectContainer} = {};

    public mapWidth:number = 500;

    private tweenTime:number = 500;

    private obstacleWidth:number = 0.1;

    private lastGetServerDataTime:number = 0;

    private bgContainer:egret.DisplayObjectContainer;

    private mapConainer:egret.DisplayObjectContainer;

    private heroContainer:egret.DisplayObjectContainer;

    public init(battleObj:battle):void{

        this.battleObj = battleObj;

        this.initContainer();

        this.initBg();

        this.initMap();
    }

    private initContainer():void{

        let tmpWidth:number = this.battleObj.mapWidth * this.battleObj.mapUnitWidth;

        this.scaleX = this.mapWidth / tmpWidth;

        this.scaleY = this.scaleX;

        this.bgContainer = new egret.DisplayObjectContainer();

        this.addChild(this.bgContainer);

        this.mapConainer = new egret.DisplayObjectContainer();

        this.addChild(this.mapConainer);

        this.heroContainer = new egret.DisplayObjectContainer();

        this.addChild(this.heroContainer);
    }

    private initBg():void{

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        let tmpWidth:number = this.battleObj.mapWidth * this.battleObj.mapUnitWidth;

        container.scaleX = container.scaleY = tmpWidth / this.mapWidth;

        this.bgContainer.addChild(container);

        let sprite:egret.Sprite = new egret.Sprite();

        container.addChild(sprite);

        sprite.graphics.beginFill(0x808080);

        sprite.graphics.drawRect(0,0,this.mapWidth, this.mapWidth * this.battleObj.mapHeight / this.battleObj.mapWidth);

        sprite.graphics.endFill();

        let cellWidth:number = this.mapWidth / this.battleObj.mapWidth;

        sprite = new egret.Sprite();

        container.addChild(sprite);

        sprite.graphics.beginFill(0x505050);
                
        for(let i:number = 0 ; i < this.battleObj.mapWidth ; i++){

            for(let m:number = 0 ; m < this.battleObj.mapHeight ; m++){

                if(i % 2 == m % 2){

                    continue;
                }

                sprite.graphics.drawRect(cellWidth * i, cellWidth * m, cellWidth, cellWidth);
            }
        }

        sprite.graphics.endFill();
    }

    private initMap():void{

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        let tmpWidth:number = this.battleObj.mapWidth * this.battleObj.mapUnitWidth;

        container.scaleX = container.scaleY = tmpWidth / this.mapWidth;

        this.mapConainer.addChild(container);

        let key:any;

        let obstacleHeight:number = this.mapWidth / this.battleObj.mapWidth;

        let obstacleWidth:number = obstacleHeight * this.obstacleWidth;

        let sprite:egret.Sprite = new egret.Sprite();

        container.addChild(sprite);

        sprite.graphics.beginFill(0xff0000);

        if(this.battleObj.obstacle.v){

            for(key in this.battleObj.obstacle.v){

                let n:number = key;

                let x:number = n % this.battleObj.mapWidth;

                let y:number = Math.floor(n / this.battleObj.mapWidth);

                sprite.graphics.drawRect(x * obstacleHeight, (y + 1) * obstacleHeight - obstacleWidth * 0.5, obstacleHeight, obstacleWidth);
            }
        }

        if(this.battleObj.obstacle.h){

            for(key in this.battleObj.obstacle.h){

                let n:number = key;

                let x:number = n % this.battleObj.mapWidth;

                let y:number = Math.floor(n / this.battleObj.mapWidth);

                sprite.graphics.drawRect((x + 1) * obstacleHeight - obstacleWidth * 0.5, y * obstacleHeight, obstacleWidth, obstacleHeight);
            }
        }

        sprite.graphics.endFill();
    }

    public gameUpdate():void{

        this.lastGetServerDataTime = Timer.getTime();

        for(let id in this.battleObj.heroArr){

            let heroObj:hero = this.battleObj.heroArr[id];

            if(!this.heroArr[id]){

                let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

                let getImg:(e:egret.Event)=>void = function(event:egret.Event){

                    let loader:egret.ImageLoader = event.currentTarget;  

                    let tex:egret.Texture = new egret.Texture();

                    tex.bitmapData = loader.data;

                    let bitmap:egret.Bitmap = new egret.Bitmap(tex);

                    bitmap.scaleX = this.battleObj.mapUnitWidth / bitmap.width;

                    bitmap.scaleY = this.battleObj.mapUnitWidth / bitmap.height;

                    bitmap.x = -0.5 * bitmap.width * bitmap.scaleX;

                    bitmap.y = -0.5 * bitmap.height * bitmap.scaleY;

                    container.addChild(bitmap);
                }

                let imgLoader:egret.ImageLoader = new egret.ImageLoader;
                imgLoader.once( egret.Event.COMPLETE, getImg, this ); 
                imgLoader.load( "resource/assets/red_point.png" );

                container.x = heroObj.x;

                container.y = heroObj.y;

                this.heroContainer.addChild(container);

                this.heroArr[id] = container;
            }
        }

        let del:Array<string> = null;

        for(let id in this.heroArr){

            let container:egret.DisplayObjectContainer = this.heroArr[id];

            if(!this.battleObj.heroArr[id]){

                this.removeChild(container);

                if(!del){

                    del = new Array<string>();
                }

                del.push(id);
            }
        }

        if(del){

            for(let id in del){

                delete this.heroArr[id];
            }
        }
    }

    public updateHero():void{

        for(let key in this.battleObj.heroArr){

            let hero:egret.DisplayObjectContainer = this.heroArr[key];

            let heroObj:hero = this.battleObj.heroArr[key];

            let percent:number;

            if(heroObj.dir == 0){

                percent = (Timer.getTime() - this.lastGetServerDataTime) / this.tweenTime;

                hero.x = hero.x + (heroObj.x - hero.x) * percent;

                hero.y = hero.y + (heroObj.y - hero.y) * percent;

            }else{

                let serverMoveDistance:number = this.battleObj.moveSpeed * this.tweenTime;

                let serverPos:Array<vector2> = this.battleObj.getHeroPos(heroObj.x, heroObj.y, heroObj.dir, serverMoveDistance);

                let serverFinalPos:vector2 = serverPos[serverPos.length - 1];

                let distance:number = Math.abs(heroObj.x - serverFinalPos.x) + Math.abs(heroObj.y - serverFinalPos.y);

                if(distance < serverMoveDistance){

                    //hit wall
                    let clientMoveDistance:number = this.battleObj.moveSpeed * Timer.getDeltaTime();

                    let needMoveDistance:number =  Math.abs(hero.x - serverFinalPos.x) + Math.abs(hero.y - serverFinalPos.y);

                    if(clientMoveDistance > needMoveDistance){

                        hero.x = serverFinalPos.x;

                        hero.y = serverFinalPos.y;
                    }
                    else{

                        percent = clientMoveDistance / needMoveDistance;

                        let fixPos:vector2 = this.getPos(hero.x, hero.y, serverFinalPos.x, serverFinalPos.y, heroObj.dir, percent);
                    
                        hero.x = fixPos.x;

                        hero.y = fixPos.y;
                    }
                }
                else{

                    percent = Timer.getDeltaTime() / (this.lastGetServerDataTime + this.tweenTime - Timer.getTime());

                    let fixPos:vector2 = this.getPos(hero.x, hero.y, serverFinalPos.x, serverFinalPos.y, heroObj.dir, percent);
                    
                    hero.x = fixPos.x;

                    hero.y = fixPos.y;
                }
            }
        }
    }

    private getPos(nowX:number, nowY:number, serverX:number, serverY:number, dir:number, percent:number):vector2{

        let result:vector2 = this.battleObj.getVector2();

        let xGap:number = Math.abs(nowX - serverX);

        let yGap:number = Math.abs(nowY - serverY);

        let dis:number = xGap + yGap;

        let fixDis:number = dis * percent;

        if(dir == 1 || dir == 2){

            if(xGap == 0){

                result.x = nowX;

                result.y = nowY + (serverY - nowY) * percent;
            }
            else{

                if(fixDis > xGap){

                    result.x = serverX;

                    let tmp:number = fixDis - xGap;

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

                    let tmp:number = fixDis - yGap;

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