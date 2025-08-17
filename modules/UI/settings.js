

export class SettingsButton {
    constructor() {
        this.button = document.createElement("button");
        this.button.textContent = "Settings";
        this.button.classList.add("settings-button");
        this.bindEvents();
    }

    bindEvents() {
        this.button.addEventListener("click", () => {
            EventBus.emit("settings:toggle");
        });
    }

    render() {
        return this.button;
    }
}