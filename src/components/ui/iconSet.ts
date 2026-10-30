import type { ComponentType, SVGProps } from 'react'
import { Chart2Icon as ChartBold } from '@solar-icons/react/bold-duotone/chart-2'
import { ClockCircleIcon as ClockBold } from '@solar-icons/react/bold-duotone/clock-circle'
import { SunIcon as SunBold } from '@solar-icons/react/bold-duotone/sun'
import { SettingsIcon as SettingsBold } from '@solar-icons/react/bold-duotone/settings'
import { AddIcon as AddLinear } from '@solar-icons/react/linear/add'
import { AltArrowLeftIcon as PrevLinear } from '@solar-icons/react/linear/alt-arrow-left'
import { AltArrowRightIcon as NextLinear } from '@solar-icons/react/linear/alt-arrow-right'
import { CheckIcon as CheckLinear } from '@solar-icons/react/linear/check'
import { Chart2Icon as ChartLine } from '@solar-icons/react/line-duotone/chart-2'
import { ClockCircleIcon as ClockLine } from '@solar-icons/react/line-duotone/clock-circle'
import { SunIcon as SunLine } from '@solar-icons/react/line-duotone/sun'
import { SettingsIcon as SettingsLine } from '@solar-icons/react/line-duotone/settings'

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number | string }
type Glyph = ComponentType<GlyphProps>

/** Solar icons (480 Design, CC BY 4.0). Line Duotone by default; Bold Duotone marks the active state. */
export const ICONS = {
  today: { line: SunLine, bold: SunBold },
  insights: { line: ChartLine, bold: ChartBold },
  settings: { line: SettingsLine, bold: SettingsBold },
  // Plain Linear (no duotone layer) so the marks stay crisp at small sizes
  check: { line: CheckLinear, bold: CheckLinear },
  add: { line: AddLinear, bold: AddLinear },
  prev: { line: PrevLinear, bold: PrevLinear },
  next: { line: NextLinear, bold: NextLinear },
  clock: { line: ClockLine, bold: ClockBold },
} satisfies Record<string, { line: Glyph; bold: Glyph }>

export type IconName = keyof typeof ICONS
export const ICON_NAMES = Object.keys(ICONS) as IconName[]
