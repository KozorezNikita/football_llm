import { getAllLeagues } from "@/lib/data/queries";
import { LeagueSplitPanels } from "@/components/league/LeagueSplitPanels";

// читає БД на кожен запит — без статичного пререндеру на білді
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const leagues = await getAllLeagues();
  return <LeagueSplitPanels leagues={leagues} />;
}
