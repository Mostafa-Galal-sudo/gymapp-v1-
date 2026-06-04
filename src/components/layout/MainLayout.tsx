import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Salad, User, Accessibility } from 'lucide-react';
import styles from './MainLayout.module.css';
import { useT } from '../../hooks/useT';

const MainLayout = () => {
  const t = useT();
  const NAV = [
    { to: '/dashboard', labelKey: 'nav.home',    Icon: LayoutDashboard },
    { to: '/workout',   labelKey: 'nav.train',   Icon: Dumbbell },
    { to: '/muscles',   labelKey: 'nav.anatomy', Icon: Accessibility },
    { to: '/nutrition', labelKey: 'nav.fuel',    Icon: Salad },
    { to: '/profile',   labelKey: 'nav.profile', Icon: User },
  ] as const;

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.nav}>
        {NAV.map(({ to, labelKey, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>
              <Icon size={22} strokeWidth={2} />
            </span>
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
