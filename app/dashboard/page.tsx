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

  // Run these three reads in parallel since they don't depend on each other.
  const [connected, data, subResult] = await Promise.all([
    hasSpotifyConnection(supabase, user.id),
    getSpotifyData(user.id),
    supabase.from("subscriptions").select("tier").eq("user_id", user.id).maybeSingle(),
  ])

  // Default to "free" if no subscription row exists yet.
  const isPro = subResult.data?.tier === "pro"

  return <DashboardClient connected={connected} data={data} isPro={isPro} />
}