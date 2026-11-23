import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { Input } from './input.js';
import { AudioSystem } from './audio.js';
import { HUD } from './hud.js';
import { BotsManager } from './bots.js';
import { RoundManager } from './rounds.js';
import { Grenade } from './grenade.js';
import { WEAPONS, WeaponInstance } from './weapons.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
canvas.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const audio = new AudioSystem();
const world = new World(scene);
const player = new Player(camera, world);
const input = new Input();
const hud = new HUD();
const botsMgr = new BotsManager(scene, world, audio);
botsMgr.init();
const rounds = new RoundManager();
const grenade = new Grenade(scene, world, audio);

let gameStarted = false;

document.getElementById('start-btn').addEventListener('click', () => {
  audio.init();
  audio.resume();
  input.requestLock(document.body);
  gameStarted = true;
  document.getElementById('start-overlay').hidden = true;
});

document.getElementById('restart-btn').addEventListener('click', () => {
  rounds.nextRound();
  player.position.set(0, 1.7, 40);
  player.health = 100;
  botsMgr.reset();
});

// Buy menu interaction
document.querySelectorAll('.buy-item').forEach(item => {
  item.addEventListener('click', () => {
    const id = item.dataset.id;
    if (id === 'armor') {
      if (player.money >= 650) {
        player.money -= 650;
        player.armor = 100;
      }
    } else if (id === 'grenade') {
      if (player.money >= 300) {
        player.money -= 300;
      }
    } else if (WEAPONS[id]) {
      const w = WEAPONS[id];
      if (player.money >= w.price) {
        player.money -= w.price;
        player.weapons = [new WeaponInstance(id)];
        player.weaponIdx = 0;
      }
    }
  });
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') audio.toggleMute();
  if (e.code === 'KeyB') {
    if (rounds.phase === 'freeze') {
      rounds.buyMenuOpen = !rounds.buyMenuOpen;
    }
  }
  if (e.code === 'KeyR') {
    const w = player.weapons[player.weaponIdx];
    if (!w.reloading && w.mag < w.magSize && w.reserve > 0) {
      w.reloading = true;
      audio.playReload();
      setTimeout(() => {
        const needed = w.magSize - w.mag;
        const take = Math.min(needed, w.reserve);
        w.mag += take;
        w.reserve -= take;
        w.reloading = false;
      }, w.reloadTime * 1000);
    }
  }
  if (e.code === 'KeyG') {
    grenade.throw(player.position, camera.getWorldDirection(new THREE.Vector3()));
  }
});

// Shooting raycast
window.addEventListener('mousedown', (e) => {
  if (!gameStarted || !input.locked || rounds.buyMenuOpen || rounds.endOpen) return;
  if (e.button !== 0) return;

  const w = player.weapons[player.weaponIdx];
  if (w.mag <= 0 || w.reloading) return;

  w.mag--;
  audio.playShot(w.id);

  // Raycast
  const raycaster = new THREE.Raycaster();
  const dir = camera.getWorldDirection(new THREE.Vector3());
  raycaster.set(camera.position, dir);

  const bots = botsMgr.bots;
  for (const bot of bots) {
    if (!bot.alive) continue;
    
    // Check headshot
    const hitRay = raycaster.ray;
    // Simple distance check or intersection with bot hitboxes
    const distToBot = bot.position.distanceTo(player.position);
    if (distToBot < 30) {
      const headDist = hitRay.distanceToPoint(bot.headSphere.center);
      if (headDist < 0.3) {
        const killed = bot.takeDamage(w.damage * w.headshot, w.name);
        hud.showHit();
        audio.playHit();
        if (killed) {
          player.money += 300;
          hud.addKill('Player', 'Bot ' + bot.index, w.name);
        }
        break;
      } else if (hitRay.distanceToPoint(bot.position.clone().add(new THREE.Vector3(0, 0.6, 0))) < 0.5) {
        const killed = bot.takeDamage(w.damage, w.name);
        hud.showHit();
        audio.playHit();
        if (killed) {
          player.money += 300;
          hud.addKill('Player', 'Bot ' + bot.index, w.name);
        }
        break;
      }
    }
  }
});

let lastTime = performance.now();
const dtFixed = 1/60;
let accumulator = 0;

function animate(time) {
  requestAnimationFrame(animate);

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  if (gameStarted) {
    accumulator += Math.min(dt, 0.2);
    while (accumulator >= dtFixed) {
      if (!rounds.endOpen) {
        rounds.update(dtFixed, botsMgr.getAliveCounts(), (winner) => {
          if (winner === 'A') player.money += 3250;
          else player.money += 1900;
        });
        if (!rounds.buyMenuOpen) {
          player.update(input, dtFixed);
          botsMgr.update(dtFixed, player, (winner) => {});
          grenade.update(dtFixed, player, botsMgr.bots, () => {});
        }
      }
      accumulator -= dtFixed;
    }

    hud.update({
      player,
      round: {
        timer: rounds.timer,
        countA: botsMgr.getAliveCounts().countA,
        countB: botsMgr.getAliveCounts().countB,
        bombPlanted: rounds.bombPlanted,
        bombTimer: rounds.bombTimer
      },
      match: {
        scoreA: rounds.scoreA,
        scoreB: rounds.scoreB
      },
      ui: {
        buyMenuOpen: rounds.buyMenuOpen,
        startOpen: !gameStarted,
        endOpen: rounds.endOpen,
        endTitle: rounds.endTitle,
        endMsg: rounds.endMsg
      }
    });
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
