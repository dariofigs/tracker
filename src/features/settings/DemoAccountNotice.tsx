/** Stands in for the account forms on /demo, where there is no login to change. */
function DemoAccountNotice() {
  return (
    <div className="flex flex-col gap-[1.2rem]">
      <p className="text-body text-text-muted">
        You’re viewing a demo with invented data. Changes you make here aren’t saved and reset when
        you reload.
      </p>
      <a href="/" className="min-touch text-body flex items-center font-semibold underline">
        Go to the app
      </a>
    </div>
  )
}

export default DemoAccountNotice
