import { Die } from "../actors/die.js";
import { Card } from "../actors/card.js";
import { LocalStorageManager } from "../lib/manage-local-storage.js";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

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
    this.card = new Card(this.controller, name, uuid, imageSrc, playerType, modifier, color); // Create card (Card will register itself during init)
    // link card back to this Player so card updates can update player state
    try {
      this.card.owner = this;
    } catch (e) {
      // ignore if card not fully initialized yet
    }
    this.save = debounce(this.save.bind(this), 500); // Debounce save method
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

  setPicture(url) {
    this.imageSrc = url;
    // update card visual (but do not call setPicture again from the card)
    if (this.card && typeof this.card.updateImageSrc === 'function') {
      this.card.imageSrc = url;
      this.card.updateCardImage(0);
    }
    // persist change
    this.saveUpdate();
  }

  delete(){
    this.deleteFromLocalStorage();
    this.die.delete()
    this.card.delete()
  }

  async save(){
    const storageManager = LocalStorageManager.getInstance();
    const saveData = storageManager.getCurrentSave();
    const players = await saveData.get("players");
    console.log("Saving player to local storage:", this.toJSON());
    players.push(this.toJSON());
    storageManager.saveToExistingSlot("players", players);
  }

  async saveUpdate(){
    try {
      const storageManager = LocalStorageManager.getInstance();
      const saveData = storageManager.getCurrentSave();
      const players = await saveData.get("players");

      if (!Array.isArray(players)) {
        console.warn("saveUpdate: players not found or invalid:", players);
        return;
      }

      const index = players.findIndex(player => player.uuid === this.uuid);
      if (index !== -1) {
        players[index] = this.toJSON();
        await storageManager.saveToExistingSlot("players", players);
        console.log("Updated player saved to slot:", this.uuid);
      } else {
        // If player not present in the slot, add it so updates persist
        players.push(this.toJSON());
        await storageManager.saveToExistingSlot("players", players);
        console.log("Player added to save slot:", this.uuid);
      }
    } catch (error) {
      console.error("Failed to save update for player:", error);
    }
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
      // this.addToLocalStorage();
    }
    // this.save()
  }
}
