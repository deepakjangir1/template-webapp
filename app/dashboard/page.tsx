import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getSpotifyData, hasSpotifyConnection } from "@/lib/spotify-data"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const connected = await hasSpotifyConnection(supabase, user.id)
  const data = await getSpotifyData(user.id)

  return <DashboardClient connected={connected} data={data} />
}