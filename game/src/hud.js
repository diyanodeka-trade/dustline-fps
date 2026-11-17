export class HUD {
  constructor() {
    this.els = {
      health: document.getElementById('health'),
      armor: document.getElementById('armor'),
      money: document.getElementById('money'),
      ammoMag: document.getElementById('ammo-mag'),
      ammoRes: document.getElementById('ammo-reserve'),
      weapon: document.getElementById('weapon-name'),
      timer: document.getElementById('timer'),
      scoreA: document.getElementById('score-a'),
      scoreB: document.getElementById('score-b'),
      countA: document.getElementById('count-a'),
      countB: document.getElementById('count-b'),
      bombStatus: document.getElementById('bomb-status'),
      bombBar: document.getElementById('bomb-timer-bar'),
      bombFill: document.getElementById('bomb-timer-fill'),
      killFeed: document.getElementById('kill-feed'),
      hitmarker: document.getElementById('hitmarker'),
      flash: document.getElementById('damage-flash'),
      crosshair: document.getElementById('crosshair'),
      buy: document.getElementById('buy-menu'),
      start: document.getElementById('start-overlay'),
      end: document.getElementById('end-overlay'),
      endTitle: document.getElementById('end-title'),
      endMsg: document.getElementById('end-msg')
    };
  }

  update(state) {
    this.els.health.textContent = Math.ceil(state.player.health);
    this.els.armor.textContent = Math.ceil(state.player.armor);
    this.els.money.textContent = `$${state.player.money}`;
    
    const weapon = state.player.weapons[state.player.weaponIdx];
    this.els.ammoMag.textContent = weapon.mag;
    this.els.ammoRes.textContent = `/ ${weapon.reserve}`;
    this.els.weapon.textContent = weapon.name;

    const mins = Math.floor(state.round.timer / 60);
    const secs = Math.floor(state.round.timer % 60);
    this.els.timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    this.els.scoreA.textContent = state.match.scoreA;
    this.els.scoreB.textContent = state.match.scoreB;
    this.els.countA.textContent = state.round.countA;
    this.els.countB.textContent = state.round.countB;

    if (state.round.bombPlanted) {
      this.els.bombStatus.style.display = 'block';
      this.els.bombBar.style.display = 'block';
      this.els.bombFill.style.width = `${(state.round.bombTimer / 35) * 100}%`;
    } else {
      this.els.bombStatus.style.display = 'none';
      this.els.bombBar.style.display = 'none';
    }

    this.els.crosshair.style.setProperty('--gap', `${4 + state.player.spread * 100}px`);
    
    this.els.buy.hidden = !state.ui.buyMenuOpen;
    this.els.start.hidden = !state.ui.startOpen;
    this.els.end.hidden = !state.ui.endOpen;

    if (state.ui.endOpen) {
      this.els.endTitle.textContent = state.ui.endTitle;
      this.els.endMsg.textContent = state.ui.endMsg;
    }
  }

  showHit() {
    this.els.hitmarker.classList.add('active');
    setTimeout(() => this.els.hitmarker.classList.remove('active'), 100);
  }

  showFlash() {
    this.els.flash.classList.add('active');
    setTimeout(() => this.els.flash.classList.remove('active'), 100);
  }

  addKill(killer, victim, weapon) {
    const div = document.createElement('div');
    div.className = 'kill-msg';
    div.innerHTML = `<b>${killer}</b> [${weapon}] <i>${victim}</i>`;
    this.els.killFeed.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }
}
