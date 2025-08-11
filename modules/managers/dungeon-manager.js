import { Player } from "../actors/player.js";
import { RollUI } from "../UI/roll.js";
import { AddPlayerUI } from "../UI/add-player.js";
import { EventBus } from "../lib/eventbus.js";

export class DungeonManager {
  constructor(controller) {
    this.controller = controller;
    this.players = [];
    this.init();
  }

  async init() {
    this.RollUI = new RollUI();
    this.AddPlayerUI = new AddPlayerUI();

    const players = this.readLocalStorage();

    console.log("DungeonManager init", players);

    if (players.length > 0) {
      for (const player of players) {
        this.players.push(this.addPlayer(player));
      }
    } else {
      for (let i = 0; i < 5; i++) {
        this.players.push(Player.empty(this.controller));
      }
    }
    EventBus.on("player:add", () => {
      this.addPlayer(null);
    });

    EventBus.on("player:delete", (player) => {
      this.deletePlayer(player)
    })
  }

  resetPlayerRolls(){
    for (const player of this.players) {
      player.roll= null;
    }
  }

  addPlayer(playerData) {
    if (!playerData) {
      return Player.empty(this.controller);
    }
    else if (playerData && playerData.name === "Dungeon master") {
      Player.dungeonMaster(this.controller);
    }
    else if (localStorage.getItem(playerData.uuid)) {
      return new Player(
        this.controller,
        playerData.name,
        playerData.uuid,
        playerData.imageSrc,
        playerData.type,
        playerData.modifier,
        playerData.color
      );
    }
  }

  deletePlayer(player) {
    const index = this.players.findIndex((p) => p.uuid === player.uuid);
    if (index !== -1) {
      localStorage.removeItem(player.uuid);
      this.players[index].delete()
      this.players.splice(index, 1);
    }
  }

  readLocalStorage() {
    const items = { ...localStorage };
    const players = [];

    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith("player")) {
        players.push({ ...JSON.parse(value) });
      }
    }
    return players;
  }
}
