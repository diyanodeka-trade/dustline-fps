import * as THREE from 'three';

export class Grenade {
  constructor(scene, world, audio) {
    this.scene = scene;
    this.world = world;
    this.audio = audio;
    this.active = false;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.timer = 0;
    this.bounced = false;

    const geo = new THREE.SphereGeometry(0.2, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a5057, metalness: 0.8, roughness: 0.2 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.visible = false;
    this.scene.add(this.mesh);
  }

  throw(pos, dir) {
    if (this.active) return;
    this.active = true;
    this.position.copy(pos);
    this.velocity.copy(dir).multiplyScalar(15);
    this.velocity.y += 5; // upward arc
    this.timer = 2.5; // 2.5s fuse
    this.bounced = false;
    this.mesh.visible = true;
    this.mesh.position.copy(this.position);
  }

  update(dt, player, bots, onExplode) {
    if (!this.active) return;

    this.timer -= dt;
    this.velocity.y -= 9.8 * dt; // gravity

    this.position.addScaledVector(this.velocity, dt);

    // Ground collision
    if (this.position.y < 0.2) {
      this.position.y = 0.2;
      if (!this.bounced) {
        this.velocity.y = -this.velocity.y * 0.4; // bounce
        this.velocity.x *= 0.6;
        this.velocity.z *= 0.6;
        this.bounced = true;
      } else {
        this.velocity.set(0, 0, 0);
      }
    }

    this.mesh.position.copy(this.position);

    if (this.timer <= 0) {
      this.explode(player, bots, onExplode);
    }
  }

  explode(player, bots, onExplode) {
    this.active = false;
    this.mesh.visible = false;
    this.audio.playExplosion();

    if (onExplode) onExplode(this.position);

    // Damage calculation
    const radius = 8;
    const maxDamage = 90;

    const distToPlayer = this.position.distanceTo(player.position);
    if (distToPlayer < radius) {
      const dmg = maxDamage * (1 - distToPlayer / radius);
      player.takeDamage(dmg);
    }

    for (const bot of bots) {
      if (!bot.alive) continue;
      const dist = this.position.distanceTo(bot.position);
      if (dist < radius) {
        const dmg = maxDamage * (1 - dist / radius);
        bot.takeDamage(dmg, 'HE Grenade');
      }
    }
  }
}
