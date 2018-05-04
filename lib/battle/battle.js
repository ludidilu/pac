function fun () {

	return getBattle();
}

function getHero(id){

	var hero = {};

	hero.id = id;

	hero.dir = 0;

	hero.x = 0;

	hero.y = 0;

	return hero;
}

function getBattle(){

	var battle = {};

	const speed = 2;

	battle.heroArr = {};

	battle.joinArr = [];

	battle.commandArr = {};

	battle.refreshData = null;

	battle.init = function (deltaTime){

		this.deltaTime = deltaTime;
	}

	battle.join = function(id){

		this.joinArr.push(id);

		if(this.refreshData == null){

			this.refreshData = this.getRefreshData();
		}

		return this.refreshData;
	}

	battle.command = function(id, dir){

		if(this.heroArr[id]){

			this.commandArr[id] = dir;
		}
	}

	battle.serverUpdate = function(){

		var result = this.getRoundData();

		for(var i = 0 ; i < this.joinArr.length ; i++){

			var id = this.joinArr[i];

			if(this.heroArr[id] == null){

				var hero = getHero(id);

				this.heroArr[id] = hero;
			}
		}

		this.joinArr = [];

		for(var id in this.commandArr){

			this.heroArr[id].dir = this.commandArr[id];
		}

		this.commandArr = {};

		this.update();

		this.refreshData = null;

		return result;
	}

	battle.clientUpdate = function(data){

		for(var i = 0 ; i < data.joinArr.length ; i++){

			var id = data.joinArr[i];

			if(this.heroArr[id] == null){

				var hero = getHero(id);

				this.heroArr[id] = hero;
			}
		}

		for(var id in data.commandArr){

			this.heroArr[id].dir = data.commandArr[id];
		}

		this.update();
	}
	
	battle.update = function(){

		for(var id in this.heroArr){

			var hero = this.heroArr[id];

			var moveSpeed = speed * this.deltaTime;

			if(hero.dir == 1){

				hero.y += moveSpeed;
			}
			else if(hero.dir == 2){

				hero.y -= moveSpeed;
			}
			else if(hero.dir == 3){

				hero.x -= moveSpeed;
			}
			else if(hero.dir == 4){

				hero.x += moveSpeed;
			}
		}
	}

	battle.getRefreshData = function(){

		return this.heroArr;
	}

	battle.setRefreshData = function(data){

		this.heroArr = data;
	}

	battle.getRoundData = function(){

		var result = {};

		result.joinArr = this.joinArr;

		result.commandArr = this.commandArr;

		return result;
	}

	return battle;
}














try{

	module.exports = fun;
}
catch(e){


}

