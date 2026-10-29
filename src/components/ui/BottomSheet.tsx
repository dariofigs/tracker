import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Pinned under the scrolling body, e.g. dismiss and save buttons. */
  footer?: ReactNode
}

/** Drag distance (px) past which releasing the handle dismisses the sheet. */
const DISMISS_DISTANCE = 96

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number } | null>(null)
  const [offset, setOffset] = useState(0)

  // Focus handling: move focus in on open, give it back on close, and stop the page behind scrolling.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheetRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const items = Array.from(sheetRef.current!.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === sheetRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    drag.current = { startY: e.clientY }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (drag.current) setOffset(Math.max(0, e.clientY - drag.current.startY))
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    const distance = Math.max(0, e.clientY - drag.current.startY)
    drag.current = null
    setOffset(0)
    if (distance >= DISMISS_DISTANCE) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="bg-text-primary/40 absolute inset-0"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="sheet-enter rounded-t-sheet bg-surface-card absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] max-w-[43rem] flex-col shadow-lg outline-none"
        style={{
          transform: offset ? `translateY(${offset}px)` : undefined,
        }}
      >
        {/* Grab area: swipe down to dismiss. Taps on the scrim or Escape work too. */}
        <div
          className="flex shrink-0 touch-none flex-col items-center px-[1.6rem] pt-[1.2rem]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            aria-hidden="true"
            className="bg-bead-stone h-[0.4rem] w-[4rem] rounded-full"
          />
          <h2 id={titleId} className="text-section text-text-primary w-full py-[1.2rem]">
            {title}
          </h2>
        </div>
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-[1.6rem] ${
            footer ? 'pb-[1.6rem]' : 'pb-[max(1.6rem,env(safe-area-inset-bottom))]'
          }`}
        >
          {children}
        </div>
        {footer && (
          <div className="border-border-subtle flex shrink-0 gap-[1.2rem] border-t px-[1.6rem] pt-[1.2rem] pb-[max(1.2rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default BottomSheet
