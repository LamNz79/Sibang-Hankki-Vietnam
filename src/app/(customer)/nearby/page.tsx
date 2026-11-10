import { NearbyMapScreen } from "@/features/restaurants/components/nearby-map-screen";
import { getRestaurants } from "@/features/restaurants/data/api";

export default async function NearbyPage() {
  return <NearbyMapScreen restaurants={await getRestaurants()} />;
}
