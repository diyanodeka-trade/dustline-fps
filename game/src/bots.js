import * as THREE from 'three';

export class Bot {
  constructor(scene, world, audio, team, index) {
    this.scene = scene;
    this.world = world;
    this.audio = audio;
    this.team = team; // 'A' or 'B'
    this.index = index;

    this.position = new THREE.Vector3(
      team === 'A' ? (index * 4 - 8) : (index * 4 - 10),
      1.0,
      team === 'A' ? 40 : -40
    );
    this.velocity = new THREE.Vector3();
    this.health = 100;
    this.armor = 50;
    this.alive = true;

    this.state = 'patrol'; // patrol, attack, plant, defuse, cover
    this.waypoints = team === 'A' ? [
      new THREE.Vector3(0, 0, 20),
      new THREE.Vector3(20, 0, 10),
      new THREE.Vector3(0, 0, 0)
    ] : [
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(-20, 0, -10),
      new THREE.Vector3(0, 0, 0)
    ];
    this.wpIdx = 0;
    this.target = null;
    this.fireCooldown = 0;

    // Visual mesh
    const geo = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: team === 'A' ? 0xd2b48c : 0xb7410e,
      roughness: 0.5
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // Hitboxes
    this.bodyBox = new THREE.Box3();
    this.headSphere = new THREE.Sphere(new THREE.Vector3(), 0.25);
    this.updateHitboxes();
  }

  updateHitboxes() {
    this.bodyBox.setFromCenterAndSize(
      this.position.clone().add(new THREE.Vector3(0, 0.6, 0)),
      new THREE.Vector3(0.6, 1.2, 0.6)
    );
    this.headSphere.center.copy(this.position).add(new THREE.Vector3(0, 1.3, 0));
  }

  update(dt, player, enemies, onKill) {
    if (!this.alive) return;

    this.fireCooldown -= dt;

    // AI logic
    let closestEnemy = null;
    let minDist = 25;

    // Check player if player is on opposite team (Player is Team A)
    if (this.team === 'B') {
      const distToPlayer = this.position.distanceTo(player.position);
      if (distToPlayer < minDist && player.health > 0) {
        minDist = distToPlayer;
        closestEnemy = player;
      }
    }

    for (const enemy of enemies) {
      if (!enemy.alive || enemy.team === this.team) continue;
      const dist = this.position.distanceTo(enemy.position);
      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      this.state = 'attack';
      this.target = closestEnemy;
    } else if (this.state === 'attack') {
      this.state = 'patrol';
    }

    // Movement based on state
    let targetPos = null;
    if (this.state === 'attack' && this.target) {
      targetPos = this.target.position || this.target.position;
      // Shoot if close enough
      if (this.position.distanceTo(targetPos) < 20 && this.fireCooldown <= 0) {
        this.fireCooldown = 0.5;
        this.audio.playShot('ar77');
        if (Math.random() < 0.3) {
          if (this.target === player) {
            player.takeDamage(20);
          } else {
            this.target.takeDamage(20, 'Bot Rifle');
          }
        }
      }
    } else {
      const wp = this.waypoints[this.wpIdx];
      if (wp && this.position.distanceTo(wp) < 3) {
        this.wpIdx = (this.wpIdx + 1) % this.waypoints.length;
      }
      targetPos = this.waypoints[this.wpIdx];
    }

    if (targetPos) {
      const dir = new THREE.Vector3().subVectors(targetPos, this.position).normalize();
      this.velocity.copy(dir).multiplyScalar(3);
      this.position.addScaledVector(this.velocity, dt);
    }

    this.mesh.position.copy(this.position);
    this.updateHitboxes();
  }

  takeDamage(amount, weaponName = 'Rifle') {
    if (!this.alive) return false;
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.mesh.visible = false;
      return true;
    }
    return false;
  }
}

export class BotsManager {
  constructor(scene, world, audio) {
    this.scene = scene;
    this.world = world;
    this.audio = audio;
    this.bots = [];
  }

  init() {
    // 4 Team A teammates, 5 Team B enemies
    for (let i = 0; i < 4; i++) {
      this.bots.push(new Bot(this.scene, this.world, this.audio, 'A', i));
    }
    for (let i = 0; i < 5; i++) {
      this.bots.push(new Bot(this.scene, this.world, this.audio, 'B', i));
    }
  }

  update(dt, player, onKill) {
    for (let i = 0; i < this.bots.length; i++) {
      this.bots[i].update(dt, player, this.bots, onKill);
    }
  }

  reset() {
    for (const bot of this.bots) {
      this.scene.remove(bot.mesh);
    }
    this.bots = [];
    this.init();
  }

  getAliveCounts() {
    let countA = 1; // Player is team A
    let countB = 0;
    for (const bot of this.bots) {
      if (bot.alive) {
        if (bot.team === 'A') countA++;
        else countB++;
      }
    }
    return { countA, countB };
  }
}
