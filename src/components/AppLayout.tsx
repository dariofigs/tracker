import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CheckinProvider, useCheckin } from '../features/checkin/CheckinContext'
import LoadingCards from '../features/today/LoadingCards'
import OfflineBanner from './OfflineBanner'
import { AppShell, BottomNav, Button } from './ui'
import type { NavItem } from './ui'
import { periodFor } from '../lib/dates'
import { useMorningCutoff } from '../lib/preferences'

const items: NavItem[] = [
  { id: '/', label: 'Today', icon: 'today' },
  { id: '/insights', label: 'Insights', icon: 'insights' },
  { id: '/settings', label: 'Settings', icon: 'settings' },
]

function RapidCheckinButton() {
  const { openCheckin } = useCheckin()
  const label =
    periodFor(new Date(), useMorningCutoff()) === 'AM'
      ? 'Morning check-in'
      : 'Evening check-in'
  return (
    <div className="mb-[1.2rem]">
      <Button fullWidth onClick={() => openCheckin()}>
        {label}
      </Button>
    </div>
  )
}

/** Shell plus the three-tab nav; every signed-in screen renders in the Outlet. */
function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active = items.find((i) => i.id !== '/' && pathname.startsWith(i.id))?.id ?? '/'

  return (
    <CheckinProvider>
      <AppShell
        navRaised={active === '/'}
        nav={
          <>
            {active === '/' && <RapidCheckinButton />}
            <BottomNav items={items} value={active} onChange={(id) => navigate(id)} />
          </>
        }
      >
        <OfflineBanner />
        <Suspense fallback={<LoadingCards label="Loading" />}>
          <Outlet />
        </Suspense>
      </AppShell>
    </CheckinProvider>
  )
}

export default AppLayout
