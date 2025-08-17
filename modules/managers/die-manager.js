import * as THREE from "three";
import { Die } from "../actors/die.js";
import { EventBus } from "../lib/eventbus.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { delayAndAWait } from "../utils/utils.js";

export class DieManager {
  constructor(controller, players = []) {
    this.controller = controller;
    this.players = players;
    this.dice = [];
    this.lines = null;
    this.outlineLine = null;
    this.fadeTarget = 1.0;

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (this.lines?.material) this.lines.material.resolution.set(w, h);
      if (this.outlineLine?.material)
        this.outlineLine.material.resolution.set(w, h);
    });

    this.init();
  }

  async init() {
    EventBus.on("roll:start", async () => {
      await this.onRoll();
    });
  }

  async onRoll() {
    await this.showDice();
    const players = await this.roll();
    EventBus.emit("roll:complete", players);
    await this.hideDice();
  }

  registerDie(die) {
    this.dice.push(die);
    die.setPosition(new THREE.Vector3(8 + this.dice.length * -4, 10, 2));
    this.setPolygonShape();
  }

  unregisterDie(die) {
    const index = this.dice.findIndex((d) => d.uuid === die.uuid);
    if (index !== -1) {
      this.dice.splice(index, 1);
      this.setPolygonShape();
    }
  }

  generatePolygon(sides, radius, centerX, centerY) {
    const points = [];
    const rotation = sides % 2 === 1 ? -Math.PI / 2 : 0;
    for (let k = 0; k < sides; k++) {
      const angle = (2 * Math.PI * k) / sides + rotation;
      const x = centerX + radius * Math.cos(-angle);
      const y = centerY + radius * Math.sin(-angle);
      points.push({ x, y });
    }
    return points;
  }

  setPolygonShape() {
    this.coordinates = this.generatePolygon(this.dice.length, 5, 0, 10);
    for (let i = 0; i < this.dice.length; i++) {
      this.dice[i].setPosition(
        new THREE.Vector3(this.coordinates[i].x, this.coordinates[i].y, 3)
      );
      this.dice[i].desiredRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, 0)
      );
    }
    // this.connectDice();
  }

  computeMST(points2D) {
    const points3D = points2D.map((p) => new THREE.Vector3(p.x, p.y, 0));
    const n = points3D.length;
    const inMST = new Array(n).fill(false);
    const key = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    key[0] = 0;

    for (let count = 0; count < n - 1; count++) {
      let u = -1;
      let minKey = Infinity;
      for (let v = 0; v < n; v++) {
        if (!inMST[v] && key[v] < minKey) {
          minKey = key[v];
          u = v;
        }
      }

      inMST[u] = true;

      for (let v = 0; v < n; v++) {
        if (!inMST[v]) {
          const dist = points3D[u].distanceTo(points3D[v]);
          if (dist < key[v]) {
            key[v] = dist;
            parent[v] = u;
          }
        }
      }
    }

    const edges = [];
    for (let i = 1; i < n; i++) {
      edges.push([parent[i], i]);
    }
    return edges;
  }

  connectDice() {
    if (this.lines) {
      this.controller.scene.remove(this.lines);
      this.lines.geometry.dispose();
      this.lines.material.dispose();
    }
    if (this.outlineLine) {
      this.controller.scene.remove(this.outlineLine);
      this.outlineLine.geometry.dispose();
      this.outlineLine.material.dispose();
    }

    if (!this.coordinates || this.coordinates.length < 2) return;

    const fixedZ = 3;

    // === MST Lines ===
    const mstEdges = this.computeMST(this.coordinates);
    const segmentPoints = [];
    mstEdges.forEach(([i1, i2]) => {
      const p1 = this.coordinates[i1];
      const p2 = this.coordinates[i2];
      segmentPoints.push(p1.x, p1.y, fixedZ, p2.x, p2.y, fixedZ);
    });

    const mstGeometry = new LineGeometry();
    mstGeometry.setPositions(segmentPoints);

    const mstMaterial = new LineMaterial({
      color: 0xff00ff,
      linewidth: 4,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    mstMaterial.resolution.set(window.innerWidth, window.innerHeight);
    this.lines = new Line2(mstGeometry, mstMaterial);
    this.controller.scene.add(this.lines);

    // === Polygon Outline ===
    const outlinePoints = [];
    this.coordinates.forEach((p) => {
      outlinePoints.push(p.x, p.y, fixedZ);
    });
    // Close the shape
    outlinePoints.push(this.coordinates[0].x, this.coordinates[0].y, fixedZ);

    const outlineGeometry = new LineGeometry();
    outlineGeometry.setPositions(outlinePoints);

    const outlineMaterial = new LineMaterial({
      color: 0xff0000,
      linewidth: 4,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    outlineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    this.outlineLine = new Line2(outlineGeometry, outlineMaterial);
    this.controller.scene.add(this.outlineLine);
  }

  async showDice() {
    return delayAndAWait(() => {
      this.dice.forEach((die) => die.show());
      this.fadeTarget = 1.0;
    }, 1000);
  }

  async hideDice() {
    return delayAndAWait(() => {
      this.dice.forEach((die) => die.hide());
      this.fadeTarget = 0;
    }, 1000);
  }

  update() {
    this.dice.forEach((die) => die.update());

    // Add pulsing glow effect
    const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2; // value from 0 to 1
    const glowOpacity = 0.5 + 0.5 * pulse;

    if (this.lines) {
      this.lines.visible = true;
      this.lines.material.opacity = glowOpacity;
    }

    if (this.outlineLine) {
      this.outlineLine.visible = true;
      this.outlineLine.material.opacity = glowOpacity;
    }
  }

  async roll() {
    this.controller.dungeonManager.resetPlayerRolls();
    const allPlayers = this.controller.dungeonManager.players;

    allPlayers.forEach(async (player) => {
      if (player) { // Ensure player is not undefined or null
        player.reroll = null;
        player.roll = await player.die.roll();
      } else {
        console.warn("Encountered undefined or null player in DieManager.roll.");
      }
    });

    allPlayers.sort((a, b) => b.roll - a.roll);

    for (let i = 0; i < allPlayers.length - 1; i++) {
      const playerA = allPlayers[i];
      const playerB = allPlayers[i + 1];

      if (playerA.roll === playerB.roll) {
        while (playerA.reroll === playerB.reroll) {
          playerA.reroll = await playerA.die.roll();
          playerB.reroll = await playerB.die.roll();
        }

        if (playerB.reroll > playerA.reroll) {
          allPlayers[i] = playerB;
          allPlayers[i + 1] = playerA;
        }
      }
    }

    return allPlayers;
  }
}
