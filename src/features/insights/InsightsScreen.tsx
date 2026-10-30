import TrendsView from './TrendsView'

function InsightsScreen() {
  return (
    <section
      aria-labelledby="insights-title"
      className="flex flex-col gap-[2.4rem] pt-[2.4rem]"
    >
      <h1 id="insights-title" className="text-screen">
        Trends
      </h1>
      <TrendsView />
    </section>
  )
}

export default InsightsScreen
