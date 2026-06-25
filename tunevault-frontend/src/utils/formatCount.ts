export const formatCount = (count?: number | null) => {
  const value = Number(count || 0);

  if (value < 1000) return value.toString();

  if (value < 1_000_000) {
    const result = value / 1000;
    return `${Number.isInteger(result) ? result.toFixed(0) : result.toFixed(1)}K`;
  }

  const result = value / 1_000_000;
  return `${Number.isInteger(result) ? result.toFixed(0) : result.toFixed(1)}M`;
};

export const formatDuration = (seconds?: number | null) => {
  const value = Number(seconds || 0);
  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};
