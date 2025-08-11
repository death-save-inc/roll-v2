import { compress } from "../lib/compress.js";
import { EventBus } from "../lib/eventbus.js";

export class RollUI {
  constructor(card) {
    this.template = null;
    this.develop = true;
    this.init();
  }

  async init() {
    if (this.develop) {
      this.template = await this.loadTemplate("../templates/roll-button.html");
    } else if (!this.template) {
      this.template = await this.loadTemplate(
        "https://raw.githubusercontent.com/death-save-inc/roll-v2/refs/heads/main/templates/roll-button.html"
      );
    }
    this.createElement();
    this.findElements();
    this.findElements();
    this.bindEvents();
  }

  async show() {
    await this.init();
  }

  async loadTemplate(url) {
    return await (await fetch(url)).text();
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.innerHTML = this.template;
    document.body.appendChild(this.element);
  }

  hide(e) {
    this.element.style.display = "none";
    setTimeout(() => {
      const event = new CustomEvent("raycaster:active", {
        bubbles: true,
      });
      document.dispatchEvent(event);
    }, 500);
  }

  show(e) {
    this.element.style.display = "unset";
  }

  click() {
    EventBus.emit('spell:cast',{});
    this.hide()
  }
  
  findElements() {
    this.rollBtn = this.element.querySelector(".roll-actions__button-main");
  }

  bindEvents() {
    EventBus.on("roll:complete", () => {
      this.show();
    })
    this.rollBtn.addEventListener("click", this.click.bind(this));
  }

  async render() {}
}
