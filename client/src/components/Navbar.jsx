import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/dashboard" className={styles.logo}>FinDash</Link>
      <div className={styles.right}>
        {user && <span className={styles.user}>{user.username}</span>}
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  )
}
