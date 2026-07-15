/**
 * components/Navbar.jsx
 * -----------------------------------------------------------------------
 * Top navigation bar shown on both dashboards. Displays the DeskFlow
 * mark, the signed-in user's identity/role, and a sign-out control.
 * -----------------------------------------------------------------------
 */

import useAuth from '../hooks/useAuth';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const { username, role, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          DF
        </span>
        <span className={styles.brandName}>DeskFlow</span>
        <span className={styles.brandSub}>IT Service Desk</span>
      </div>

      <div className={styles.session}>
        <div className={styles.identity}>
          <span className={styles.username}>{username}</span>
          <span className={styles.role}>{role === 'admin' ? 'Administrator' : 'Employee'}</span>
        </div>
        <button type="button" className={styles.signOut} onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
