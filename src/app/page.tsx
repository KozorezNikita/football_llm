import { getAllLeagues } from "@/lib/data/queries";
import { LeagueSplitPanels } from "@/components/league/LeagueSplitPanels";

export default async function HomePage() {
  const leagues = await getAllLeagues();
  return <LeagueSplitPanels leagues={leagues} />;
}
