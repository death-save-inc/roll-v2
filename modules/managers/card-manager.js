import * as THREE from "three";
import { Card } from "../actors/card.js";
import { RollUI } from "../UI/roll.js";


const delayAndAWait = (callback, time)=>{
  return new Promise((resolve, _)=>{
    setTimeout(()=>{
      resolve(callback())
    }, time)
  })
}

export class CardManager {
  constructor(controller) {
    this.controller = controller;
    this.cards = [];
    this.init();
  }

  async init() {
    const cards = this.readLocalStorage();

    if (cards.length > 0) {
      for (const card of cards) {
          this.cards.push(await this.addCard(card));
      }
    } else {
      this.cards.push(await this.addCard());
      this.cards.push(await this.addCard());
      this.cards.push(await this.addCard());
      this.cards.push(await this.addCard());
      this.cards.push(await this.addDM());
    }

    window.addEventListener("roll", async ()=>{
      this.controller.setRollView()
      
      
      this.setStackShape();
      this.cards = await this.roll()
    await delayAndAWait(async ()=>{await this.controller.setCardView()}, 2000) 
      
      this.setFanShape();
      
    })

    this.UI = new RollUI()
    console.log(this.UI)
    // this.demoLoop()
  }

  randomDice(modifier, faceCount = 20) {
    const rawRoll = Math.floor(Math.random() * faceCount) + 1
    return rawRoll + parseInt(modifier)
  }

  async roll() {
    // group DM and players together
    const allPlayers = this.cards

    // do initial round of rolls
    allPlayers.forEach(async (player) => {
      player.reroll = null;
      player.roll = await player.die.roll()//this.randomDice(player.modifier);
    });

    // decide initial
    allPlayers.sort((a, b) => b.roll - a.roll);

    for (let i = 0; i < allPlayers.length - 1; i++) {
      const playerA = allPlayers[i];
      const playerB = allPlayers[i + 1];

      // if two players rolled the same, reroll until unique results
      if (playerA.roll === playerB.roll) {
        while (playerA.reroll === playerB.reroll) {
          playerA.reroll = await playerA.die.roll()
          playerB.reroll = await playerA.die.roll()
        }

        // swap positions if player B has a higher roll
        if (playerB.reroll > playerA.reroll) {
          allPlayers[i] = playerB;
          allPlayers[i + 1] = playerA;
        }
      }

      // playera
    }
    allPlayers.forEach(player => player.setRoll())

    return allPlayers
  }

  async demoLoop() {
    this.setStackShape();
    this.cards = await this.roll()
    setTimeout(() => {
      this.setPolygonShape();
      setTimeout(() => {
        this.setFanShape();
        setTimeout(() => {
          this.demoLoop();
        }, 4000);
      }, 4000);
    }, 4000);
  }

  async addCard(data) {
    if (data) {
      const card = new Card(this.controller, data.name, data.uuid, data.imageSrc, "player", data.modifier);
      await card._init()
      return card
    } else {
      const card = Card.empty(this.controller);
      await card._init()
      return card
    }
  }

  async addDM() {
    const card = Card.dungeonMaster(this.controller)
    await card._init()
    return card
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
