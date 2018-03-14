// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Seeking "vehicle" follows the mouse position

// Implements Craig Reynold's autonomous steering behaviors
// One vehicle "seeks"
// See: http://www.red3d.com/cwr/

var v;
var foods = [];
var poison = [];
var vehicles = [];
var food_percent = 0.15;

var debug = false;

function setup() {
   createCanvas(1200, 550);
   for (var i = 0; i < 10; i++) {
      vehicles.push(new Vehicle(width / 2, height / 2));
   }
   for (var i = 0; i < 50; i++) {
      var x = random(width);
      var y = random(height);
      var vec = createVector(x, y);
      foods.push(vec);
   }
   for (var i = 0; i < 10; i++) {
      var x = random(width);
      var y = random(height);
      var vec = createVector(x, y);
      poison.push(vec);
   }
}

function draw() {
   background(51);
   if (random() < food_percent) {
      foods.push(createVector(random(width), random(height)));
   }

   if (random() < 0.03) {
      poison.push(createVector(random(width), random(height)));
   }

   for (var i = 0; i < foods.length; i++) {
      noStroke();
      fill(0, 255, 0);
      ellipse(foods[i].x, foods[i].y, 8, 8);
   }
   for (var i = 0; i < poison.length; i++) {
      noStroke();
      fill(255, 0, 0);
      ellipse(poison[i].x, poison[i].y, 8, 8);
   }

   // Call the appropriate steering behaviors for our agents
   for (var i = vehicles.length - 1; i >= 0; i--) {
      vehicles[i].boundaries();
      vehicles[i].behaviors(foods, poison);
      vehicles[i].update();
      vehicles[i].display();

      var newVehicle = vehicles[i].clone();
      if (newVehicle)
         vehicles.push(newVehicle);

      if (vehicles[i].dead()) {
         var x = vehicles[i].position.x;
         var y = vehicles[i].position.y;
         foods.push(createVector(x, y));
         vehicles.splice(i, 1);
      }
   }

   if(poison.length > 130){
      poison.splice(30, 30);
   }
}

function mouseDragged() {
   vehicles.push(new Vehicle(mouseX, mouseY));
}
