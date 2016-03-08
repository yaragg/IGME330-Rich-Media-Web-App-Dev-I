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
    debug: true,

    //init circle properties
    x: 100,
    y: 100,
    radius: 40,
    radius: 40,
    xSpeed: 200, //pixels per second
    ySpeed: 160, //pixels per second
    fillStyle: "red",

    
    
    // methods
	init : function() {
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		// start the game loop
		this.update();
	},
	
	update: function(){
		// 1) LOOP
		// schedule a call to update()
	 	requestAnimationFrame(this.update.bind(this));

	 	// 2) PAUSED?
	 	// if so, bail out of loop
	 	
	 	// 3) HOW MUCH TIME HAS GONE BY?
	 	var dt = this.calculateDeltaTime();
	 	 
	 	// 4) UPDATE
	 	// move circles
	 	this.x += this.xSpeed*dt; //pixels per second * approx. 1/60
	 	this.y += this.ySpeed*dt; //pixels per second * approx. 1/60

	 	//did circle leave screen? Then bounce
	 	if(this.circleHitLeftRight(this.x, this.y, this.radius)){
	 		this.xSpeed *= -1;
	 	}

	 	if(this.circleHitTopBottom(this.x, this.y, this.radius)){
	 		this.ySpeed *= -1;
	 	}
	 	
		// 5) DRAW	
		// i) draw background
		this.ctx.fillStyle = "black"; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
	
		// ii) draw circles
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
		this.ctx.closePath();
		this.ctx.fillStyle = this.fillStyle;
		this.ctx.fill();
	
		// iii) draw HUD
		
		
		// iv) draw debug info
		if (this.debug){
			// draw dt in bottom right corner
			this.fillText("dt: " + dt.toFixed(3), this.WIDTH - 150, this.HEIGHT - 10, "18pt courier", "white");
		}
		
	},
	
	fillText: function(string, x, y, css, color) {
		this.ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		this.ctx.font = css;
		this.ctx.fillStyle = color;
		this.ctx.fillText(string, x, y);
		this.ctx.restore();
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

	circleHitLeftRight: function (x, y, radius){
		if(x<radius || x>this.WIDTH - radius){
			return true;
		}
	},

	circleHitTopBottom: function (x, y, radius){
		if(y<radius || y>this.HEIGHT-radius){
			return true;
		}
	}
	
    
    
}; // end app.main