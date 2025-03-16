import { compress } from "../lib/compress.js";

export class RollUI {
    constructor(card) {
        this.template = null
        this.develop = true
        this.init()
    }

    async init() {
        if (this.develop){
            console.log("(re)loading template")
            this.template = await this.loadTemplate("../templates/roll-button.html")
        }else if (!this.template){
            this.template = await this.loadTemplate("https://raw.githubusercontent.com/Roll-for-Initiative/roll-v2/refs/heads/main/templates/roll-button.html")
        }
        this.createElement()
        this.findElements();
        this.findElements();
        this.bindEvents();
    }

    async show() {
        await this.init();
    }

    async loadTemplate(url) {
        return await (
            await fetch(url)
        ).text();
    }

    createElement(){
        this.element = document.createElement("div");
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

    click(){
            const event = new CustomEvent("roll", {
                bubbles: true,
            });
            document.dispatchEvent(event);
    }
    findElements() {
        this.rollBtn = this.element.querySelector(".roll-actions__button-main")
    }

    bindEvents() {
        this.rollBtn.addEventListener("click",this.click );
    }

    async render() {
      
    }
}
