export class Config {
  static instance = null;
  data = null;

  static async load() {
    if (Config.instance) return Config.instance; // already loaded

    let cfgData = null;

    // Try local config first
    try {
      const localResponse = await fetch("./config.local.json", { credentials: "same-origin" });
      if (localResponse.ok) {
        cfgData = await localResponse.json();
        console.log("Loaded local config:", cfgData);
      }
    } catch (err) {
      // Ignore fetch errors for local config
      console.log("No local config found, falling back to default", err);
    }

    // Fallback to default config
    if (!cfgData) {
      console.log("Loading default config from dungeon.json");
      const defaultResponse = await fetch("./dungeon.json", { credentials: "same-origin" });
      if (!defaultResponse.ok) throw new Error(`Failed to load config: ${defaultResponse.status}`);
      cfgData = await defaultResponse.json();
    }

    const cfg = new Config();
    cfg.data = cfgData;
    Config.instance = cfg;
    return cfg;
  }

  get(key) {
    if (!this.data) throw new Error("Config not loaded yet");
    return this.data[key];
  }
}
