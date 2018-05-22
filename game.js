'use strict';


// Вектор
// Позволяет контролировать расположение объектов в двумерном пространстве и управлять их размером и перемещением

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	plus(vector) {
		if(!(vector instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}

		let sumVector = new Vector();
		sumVector.x = this.x + vector.x;
		sumVector.y = this.y + vector.y;
		return sumVector;
	}
	

	times(number) {
		let multiplierVector = new Vector();
		multiplierVector.x = this.x * number;
		multiplierVector.y = this.y * number;
		return multiplierVector;
	}
}


// Движущийся объект
// Позволяет контролировать все движущиеся объекты на игровом поле и контролировать их пересечение.

class Actor {
	constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		
		this.pos = pos;
		this.size = size;
		this.speed = speed;
		
  	if(!(this.pos instanceof Vector) || !(this.size  instanceof Vector) || !(this.speed instanceof Vector)) {
  		throw new Error('Можно прибавлять к вектору только вектор типа Vector')
  	}

	}
	
	act() {}
	
	get left(){
		return this.pos.x;
	}
	get right(){
		return this.pos.x + this.size.x;
	}
	get top(){
		return this.pos.y;
	}
	get bottom(){
		return this.pos.y + this.size.y;
	}
	
	get type() {
		return "actor";
	}
	
	isIntersect(actor) {
    if(!(actor instanceof Actor) && actor !== undefined) {
    	throw new Error('Можно прибавлять к вектору только вектор типа Vector'); 
    }

    if(actor === this) {
      return false;
    }

   if((this.right > actor.left && this.left < actor.right) && (this.top < actor.bottom && this.bottom > actor.top)) {
      return true;
    }
    return false;
  }

}


function maximum(grid) {
  const gridMaxWidth = grid.map(line => line.length);
  function getMaxOfArray(gridMaxWidth) {
    return Math.max.apply(null, gridMaxWidth);
  }
  return(getMaxOfArray(gridMaxWidth));
}


// Игровое поле
// Реализует схему игрового поля конкретного уровня, контролирует все движущиеся объекты на нём и реализует логику игры.

class Level {
	constructor (grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.player = actors.filter(function(item) {return item.type === 'player'})[0]
		this.height = this.grid.length;
		this.width = (this.height > 0) ? maximum(this.grid) : 0
		this.status = null;
		this.finishDelay = 1;
	}
	
	isFinished() {
		if(this.status !== null && this.finishDelay < 0) {
			return true;
		}else {
			return false;
		}
	}
	
	actorAt(actor) {
    if(!(actor instanceof Actor) && (actor !== undefined)) {
    	throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }


    if(this.actors === undefined) {
    	return undefined;
    }else {
    	for(let i = 0; i < this.actors.length; i++){
    		if(this.actors[i].isIntersect(actor)){
    			return this.actors[i];
    		}
    	}
    }
  }

	
	obstacleAt(pos, size) {
		if(!(pos instanceof Vector && size instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}

		let scopeObj = new Actor(pos,size);

		let left = Math.floor(scopeObj.pos.x);
		let top = Math.floor(scopeObj.pos.y);
		let right = Math.ceil(scopeObj.pos.x + scopeObj.size.x);
		let bottom = Math.ceil(scopeObj.pos.y + scopeObj.size.y);

		if(scopeObj.bottom > this.height) {
			return "lava";
		}
		if((scopeObj.top < 0 ) || (scopeObj.left < 0) || (scopeObj.right > this.width)) {
			return "wall";
		}
		
		for(let i = top; i < bottom; i ++) {
			for(let j = left; j < right; j++) {
				if(this.grid[i][j] !== undefined) {
					return this.grid[i][j];
				}
			}
		}
		
	}
	
	removeActor(actor) {
		if(this.actors !== actor){
			return this.actors.splice(actor,1)
		}
	}
	
	noMoreActors(player) {
		for(let i = 0; i < this.actors.length; i++){
			if(player === this.actors[i].type){
				return false;
			}
		}
		return true;
	}

	
	playerTouched(typeOfObstacles, actor){

		if(typeOfObstacles === "lava" || typeOfObstacles === "fireball") {
			this.status = "lost";
		}
		
		if((typeOfObstacles === "coin") && (actor.type === "coin")) {
			for(let i = 0; i < this.actors.length; i++) {
				if(this.actors[i].type === "coin") {
					this.actors.splice(i,1);
				}
				this.status = "won";
			}
		}
	}
}

// Парсер уровня
// Позволяет создать игровое поле Level

class LevelParser {
	constructor(movingObject){
		this.dictionary = movingObject;
	}
	
	actorFromSymbol(token){
		if(this.dictionary === undefined) {
			return undefined;
		}else {
			return this.dictionary[token];
		}
	}
	
	obstacleFromSymbol(token){
		if(token === "x") {
			return "wall";
		}else if(token === "!"){
			return "lava";
		}else {
			return undefined;
		}
	}

	createGrid(arrayOfStrings){
		let grid = []
		for (let i = 0; i < arrayOfStrings.length; i++) {
			grid.push([])
			for (let j = 0; j < arrayOfStrings[i].length; j++) {
				let symb = arrayOfStrings[i].charAt(j);			 
				grid[i].push(this.obstacleFromSymbol(symb));			
			}			
		}
		return grid;
	}


	createActors(plan) {
		
		let actors = [];
		
		if(this.dictionary === undefined || plan.length === 0){
			return [];
		}
	
		for (let i = 0; i < plan.length; i++) {
			for (let j = 0; j < plan[i].length; j++) {	
				if ((this.actorFromSymbol(plan[i].charAt(j)) === undefined) || ((typeof this.actorFromSymbol(plan[i].charAt(j))) !== 'function')) {}
				else {
					let obj = new (this.actorFromSymbol(plan[i].charAt(j)))(new Vector(j,i));
					if (obj instanceof Actor) {
						actors.push(obj);
					}
					else continue;
				}
			}
		}
		return actors;
	}

	parse(plan){
		let playingfField = new Level(this.createGrid(plan), this.createActors(plan));
		return playingfField;
	}

}


// Шаровая молния

class Fireball extends Actor {
	constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		super();
		this.speed = speed;
		this.pos = pos;
	}
	
	get type(){
		return "fireball";
	}
	
	getNextPosition(time = 1){
		let newPosition = new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time)
		return newPosition;
	}
	
	handleObstacle() {
		if(this.speed.x > 0 || this.speed.y > 0 ) {
			this.speed.x = -this.speed.x;
			this.speed.y = -this.speed.y;
		}
	}

	act(time, grid = new Level()){
		let nextPosition = this.getNextPosition(time);
		if(!(grid.obstacleAt(nextPosition, this.size))) {
			this.pos = nextPosition;
		}else {
			try {
				if(grid.obstacleAt(nextPosition, this.size)){
					this.pos != nextPosition;
					this.handleObstacle();
				}
			}catch(err) {
				console.log(err.name, err.message);
			}
		}
	}
}

// Горизонталньая шаровая молния

class HorizontalFireball extends Fireball {
	constructor(speed = new Vector(2, 0)){
		super();
		this.speed = speed;
	}
}

// Вертикальная шаровая молния

class VerticalFireball extends Fireball {
	constructor(speed = new Vector(0, 2)) {
		super();
		this.speed = speed;
	}
}

// Огненный дождь

class FireRain extends Fireball {
	constructor(pos = new Vector()){
		super();
		this.position = pos;
		this.speed = new Vector(0,3);
		this.size = new Vector(1,1);
	}

	handleObstacle(){
		if(this.pos.x >= 0 || this.pos.y >= 0 ) {
			this.pos = this.position;
		}
	}
}

// Монета

class Coin extends Actor {
	constructor(pos = new Vector()){
		super(pos);
		this.pos = this.pos.plus(new Vector(0.2, 0.1));
		this.position = this.pos;
		this.size = new Vector(0.6, 0.6);
		this.springSpeed = 8; // Скорость подпрыгивания
		this.springDist = 0.07; // Радиус подпрыгивания
		this.spring = Math.random() * 2 * Math.PI; // Фаза подпрыгивания
	}
	
	get type(){
		return "coin";
	}
	
	updateSpring(time = 1){
		this.spring = this.spring + this.springSpeed * time;
	}
	
	getSpringVector(){
		let springVector = new Vector(0, Math.sin(this.spring) * this.springDist)
		return springVector;
	}
	
	getNextPosition(time = 1){
		this.updateSpring(time);
		
		let newPosition = new Vector(this.position.x + this.getSpringVector().x, this.position.y + this.getSpringVector().y);
		return newPosition;
	}

	act(time){
		this.pos = this.getNextPosition(time);
	}
}

// Игрок

class Player extends Actor {
	constructor(pos = new Vector()) {
		super();
		this.pos = new Vector(pos.x, pos.y - 0.5);
		this.size = new Vector(0.8, 1.5);
		this.speed = new Vector(0, 0);
	}
	
	get type(){
		return "player";
	}


}




