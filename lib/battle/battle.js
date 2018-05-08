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

	battle.moveSpeed = 1;

	battle.refreshData = null;

	battle.init = function (mapWidth, mapHeight, mapScale, obstacle, moveSpeed){

		this.mapWidth = mapWidth;

		this.mapHeight = mapHeight;

		this.mapScale = mapScale;

		this.mapUnitWidth = this.mapScale * 2 + 1;

		this.obstacle = obstacle;

		this.moveSpeed = moveSpeed;
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

			if(hero.dir != 0){

				var result = this.getHeroPos(hero.x, hero.y, hero.dir, this.moveSpeed);

				hero.x = result.x;

				hero.y = result.y;
			}
		}
	}

	battle.getHeroPos = function(heroX, heroY, heroDir, moveDistance){

		var bx = parseInt(heroX / this.mapUnitWidth);

		var lx = heroX % this.mapUnitWidth;

		var by = parseInt(heroY / this.mapUnitWidth);

		var ly = heroY % this.mapUnitWidth;

		var id = by * this.mapWidth + bx;

		var x = heroX;

		var y = heroY;

		if(heroDir == 1){

			if(by == 0 || this.obstacle[id - this.mapWidth]){

				if(ly - moveDistance < this.mapScale){

					y = by * this.mapUnitWidth + this.mapScale;
				}
				else{

					y -= moveDistance;
				}
			}
			else{

				if(lx == this.mapScale){

					y -= moveDistance;
				}
				else{

					if(lx < this.mapScale){

						if(this.mapScale - lx > moveDistance){

							x += moveDistance;
						}
						else{

							var moveDis = moveDistance - (this.mapScale - lx);

							x = bx * this.mapUnitWidth + this.mapScale;

							y -= moveDis;
						}
					}
					else{

						if(lx - this.mapScale > moveDistance){

							x -= moveDistance;
						}
						else{

							var moveDis = moveDistance - (lx - this.mapScale);

							x = bx * this.mapUnitWidth + this.mapScale;

							y -= moveDis;
						}
					}
				}
			}
		}
		else if(heroDir == 2){

			if(by == this.mapHeight - 1 || this.obstacle[id + this.mapWidth]){

				if(ly + moveDistance > this.mapScale){

					y = by * this.mapUnitWidth + this.mapScale;
				}
				else{

					y += moveDistance;
				}
			}
			else{

				if(lx == this.mapScale){

					y += moveDistance;
				}
				else{

					if(lx < this.mapScale){

						if(this.mapScale - lx > moveDistance){

							x += moveDistance;
						}
						else{

							var moveDis = moveDistance - (this.mapScale - lx);

							x = bx * this.mapUnitWidth + this.mapScale;

							y += moveDis;
						}
					}
					else{

						if(lx - this.mapScale > moveDistance){

							x -= moveDistance;
						}
						else{

							var moveDis = moveDistance - (lx - this.mapScale);

							x = bx * this.mapUnitWidth + this.mapScale;

							y += moveDis;
						}
					}
				}
			}
		}
		else if(heroDir == 3){

			if(bx == 0 || this.obstacle[id - 1]){

				if(lx - moveDistance < this.mapScale){

					x = bx * this.mapUnitWidth + this.mapScale;
				}
				else{

					x -= moveDistance;
				}
			}
			else{

				if(ly == this.mapScale){

					x -= moveDistance;
				}
				else{

					if(ly < this.mapScale){

						if(this.mapScale - ly > moveDistance){

							y += moveDistance;
						}
						else{

							var moveDis = moveDistance - (this.mapScale - ly);

							y = by * this.mapUnitWidth + this.mapScale;

							x -= moveDis;
						}
					}
					else{

						if(ly - this.mapScale > moveDistance){

							y -= moveDistance;
						}
						else{

							var moveDis = moveDistance - (ly - this.mapScale);

							y = by * this.mapUnitWidth + this.mapScale;

							x -= moveDis;
						}
					}
				}
			}
		}
		else if(heroDir == 4){

			if(bx == this.mapWidth - 1 || this.obstacle[id + 1]){

				if(lx + moveDistance < this.mapScale){

					x = bx * this.mapUnitWidth + this.mapScale;
				}
				else{

					x += moveDistance;
				}
			}
			else{

				if(ly == this.mapScale){

					x += moveDistance;
				}
				else{

					if(ly < this.mapScale){

						if(this.mapScale - ly > moveDistance){

							y += moveDistance;
						}
						else{

							var moveDis = moveDistance - (this.mapScale - ly);

							y = by * this.mapUnitWidth + this.mapScale;

							x += moveDis;
						}
					}
					else{

						if(ly - this.mapScale > moveDistance){

							y -= moveDistance;
						}
						else{

							var moveDis = moveDistance - (ly - this.mapScale);

							y = by * this.mapUnitWidth + this.mapScale;

							x += moveDis;
						}
					}
				}
			}
		}

		return {x:x,y:y};
	}

	battle.getRefreshData = function(){

		if(this.refreshData == null){

			this.refreshData = {};

			this.refreshData.heroArr = this.heroArr;

			this.refreshData.mapWidth = this.mapWidth;

			this.refreshData.mapHeight = this.mapHeight;

			this.refreshData.mapScale = this.mapScale;

			this.refreshData.obstacle = this.obstacle;

			this.refreshData.moveSpeed = this.moveSpeed;
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

		this.moveSpeed = data.moveSpeed;
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

