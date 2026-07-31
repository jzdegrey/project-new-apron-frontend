import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p>
        &copy; {year} Project New Apron. All rights reserved.
      </p>
      <div className={styles.links}>
        <a href="/terms-of-service">Terms of Service</a>
        <a href="/privacy-policy">Privacy Policy</a>
      </div>
    </footer>
  );
}
