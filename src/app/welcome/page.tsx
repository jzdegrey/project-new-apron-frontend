import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import styles from "../page.module.css";

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await backendGetCurrentUser(token) : null;

  if (!user) {
    redirect("/");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Welcome, {user.first_name}!</h1>
        <p>You&apos;re signed in as {user.username}.</p>
      </main>
    </div>
  );
}
