import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return session;
}
