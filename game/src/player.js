import * as THREE from 'three';
import { WeaponInstance } from './weapons.js';

export class Player {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    
    this.position = new THREE.Vector3(0, 1.7, 40);
    this.velocity = new THREE.Vector3();
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    
    this.health = 100;
    this.armor = 0;
    this.money = 800;
    
    this.weapons = [new WeaponInstance('p9')];
    this.weaponIdx = 0;
    
    this.crouching = false;
    this.spread = 0;
    this.height = 1.7;
    
    this.aabb = new THREE.Box3();
    this.updateAABB();
  }

  updateAABB() {
    this.aabb.setFromCenterAndSize(
      this.position,
      new THREE.Vector3(0.6, this.height, 0.6)
    );
  }

  update(input, dt) {
    // Rotation
    const delta = input.consumeDelta();
    this.rotation.y -= delta.x * 0.002;
    this.rotation.x -= delta.y * 0.002;
    this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
    this.camera.quaternion.setFromEuler(this.rotation);

    // Movement
    const speed = this.crouching ? 2 : 5;
    const accel = 50;
    const friction = 10;
    
    const move = new THREE.Vector3();
    if (input.isDown('KeyW')) move.z -= 1;
    if (input.isDown('KeyS')) move.z += 1;
    if (input.isDown('KeyA')) move.x -= 1;
    if (input.isDown('KeyD')) move.x += 1;
    move.normalize().applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.rotation.y, 0)));

    const targetVel = move.multiplyScalar(speed);
    // Damping and acceleration
    this.velocity.x += (targetVel.x - this.velocity.x) * friction * dt;
    this.velocity.z += (targetVel.z - this.velocity.z) * friction * dt;

    // Crouch
    this.crouching = input.isDown('ControlLeft') || input.isDown('ControlRight');
    const targetHeight = this.crouching ? 1.0 : 1.7;
    this.height += (targetHeight - this.height) * 10 * dt;

    // Collision
    const nextPos = this.position.clone().add(this.velocity.clone().multiplyScalar(dt));
    const testAABB = this.aabb.clone();
    
    // X collision
    testAABB.setFromCenterAndSize(new THREE.Vector3(nextPos.x, this.position.y, this.position.z), new THREE.Vector3(0.6, this.height, 0.6));
    if (!this.world.checkCollision(testAABB)) {
      this.position.x = nextPos.x;
    } else {
      this.velocity.x = 0;
    }

    // Z collision
    testAABB.setFromCenterAndSize(new THREE.Vector3(this.position.x, this.position.y, nextPos.z), new THREE.Vector3(0.6, this.height, 0.6));
    if (!this.world.checkCollision(testAABB)) {
      this.position.z = nextPos.z;
    } else {
      this.velocity.z = 0;
    }

    this.position.y = this.height;
    this.camera.position.copy(this.position);
    this.updateAABB();

    // Spread calculation
    const moveSpeed = new THREE.Vector3(this.velocity.x, 0, this.velocity.z).length();
    const weapon = this.weapons[this.weaponIdx];
    let targetSpread = weapon.spread;
    if (moveSpeed > 0.1) targetSpread *= 5;
    if (this.crouching) targetSpread *= 0.5;
    this.spread += (targetSpread - this.spread) * 5 * dt;
  }

  takeDamage(amount) {
    if (this.armor > 0) {
      const absorbed = amount * 0.5;
      this.armor -= absorbed;
      this.health -= (amount - absorbed);
      if (this.armor < 0) {
        this.health += this.armor;
        this.armor = 0;
      }
    } else {
      this.health -= amount;
    }
    return this.health <= 0;
  }
}
