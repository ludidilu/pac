var io = require('socket.io')();

io.on('connection', connection);

io.listen(1999);

var messageTag = ["join","command","refresh"];

var fun = require("../lib/battle/battle");

const deltaTime = 20;

setInterval(update, deltaTime);

var battle = fun();

battle.init(deltaTime * 0.001);

var player = [];

function update(){

	var result = JSON.stringify(battle.serverUpdate());

	for(var playerID in player){

		player[playerID].emit("update", result);
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

	if(tag == "join"){

		if(!client.playerID){

			var id = data;

			client.playerID = id;

			player[id] = client;

			var result = battle.join(id);

			client.emit("refresh", JSON.stringify(result));
		}
	}
	else if(tag == "command"){

		if(client.playerID){

			battle.command(client.playerID, parseInt(data));
		}
	}
	else if(tag == "refresh"){

		var result = battle.getRefreshData();

		client.emit("refresh", JSON.stringify(result));
	}
}
