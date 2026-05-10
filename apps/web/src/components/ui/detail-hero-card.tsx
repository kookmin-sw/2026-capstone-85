import styles from "./detail-hero-card.module.css";

export function DetailHeroCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.heroWrap}>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}
