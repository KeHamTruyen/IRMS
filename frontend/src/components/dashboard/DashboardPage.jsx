import GenericDashboard from './GenericDashboard'
import AdminDashboard from './admin/AdminDashboard'
import ChefDashboard from './chef/ChefDashboard'
import ServerDashboard from './server/ServerDashboard'
import ManagerDashboard from './manager/ManagerDashboard'
import HostDashboard from './host/HostDashboard'
import { getRoleMeta } from '../../constants/roles'

function DashboardPage({ session, dashboard, dashboardConfig, loadingDashboard, onSignOut }) {
  const roleMeta = getRoleMeta(session.role)

  if (session.role === 'SERVER' && dashboard) {
    return <ServerDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
  }

  if (session.role === 'CHEF' && dashboard) {
    return <ChefDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
  }

  if (session.role === 'ADMIN' && dashboard) {
    return <AdminDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
  }

  if (session.role === 'MANAGER' && dashboard) {
    return <ManagerDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
  }

  if (session.role === 'HOST' && dashboard) {
    return <HostDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
  }

  return (
    <GenericDashboard
      session={session}
      dashboard={dashboard}
      dashboardConfig={dashboardConfig}
      roleMeta={roleMeta}
      loadingDashboard={loadingDashboard}
      onSignOut={onSignOut}
    />
  )
}

export default DashboardPage
