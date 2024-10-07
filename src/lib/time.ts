export function delay(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export function isMoreThanOneHourPast(givenDate: Date) {
  const currentTime = new Date();
  const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

  return givenDate < oneHourAgo;
}
export function isMoreThanOneDayPast(givenDate: Date) {
  const currentTime = new Date();
  const oneDayAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

  return givenDate < oneDayAgo;
}
