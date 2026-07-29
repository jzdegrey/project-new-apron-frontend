import Link from "next/link";
import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.brand}>
        Project New Apron
      </Link>
      <nav className={styles.links} aria-label="Primary">
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="/sign-in" className={styles.signInLink}>
          Sign In / Create Account
        </Link>
      </nav>
    </header>
  );
}
