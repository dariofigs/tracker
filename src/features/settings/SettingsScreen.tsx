import { Button } from '../../components/ui'
import { supabase } from '../../lib/supabase'

function SettingsScreen() {
  return (
    <section
      aria-labelledby="settings-title"
      className="flex flex-col gap-[2.4rem] pt-[2.4rem]"
    >
      <h1 id="settings-title" className="text-screen">
        Settings
      </h1>
      <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
        Sign out
      </Button>
    </section>
  )
}

export default SettingsScreen
