function fun () {

	return getBattle();
}

function getHero(id, moveSpeed, x, y){

	let hero = {};

	hero.id = id;

	hero.moveSpeed = moveSpeed;

	hero.dir = 0;

	hero.x = x;

	hero.y = y;

	return hero;
}

function getBattle(){

	let battle = {};

	battle.heroArr = {};

	battle.heroList = [];
	
	//server data
	battle.joinArr = [];

	//server data
	battle.commandArr = {};

	battle.mapScale = 0;

	battle.mapUnitWidth = 0;

	battle.heroDefaultMoveSpeed = 30;

	battle.obstacle = {};

	battle.deltaTime = 0;

	battle.refreshData = null;

	battle.init = function (mapScale, obstacle, deltaTime){

		this.mapScale = mapScale;

		this.mapUnitWidth = this.mapScale * 2 + 1;

		this.obstacle = obstacle;

		this.deltaTime = deltaTime;
	}

	battle.join = function(id){

		let bx = Math.floor(Math.random() * this.obstacle.mapWidth);

		let by = Math.floor(Math.random() * this.obstacle.mapHeight);

		let x = bx * this.mapUnitWidth + this.mapScale;

		let y = by * this.mapUnitWidth + this.mapScale;

		let hero = getHero(id, this.heroDefaultMoveSpeed, x, y);

		this.joinArr.push(hero);

		return this.getRefreshData();
	}

	battle.command = function(id, dir){

		if(this.heroArr[id] && this.heroArr[id].dir != dir){

			this.commandArr[id] = dir;
		}
	}

	battle.serverUpdate = function(){

		let result = this.getRoundData();

		for(let i = 0 ; i < this.joinArr.length ; i++){

			let hero = this.joinArr[i];

			if(!this.heroArr[hero.id]){

				this.heroArr[hero.id] = hero;

				this.heroList.push(hero);
			}
		}

		this.joinArr = [];

		for(let id in this.commandArr){

			this.heroArr[id].dir = this.commandArr[id];
		}

		this.commandArr = {};

		this.update();

		this.refreshData = null;

		return result;
	}

	battle.checkHit = function(){

		let result = [];

		for(let i = 0 ; i < this.heroList.length ; i++){

			let hero0 = this.heroList[i];

			for(let m = i + 1 ; m < this.heroList.length ; m++){

				let hero1 = this.heroList[m];

				if(Math.abs(hero0.x - hero1.x) < this.mapUnitWidth && Math.abs(hero0.y - hero1.y) < this.mapUnitWidth){

					result.push([hero0.id, hero1.id]);

					console.log("hit!!!");
				}
			}
		}

		return result;
	}

	battle.clientUpdate = function(data){

		for(let i = 0 ; i < data.joinArr.length ; i++){

			let hero = data.joinArr[i];

			this.heroArr[hero.id] = hero;
		}

		for(let id in data.commandArr){

			this.heroArr[id].dir = data.commandArr[id];
		}

		this.update();
	}
	
	battle.update = function(){

		for(let id in this.heroArr){

			let hero = this.heroArr[id];

			if(hero.dir != 0){

				let result = this.getHeroPos(hero.x, hero.y, hero.dir, hero.moveSpeed * this.deltaTime);

				hero.x = result[result.length - 1].x;

				hero.y = result[result.length - 1].y;
			}
		}
	}

	battle.getHeroPos = function(heroX, heroY, heroDir, moveDistance){

		let bx = Math.floor(heroX / this.mapUnitWidth);

		let lx = heroX % this.mapUnitWidth;

		let by = Math.floor(heroY / this.mapUnitWidth);

		let ly = heroY % this.mapUnitWidth;

		let id = by * this.obstacle.mapWidth + bx;

		let x = heroX;

		let y = heroY;

		let result = [];

		if(heroDir == 1){

			if(by == 0 || (this.obstacle.v && this.obstacle.v[id - this.obstacle.mapWidth])){

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

							let moveDis = moveDistance - (this.mapScale - lx);

							x = bx * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							y -= moveDis;
						}
					}
					else{

						if(lx - this.mapScale > moveDistance){

							x -= moveDistance;
						}
						else{

							let moveDis = moveDistance - (lx - this.mapScale);

							x = bx * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							y -= moveDis;
						}
					}
				}
			}
		}
		else if(heroDir == 2){

			if(by == this.obstacle.mapHeight - 1 || (this.obstacle.v && this.obstacle.v[id])){

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

							let moveDis = moveDistance - (this.mapScale - lx);

							x = bx * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							y += moveDis;
						}
					}
					else{

						if(lx - this.mapScale > moveDistance){

							x -= moveDistance;
						}
						else{

							let moveDis = moveDistance - (lx - this.mapScale);

							x = bx * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							y += moveDis;
						}
					}
				}
			}
		}
		else if(heroDir == 3){

			if(bx == 0 || (this.obstacle.h && this.obstacle.h[id - 1])){

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

							let moveDis = moveDistance - (this.mapScale - ly);

							y = by * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							x -= moveDis;
						}
					}
					else{

						if(ly - this.mapScale > moveDistance){

							y -= moveDistance;
						}
						else{

							let moveDis = moveDistance - (ly - this.mapScale);

							y = by * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							x -= moveDis;
						}
					}
				}
			}
		}
		else if(heroDir == 4){

			if(bx == this.obstacle.mapWidth - 1 || (this.obstacle.h && this.obstacle.h[id])){

				if(lx + moveDistance > this.mapScale){

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

							let moveDis = moveDistance - (this.mapScale - ly);

							y = by * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							x += moveDis;
						}
					}
					else{

						if(ly - this.mapScale > moveDistance){

							y -= moveDistance;
						}
						else{

							let moveDis = moveDistance - (ly - this.mapScale);

							y = by * this.mapUnitWidth + this.mapScale;

							result.push({x:x,y:y});

							x += moveDis;
						}
					}
				}
			}
		}

		result.push({x:x,y:y});

		return result;
	}

	battle.getRefreshData = function(){

		if(this.refreshData == null){

			this.refreshData = {};

			this.refreshData.heroArr = this.heroArr;

			this.refreshData.mapScale = this.mapScale;

			this.refreshData.obstacle = this.obstacle;

			this.refreshData.deltaTime = this.deltaTime;
		}

		return this.refreshData;
	}

	battle.setRefreshData = function(data){

		this.heroArr = data.heroArr;

		this.mapScale = data.mapScale;

		this.mapUnitWidth = this.mapScale * 2 + 1;

		this.obstacle = data.obstacle;

		this.deltaTime = data.deltaTime;
	}

	battle.getRoundData = function(){

		let result = {};

		result.joinArr = this.joinArr;

		result.commandArr = this.commandArr;

		result.hitArr = this.checkHit();

		return result;
	}

	battle.getVector2 = function(){

		return {x:0,y:0};
	}

	return battle;
}














try{

	module.exports = fun;
}
catch(e){


}

