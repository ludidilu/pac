declare class battle{

	heroArr:{[key:string]:hero};
	
	init(mapWidth:number, mapHeight:number, mapScale:number, obstacle:{[key:number]:number}, moveSpeed:number):void;

	clientUpdate(data:roundData):void;

	setRefreshData(data:refreshData):void;

	getHeroPos(heroX:number, heroY:number, heroDir:number, moveSpeed:number):vector2;

	mapWidth:number;

	mapHeight:number;

	mapScale:number;

	mapUnitWidth:number;

	obstacle:{[key:number]:number};

	moveSpeed:number;
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

	obstacle:{[key:number]:number};

	moveSpeed:number;
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