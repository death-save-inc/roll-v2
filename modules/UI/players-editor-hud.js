import { EventBus } from "../lib/eventbus.js";
import { LoadTemplate } from "../lib/template.js";

export class PlayerEditorHud {
    constructor() {
        this.template = null;
        this.init();
    }

    async init() {
        this.template = await LoadTemplate("players-editor-hud.html");
        this.createElement();
        this.findElements();
        this.bindEvents();
    }

    async loadTemplate(url) {
        return await (await fetch(url)).text();
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.innerHTML = this.template;
        const parent = document.querySelector(".hud");
        if (!parent) {
            console.error("No parent element found for AddPlayerUI");
            return;
        }
        this.element.classList.add("player-actions");
        parent.appendChild(this.element);
    }

    hide(e) {
        this.element.style.display = "none";
    }

    show(e) {
        this.element.style.display = "unset";
    }

    findElements() {
        this.openPlayerEditorEl = this.element.querySelector(".open-player-editor");
        this.addButtonEl = this.element.querySelector(".player-actions__button");
        this.settingsButtonEl = this.element.querySelector(".open-settings");
    }

    bindEvents() {
        this.openPlayerEditorEl.addEventListener("click", () => {
            EventBus.emit('playersEditor:show', {});
        });

        this.settingsButtonEl.addEventListener("click", () => {
            EventBus.emit('saveSlots:show', {});
        });
    }
}