export class RoundManager {
  constructor() {
    this.phase = 'freeze'; // freeze, live, ended
    this.timer = 15;
    this.scoreA = 0;
    this.scoreB = 0;
    this.bombPlanted = false;
    this.bombTimer = 35;
    this.buyMenuOpen = false;
    this.endOpen = false;
    this.endTitle = '';
    this.endMsg = '';
  }

  update(dt, counts, onRoundEnd) {
    this.timer -= dt;

    if (this.phase === 'freeze') {
      this.buyMenuOpen = true;
      if (this.timer <= 0) {
        this.phase = 'live';
        this.timer = 100;
        this.buyMenuOpen = false;
      }
    } else if (this.phase === 'live') {
      if (this.bombPlanted) {
        this.bombTimer -= dt;
        if (this.bombTimer <= 0) {
          this.endRound('B', 'Bomb Detonated', onRoundEnd);
          return;
        }
      }

      if (this.timer <= 0) {
        this.endRound('B', 'Time Expired - Defenders Win', onRoundEnd);
        return;
      }

      if (counts.countA <= 0) {
        this.endRound('B', 'Team B Eliminated Team A', onRoundEnd);
        return;
      }
      if (counts.countB <= 0) {
        this.endRound('A', 'Team A Eliminated Team B', onRoundEnd);
        return;
      }
    }
  }

  endRound(winner, msg, callback) {
    this.phase = 'ended';
    this.endOpen = true;
    this.endTitle = winner === 'A' ? 'ROUND WON' : 'ROUND LOST';
    this.endMsg = msg;
    if (winner === 'A') this.scoreA++;
    else this.scoreB++;

    if (callback) callback(winner);
  }

  nextRound() {
    this.phase = 'freeze';
    this.timer = 15;
    this.bombPlanted = false;
    this.bombTimer = 35;
    this.endOpen = false;
  }
}
