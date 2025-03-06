import * as THREE from "three";
import { Card } from "../actors/card.js";

export class CardManager {
  constructor(controller) {
    this.controller = controller;
    this.cards = [];
    this.init();
  }

  init() {
    const cards = this.readLocalStorage();

    if (cards.length > 0) {
      for (const card of cards) {
        this.cards.push(this.addCard(card));
      }
    } else {
      this.cards.push(this.addCard());
      this.cards.push(this.addCard());
      this.cards.push(this.addCard());
      this.cards.push(this.addCard());
      this.cards.push(this.addDM());
    }
    // console.log("roll",this.roll())
    // this.cards = this.roll()
    // this.setFanShape();
    this.demoLoop()
  }

  randomDice(modifier, faceCount = 20) {
    return Math.floor(Math.random() * faceCount) + 1 + modifier;
  }

  roll() {
    // group DM and players together
    const allPlayers = this.cards

    // do initial round of rolls
    allPlayers.forEach((player) => {
      player.reroll = null;
      player.roll = this.randomDice(player.modifier);
    });

    // decide initial
    allPlayers.sort((a, b) => b.roll - a.roll);

    for (let i = 0; i < allPlayers.length - 1; i++) {
      const playerA = allPlayers[i];
      const playerB = allPlayers[i + 1];

      // if two players rolled the same, reroll until unique results
      if (playerA.roll === playerB.roll) {
        while (playerA.reroll === playerB.reroll) {
          playerA.reroll = this.randomDice(playerA.modifier);
          playerB.reroll = this.randomDice(playerB.modifier);
        }

        // swap positions if player B has a higher roll
        if (playerB.reroll > playerA.reroll) {
          allPlayers[i] = playerB;
          allPlayers[i + 1] = playerA;
        }
      }
    }

    return allPlayers
  }

  demoLoop() {
    this.setStackShape();
    this.cards = this.roll()
    setTimeout(() => {
      this.setPolygonShape();
      setTimeout(() => {
        this.setFanShape();
        setTimeout(() => {
          this.demoLoop();
        }, 3000);
      }, 3000);
    }, 3000);
  }

  addCard(data) {
    if (data) {
      return new Card(this.controller, data.name, data.uuid, data.imageSrc);
    } else {
      return Card.empty(this.controller);
    }
  }

  addDM(){
    return Card.dungeonMaster(this.controller)
  }

  readLocalStorage() {
    const items = { ...localStorage };
    const cards = [];
    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith("card")) {
        cards.push({ ...JSON.parse(value) });
      }
    }
    return cards;
  }

  generatePolygon(sides, radius, centerX, centerY) {
    const points = [];
    const rotation = sides % 2 === 1 ? -Math.PI / 2 : 0; // Rotate odd-sided polygons upwards

    for (let k = 0; k < sides; k++) {
      let angle = (2 * Math.PI * k) / sides + rotation;
      let x = centerX + radius * Math.cos(-angle);
      let y = centerY + radius * Math.sin(-angle);
      points.push({ x, y });
    }
    return points;
  }

  setStackShape() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].desiredPosition = new THREE.Vector3(0, i * -0.2 + 2, 0);
      this.cards[i].desiredRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-90 * (Math.PI / 180), 0, 0, "XYZ")
      );
    }
  }

  setPolygonShape() {
    const coordinates = this.generatePolygon(this.cards.length, 5, 0, 7);
    console.log(coordinates);
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].desiredPosition = new THREE.Vector3(
        coordinates[i].x,
        coordinates[i].y,
        0
      );
      this.cards[i].desiredRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, 0)
      );
    }
  }

  setFanShape() {
    // Create a set of boxes (cards)
    const cardCount = this.cards.length; // Number of cards
    const fanAngle = Math.PI / 3; // 60-degree spread
    const cardWidth = 2; // Width of each card
    const radius = (cardCount * cardWidth) / fanAngle; // Adjust radius dynamically

    for (let i = 0; i < cardCount; i++) {
      // Compute angle for this card
      const angle = -fanAngle / 2 + (i / (cardCount - 1)) * fanAngle;

      // Position the card along a **horizontal arc** (X-axis spread, Y-axis curve)
      const x = Math.sin(angle) * radius; // Spread out left to right (X)
      const y = Math.cos(angle) * (radius / 4); // Slight curve upward (Y), smaller radius to keep low
      this.cards[i].desiredPosition = new THREE.Vector3(x, y + 2, -0.5 * i);
      this.cards[i].desiredRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, -angle)
      );
    }
  }
}
