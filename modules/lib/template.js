export const LoadTemplate = async (path, develop = false) => {
  if (develop) {
    return await (await fetch(`../templates/${path}`)).text();
  }
  return await (
    await fetch(`https://death-save-inc.github.io/roll-v2/templates/${path}`)
  ).text();
};

