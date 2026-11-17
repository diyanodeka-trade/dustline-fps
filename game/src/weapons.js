// Tactical weapon specifications
export const WEAPONS = {
  p9: {
    name: 'P9 Sidearm',
    damage: 25,
    headshot: 4.0,
    fireRate: 0.2,
    magSize: 12,
    reserve: 24,
    spread: 0.01,
    recoil: 0.02,
    reloadTime: 1.5,
    price: 0
  },
  vk9: {
    name: 'VK-9 SMG',
    damage: 22,
    headshot: 3.5,
    fireRate: 0.08,
    magSize: 30,
    reserve: 90,
    spread: 0.03,
    recoil: 0.015,
    reloadTime: 2.0,
    price: 1200
  },
  ar77: {
    name: 'AR-77 Longshot',
    damage: 34,
    headshot: 4.0,
    fireRate: 0.1,
    magSize: 30,
    reserve: 90,
    spread: 0.005,
    recoil: 0.03,
    reloadTime: 2.5,
    price: 2700
  },
  lr50: {
    name: 'LR-50 Sniper',
    damage: 100,
    headshot: 4.0,
    fireRate: 1.5,
    magSize: 5,
    reserve: 10,
    spread: 0.001,
    recoil: 0.1,
    reloadTime: 3.5,
    price: 4750
  }
};

export class WeaponInstance {
  constructor(id) {
    const data = WEAPONS[id];
    Object.assign(this, data);
    this.id = id;
    this.mag = this.magSize;
    this.reserve = this.reserve;
    this.lastFire = 0;
    this.reloading = false;
    this.reloadEnd = 0;
  }
}
