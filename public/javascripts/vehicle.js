// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// The "Vehicle" class

var mutationRate = 0.015;

function mutate(val, upperBound, lowerBound) {
   if (random() < 0.015)
      return val + random(lowerBound, upperBound);
   else
      return val;
}

function Vehicle(x, y, dna) {
   this.acceleration = createVector(0, 0);
   this.velocity = createVector(0, -2);
   this.position = createVector(x, y);
   this.r = 5;
   this.maxspeed = 8;
   this.maxforce = 0.6;
   this.health = 1;

   this.dna = []
   if (!dna) {
      // initialize DNA with attraction towards poison and food
      this.dna[0] = random(-3, 3); // food attraction
      this.dna[1] = random(-3, 3); // poison attraction
      this.dna[2] = random(0, 100);
      this.dna[3] = random(0, 100);
   } else {
      this.dna[0] = mutate(dna[0], 1.4, -1.4);
      this.dna[1] = mutate(dna[1], 1.4, -1.4);
      this.dna[2] = mutate(dna[2], 12, -12);
      this.dna[3] = mutate(dna[3], 12, -12);
   }
   // Method to update location
   this.update = function() {
      this.health -= 0.007;
      // Update velocity
      this.velocity.add(this.acceleration);
      // Limit speed
      this.velocity.limit(this.maxspeed);
      this.position.add(this.velocity);
      // Reset accelerationelertion to 0 each cycle
      this.acceleration.mult(0);
   };

   this.applyForce = function(force) {
      // We could add mass here if we want A = F / M
      this.acceleration.add(force);
   };

   this.behaviors = function(good, bad) {
      var steerG = this.eat(good, 0.22, this.dna[2]);
      var steerB = this.eat(bad, -0.75, this.dna[3]);

      steerG.mult(this.dna[0]);
      steerB.mult(this.dna[1]);

      this.applyForce(steerB);
      this.applyForce(steerG);
   }

   this.dead = function() {
      return (this.health < 0);
   }

   this.eat = function(list, nutrition, perception) {
      var bestD = Infinity;
      var bestV = null;
      for (var i = list.length - 1; i >= 0; i--) {
         var d = this.position.dist(list[i]);

         if (d < this.maxspeed) {
            this.health += nutrition;
            list.splice(i, 1);
         } else if (d < bestD && d < perception) {
            bestD = d;
            bestV = list[i];
         }
      }

      if (bestV != null) {
         return this.seek(bestV);
      }
      return createVector(0, 0);
   }

   // A method that calculates a steering force towards a target
   // STEER = DESIRED MINUS VELOCITY
   this.seek = function(target) {

      var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

      // Scale to maximum speed
      desired.setMag(this.maxspeed);

      // Steering = Desired minus velocity
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce); // Limit to maximum steering force

      return steer;
   };

   this.clone = function() {
      if (random() < 0.005) {
         return new Vehicle(this.position.x, this.position.y, this.dna);
      } else {
         return null;
      }
   }

   this.boundaries = function() {
      var d = 25;
      var desired = null;

      if (this.position.x < d) {
         desired = createVector(this.maxspeed, this.velocity.y);
      } else if (this.position.x > width - d) {
         desired = createVector(-this.maxspeed, this.velocity.y);
      }

      if (this.position.y < d) {
         desired = createVector(this.velocity.x, this.maxspeed);
      } else if (this.position.y > height - d) {
         desired = createVector(this.velocity.x, -this.maxspeed);
      }

      if (desired !== null) {
         desired.normalize();
         desired.mult(this.maxspeed);
         var steer = p5.Vector.sub(desired, this.velocity);
         steer.limit(this.maxforce);
         this.applyForce(steer);
      }
   }

   this.display = function() {
      // Draw a triangle rotated in the direction of velocity
      var theta = this.velocity.heading() + PI / 2;
      fill(127);
      stroke(200);
      strokeWeight(1);
      push();
      translate(this.position.x, this.position.y);
      rotate(theta);
      if (debug) {
         // attraction towards red (bad) and green (good)
         noFill();
         stroke(0, 255, 0);
         line(0, 0, 0, -this.dna[0] * 20);
         ellipse(0, 0, this.dna[2] * 2);
         stroke(255, 0, 0);
         line(0, 0, 0, -this.dna[1] * 20);
         ellipse(0, 0, this.dna[3] * 2);
      }
      var rd = color(255, 0, 0);
      var gn = color(0, 255, 0);
      var col = lerpColor(rd, gn, this.health);

      fill(col);
      stroke(20);
      strokeWeight(1);
      beginShape();
      vertex(0, -this.r * 2);
      vertex(-this.r, this.r * 2);
      vertex(this.r, this.r * 2);
      endShape(CLOSE);
      pop();
   };
}
