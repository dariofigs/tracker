import { ICONS, type IconName } from './iconSet'

/** Solar's own default is 1.5, which is faint at 16-20px; the bottom nav keeps it. */
const STROKE_WIDTH = 2

type IconProps = {
  name: IconName
  /** Bold Duotone, for the active or filled state. */
  bold?: boolean
  /** Pixel size; defaults to 20. */
  size?: number
  /** Line weight; defaults to 2. */
  strokeWidth?: number
  className?: string
}

/** Decorative icon in the current text color. The label next to it carries the meaning. */
function Icon({
  name,
  bold = false,
  size = 20,
  strokeWidth = STROKE_WIDTH,
  className,
}: IconProps) {
  const Glyph = ICONS[name][bold ? 'bold' : 'line']
  return (
    <Glyph
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  )
}

export default Icon
