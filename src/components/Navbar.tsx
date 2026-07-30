import Link from "next/link";
import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.brand}>
        Project New Apron
      </Link>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="/sign-in" className={styles.link}>
          Sign In / Create Account
        </Link>
      </div>
    </nav>
  );
}
