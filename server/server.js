var io = require('socket.io')();

io.on('connection', connection);

io.listen(1999);

var messageTag = ["join","command","refresh","getLag"];

var fun = require("../lib/battle/battle");

const deltaTime = 20;

setInterval(update, deltaTime);

var battle = fun();

battle.init(16,16,50,{h:{1:1},v:{3:1}},3);

var player = [];

var startTime = new Date().getTime();

var lagTest = true;

var lagMin = 100;

var lagMax = 200;

var lagList = [];

function update(){

	var result = JSON.stringify(battle.serverUpdate());

	for(var playerID in player){

		sendData(player[playerID], "update", result);
	}
}


function connection(client){

	console.log("one user connection");

	for(var key in messageTag){

		var dele2 = function(){

			var tag = messageTag[key];

			var delegate = function(data){

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

		var runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		var dele = function(){

			getDataReal(client, tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function getDataReal(client, tag, data){

	if(tag == "join"){

		if(!client.playerID){

			var id = data;

			client.playerID = id;

			player[id] = client;

			var result = battle.join(id);

			sendData(client, "refresh", JSON.stringify(result));
		}
	}
	else if(tag == "command"){

		if(client.playerID){

			battle.command(client.playerID, parseInt(data));
		}
	}
	else if(tag == "refresh"){

		var result = battle.getRefreshData();

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
		
		var runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		var dele = function(){

			client.emit(tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function addLagTest(dele, runTime){

	lagList.push({dele:dele, runTime:runTime});

	if(lagList.length == 1){

		setTimeout(lagRun, runTime - (new Date().getTime()));
	}
}

function lagRun(){

	var nowTime = new Date().getTime();

	var obj = lagList.shift();

	obj.dele();

	while(lagList.length > 0){

		obj = lagList[0];

		var gap = obj.runTime - nowTime;

		if(gap <= 0){

			lagList.shift();

			obj.dele();
		}
		else{

			setTimeout(lagRun, gap);

			return;
		}
	}
}