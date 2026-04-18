import {LoadTemplate} from "../lib/template.js";
import {EventBus} from "../lib/eventbus.js";
import {LocalStorageManager} from "../lib/manage-local-storage.js";
import {compress} from "../lib/compress.js";

export class PlayersEditor {
    constructor() {
        this.template = null;
        this.element = null;
        this.playersListEl = null;
        this.addButtonEl = null;
        this.init();
    }

    async init() {
        this.template = await LoadTemplate("players-editor.html");
        this.playerItem = await LoadTemplate("player-item.html");
        this.playerEditor = await LoadTemplate("player-editor-item.html");
        this.createElement();
        this.findElements();
        this.bindEvents();
    }

    show(){
        this.element.classList.add("players-editor__active");
        this.renderPlayersFromLocalStorage();
    } 
    hide(){
        this.element.classList.remove("players-editor__active");
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.innerHTML = this.template;
        this.element.classList.add("players-editor");
        document.body.appendChild(this.element);
    }

    findElements() {
        this.playersListEl = this.element.querySelector(".players-editor__list");
        this.addButtonEl = this.element.querySelector(".players-editor__add");
    }

    bindEvents() {
        EventBus.on("playersEditor:show", () => {
            this.show();
        })
        this.addButtonEl.addEventListener("click", () => {
            EventBus.emit('player:add', {});
        });
    }

    renderPlayerItem(player) {
        const playerEl = document.createElement("div");
        playerEl.classList.add("player-item");
        playerEl.innerHTML = this.playerItem;
        // Here you can set player data to the playerEl if needed
        // playerEl.querySelector(".player-item__name").innerHTML/ = player.name || "New Player";
        // playerEl.querySelector(".player-item__image").innerHTML = `<img src="${player.imageSrc || 'default-image.png'}" alt="${player.name}">`;

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.classList.add("player-name");
        nameInput.placeholder = "Enter player name";
        playerEl.appendChild(nameInput);    
        nameInput.value = player.name || "";

        const imageFileInput = document.createElement("input");
        imageFileInput.type = "file";
        imageFileInput.accept = "image/*";
        imageFileInput.classList.add("player-image");
        playerEl.appendChild(imageFileInput);
        imageFileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = await compress(e.target.files[0], 140);
            }
        });



        // const imageInput = playerEl.querySelector(".player-image");
        // imageInput.value = player.imageSrc || "";


        return playerEl;
    }

    async renderPlayersFromLocalStorage() {
        const storageManager = LocalStorageManager.getInstance();
        const saveData = storageManager.getCurrentSave();
        const players = await saveData.get("players");    

        this.playersListEl.innerHTML = ""; // Clear existing players
        if (players.length > 0) {
            for (const player of players) {
                const playerEl = this.renderPlayerItem(player);
                this.playersListEl.appendChild(playerEl);
            }
        }   
        else {
            const noPlayersEl = document.createElement("div");
            noPlayersEl.classList.add("no-players");
            noPlayersEl.textContent = "No players found. Click 'Add Player' to create one.";
            this.playersListEl.appendChild(noPlayersEl);
        }
    }
}