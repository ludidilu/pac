class Joystick extends egret.DisplayObjectContainer{

    private joystickBgRadius:number = 50;

    private joystickCircleRadius:number = 15;

    private moveThreshold:number = 5;

    private clickThreshold:number = 100;

    private joystickBgCanMove = false;

    private callback:(dir:number)=>void;

    private bg:egret.DisplayObject;

    private container:egret.DisplayObjectContainer;

    private joystickBg:egret.Sprite;

    private joystickCircle:egret.Sprite;

    private arrowList:Array<egret.Sprite> = new Array<egret.Sprite>(4);

    private hasMove:boolean = false;

    private hasDown:boolean = false;

    private downX:number;

    private downY:number;

    private downTime:number;

    public init(bg:egret.DisplayObject, container:egret.DisplayObjectContainer, callback:(dir:number)=>void):void{

        this.bg = bg;

        this.container = container;

        this.callback = callback;

        this.initUi();

        this.initEvents();
    }

    private initUi():void{

        this.joystickBg = new egret.Sprite();

        this.container.addChild(this.joystickBg);

        this.joystickBg.graphics.beginFill(0xffffff);

        this.joystickBg.graphics.drawCircle(0, 0, this.joystickBgRadius);

        this.joystickBg.graphics.endFill();

        for(var i:number = 0 ; i < 4 ; i++){

            var mask:egret.Sprite = new egret.Sprite();

            mask.graphics.beginFill(0xffffff);

            mask.graphics.drawCircle(0, 0, this.joystickBgRadius);

            mask.graphics.endFill();

            this.joystickBg.addChild(mask);

            var sprite:egret.Sprite = new egret.Sprite();

            sprite.graphics.beginFill(0xffff00);

            sprite.graphics.drawRect(0, 0, this.joystickBgRadius, this.joystickBgRadius);

            sprite.graphics.endFill();

            if(i == 0){

                sprite.rotation = -135;
            }
            else if(i == 1){

                sprite.rotation = 45;
            }
            else if(i == 2){

                sprite.rotation = 135;
            }
            else{

                sprite.rotation = -45;
            }

            sprite.mask = mask;

            this.arrowList[i] = sprite;

            this.joystickBg.addChild(sprite);

            sprite.visible = false;
        }

        this.joystickCircle = new egret.Sprite();

        this.joystickBg.addChild(this.joystickCircle);

        this.joystickCircle.graphics.beginFill(0x000000);

        this.joystickCircle.graphics.drawCircle(0, 0, this.joystickCircleRadius);

        this.joystickCircle.graphics.endFill();

        this.joystickBg.visible = false;
    }

    private initEvents():void{

        this.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);

        this.bg.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);

        this.bg.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);

        this.bg.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.touchEnd, this);
    }

    private touchBegin(e:egret.Event):void{

        var touch:egret.TouchEvent = <egret.TouchEvent>e;

        this.hasDown = true;

        this.downX = touch.stageX;

        this.downY = touch.stageY;

        this.downTime = Timer.getUnscaledTime();
    }

    private touchMove(e:egret.Event):void{

        if(!this.hasDown){

            return;
        }

        var touch:egret.TouchEvent = <egret.TouchEvent>e;

        var distance:number = Math.sqrt(Math.abs(touch.stageX - this.downX) * Math.abs(touch.stageX - this.downX) + Math.abs(touch.stageY - this.downY) * Math.abs(touch.stageY - this.downY));

        if(!this.hasMove){

            if(distance > this.moveThreshold){

                this.hasMove = true;

                this.joystickBg.visible = true;
            }
            else{

                return;
            }
        }
        
        var angle:number = Math.atan2(touch.stageY - this.downY, touch.stageX - this.downX);

        var dir:number;

        if(angle < -Math.PI * 0.25 && angle >= -Math.PI * 0.75){

            dir = 1;
        }
        else if(angle < Math.PI * 0.75 && angle >= Math.PI * 0.25){

            dir = 2;
        }
        else if(angle < -Math.PI * 0.75 ||angle >= Math.PI * 0.75){

            dir = 3;
        }
        else{
            
            dir = 4;
        }

        this.callback(dir);

        for(var i:number = 0 ; i < 4 ; i++){

            if(i == dir - 1){

                this.arrowList[i].visible = true;
            }
            else{

                this.arrowList[i].visible = false;
            }
        }

        if(this.joystickBgCanMove && distance > this.joystickBgRadius - this.joystickCircleRadius){

            this.downX = touch.stageX - Math.cos(angle) * (this.joystickBgRadius - this.joystickCircleRadius);

            this.downY = touch.stageY - Math.sin(angle) * (this.joystickBgRadius - this.joystickCircleRadius);
        }

        this.joystickBg.x = this.downX;

        this.joystickBg.y = this.downY;

        this.joystickCircle.x = Math.cos(angle) * (distance > this.joystickBgRadius - this.joystickCircleRadius ? this.joystickBgRadius - this.joystickCircleRadius : distance);

        this.joystickCircle.y = Math.sin(angle) * (distance > this.joystickBgRadius - this.joystickCircleRadius ? this.joystickBgRadius - this.joystickCircleRadius : distance);
    }

    private touchEnd(e:egret.Event):void{

        if(!this.hasDown){

            return;
        }

        if(this.hasMove){

            this.callback(0);

            this.hasMove = false;

            this.joystickBg.visible = false;

            for(var i:number = 0 ; i < 4 ; i++){

                this.arrowList[i].visible = false;
            }
        }
        else{

            if(Timer.getUnscaledTime() - this.downTime < this.clickThreshold){

                this.callback(-1);
            }
        }

        this.hasDown = false;
    }
}