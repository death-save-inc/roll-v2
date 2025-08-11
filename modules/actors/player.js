import { Die } from "../actors/die.js";
import { Card } from "../actors/card.js";

export class Player {
  constructor(controller, name, uuid, imageSrc, playerType, modifier, color) {
    this.controller = controller;
    this.name = name;
    this.uuid = uuid || `player-${crypto.randomUUID()}`;
    this.imageSrc = imageSrc || null;
    this.type = playerType || "player";
    this.modifier = modifier || 0;
    this.color = color || 0xff00ff;
    this.image = null;
    this.model = null;
    this.ready = false;
    this.die = new Die(this.controller, this); // Assigned by DieManager
    this.card = new Card(this.controller,name, uuid,imageSrc,playerType,modifier,color); // Assigned by CardManager\
    this._init();
  }

  toJSON() {
    return {
      name: this.name,
      uuid: this.uuid,
      imageSrc: this.imageSrc,
      type: this.type,
      modifier: this.modifier,
      color: this.color,
    };
  }
  static empty(controller) {
    return new Player(controller, "change me test", `player-${crypto.randomUUID()}`);
  }
  static dungeonMaster(controller) {
    return new Player(
      controller,
      "Dungeon master",
      `player-${crypto.randomUUID()}`,
      null,
      "dm"
    );
  }

  delete(){
    this.deleteFromLocalStorage();
    this.die.delete()
    this.card.delete()
  }


  isInLocalStorage() {
    return localStorage.getItem(this.uuid) !== null;
  }

  addToLocalStorage() {
    localStorage.setItem(this.uuid, JSON.stringify(this.toJSON()));
  }

  deleteFromLocalStorage() {
    localStorage.removeItem(this.uuid);
  }

  async _init() {
    if (!this.isInLocalStorage()) {
      this.addToLocalStorage();
    }
  }
}
