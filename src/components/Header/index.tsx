import Link from 'next/link';
import styles from './header.module.scss';
export default function Header() {
  return (
      <section className={styles.logo}>
        <Link href={'/'}>
          <img src="/logo.svg" alt="logo" />
        </Link>
      </section>
  )
}
