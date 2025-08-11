import { compress } from "../lib/compress.js";
import { EventBus } from "../lib/eventbus.js";
import { LoadTemplate } from "../lib/template.js";

export class CardUI {
    constructor(player) {
        this.player = player;
        this.template = null
    }

    async init() {
       this.template = await LoadTemplate("card.html");
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

    createElement(){
        this.element = document.createElement("div");
        this.element.classList.add("modal");
        this.element.innerHTML = this.template
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
        this.inputModifierEl = this.element.querySelector(".card-editor__modifier")
        this.inputRollEl = this.element.querySelector(".card-editor__roll")
        this.inputRerollEl = this.element.querySelector(".card-editor__reroll")
        this.deleteBtnEl = this.element.querySelector(".card-editor__delete")
        this.colorPicker = this.element.querySelector(".card-editor__color")
    }

    bindEvents() {
        this.closeBtnEl.addEventListener("click", this.hide.bind(this));
        this.inputNameEl.addEventListener("change", this.onNameChange.bind(this));
        this.inputImageEl.addEventListener("change", this.onImageChange.bind(this));
        this.inputModifierEl.addEventListener("change", this.onModifierChange.bind(this))
        this.deleteBtnEl.addEventListener("click", this.onDelete.bind(this))
        this.colorPicker.addEventListener("change", this.onColorChange.bind(this));
    }

    onNameChange(e) {
        this.player.updateName(e.target.value);
    }

    onModifierChange(e){
        this.player.updateModifier(e.target.value)
    }

    onDelete(e){
        EventBus.emit("player:delete", this.player);
        this.hide();
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
        this.player.setPicture(url, true);
        this.imageEl.src = url;
        console.log('hi')
    }

    onColorChange(e){
        this.player.updateDieColor(e.target.value)
    }

    async render() {
        this.inputNameEl.value = this.player.name;
        if (this.player.imageSrc) {
            this.imageEl.src = this.player.imageSrc;
        }
        this.inputModifierEl.value = this.player.modifier
        this.inputRollEl.value = parseInt(this.player.roll) -  parseInt(this.player.modifier)
        this.inputRerollEl.value = this.player.reroll?  this.player.reroll - this.player.modifier : "x"
    }
}
