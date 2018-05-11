let io = require('socket.io')();

io.on('connection', connection);

io.listen(1999);

let messageTag = ["join","command","refresh","getLag"];

let fun = require("../lib/battle/battle");

const deltaTime = 20;

setInterval(update, deltaTime);

let battle = fun();

battle.init(16,16,1000,{h:{1:1,5:1,23:1},v:{3:1,34:1,56:1}},3,deltaTime);

let player = [];

let startTime = new Date().getTime();

let lagTest = false;

let lagMin = 0;

let lagMax = 32;

let lagList = [];

let isLagRunning = false;

function update(){

	let result = JSON.stringify(battle.serverUpdate());

	for(let playerID in player){

		sendData(player[playerID], "update", result);
	}
}


function connection(client){

	console.log("one user connection");

	for(let key in messageTag){

		let dele2 = function(){

			let tag = messageTag[key];

			let delegate = function(data){

				getData(client, tag, data);
			};

			client.on(tag, delegate);
		}

		dele2();
	}
}

function getData(client, tag, data){

	if(!lagTest){

		getDataReal(client, tag, data);
	}
	else{

		let runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		let dele = function(){

			getDataReal(client, tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function getDataReal(client, tag, data){

	if(tag == "join"){

		if(!client.playerID){

			let id = data;

			client.playerID = id;

			player[id] = client;

			let result = battle.join(id);

			sendData(client, "refresh", JSON.stringify(result));
		}
	}
	else if(tag == "command"){

		if(client.playerID){

			battle.command(client.playerID, parseInt(data));
		}
	}
	else if(tag == "refresh"){

		let result = battle.getRefreshData();

		sendData(client, "refresh", JSON.stringify(result));
	}
	else if(tag == "getLag"){

		sendData(client, "getLag", data);
	}
}

function sendData(client, tag, data){

	if(!lagTest){

		client.emit(tag, data);
	}
	else{
		
		let runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		let dele = function(){

			client.emit(tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function addLagTest(dele, runTime){

	lagList.push({dele:dele, runTime:runTime});

	if(!isLagRunning && lagList.length == 1){

		setTimeout(lagRun, runTime - (new Date().getTime()));
	}
}

function lagRun(){

	isLagRunning = true;

	let nowTime = new Date().getTime();

	let obj = lagList.shift();

	obj.dele();

	while(lagList.length > 0){

		obj = lagList[0];

		let gap = obj.runTime - nowTime;

		if(gap <= 0){

			lagList.shift();

			obj.dele();
		}
		else{

			setTimeout(lagRun, gap);

			break;
		}
	}

	isLagRunning = false;
}