import styles from "../company-detail.module.css";

interface IconInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function IconInfo({ icon, label, value }: IconInfoProps) {
  return (
    <div>
      <p className={`${styles.infoLabel} ${styles.iconInfoLabel}`}>
        <span className={styles.iconInfo}>{icon}</span>
        {label}
      </p>
      <p className={styles.infoValue}>{value}</p>
    </div>
  );
}
