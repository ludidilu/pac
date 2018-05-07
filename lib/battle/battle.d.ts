declare class battle{

	heroArr:{[key:string]:hero};
	
	init(deltaTime:number):void;

	clientUpdate(data:roundData):void;

	setRefreshData(data:{[key:string]:hero}):void;

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