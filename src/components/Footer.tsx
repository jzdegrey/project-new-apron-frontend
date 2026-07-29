import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p>&copy; {year} Project New Apron. All rights reserved.</p>
      <nav className={styles.links} aria-label="Legal">
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </nav>
    </footer>
  );
}
