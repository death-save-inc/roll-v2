import { LoadTemplate } from "../lib/template.js";
import { EventBus } from "../lib/eventbus.js";
import { LocalStorageManager } from "../lib/manage-local-storage.js";


export class SaveSlotsUI {
    constructor() {
        this.template = null;
        this.element = null;
        this.saveSlotsListEl = null;
        this.addButtonEl = null;
        this.loadButtonEl = null;
        this.closeButtonEl = null;
        this.init();
    }

    async init() {
        this.template = await LoadTemplate("save-slots.html");
        this.createElement();
        this.findElements();
        this.bindEvents();
        this.renderSaveSlotsFromLocalStorage();

    }

    createElement() {
        this.element = document.createElement("div");
        this.element.innerHTML = this.template;
        this.element.classList.add("save-slots");
        this.element.classList.add("modal");
        // start hidden; we'll control visibility via style.display in show/hide
        this.element.style.display = 'none';
        document.body.appendChild(this.element);
    }

    findElements() {
        this.saveSlotsListEl = this.element.querySelector(".save-slots__list");
        this.addButtonEl = this.element.querySelector(".save-slots__add");
        this.loadButtonEl = this.element.querySelector(".save-slots__load");
        this.closeButtonEl = this.element.querySelector('.save-slots__close');
    }

    bindEvents() {
        EventBus.on("saveSlots:show", () => {
            this.show();
            this.renderSaveSlotsFromLocalStorage();
        });
        
        this.addButtonEl.addEventListener("click", () => {
            this.createNewSaveSlot();
            EventBus.emit('saveSlot:add', {});
        });

        this.loadButtonEl.addEventListener("click", () => {
            EventBus.emit('saveSlot:load', {});
        });

        if (this.closeButtonEl) {
            this.closeButtonEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide();
            });
        }

        // allow opening modal when user clicks the HUD settings button
        EventBus.on('hud:openSettings', () => {
            this.show();
            this.renderSaveSlotsFromLocalStorage();
        });
    }

    show() {
        // use inline style so we don't depend on an external class to exist
        this.element.style.display = 'flex';
        this.element.classList.add("save-slots__active");
    } 

    hide() {
        this.element.style.display = 'none';
        this.element.classList.remove("save-slots__active");
    }

    async createNewSaveSlot(slotName) {
        //slot name from prompt
        if (!slotName) {
            slotName = prompt("Enter a name for the new save slot:");
            if (!slotName) {
                console.warn("No slot name provided, save slot creation cancelled.");
                return;
            }
        }

        const storageManager = LocalStorageManager.getInstance();
        await storageManager.createSlot(slotName);
        this.renderSaveSlotsFromLocalStorage();
        EventBus.emit('saveSlot:created', { slotName: slotName });
    }

    async deleteSaveSlot(slotName) {
        if (!slotName) {
            console.warn("No slot name provided for deletion.");
            return;
        }
        const storageManager = LocalStorageManager.getInstance();
        await storageManager.deleteSlot(slotName);
        this.renderSaveSlotsFromLocalStorage();
    }

    async renderSaveSlotsFromLocalStorage() {
        // Logic to render save slots from local storage
        const storageManager = LocalStorageManager.getInstance();
        const saveSlots = await storageManager.getAllSlotsFromStorage();
        console.log("Rendering save slots:", saveSlots);
        this.saveSlotsListEl.innerHTML = ""; // Clear existing slots
        // getAllSlotsFromStorage may return a map/object or an array; normalize to array
        const slotsArray = Array.isArray(saveSlots) ? saveSlots : Object.values(saveSlots);
        for (const slotEntry of slotsArray) {
            console.log("Rendering save slot:", slotEntry);
            const slotEl = document.createElement("div");
            slotEl.classList.add("save-slots__item");

            // Normalize slotName and slotData for various shapes (string, SaveSlot object, plain object)
            // prefer an explicit slotName set on the SaveSlot instance (logical name)
            const slotName = (slotEntry && (slotEntry.slotName || slotEntry.name)) || (typeof slotEntry === 'string' ? slotEntry : String(slotEntry));
            slotEl.innerHTML = `<h2 class="save-slots__item-title">Slot: ${slotName}</h2>`;

            // slot.data may be missing or the slotEntry may be just a string key; try to resolve data from the entry or localStorage
            let slotData = (slotEntry && slotEntry.data) ? slotEntry.data : null;
            if (!slotData) {
                // figure out which storage key actually holds this slot's persisted data
                const storageKey = (slotEntry && slotEntry.storageKey) ? slotEntry.storageKey : (typeof slotName === 'string' ? slotName : null);
                if (storageKey) {
                    try {
                        const raw = localStorage.getItem(storageKey);
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            // some persisted shapes store data under .data, others store the full object
                            slotData = parsed && parsed.data ? parsed.data : parsed;
                        }
                    } catch (err) {
                        console.warn('Failed to parse persisted slot data for', storageKey, err);
                    }
                }
            }

            if (slotData) {
                //render card for each player in slot
                for (const player of slotData.players || []) {
                    const playerCard = document.createElement("div");
                    playerCard.classList.add("save-slots__player-card");
                    const displayName = (typeof player.name === 'string') ? player.name : (player.name && typeof player.name === 'object' && typeof player.name.name === 'string') ? player.name.name : JSON.stringify(player.name);
                    const imgSrc = (player.imageSrc && typeof player.imageSrc === 'string') ? player.imageSrc : 'default-image.png';
                  
                    playerCard.innerHTML = `<img width="50" height="50" src="${imgSrc}" alt="${displayName}"><span>${displayName}</span>`;
                    
                    slotEl.appendChild(playerCard);
                }
            }
                // data in dropdown
                const dataDropdown = document.createElement("div");
                dataDropdown.classList.add("save-slot-data");

                const header = document.createElement("div");
                header.classList.add("save-slot-data__header");
                header.textContent = "Data";

                const toggleBtn = document.createElement("button");
                toggleBtn.type = "button";
                toggleBtn.classList.add("save-slot-data__toggle");
                toggleBtn.textContent = "Show";
                header.appendChild(toggleBtn);

                const pre = document.createElement("pre");
                pre.classList.add("save-slot-data__pre");
                pre.style.display = "none";
                try {
                    pre.textContent = slotData ? JSON.stringify(slotData, null, 2) : "{}";
                } catch (err) {
                    pre.textContent = String(slotData);
                }

                dataDropdown.appendChild(header);
                dataDropdown.appendChild(pre);

                // toggle behaviour
                toggleBtn.addEventListener("click", (e) => {
                    const visible = pre.style.display !== "none";
                    pre.style.display = visible ? "none" : "block";
                    toggleBtn.textContent = visible ? "Show" : "Hide";
                });
                  const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("save-slots__delete");
                    deleteBtn.innerHTML = "Delete";
                    deleteBtn.addEventListener("click", (e) => {
                        this.deleteSaveSlot(slotName)
                        e.stopPropagation(); // Prevent the slot click event
                    });
                    slotEl.appendChild(deleteBtn);

            // create make-current button or current label
            const currentSlotName = storageManager.saveSlotName;
            const isCurrent = currentSlotName === slotName;
            if (isCurrent) {
                const currentLabel = document.createElement('span');
                currentLabel.classList.add('save-slots__current-label');
                currentLabel.textContent = 'Current';
                slotEl.appendChild(currentLabel);
            } else {
                const makeCurrentBtn = document.createElement('button');
                makeCurrentBtn.classList.add('save-slots__make-current');
                makeCurrentBtn.innerHTML = 'Make current';
                makeCurrentBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await storageManager.setCurrentSlot(slotName);
                        EventBus.emit('saveSlot:currentChanged', { slotName });
                        this.renderSaveSlotsFromLocalStorage();
                    } catch (err) {
                        console.error('Failed to set current slot', err);
                    }
                });
                slotEl.appendChild(makeCurrentBtn);
            }

                slotEl.appendChild(dataDropdown);
            

            // emit the resolved slotName when selecting a slot
            slotEl.addEventListener("click", () => {
                EventBus.emit('saveSlot:select', { slotName: slotName });
            });
            this.saveSlotsListEl.appendChild(slotEl);
        }
    }
}