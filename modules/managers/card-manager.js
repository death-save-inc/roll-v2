import * as THREE from "three";
import { Card } from "../actors/card.js";
import { randomRange } from "../utils/utils.js";

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
        this.cards.push(this.addCard(card))
      }
    } else {
      this.cards.push(this.addCard())
      this.cards.push(this.addCard())
      this.cards.push(this.addCard())

    }

    for (const card of this.cards){
        card.desiredPosition = new THREE.Vector3(randomRange(-6, 6),randomRange(2, 8), randomRange(-2,2) )
    }
  }

  addCard(data) {
    if (data){
        return new Card(this.controller, data.name, data.uuid, data.imageSrc)
    }else {
        return Card.empty(this.controller)
    }
  }

  readLocalStorage() {
    const items = { ...localStorage };
    const cards = []
    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith("card")) {
        cards.push({ ...JSON.parse(value) });
      }
    }
    return cards
  }
}
