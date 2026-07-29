import styles from "./page.module.css";
import { logger } from "@/lib/logger";
import { LogOnMount } from "@/components/LogOnMount";

export default function Home() {
  logger.info("Home page rendered on the server");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Project New Apron</h1>
        <p>Frontend base project structure.</p>
        <LogOnMount />
      </main>
    </div>
  );
}
