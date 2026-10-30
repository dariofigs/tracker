import type { ComponentType, SVGProps } from 'react'
import { AddIcon as AddBold } from '@solar-icons/react/bold-duotone/add'
import { AltArrowLeftIcon as PrevBold } from '@solar-icons/react/bold-duotone/alt-arrow-left'
import { AltArrowRightIcon as NextBold } from '@solar-icons/react/bold-duotone/alt-arrow-right'
import { CheckIcon as CheckBold } from '@solar-icons/react/bold-duotone/check'
import { Chart2Icon as ChartBold } from '@solar-icons/react/bold-duotone/chart-2'
import { ClockCircleIcon as ClockBold } from '@solar-icons/react/bold-duotone/clock-circle'
import { SunIcon as SunBold } from '@solar-icons/react/bold-duotone/sun'
import { Tuning2Icon as TuningBold } from '@solar-icons/react/bold-duotone/tuning-2'
import { AddIcon as AddLine } from '@solar-icons/react/line-duotone/add'
import { AltArrowLeftIcon as PrevLine } from '@solar-icons/react/line-duotone/alt-arrow-left'
import { AltArrowRightIcon as NextLine } from '@solar-icons/react/line-duotone/alt-arrow-right'
import { CheckIcon as CheckLine } from '@solar-icons/react/line-duotone/check'
import { Chart2Icon as ChartLine } from '@solar-icons/react/line-duotone/chart-2'
import { ClockCircleIcon as ClockLine } from '@solar-icons/react/line-duotone/clock-circle'
import { SunIcon as SunLine } from '@solar-icons/react/line-duotone/sun'
import { Tuning2Icon as TuningLine } from '@solar-icons/react/line-duotone/tuning-2'

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number | string }
type Glyph = ComponentType<GlyphProps>

/** Solar icons (480 Design, CC BY 4.0). Line Duotone by default; Bold Duotone marks the active state. */
export const ICONS = {
  today: { line: SunLine, bold: SunBold },
  insights: { line: ChartLine, bold: ChartBold },
  settings: { line: TuningLine, bold: TuningBold },
  check: { line: CheckLine, bold: CheckBold },
  add: { line: AddLine, bold: AddBold },
  prev: { line: PrevLine, bold: PrevBold },
  next: { line: NextLine, bold: NextBold },
  clock: { line: ClockLine, bold: ClockBold },
} satisfies Record<string, { line: Glyph; bold: Glyph }>

export type IconName = keyof typeof ICONS
export const ICON_NAMES = Object.keys(ICONS) as IconName[]
