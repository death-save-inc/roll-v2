import { EventBus } from "../lib/eventbus.js";
import { LoadTemplate } from "../lib/template.js";
import { Config } from "../lib/config.js";

export class RollUI {
  constructor() {
    this.template = null;
    this.develop = Config.instance.get("develop");
    this.init();
  }

  async init() {
    this.template = await LoadTemplate("roll-button.html");
    this.createElement();
    this.findElements();
    this.bindEvents();
  }

  async show() {
    await this.init();
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.innerHTML = this.template;
    this.element.classList.add("roll-actions")
    const parent = document.querySelector(".hud");
    if (!parent) {
      console.error("No parent element found for RollUI");
      return;
    }
    parent.appendChild(this.element);
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
    this.element.style.display = "";
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
