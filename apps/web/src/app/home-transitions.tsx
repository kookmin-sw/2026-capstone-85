'use client';

import { useEffect } from 'react';

import styles from './page.module.css';

export function HomeTransitions() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(`.${styles.page}`);
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-home-reveal]'),
    );

    if (!page || revealTargets.length === 0) return;

    page.classList.add(styles.transitionsReady);

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add(styles.isVisible));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.isVisible);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    revealTargets.forEach((element) => {
      element.style.removeProperty('--home-reveal-delay');
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
