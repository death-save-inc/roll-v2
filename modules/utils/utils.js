export const randomRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const delayAndAWait = (callback, time) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(callback());
    }, time);
  });
};

export const waitForActionToFinish =(action)=>{
  return new Promise(async (resolve, _) => {
     action(resolve)
  })
}