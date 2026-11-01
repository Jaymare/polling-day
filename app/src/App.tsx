import { type ItemValues } from './data'
import { useStoredState } from './useStoredState'
import { Board } from './components/Board'

export default function App() {
  const [dates, setDates] = useStoredState<ItemValues>('checklist.dates', {})
  // Who collected each district's materials, keyed like the dates
  const [contacts, setContacts] = useStoredState<ItemValues>('checklist.contacts', {})
  // How each item was handled where there's a choice (e.g. "Posted" or "Collected")
  const [methods, setMethods] = useStoredState<ItemValues>('checklist.methods', {})

  return (
    <main className="page">
      <header className="title-bar">
        <h1>Polling day materials</h1>
      </header>

      <Board
        dates={dates}
        contacts={contacts}
        methods={methods}
        onSetDate={(key, date) => setDates((prev) => ({ ...prev, [key]: date }))}
        onSetContact={(key, contact) => setContacts((prev) => ({ ...prev, [key]: contact }))}
        onSetMethod={(key, method) => setMethods((prev) => ({ ...prev, [key]: method }))}
      />
    </main>
  )
}
