declare class battle{

	heroArr:{[key:string]:hero};
	
	init(mapScale:number, obstacle:obstacleData, deltaTime:number):void;

	clientUpdate(data:roundData):void;

	setRefreshData(data:refreshData):void;

	getHeroPos(heroX:number, heroY:number, heroDir:number, moveDistance:number):Array<vector2>;

	mapScale:number;

	mapUnitWidth:number;

	obstacle:obstacleData;

	deltaTime:number;

	getVector2():vector2;
}

declare class obstacleData{

	v:{[key:number]:number};

	h:{[key:number]:number};

	mapWidth:number;

	mapHeight:number;
}

declare class vector2{

	x:number;
	
	y:number;
}

declare class refreshData{

	heroArr:{[key:string]:hero};

	mapScale:number;

	obstacle:obstacleData;

	deltaTime:number;
}

declare class roundData{

	joinArr:Array<hero>;

	commandArr:{[key:string]:number};

	hitArr:Array<Array<number>>;
}

declare class hero{

	id:string;

	dir:number;

	moveSpeed:number;

	x:number;

	y:number;
}

declare function fun():battle;