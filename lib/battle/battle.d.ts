declare class battle{

	heroArr:{[key:string]:hero};
	
	init(mapWidth:number, mapHeight:number, mapScale:number, obstacle:{[key:number]:number}, speed:number):void;

	clientUpdate(data:roundData):void;

	setRefreshData(data:refreshData):void;

	mapWidth:number;

	mapHeight:number;

	mapScale:number;

	mapUnitWidth:number;

	obstacle:{[key:number]:number};

	speed:number;
}

declare class refreshData{

	heroArr:{[key:string]:hero};

	mapWidth:number;

	mapHeight:number;

	mapScale:number;

	obstacle:{[key:number]:number};

	speed:number;
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