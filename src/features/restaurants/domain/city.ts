const CITY_ALIASES: Record<string, string> = {
  "ho-chi-minh-city": "ho-chi-minh",
};

export const cityLabels: Record<string, string> = {
  "ho-chi-minh": "Ho Chi Minh City",
  hanoi: "Hanoi",
  "da-nang": "Da Nang",
};

export function normalizeCitySlug(slug: string) {
  return CITY_ALIASES[slug] ?? slug;
}

export function matchesCitySlug(restaurantCity: string, requestedCity: string) {
  return normalizeCitySlug(restaurantCity) === normalizeCitySlug(requestedCity);
}
