export class Config {
  static instance = null;
  data = null;

  static async load(url ="./dungeon.json") {
    if (Config.instance) return Config.instance; // already loaded

    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
    
    const cfg = new Config();
    cfg.data = await response.json();
    Config.instance = cfg;
    return cfg;
  }

  get(key) {
    if (!this.data) throw new Error("Config not loaded yet");
    return this.data[key];
  }
}
