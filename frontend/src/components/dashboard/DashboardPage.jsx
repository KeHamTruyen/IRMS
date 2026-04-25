import GenericDashboard from './GenericDashboard'
import ChefDashboard from './chef/ChefDashboard'
import ServerDashboard from './server/ServerDashboard'
import { getRoleMeta } from '../../constants/roles'

function DashboardPage({ session, dashboard, dashboardConfig, loadingDashboard, onSignOut }) {
  const roleMeta = getRoleMeta(session.role)

  if (session.role === 'SERVER' && dashboard) {
    return <ServerDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
  }

  if (session.role === 'CHEF' && dashboard) {
    return <ChefDashboard session={session} dashboard={dashboard} onSignOut={onSignOut} />
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
