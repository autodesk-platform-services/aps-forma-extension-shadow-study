export type Event = { currentTarget: { value: string } };
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getTimezoneOffset = (date: Date, timeZone: string) => {
  const timezoneDate = new Date(date.toLocaleString("en", { timeZone }));
  return date.getTime() - timezoneDate.getTime();
};
