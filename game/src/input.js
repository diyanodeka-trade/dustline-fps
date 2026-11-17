export class Input {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, left: false, right: false };
    this.delta = { x: 0, y: 0 };
    this.locked = false;

    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouse.left = true;
      if (e.button === 2) this.mouse.right = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (this.locked) {
        this.delta.x += e.movementX;
        this.delta.y += e.movementY;
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement !== null;
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  consumeDelta() {
    const d = { ...this.delta };
    this.delta.x = 0;
    this.delta.y = 0;
    return d;
  }

  requestLock(element) {
    element.requestPointerLock();
  }
}
