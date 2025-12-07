let currentAnalystIndex = 0;

export const getNextAnalystIndex = (totalAnalysts) => {
  const index = currentAnalystIndex;
  currentAnalystIndex = (currentAnalystIndex + 1) % totalAnalysts;
  return index;
};
