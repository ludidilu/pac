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

	battle.heroArr = {};
	
	//server data
	battle.joinArr = [];

	//server data
	battle.commandArr = {};

	battle.mapWidth = 0;

	battle.mapHeight = 0;

	battle.mapScale = 0;

	battle.mapUnitWidth = 0;

	battle.obstacle = {};

	battle.speed = 1;

	battle.refreshData = null;

	battle.init = function (mapWidth, mapHeight, mapScale, obstacle, speed){

		this.mapWidth = mapWidth;

		this.mapHeight = mapHeight;

		this.mapScale = mapScale;

		this.mapUnitWidth = this.mapScale * 2 + 1;

		this.obstacle = obstacle;

		this.speed = speed;
	}

	battle.join = function(id){

		this.joinArr.push(id);

		return this.getRefreshData();
	}

	battle.command = function(id, dir){

		if(this.heroArr[id] && this.heroArr[id].dir != dir){

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

			var bx = parseInt(this.x / this.mapUnitWidth);

			var lx = this.x % this.mapUnitWidth;

			var by = parseInt(hero.y / this.mapUnitWidth);

			var ly = hero.y % this.mapUnitWidth;

			var id = by * this.mapWidth + bx;

			var moveSpeed = this.speed;

			if(hero.dir == 1){

				if(by == 0 || obstacle[id - this.mapWidth]){

					if(ly - moveSpeed < this.mapScale){

						hero.y = by * this.mapUnitWidth + this.mapScale;
					}
					else{

						hero.y -= moveSpeed;
					}
				}
				else{

					if(lx == this.mapScale){

						hero.y -= moveSpeed;
					}
					else{

						if(lx < this.mapScale){

							if(this.mapScale - lx > moveSpeed){

								hero.x += moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (this.mapScale - lx);

								hero.x = bx * this.mapUnitWidth + this.mapScale;

								hero.y -= moveDis;
							}
						}
						else{

							if(lx - this.mapScale > moveSpeed){

								hero.x -= moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (lx - this.mapScale);

								hero.x = bx * this.mapUnitWidth + this.mapScale;

								hero.y -= moveDis;
							}
						}
					}
				}
			}
			else if(hero.dir == 2){

				if(by == this.mapHeight - 1 || obstacle[id + this.mapWidth]){

					if(ly + moveSpeed > this.mapScale){

						hero.y = by * this.mapUnitWidth + this.mapScale;
					}
					else{

						hero.y += moveSpeed;
					}
				}
				else{

					if(lx == this.mapScale){

						hero.y += moveSpeed;
					}
					else{

						if(lx < this.mapScale){

							if(this.mapScale - lx > moveSpeed){

								hero.x += moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (this.mapScale - lx);

								hero.x = bx * this.mapUnitWidth + this.mapScale;

								hero.y += moveDis;
							}
						}
						else{

							if(lx - this.mapScale > moveSpeed){

								hero.x -= moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (lx - this.mapScale);

								hero.x = bx * this.mapUnitWidth + this.mapScale;

								hero.y += moveDis;
							}
						}
					}
				}
			}
			else if(hero.dir == 3){

				if(bx == 0 || obstacle[id - 1]){

					if(lx - moveSpeed < this.mapScale){

						hero.x = bx * this.mapUnitWidth + this.mapScale;
					}
					else{

						hero.x -= moveSpeed;
					}
				}
				else{

					if(ly == this.mapScale){

						hero.x -= moveSpeed;
					}
					else{

						if(ly < this.mapScale){

							if(this.mapScale - ly > moveSpeed){

								hero.y += moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (this.mapScale - ly);

								hero.y = by * this.mapUnitWidth + this.mapScale;

								hero.x -= moveDis;
							}
						}
						else{

							if(ly - this.mapScale > moveSpeed){

								hero.y -= moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (ly - this.mapScale);

								hero.y = by * this.mapUnitWidth + this.mapScale;

								hero.x -= moveDis;
							}
						}
					}
				}
			}
			else if(hero.dir == 4){

				if(bx == this.mapWidth - 1 || obstacle[id + 1]){

					if(lx + moveSpeed < this.mapScale){

						hero.x = bx * this.mapUnitWidth + this.mapScale;
					}
					else{

						hero.x += moveSpeed;
					}
				}
				else{

					if(ly == this.mapScale){

						hero.x += moveSpeed;
					}
					else{

						if(ly < this.mapScale){

							if(this.mapScale - ly > moveSpeed){

								hero.y += moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (this.mapScale - ly);

								hero.y = by * this.mapUnitWidth + this.mapScale;

								hero.x -= moveDis;
							}
						}
						else{

							if(ly - this.mapScale > moveSpeed){

								hero.y += moveSpeed;
							}
							else{

								var moveDis = moveSpeed - (ly - this.mapScale);

								hero.y = by * this.mapUnitWidth + this.mapScale;

								hero.x += moveDis;
							}
						}
					}
				}
			}
		}
	}

	battle.getRefreshData = function(){

		if(this.refreshData == null){

			this.refreshData = {};

			this.refreshData.heroArr = this.heroArr;

			this.refreshData.mapWidth = this.mapWidth;

			this.refreshData.mapHeight = this.mapHeight;

			this.refreshData.mapScale = this.mapScale;

			this.refreshData.obstacle = this.obstacle;

			this.refreshData.speed = this.speed;
		}

		return this.refreshData;
	}

	battle.setRefreshData = function(data){

		this.heroArr = data.heroArr;

		this.mapWidth = data.mapWidth;
		
		this.mapHeight = data.mapHeight;

		this.mapScale = data.mapScale;

		this.mapUnitWidth = this.mapScale * 2 + 1;

		this.obstacle = data.obstacle;

		this.speed = data.speed;
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

