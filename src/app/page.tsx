import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { logger } from "@/lib/logger";
import styles from "./page.module.css";

const SELL_POINTS = [
  "Plan meals for any date range and collaborate with family & friends",
  "Save and organize your favorite recipes in one place",
  "Grocery integrations with Kroger, Walmart, and Target — on the roadmap",
];

export default function Home() {
  logger.info("Landing page rendered on the server");

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Plan meals. Save recipes. Eat better — together.</h1>
          <p className={styles.subtitle}>
            Project New Apron helps you plan meals, store and share recipes, and eat better — all
            in one place.
          </p>
          <ul className={styles.sellPoints}>
            {SELL_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link href="/sign-in" className={styles.cta}>
            Sign In / Create Account
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
