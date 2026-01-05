export function timeAgoFa(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();

  if (Number.isNaN(then.getTime())) return "نامشخص";

  const sec = Math.floor(diffMs / 1000);
  if (sec < 15) return "همین حالا";
  if (sec < 60) return `${sec} ثانیه پیش`;

  const min = Math.floor(sec / 60);
  if (min === 1) return "۱ دقیقه پیش";
  if (min < 60) return `${min} دقیقه پیش`;

  const hr = Math.floor(min / 60);
  if (hr === 1) return "۱ ساعت پیش";
  if (hr < 24) return `${hr} ساعت پیش`;

  const day = Math.floor(hr / 24);
  if (day === 1) return "۱ روز پیش";
  if (day < 30) return `${day} روز پیش`;

  const month = Math.floor(day / 30);
  if (month === 1) return "۱ ماه پیش";
  if (month < 12) return `${month} ماه پیش`;

  const year = Math.floor(month / 12);
  if (year === 1) return "۱ سال پیش";
  return `${year} سال پیش`;
}
