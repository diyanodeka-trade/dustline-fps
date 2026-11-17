import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.walls = []; // AABBs for collision
    this.sites = {
      A: { center: new THREE.Vector3(20, 0, 10), radius: 5 },
      B: { center: new THREE.Vector3(-20, 0, -10), radius: 5 }
    };
    
    this.init();
  }

  init() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c }); // Sand
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Sky
    this.scene.background = new THREE.Color(0xf0a830); // Dusk amber

    // Map Boundaries
    this.addBox(0, 5, 50, 100, 10, 2, 0x4a5057); // North
    this.addBox(0, 5, -50, 100, 10, 2, 0x4a5057); // South
    this.addBox(50, 5, 0, 2, 10, 100, 0x4a5057); // East
    this.addBox(-50, 5, 0, 2, 10, 100, 0x4a5057); // West

    // Dustline Yard - Layout
    // Mid Lane
    this.addBox(0, 3, 0, 10, 6, 40, 0x2f353b); // Central block
    
    // Site A area
    this.addBox(25, 2, 15, 10, 4, 10, 0xb7410e); // Rusty container A
    this.addBox(15, 1, 20, 4, 2, 4, 0x4a5057); // Crate A1
    
    // Site B area
    this.addBox(-25, 2, -15, 10, 4, 10, 0xb7410e); // Rusty container B
    this.addBox(-15, 1, -20, 4, 2, 4, 0x4a5057); // Crate B1

    // Additional cover
    this.addBox(10, 2, -10, 6, 4, 6, 0x2f353b);
    this.addBox(-10, 2, 10, 6, 4, 6, 0x2f353b);

    // Lighting
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0x404040, 0.5));
  }

  addBox(x, y, z, w, h, d, color) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.walls.push(new THREE.Box3().setFromObject(mesh));
  }

  checkCollision(box) {
    for (const wall of this.walls) {
      if (box.intersectsBox(wall)) return true;
    }
    return false;
  }
}
