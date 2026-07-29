import styles from "../authLayout.module.css";
import { AuthForm } from "@/components/AuthForm";
import { logger } from "@/lib/logger";

export default function SignIn() {
  logger.info("Sign in / create account page rendered on the server");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AuthForm />
      </main>
    </div>
  );
}
