import { compress } from "../lib/compress.js";

export class CardUI {
    constructor(card) {
        this.card = card;
    }

    async init() {
        await this.loadTemplate();
        this.findElements();
        this.findElements();
        this.bindEvents();
        await this.render();
    }

    async show() {
        const event = new CustomEvent("raycaster:inactive", {
            bubbles: true,
        });
        document.dispatchEvent(event);
        await this.init();
    }

    async loadTemplate() {
        this.element = document.createElement("div");
        this.element.classList.add("modal");
        this.element.innerHTML = await (
            // await fetch("../templates/card.html")
            await fetch("https://raw.githubusercontent.com/Roll-for-Initiative/roll-v2/refs/heads/main/templates/card.html")
        ).text();
        document.body.appendChild(this.element);
    }

    hide(e) {
        this.element.remove();
        setTimeout(() => {
            const event = new CustomEvent("raycaster:active", {
                bubbles: true,
            });
            document.dispatchEvent(event);
        }, 500);
    }

    findElements() {
        this.imageEl = this.element.querySelector(".card-editor__image");
        this.inputNameEl = this.element.querySelector(".card-editor__input-name");
        this.closeBtnEl = this.element.querySelector(".card-editor__close");
        this.inputImageEl = this.element.querySelector(".card-editor__input-image");
    }

    bindEvents() {
        this.closeBtnEl.addEventListener("click", this.hide.bind(this));
        this.inputNameEl.addEventListener("change", this.onNameChange.bind(this));
        this.inputImageEl.addEventListener("change", this.onImageChange.bind(this));
    }

    async onNameChange(e) {
        await this.card.updateName(e.target.value);
    }

    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    async onImageChange(e) {
        // let url = window.URL.createObjectURL(e.target.files[0]);
        const url = await compress(e.target.files[0], 140);
        this.card.setPicture(url, true);
        this.imageEl.src = url;
    }

    async render() {
        this.inputNameEl.value = this.card.name;
        if (this.card.imageSrc) {
            this.imageEl.src = this.card.imageSrc;
        }
    }
}
