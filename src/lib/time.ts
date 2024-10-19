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

export function timeAgo(date: Date) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) return `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  return `${seconds} seconds ago`;
}
