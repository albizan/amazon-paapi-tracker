export const chunk = (input, size: number): any[][] => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

export const percentageDiff = (a: number, b: number) => {
  return ((b - a) * 100) / b;
};
