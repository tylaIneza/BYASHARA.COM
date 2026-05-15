import AdminTeamClient from "@/components/AdminTeamClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Byashara Store Admin",
};

export default function TeamPage() {
  return <AdminTeamClient />;
}
