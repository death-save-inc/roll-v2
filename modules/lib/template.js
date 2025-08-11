import { Config } from "./config.js";

export const LoadTemplate = async (path) => {
  const develop = Config.instance.get("develop");
  if (develop) {
    return await (await fetch(`../templates/${path}`)).text();
  }
  const domain = Config.instance.get("domain");
  if (!domain) {
    throw new Error("Domain not set in config");
  }

  return await (
    await fetch(`${domain}/${path}`)
  ).text();
};
