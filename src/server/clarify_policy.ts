export function needsClarification(confidence: number) {
  return confidence < 0.6;
}
