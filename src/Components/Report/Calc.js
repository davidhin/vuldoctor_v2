// sort array ascending
export const asc = (arr) => arr.sort((a, b) => a - b);

export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const mean = (arr) => sum(arr) / arr.length;

// sample standard deviation
export const std = (arr) => {
  const mu = mean(arr);
  const diffArr = arr.map((a) => (a - mu) ** 2);
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

export const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export const q25 = (arr) => quantile(arr, 0.25);

export const q50 = (arr) => quantile(arr, 0.5);

export const q75 = (arr) => quantile(arr, 0.75);

export const median = (arr) => q50(arr);

export const min = (arr) => Math.min(...arr);
export const max = (arr) => Math.max(...arr);

export const calcBoxPlotVals = (arr, name) => {
  let data = {};
  data["lower"] = min(arr);
  data["q1"] = q25(arr) - 0.1;
  data["median"] = median(arr);
  data["q3"] = q75(arr) + 0.1;
  data["upper"] = max(arr);
  data["mean"] = mean(arr).toFixed(2);
  data["name"] = name;
  return data;
};
