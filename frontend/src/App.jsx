import { useTerminalAuth } from './hooks/useTerminalAuth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const auth = useTerminalAuth()

  if (!auth.session) {
    return <LoginPage {...auth} />
  }

  return <DashboardPage {...auth} />
}

export default App
