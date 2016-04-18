// main.js
// Dependencies: 
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

/*
 .main is an object literal that is a property of the app global
 This object literal has its own properties and methods (functions)
 
 */
app.main = {
	//  properties
    WIDTH : 640,
    HEIGHT: 480,
    canvas: undefined,
    ctx: undefined,
   	lastTime: 0, // used by calculateDeltaTime() 
    debug: false,
    paused: false,
    animationID: 0,
    gameState : undefined,
    roundScore : 0,
    totalScore : 0,
    sound : undefined, //required - loaded by main.js
    currentLevel : 0,
    doneCircles : 0,

    bgAudio : undefined,
    effectAudio : undefined,
    currentEffect : 0,
    currentDirection : 1,
    effectSounds : ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3", "6.mp3", "7.mp3", "8.mp3"],
    targetNums : [1, 2, 3, 5, 7, 10, 15, 21, 27, 33, 44, 55],

    //properties
    CIRCLE : Object.freeze({
    	NUM_CIRCLES_START : 5,
    	NUM_CIRCLES_END : 20,
    	START_RADIUS : 8,
    	MAX_RADIUS : 45,
    	MIN_RADIUS : 2,
    	MAX_LIFETIME : 2.5,
    	MAX_SPEED : 80,
    	EXPLOSION_SPEED : 60,
    	IMPLOSION_SPEED : 86

    }),

    CIRCLE_STATE : Object.freeze({ //fake enumeration, actually an object literal
    	NORMAL : 0,
    	EXPLODING : 1,
    	MAX_SIZE : 2,
    	IMPLODING : 3,
    	DONE : 4
    }),

    GAME_STATE : Object.freeze({ //another fake enumeration
    	BEGIN : 0,
    	DEFAULT : 1,
    	EXPLODING : 2,
    	ROUND_OVER : 3,
    	REPEAT_LEVEL : 4,
    	END : 5
    }),

    //original 8 fluorescent crayons: https://en.wikipedia.org/List_of_Crayola_crayon_colors#Fluorescent_crayons
    //"Ultra Red", "Ultra Orange", "Ultra Yellow", "Chartreuse", "Ultra Green", "Ultra Blue", "Ultra Pink", "Hot Magenta"
    colors: ["#FD5B78", "#FF6037", "#FFFF66", "#66FF66", "#50BFE6", "#FF6EFF", "#EE34D2"],

    // methods
	init : function() {
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');

		this.numCircles = this.CIRCLE.NUM_CIRCLES_START;
		this.circles = this.makeCircles(this.numCircles);
		console.log("this.circles = " + this.circles);

		this.gameState = this.GAME_STATE.BEGIN;

		//hook up events
		this.canvas.onmousedown = this.doMousedown.bind(this);

		//load level
		this.reset();
		
		// start the game loop
		this.update();
	},

	//creates a new level of circles
	reset : function(){
		
		this.roundScore = 0;
		this.doneCircles = 0;
		this.circles = this.makeCircles(this.numCircles);
	},
	
	update: function(){
	 	// 1) PAUSED?
	 	// if so, bail out of loop
	 	if(this.paused){
	 		this.drawPauseScreen(this.ctx);
	 		return;
	 	}

		// 2) LOOP	
		// schedule a call to update()
	 	this.animationID = requestAnimationFrame(this.update.bind(this));
	 	
	 	// 3) HOW MUCH TIME HAS GONE BY?
	 	var dt = this.calculateDeltaTime();
	 	 
	 	// 4) UPDATE
	 	//move circles
	 	this.moveCircles(dt);

	 	//CHECK FOR COLLISIONS
	 	this.checkForCollisions();

		// 5) DRAW	
		// i) draw background
		this.ctx.fillStyle = "black"; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
	
		// ii) draw circles
		this.ctx.globalAlpha = 0.9;
		this.drawCircles(this.ctx);

		// iii) draw HUD
		this.ctx.globalAlpha = 1.0;
		this.drawHUD(this.ctx);
		
		// iv) draw debug info
		if (this.debug){
			// draw dt in bottom right corner
			this.fillText(this.ctx, "dt: " + dt.toFixed(3), this.WIDTH - 150, this.HEIGHT - 10, "18pt courier", "white");
		}

		//6) CHECK FOR CHEATS
		//if we are on the start screen or a round over screen
		if(this.gameState == this.GAME_STATE.BEGIN || this.gameState == this.GAME_STATE.ROUND_OVER){
			//if the shift key and up arrow are both down (true)
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_UP] && myKeys.keydown[myKeys.KEYBOARD.KEY_SHIFT]){
				this.totalScore++;
				this.sound.playEffect();
			}
		}
		
	},
	
	fillText: function(ctx, string, x, y, css, color) {
		ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		ctx.font = css;
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);
		ctx.restore();
	},
	
	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},

	makeCircles : function(num){
		var array = [];

		//a function that we will soon use as a "method"
		var circleDraw = function(ctx){
			//drwa circle
			ctx.save();
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.fillStyle;
			ctx.fill();
			ctx.restore();
		};

		//a function that we will soon use as a "method"
		var circleMove = function(dt){
			this.x += this.xSpeed*this.speed*dt;
			this.y += this.ySpeed*this.speed*dt;
		};

		// debugger;
		for(var i=0; i<num; i++){
			//make a new object literal
			var c = {};

			//add .x and .y properties
			//.x and .y are somewhere on the canvas, with a minimum margin of START_RADIUS
			//getRandom() is from utilities.js
			c.x = getRandom(this.CIRCLE.START_RADIUS*2, this.WIDTH - this.CIRCLE.START_RADIUS*2);
			c.y = getRandom(this.CIRCLE.START_RADIUS*2, this.HEIGHT - this.CIRCLE.START_RADIUS*2);

			//ad a radius property
			c.radius = this.CIRCLE.START_RADIUS;

			//getRandomUnitVector() is from utilities.js
			var randomVector = getRandomUnitVector();
			c.xSpeed = randomVector.x;
			c.ySpeed = randomVector.y;

			//make more properties
			c.speed = this.CIRCLE.MAX_SPEED;
			c.fillStyle = this.colors[i%this.colors.length];
			c.state = this.CIRCLE_STATE.NORMAL;
			c.lifetime = 0;

			c.draw = circleDraw;
			c.move = circleMove;

			//no more properties can be added!
			Object.seal(c);
			array.push(c);
		}
		return array;
	},

	drawCircles : function(ctx){
		if(this.gameState == this.GAME_STATE.REPEAT_LEVEL || this.gameState == this.GAME_STATE.ROUND_OVER || this.gameState == this.GAME_STATE.END) this.ctx.globalAlpha = 0.25;
		for(var i=0; i<this.circles.length; i++){
			var c = this.circles[i];
			if(c.state === this.CIRCLE_STATE.DONE) continue;
			c.draw(ctx);
		}
	},

	// Part III #2B
	moveCircles: function(dt){
		for(var i=0;i<this.circles.length; i++){
			var c = this.circles[i];
			if(c.state === this.CIRCLE_STATE.DONE) continue;
			if(c.state === this.CIRCLE_STATE.EXPLODING){
				c.radius += this.CIRCLE.EXPLOSION_SPEED  * dt;
				if (c.radius >= this.CIRCLE.MAX_RADIUS){
					c.state = this.CIRCLE_STATE.MAX_SIZE;
					console.log("circle #" + i + " hit CIRCLE.MAX_RADIUS");
				}
				continue;
			}
		
			if(c.state === this.CIRCLE_STATE.MAX_SIZE){
				c.lifetime += dt; // lifetime is in seconds
				if (c.lifetime >= this.CIRCLE.MAX_LIFETIME){
					c.state = this.CIRCLE_STATE.IMPLODING;
					console.log("circle #" + i + " hit CIRCLE.MAX_LIFETIME");
				}
				continue;
			}
				
			if(c.state === this.CIRCLE_STATE.IMPLODING){
				c.radius -= this.CIRCLE.IMPLOSION_SPEED * dt;
				if (c.radius <= this.CIRCLE.MIN_RADIUS){
					console.log("circle #" + i + " hit CIRCLE.MIN_RADIUS and is gone");
					c.state = this.CIRCLE_STATE.DONE;
					this.doneCircles++;
					continue;
				}
			
			}
		
			// move circles
			c.move(dt);
		
			// did circles leave screen?
			if(this.circleHitLeftRight(c)){
				c.xSpeed *= -1;	
				c.move(dt); //an extra move
			} 
 			if(this.circleHitTopBottom(c)){
 				c.ySpeed *= -1;
 				c.move(dt); //an extra move
 			} 
	
		} // end for loop
	},

	circleHitLeftRight: function (c){
		if(c.x<c.radius || c.x>this.WIDTH - c.radius){
			return true;
		}
	},

	circleHitTopBottom: function (c){
		if(c.y<c.radius || c.y>this.HEIGHT-c.radius){
			return true;
		}
	},

	drawPauseScreen : function(ctx){
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		this.fillText(this.ctx, "... PAUSED ...", this.WIDTH/2, this.HEIGHT/2, "40pt courier", "white");
		ctx.restore();
	},

	doMousedown : function(e){
		this.sound.playBGAudio();
		//unpause on a click
		//just to make sure we never get stuck in a paused state
		if(this.paused){
			this.paused = false;
			this.update();
			return;
		};

		//you can only click one circle
		if(this.gameState == this.GAME_STATE.EXPLODING) return;

		//if the round is over, reset and add 5 more circles
		if(this.gameState == this.GAME_STATE.ROUND_OVER){
			this.gameState = this.GAME_STATE.DEFAULT;
			this.totalScore += this.roundScore;

			this.numCircles += 5;
			this.currentLevel++;
			this.reset();
			return;
		}

		if(this.gameState == this.GAME_STATE.REPEAT_LEVEL){
			this.gameState = this.GAME_STATE.DEFAULT;
			this.reset();
		}

		//if game is over, restart the game
		if(this.gameState == this.GAME_STATE.END){
			this.gameState = this.GAME_STATE.BEGIN;
			var highScore = window.localStorage.getItem("highScore");
			if(highScore == null) window.localStorage.setItem("highScore", this.totalScore);
			else if(this.totalScore > highScore) window.localStorage.setItem("highScore", this.totalScore);
			this.totalScore = 0;
			this.numCircles = 5;
			this.currentLevel = 0;
			this.reset();
			return;
		}

		var mouse = getMouse(e);
		//have to call through app.main because this = canvas
		//can you come up with a better way?
		// this.checkCircleClicked.bind(app.main, mouse);
		this.checkCircleClicked(mouse);
	},

	checkCircleClicked : function(mouse){
		//looping through circle array backwards, why?
		for(var i=this.circles.length-1; i>=0; i--){
			var c = this.circles[i];
			if (pointInsideCircle(mouse.x, mouse.y, c)){
				c.xSpeed = c.ySpeed = 0;
				this.sound.playEffect();
				c.state = this.CIRCLE_STATE.EXPLODING;
				this.gameState = this.GAME_STATE.EXPLODING;
				this.roundScore++;
				break; //we want to click only one circle
			}
		}
	},

	checkForCollisions : function(){
		if(this.gameState == this.GAME_STATE.EXPLODING){
			// check for collisions between circles
			for(var i=0;i<this.circles.length; i++){
				var c1 = this.circles[i];
				// only check for collisions if c1 is exploding
				if (c1.state === this.CIRCLE_STATE.NORMAL) continue;   
				if (c1.state === this.CIRCLE_STATE.DONE) continue;
				for(var j=0;j<this.circles.length; j++){
					var c2 = this.circles[j];
				// don't check for collisions if c2 is the same circle
					if (c1 === c2) continue; 
				// don't check for collisions if c2 is already exploding 
					if (c2.state != this.CIRCLE_STATE.NORMAL ) continue;  
					if (c2.state === this.CIRCLE_STATE.DONE) continue;
				
					// Now you finally can check for a collision
					if(circlesIntersect(c1,c2) ){
						this.sound.playEffect();
						c2.state = this.CIRCLE_STATE.EXPLODING;
						c2.xSpeed = c2.ySpeed = 0;
						this.roundScore ++;
					}
				}
			} // end for
			
			// round over?
			var isOver = true;
			for(var i=0;i<this.circles.length; i++){
				var c = this.circles[i];
				if(c.state != this.CIRCLE_STATE.NORMAL && c.state != this.CIRCLE_STATE.DONE){
				 isOver = false;
				 break;
				}
			} // end for

			if(isOver){
				this.stopBGAudio();
				if(this.doneCircles < this.targetNums[this.currentLevel]) this.gameState = this.GAME_STATE.REPEAT_LEVEL;
				else{
					this.gameState = this.GAME_STATE.ROUND_OVER;
					var highScore = window.localStorage.getItem("highScore");
					if(highScore == null) window.localStorage.setItem("highScore", this.totalScore);
					else if(this.totalScore + this.roundScore > highScore) window.localStorage.setItem("highScore", this.totalScore + this.roundScore);

					if(this.currentLevel >= this.targetNums.length-1){
						this.gameState = this.GAME_STATE.END;
					}
				}
			 }
			
		} // end if GAME_STATE_EXPLODING
	},

	drawHUD : function(ctx){
		ctx.save(); // NEW
		// draw score
      	// fillText(string, x, y, css, color)
		this.fillText(this.ctx, "This Round: " + this.roundScore + "/" + this.targetNums[this.currentLevel] + " of " + this.numCircles, 20, 20, "14pt courier", "#ddd");
		this.fillText(this.ctx, "Total Score: " + this.totalScore, this.WIDTH - 200, 20, "14pt courier", "#ddd");

		// NEW
		if(this.gameState == this.GAME_STATE.BEGIN){
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			this.fillText(this.ctx, "To begin, click a circle", this.WIDTH/2, this.HEIGHT/2, "30pt courier", "white");
			var highScore = window.localStorage.getItem("highScore");
			if(highScore == null) highScore = 0;
			this.fillText(this.ctx, "High Score: " + highScore, this.WIDTH/2 , this.HEIGHT/2 + 35, "20pt courier", "#ddd");
		} // end if

		if(this.gameState == this.GAME_STATE.REPEAT_LEVEL){
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			this.fillText(this.ctx, "You missed the goal of " + this.targetNums[this.currentLevel] + " circles", this.WIDTH/2, this.HEIGHT/2 - 40, "20pt courier", "white");
			this.fillText(this.ctx, "Click to try again", this.WIDTH/2, this.HEIGHT/2, "20pt courier", "red");
			this.fillText(this.ctx, "Goal: " + this.targetNums[this.currentLevel] + " of " + this.numCircles + " circles", this.WIDTH/2 , this.HEIGHT/2 + 35, "20pt courier", "#ddd");
		}
	
		// NEW
		if(this.gameState == this.GAME_STATE.ROUND_OVER){
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			this.fillText(this.ctx, "Round Over", this.WIDTH/2, this.HEIGHT/2 - 40, "30pt courier", "red");
			this.fillText(this.ctx, "Click to continue", this.WIDTH/2, this.HEIGHT/2, "30pt courier", "red");
			this.fillText(this.ctx, "Goal next round: " + this.targetNums[this.currentLevel+1] + " of " + (this.numCircles + 5) + " circles", this.WIDTH/2 , this.HEIGHT/2 + 35, "20pt courier", "#ddd");
		} // end if

		if(this.gameState == this.GAME_STATE.END){
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			this.fillText(this.ctx, "Game Over", this.WIDTH/2, this.HEIGHT/2 - 40, "30pt courier", "white");
			this.fillText(this.ctx, "Your final score was "+this.totalScore + this.roundScore, this.WIDTH/2, this.HEIGHT/2, "20pt courier", "red");
			this.fillText(this.ctx, "Click to play again", this.WIDTH/2 , this.HEIGHT/2 + 35, "20pt courier", "#ddd");
		}
		
		ctx.restore(); // NEW
	},

	pauseGame : function(){
		this.paused = true;

		//stop the animation loop
		cancelAnimationFrame(this.animationID);

		this.stopBGAudio();

		//call update() once so that our paused screen gets drawn
		this.update();
	},

	resumeGame : function(){
		//stop the animation loop, just in case it's running
		cancelAnimationFrame(this.animationID);

		this.paused = false;

		this.sound.playBGAudio();

		//restart the loop
		this.update();
	}, 

	stopBGAudio : function(){
		// this.bgAudio.pause();
		// this.bgAudio.currentTime = 0;
		this.sound.stopBGAudio();
	},

	toggleDebug : function(){
		this.debug = !this.debug;
	}
    
}; // end app.main