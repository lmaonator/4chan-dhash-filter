const defaults = {
  initialized: false,
  hammingDistance: 10,
  hide: true,
  blur: true,
  blurStyle: "blur(8px) grayscale(0.75)",
};

export default async function () {
  const conf = await GM.getValues(defaults);
  if (conf.initialized === false) {
    conf.initialized = true;
    await GM.setValues(conf);
  }
  return conf;
}
