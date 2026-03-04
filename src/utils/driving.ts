export function formatDistanceLabel(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

export function formatEarnedPointsLabel(points: number): string {
  return `+ ${points.toLocaleString()}`;
}

export function formatCarModel(brandName: string, modelName: string, variantName: string): string {
  const parts = [brandName, modelName, variantName].filter(Boolean);
  return parts.join(' ');
}
