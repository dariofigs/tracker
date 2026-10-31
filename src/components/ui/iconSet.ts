import type { ComponentType, SVGProps } from 'react'
import { Chart2Icon as ChartBold } from '@solar-icons/react/bold-duotone/chart-2'
import { ClockCircleIcon as ClockBold } from '@solar-icons/react/bold-duotone/clock-circle'
import { SunIcon as SunBold } from '@solar-icons/react/bold-duotone/sun'
import { SettingsIcon as SettingsBold } from '@solar-icons/react/bold-duotone/settings'
import { CalendarMarkIcon as CalendarBold } from '@solar-icons/react/bold-duotone/calendar-mark'
import { FireIcon as FireBold } from '@solar-icons/react/bold-duotone/fire'
import { AddIcon as AddLinear } from '@solar-icons/react/linear/add'
import { AltArrowDownIcon as DownLinear } from '@solar-icons/react/linear/alt-arrow-down'
import { AltArrowUpIcon as UpLinear } from '@solar-icons/react/linear/alt-arrow-up'
import { CalendarMarkIcon as CalendarLine } from '@solar-icons/react/line-duotone/calendar-mark'
import { FireIcon as FireLine } from '@solar-icons/react/line-duotone/fire'
import { AltArrowLeftIcon as PrevLinear } from '@solar-icons/react/linear/alt-arrow-left'
import { AltArrowRightIcon as NextLinear } from '@solar-icons/react/linear/alt-arrow-right'
import { CheckIcon as CheckLinear } from '@solar-icons/react/linear/check'
import { Chart2Icon as ChartLine } from '@solar-icons/react/line-duotone/chart-2'
import { ClockCircleIcon as ClockLine } from '@solar-icons/react/line-duotone/clock-circle'
import { SunIcon as SunLine } from '@solar-icons/react/line-duotone/sun'
import { SettingsIcon as SettingsLine } from '@solar-icons/react/line-duotone/settings'
import { MoonIcon as MoonLine } from '@solar-icons/react/line-duotone/moon'
import { MoonIcon as MoonBold } from '@solar-icons/react/bold-duotone/moon'
import { MonitorIcon as MonitorLine } from '@solar-icons/react/line-duotone/monitor'
import { MonitorIcon as MonitorBold } from '@solar-icons/react/bold-duotone/monitor'

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
  calendar: { line: CalendarLine, bold: CalendarBold },
  fire: { line: FireLine, bold: FireBold },
  up: { line: UpLinear, bold: UpLinear },
  down: { line: DownLinear, bold: DownLinear },
  // Same glyph as today, named for what it shows
  sun: { line: SunLine, bold: SunBold },
  moon: { line: MoonLine, bold: MoonBold },
  monitor: { line: MonitorLine, bold: MonitorBold },
} satisfies Record<string, { line: Glyph; bold: Glyph }>

export type IconName = keyof typeof ICONS
export const ICON_NAMES = Object.keys(ICONS) as IconName[]
