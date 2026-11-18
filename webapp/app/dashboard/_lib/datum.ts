export function datumSleutel(datum: Date) {
  return [
    datum.getFullYear(),
    String(datum.getMonth() + 1).padStart(2, "0"),
    String(datum.getDate()).padStart(2, "0"),
  ].join("-");
}

export function startVanWeek(datum: Date) {
  const maandag = new Date(datum);
  maandag.setDate(datum.getDate() - ((datum.getDay() + 6) % 7));
  return maandag;
}
