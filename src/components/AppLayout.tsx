import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppShell, BottomNav, InsightsIcon, SettingsIcon, TodayIcon } from './ui'
import type { NavItem } from './ui'

const items: NavItem[] = [
  { id: '/', label: 'Today', icon: TodayIcon },
  { id: '/insights', label: 'Insights', icon: InsightsIcon },
  { id: '/settings', label: 'Settings', icon: SettingsIcon },
]

/** Shell plus the three-tab nav; every signed-in screen renders in the Outlet. */
function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active = items.find((i) => i.id !== '/' && pathname.startsWith(i.id))?.id ?? '/'

  return (
    <AppShell
      nav={<BottomNav items={items} value={active} onChange={(id) => navigate(id)} />}
    >
      <Outlet />
    </AppShell>
  )
}

export default AppLayout
