import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

type Option<T extends string | number> = { value: T; label: string }

type ScrollTabsProps<T extends string | number> = {
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  /** Accessible name, e.g. "Kind of option". */
  label: string
}

/**
 * Single-choice row of chips that scrolls sideways when it does not fit. A fade on
 * the edge that still has content hints that more chips are out of view.
 * Same radio-group behavior as SegmentedControl.
 */
function ScrollTabs<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: ScrollTabsProps<T>) {
  const scroller = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [fade, setFade] = useState({ start: false, end: false })
  const selected = options.findIndex((o) => o.value === value)

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setFade({
      start: el.scrollLeft > 1,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, options.length])

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (move === undefined) return
    e.preventDefault()
    const next = (index + move + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
    refs.current[next]?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' })
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        role="radiogroup"
        aria-label={label}
        onScroll={measure}
        className="flex snap-x [scrollbar-width:none] gap-[0.8rem] overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option, i) => {
          const active = i === selected
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active || (selected === -1 && i === 0) ? 0 : -1}
              onClick={() => {
                onChange(option.value)
                refs.current[i]?.scrollIntoView?.({
                  inline: 'nearest',
                  block: 'nearest',
                  behavior: 'smooth',
                })
              }}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-touch text-body focus-visible:outline-brand-sage shrink-0 snap-start rounded-full px-[1.6rem] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                active
                  ? 'bg-brand-sage text-surface-card font-semibold'
                  : 'bg-surface-subtle text-text-muted font-medium'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <span
        aria-hidden="true"
        className={`to-surface-card pointer-events-none absolute inset-y-0 right-0 w-[6.4rem] bg-linear-to-r from-transparent transition-opacity ${
          fade.end ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <span
        aria-hidden="true"
        className={`from-surface-card pointer-events-none absolute inset-y-0 left-0 w-[3.2rem] bg-linear-to-r to-transparent transition-opacity ${
          fade.start ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export default ScrollTabs
