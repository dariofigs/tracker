import CalendarView from './CalendarView'

function CalendarScreen() {
  return (
    <section
      aria-labelledby="calendar-title"
      className="flex flex-col gap-[2.4rem] pt-[2.4rem]"
    >
      <h1 id="calendar-title" className="text-screen">
        Calendar
      </h1>
      <CalendarView />
    </section>
  )
}

export default CalendarScreen
