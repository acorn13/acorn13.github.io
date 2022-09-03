function Vehicle(x,y){
	this.pos = createVector(random(width),random(height));
	this.target = createVector(x,y);
	this.vel = createVector();
	this.acc = createVector();
	this.maxspeed = 10;
	this.maxforce = 1;

}

Vehicle.prototype.behaviours = function(){
	var arrive = this.arrive(this.target);

	var mouse = createVector(mouseX, mouseY);
	var flee = this.flee(mouse);

	arrive.mult(1);
	flee.mult(5);

	this.applyForce(arrive);
	this.applyForce(flee);
}

Vehicle.prototype.applyForce = function(f){
	this.acc.add(f);
}

Vehicle.prototype.update = function(){
	this.pos.add(this.vel);
	this.pos.x = constrain(this.pos.x, r, width-r);
	this.pos.y = constrain(this.pos.y, r, height-r);
	this.vel.add(this.acc);
	this.acc.mult(0);
}

Vehicle.prototype.show = function(){
	if(rainbow){
		colorMode(HSB, width, width, width);
		stroke(this.pos.x, width, width);
	} else {
		stroke(255);
	}
	strokeWeight(r);
	point(this.pos.x, this.pos.y);
}

Vehicle.prototype.arrive = function(target){
	var desired = p5.Vector.sub(target, this.pos);
	var d = desired.mag();
	var speed = this.maxspeed;
	if(d<100){
		speed = map(d,0,100,0,this.maxspeed);
	}
	desired.setMag(speed);
	var steer = p5.Vector.sub(desired, this.vel);
	steer.limit(this.maxforce);
	return steer;
}

Vehicle.prototype.flee = function(target){
	var desired = p5.Vector.sub(target, this.pos);
	var d = desired.mag();
	if(d < 50){
		desired.setMag(this.maxspeed).mult(-1);
		var steer = p5.Vector.sub(desired, this.vel);
		steer.limit(this.maxforce);
		return steer;
	}
	return createVector(0,0);
	
}