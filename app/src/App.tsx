import { useEffect, useState } from 'react'
import { type ItemValues } from './data'
import { useStoredState } from './useStoredState'
import { Board } from './components/Board'
import { Home } from './components/Home'

// Pages live in the URL hash (#/board) so GitHub Pages never has to serve a
// path it doesn't know about.
const PAGES = [
  { hash: '#/', label: 'Home' },
  { hash: '#/board', label: 'Board' },
] as const

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const [dates, setDates] = useStoredState<ItemValues>('checklist.dates', {})
  // Who collected each district's materials, keyed like the dates
  const [contacts, setContacts] = useStoredState<ItemValues>('checklist.contacts', {})
  // How each item was handled where there's a choice (e.g. "Posted" or "Collected")
  const [methods, setMethods] = useStoredState<ItemValues>('checklist.methods', {})

  return (
    <main className="page">
      <header className="title-bar">
        <h1>Polling day materials</h1>
        <nav className="site-nav">
          {PAGES.map((p) => (
            <a key={p.hash} href={p.hash} aria-current={hash === p.hash ? 'page' : undefined}>
              {p.label}
            </a>
          ))}
        </nav>
      </header>

      {hash === '#/board' ? (
        <Board
          dates={dates}
          contacts={contacts}
          methods={methods}
          onSetDate={(key, date) => setDates((prev) => ({ ...prev, [key]: date }))}
          onSetContact={(key, contact) => setContacts((prev) => ({ ...prev, [key]: contact }))}
          onSetMethod={(key, method) => setMethods((prev) => ({ ...prev, [key]: method }))}
        />
      ) : (
        <Home />
      )}
    </main>
  )
}
