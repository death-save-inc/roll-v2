export class SaveSlot {
    constructor(slotName) {
        this.slotName = slotName;
        this.storageKey = slotName; // actual key used in localStorage (may be namespaced by manager)
        this.data = {
            players :[],
        }
    }

    async get(key) {
        return this.data[key] || null;
    }

    set(path, value) {
        const keys = path.split('.');
        let current = this.data;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    async save(data) {
        // Create a JSON-only clone to ensure we persist plain data (strip methods, class instances)
        const key = this.storageKey || this.slotName;
        try {
            let serialized;
            try {
                serialized = JSON.stringify(data);
            } catch (err) {
                // possible circular reference or unserializable content; attempt a safe clone that strips functions
                try {
                    const replacer = (k, v) => (typeof v === 'function' ? undefined : v);
                    serialized = JSON.stringify(data, replacer);
                } catch (err2) {
                    console.error(`SaveSlot.save: failed to serialize data for slot ${this.slotName}`, err2);
                    return false;
                }
            }

            // log what's being written
            console.debug(`SaveSlot.save -> key: ${key}, payload length: ${serialized.length}`);

            // persist the serialized payload
            localStorage.setItem(key, serialized);

            // store a clean parsed copy in memory so subsequent mutations don't include class instances
            try {
                this.data = JSON.parse(serialized);
            } catch (err) {
                // fallback: keep original data if parse fails
                this.data = data;
            }

            return true;
        } catch (error) {
            console.error(`Failed to save data to slot ${this.slotName}:`, error);
            return false;
        }
    }

    async load() {
        try {
            const key = this.storageKey || this.slotName;
            const data = localStorage.getItem(key);
            if (data) {
                this.data = JSON.parse(data);
                return this.data;
            } else {
                console.warn(`No data found in slot ${this.slotName}`);
                return null;
            }
        } catch (error) {
            console.error(`Failed to load data from slot ${this.slotName}:`, error);
            return null;
        }
    }

    async clear() {
        try {
            const key = this.storageKey || this.slotName;
            localStorage.removeItem(key);
            this.data = {};
        } catch (error) {
            console.error(`Failed to clear data from slot ${this.slotName}:`, error);
        }
    }

    serialize() {
        return JSON.stringify(this.data);
    }

    static deserialize(serializedData) {
        const slot = new SaveSlot("default");
        try {
            slot.data = JSON.parse(serializedData);
            return slot;
        } catch (error) {
            console.error("Failed to deserialize data:", error);
            return null;
        }
    }
}

export class LocalStorageManager {
    static instance = null;

    constructor(saveSlotName = "default") {
        if (LocalStorageManager.instance) {
            return LocalStorageManager.instance; // Prevent new instance
        }

        this.slots = {};
        this.saveSlotName = saveSlotName;
        // rootKey is the fixed namespace used for persistence. It must not change when switching active slots.
        this.rootKey = saveSlotName;
        
        this.init();

        LocalStorageManager.instance = this; // Save singleton reference
    }

    static getInstance(saveSlotName = "default") {
        if (!LocalStorageManager.instance) {
            LocalStorageManager.instance = new LocalStorageManager(saveSlotName);
        }
        return LocalStorageManager.instance;
    }

    init() {
        // Load active pointer first (if present)
        try {
            const active = localStorage.getItem(`${this.rootKey}_active`);
            if (active) {
                this.saveSlotName = active;
            }
        } catch (err) {
            // ignore
        }

        const slots = this.getAllSlotsFromStorage();
        if (Object.keys(slots).length === 0) {
            // ensure the default slot exists
            this.createSlot(this.saveSlotName);
        } else {
            this.slots = slots;
        }

        console.table(this.slots);
    }

    createSlot(slotName) {
        if (this.slots[slotName]) {
            console.warn(`Slot ${slotName} already exists. Overwriting.`);
        }
        const slot = new SaveSlot(slotName);
        // set logical name on the SaveSlot instance for UI/consumers
        slot.slotName = slotName;
        // namespaced key: always use rootKey_<slotName> for slot persistence
        slot.storageKey = `${this.rootKey}_${slotName}`;

        // Initialize players for the new slot.
        // - If there's an existing current save with players, copy those into the new slot.
        // - Otherwise, create a default set of 5 placeholder player JSON objects.
        try {
            const currentSave = this.getCurrentSave();
            const currentPlayers = currentSave && currentSave.data && Array.isArray(currentSave.data.players) && currentSave.data.players.length ? JSON.parse(JSON.stringify(currentSave.data.players)) : null;
            if (currentPlayers) {
                slot.data.players = currentPlayers;
            } else {
                const defaultPlayers = [];
                for (let i = 1; i <= 5; i++) {
                    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? `player-${crypto.randomUUID()}` : `player-${Date.now()}-${Math.floor(Math.random()*100000)}`;
                    defaultPlayers.push({
                        name: `Player ${i}`,
                        uuid: uuid,
                        imageSrc: null,
                        type: 'player',
                        modifier: 0,
                        color: 0xff00ff
                    });
                }
                slot.data.players = defaultPlayers;
            }
        } catch (err) {
            console.warn('Failed to initialize players for new slot, defaulting to empty players array', err);
            slot.data.players = [];
        }

        this.slots[slotName] = slot;
        // persist initial empty data for the slot so it shows up in storage
        try {
            console.debug(`createSlot: persisting new slot '${slotName}' -> key '${slot.storageKey}'`, slot.data);
            slot.save(slot.data);
        } catch (err) {
            console.error('Failed to persist new slot:', err);
        }
        return this.slots[slotName];
    }

    async deleteSlot(slotName) {
        if (!slotName) {
            console.warn('deleteSlot called without a slotName');
            return false;
        }

        // determine the actual storage key used for this slot (use namespaced key)
        const storageKey = `${this.rootKey}_${slotName}`;

        // if a slot instance is tracked in memory, clear and remove it
        const existing = this.slots[slotName];
        if (existing) {
            try {
                await existing.clear();
            } catch (err) {
                console.warn(`Failed to clear slot instance ${slotName}:`, err);
            }
            delete this.slots[slotName];
        }

        // always remove the localStorage entry (in case it existed but wasn't tracked)
        try {
            localStorage.removeItem(storageKey);
        } catch (err) {
            console.error(`Failed to remove localStorage key ${storageKey}:`, err);
        }

        // If we deleted the current save slot, clear active pointer and fall back to root default
        if (slotName === this.saveSlotName) {
            try {
                localStorage.removeItem(`${this.rootKey}_active`);
            } catch (err) {}
            // set saveSlotName back to root default and ensure it exists
            this.saveSlotName = this.saveSlotName || 'default';
            if (!this.slots[this.saveSlotName]) {
                this.createSlot(this.saveSlotName);
            }
        }

        return true;
    }

    // Set a slot as the current active save slot. Loads/registers the slot if needed and persists it
    async setCurrentSlot(slotName) {
        if (!slotName) {
            return Promise.reject(new Error('setCurrentSlot called without a slotName'));
        }

        // If we already track it, fine. Otherwise try to load from storage or create it.
        if (!this.slots[slotName]) {
            // attempt to load it if present in storage
            const namespacedKey = `${this.rootKey}_${slotName}`;
            try {
                const raw = localStorage.getItem(namespacedKey);
                if (raw) {
                    const slot = new SaveSlot(slotName);
                    slot.slotName = slotName;
                    slot.storageKey = namespacedKey;
                    slot.data = JSON.parse(raw);
                    this.slots[slotName] = slot;
                } else {
                    // create slot if not found
                    await this.createSlot(slotName);
                }
            } catch (err) {
                console.warn(`Failed to load slot ${slotName}:`, err);
                await this.createSlot(slotName);
            }
        }

        this.saveSlotName = slotName;
        try {
            localStorage.setItem(`${this.rootKey}_active`, slotName);
        } catch (err) {
            console.warn('Failed to persist active slot pointer:', err);
        }
        return this.slots[slotName] || null;
    }

    getSlot(slotName) {
        return this.slots[slotName] || null;
    }

    getCurrentSave() {
        // Prefer the slot already tracked by the manager so callers get the same instance
        const existingSlot = this.getSlot(this.saveSlotName);
        if (existingSlot) {
            return existingSlot;
        }

        // load from namespaced key for the active slot
        const storageKey = `${this.rootKey}_${this.saveSlotName}`;
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const slot = new SaveSlot(this.saveSlotName);
                slot.slotName = this.saveSlotName;
                slot.storageKey = storageKey;
                slot.data = JSON.parse(raw);
                this.slots[this.saveSlotName] = slot;
                return slot;
            }
        } catch (err) {
            console.error('Failed to parse current save data:', err);
        }

        // create and register a new slot if nothing found
        const newSlot = new SaveSlot(this.saveSlotName);
        newSlot.slotName = this.saveSlotName;
        newSlot.storageKey = `${this.rootKey}_${this.saveSlotName}`;
        this.slots[this.saveSlotName] = newSlot;
        return newSlot;
    }

    //current slot data
    getData(){
        return this.slots[this.saveSlotName]?.data || null;
    }

    getDataByKey(key) {
        const slot = this.getSlot(this.saveSlotName);
        if (slot && slot.data) {
            return slot.data[key] || null;
        }
        console.warn(`Slot data not found for key: ${key}`);
        return null;
    }

    saveToExistingSlot(path, value) {
        const slot = this.getSlot(this.saveSlotName);
        if (!slot) {
            return Promise.reject(`Slot ${this.saveSlotName} does not exist.`);
        }
        console.debug(`saveToExistingSlot: path='${path}' value=`, value, `on slot='${this.saveSlotName}' (storageKey='${slot.storageKey}')`);
        slot.set(path, value);
        try {
            console.debug('saveToExistingSlot: slot data after set:', JSON.stringify(slot.data));
        } catch (e) {
            console.debug('saveToExistingSlot: slot data after set: <unserializable>');
        }
        return slot.save(slot.data);
    }

    getAllSlotsFromStorage() {
        const allSlots = {};
        const prefix = `${this.rootKey}_`;
        const activeKey = `${this.rootKey}_active`;
        for (const key in localStorage) {
            // Only consider keys that belong to our namespace
            if (!localStorage.hasOwnProperty(key) || !key.startsWith(prefix)) continue;

            // Skip the reserved active pointer key — it is not a slot
            if (key === activeKey) continue;

            const slotName = key.replace(prefix, "");
            if (!slotName) continue; // defensive

            const slot = new SaveSlot(slotName);
            try {
                const raw = localStorage.getItem(key);
                if (raw) {
                    // Attempt to parse JSON; if it's not valid JSON, fall back to storing raw under .data
                    try {
                        slot.data = JSON.parse(raw);
                    } catch (err) {
                        console.warn(`getAllSlotsFromStorage: non-JSON payload for key ${key}, storing raw value under .data`);
                        slot.data = { raw: raw };
                    }
                }
            } catch (err) {
                console.error(`Failed to parse slot data for key ${key}:`, err);
            }
            slot.storageKey = key;
            slot.slotName = slotName;
            allSlots[slotName] = slot;
        }
        return allSlots;
    }

    async saveCurrentSlot() {
        const slot = this.getSlot(this.saveSlotName);
        if (!slot) {
            console.error(`Slot ${this.saveSlotName} does not exist.`);
            return Promise.reject(`Slot ${this.saveSlotName} does not exist.`);
        }
        return slot.save(slot.data);
    }

    async saveAll() {
        for (const slot of Object.values(this.slots)) {
            await slot.save(slot.data);
        }
    }

    async loadAll() {
        for (const slot of Object.values(this.slots)) {
            await slot.load();
        }
    }
}
