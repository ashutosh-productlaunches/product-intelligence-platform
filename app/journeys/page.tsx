// /journeys — the list of journeys lives on the home page.
import { redirect } from "next/navigation";

export default function JourneysIndex() {
  redirect("/#journeys");
}
