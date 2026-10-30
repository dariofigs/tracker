import { ICONS, type IconName } from './iconSet'

type IconProps = {
  name: IconName
  /** Bold Duotone, for the active or filled state. */
  bold?: boolean
  /** Pixel size; defaults to 20. */
  size?: number
  className?: string
}

/** Decorative icon in the current text color. The label next to it carries the meaning. */
function Icon({ name, bold = false, size = 20, className }: IconProps) {
  const Glyph = ICONS[name][bold ? 'bold' : 'line']
  return <Glyph aria-hidden="true" size={size} className={className} />
}

export default Icon
