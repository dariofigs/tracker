import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  /** Floating bottom nav (4.2). Pinned above the home indicator. */
  nav?: ReactNode
  /** Extra room above the nav for a button stacked on top of it. */
  navRaised?: boolean
}

/**
 * Linen canvas with safe-area insets. On a phone it fills the screen; on a
 * wide desktop window the content stays in a centered phone-width column.
 */
function AppShell({ children, nav, navRaised = false }: AppShellProps) {
  return (
    <div className="bg-canvas-bg min-h-dvh">
      <div className="relative mx-auto min-h-dvh w-full max-w-[48rem] pt-[env(safe-area-inset-top)] pr-[max(1.6rem,env(safe-area-inset-right))] pl-[max(1.6rem,env(safe-area-inset-left))]">
        <main
          className={
            nav
              ? navRaised
                ? 'pb-[calc(16rem+env(safe-area-inset-bottom))]'
                : 'pb-[calc(10rem+env(safe-area-inset-bottom))]'
              : 'pb-[max(1.6rem,env(safe-area-inset-bottom))]'
          }
        >
          {children}
        </main>
        {nav && (
          <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.6rem,env(safe-area-inset-bottom))] z-20">
            <div className="pointer-events-auto mx-auto w-full max-w-[48rem] px-[max(1.6rem,env(safe-area-inset-left))]">
              {nav}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppShell
