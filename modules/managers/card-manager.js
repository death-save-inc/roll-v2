import * as THREE from "three";
import { Card } from "../actors/card.js";
import { EventBus } from "../lib/eventbus.js";
import { delayAndAWait } from "../utils/utils.js";

export class CardManager {
  constructor(controller) {
    this.controller = controller;
    this.cards = [];

    EventBus.on("spell:cast", async () => {
      this.setStackShape();
    });

    EventBus.on("roll:complete", async (playerOrder) => {
      delayAndAWait(async () => {
        for (let i = 0; i < this.cards.length; i++) {
          const playerData = playerOrder.find(
            (p) => p.uuid === this.cards[i].uuid
          );
          if (playerData) {
            this.cards[i].roll = playerData.roll;
            this.cards[i].reroll = playerData.reroll;
            this.cards[i].setRoll();
            await this.cards[i].updateCardImage(i + 1);
          }
        }
        this.setPolygonShape();
      }, 1000);
    });
  }

  registerCard(card) {
    this.cards.push(card);
    this.setStackShape();
  }

  unregisterCard(card) {
    const index = this.cards.findIndex((c) => c.uuid === card.uuid);
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
    this.setStackShape();
  }

  randomDice(modifier, faceCount = 20) {
    const rawRoll = Math.floor(Math.random() * faceCount) + 1;
    return rawRoll + parseInt(modifier);
  }

  async roll() {
    // group DM and players together
    const allPlayers = this.cards;

    // do initial round of rolls
    allPlayers.forEach(async (player) => {
      player.reroll = null;
      // player.roll = await player.die.roll()//this.randomDice(player.modifier);
    });

    // decide initial
    allPlayers.sort((a, b) => b.roll - a.roll);

    for (let i = 0; i < allPlayers.length - 1; i++) {
      const playerA = allPlayers[i];
      const playerB = allPlayers[i + 1];

      // if two players rolled the same, reroll until unique results
      if (playerA.roll === playerB.roll) {
        while (playerA.reroll === playerB.reroll) {
          playerA.reroll = await playerA.die.roll();
          playerB.reroll = await playerB.die.roll();
        }

        // swap positions if player B has a higher roll
        if (playerB.reroll > playerA.reroll) {
          allPlayers[i] = playerB;
          allPlayers[i + 1] = playerA;
        }
      }

      // playera
    }
    allPlayers.forEach((player) => player.setRoll());

    return allPlayers;
  }

  // async demoLoop() {
  //   this.setStackShape();
  //   this.cards = await this.roll();
  //   setTimeout(() => {
  //     this.setPolygonShape();
  //     setTimeout(() => {
  //       this.setFanShape();
  //       setTimeout(() => {
  //         this.demoLoop();
  //       }, 4000);
  //     }, 4000);
  //   }, 4000);
  // }

  async addCard(data) {
    if (data) {
      const card = new Card(
        this.controller,
        data.name,
        data.uuid,
        data.imageSrc,
        "player",
        data.modifier,
        data.color
      );
      await card._init();
      return card;
    } else {
      const card = Card.empty(this.controller);
      await card._init();
      return card;
    }
  }

  // async addDM() {
  //   const card = Card.dungeonMaster(this.controller);
  //   await card._init();
  //   return card;
  // }

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
    const rotation = Math.PI / 2; // Rotate so the first point is at the top

    for (let k = 0; k < sides; k++) {
        let angle = (2 * Math.PI * k) / sides + rotation; // Negative for clockwise direction
        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);
        points.push({ x, y });
    }
    return points;
}

  setStackShape() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].desiredPosition = new THREE.Vector3(0, i * -0.2 + 4, 0);
      // this.cards[i].desiredPosition = new THREE.Vector3(0, 3, 0);

      this.cards[i].desiredRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-90 * (Math.PI / 180), 0, 0, "XYZ")
      );
    }
  }

  setPolygonShape() {
    const coordinates = this.generatePolygon(this.cards.length, 6, 0, 12);
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
