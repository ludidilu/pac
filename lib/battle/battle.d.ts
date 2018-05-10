declare class battle{

	heroArr:{[key:string]:hero};
	
	init(mapWidth:number, mapHeight:number, mapScale:number, obstacle:obstacleData, moveSpeed:number, deltaTime:number):void;

	clientUpdate(data:roundData):void;

	setRefreshData(data:refreshData):void;

	getHeroPos(heroX:number, heroY:number, heroDir:number, moveDistance:number):Array<vector2>;

	mapWidth:number;

	mapHeight:number;

	mapScale:number;

	mapUnitWidth:number;

	obstacle:obstacleData;

	moveSpeed:number;

	deltaTime:number;

	getVector2():vector2;
}

declare class obstacleData{

	v:{[key:number]:number};
	h:{[key:number]:number};
}

declare class vector2{

	x:number;
	
	y:number;
}

declare class refreshData{

	heroArr:{[key:string]:hero};

	mapWidth:number;

	mapHeight:number;

	mapScale:number;

	obstacle:obstacleData;

	moveSpeed:number;

	deltaTime:number;
}

declare class roundData{

	joinArr:Array<string>;

	commandArr:{[key:string]:number};
}

declare class hero{

	id:string;

	dir:number;

	x:number;

	y:number;
}

declare function fun():battle;