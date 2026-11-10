export function googleMapsDirectionsUrl({
  name,
  address,
}: {
  name: string;
  address: string;
}) {
  const search = new URLSearchParams({
    api: "1",
    destination: `${name}, ${address}`,
  });

  return `https://www.google.com/maps/dir/?${search.toString()}`;
}
