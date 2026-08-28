export const parseCelestiaString = (str: string) => {
  if (str?.startsWith('"')) {
    return JSON.parse(str);
  }
  return str;
};
