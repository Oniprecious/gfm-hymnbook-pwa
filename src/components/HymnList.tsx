import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cleanTitle } from '../lib/catalogue'
import type { Hymn } from '../types'

const PAGE_SIZE = 80

export function HymnList({ hymns, readerQuery = '' }: { hymns: Hymn[]; readerQuery?: string }) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  if (!hymns.length) return <div className="empty-state"><strong>No matching hymns found</strong><span>Try another number, title, lyric, language, or theme.</span></div>
  return (
    <>
      <div className="hymn-list" aria-label="Hymn results">
        {hymns.slice(0, limit).map((hymn) => (
          <Link key={hymn.stableId} className="hymn-row" to={`/hymn/${hymn.stableId}${readerQuery}`} aria-label={`Hymn ${hymn.hymnNumber}, ${cleanTitle(hymn.title)}`}>
            <span className="number-badge">{String(hymn.hymnNumber).padStart(3, '0')}</span>
            <span className="hymn-row__content">
              <strong>{cleanTitle(hymn.title).toLocaleUpperCase()}</strong>
              {hymn.availability === 'MISSING_TEXT' && <small>Text unavailable</small>}
              {hymn.availability === 'NEEDS_REVIEW' && <small>Legacy text · review pending</small>}
            </span>
            <ChevronRight aria-hidden="true" />
          </Link>
        ))}
      </div>
      {limit < hymns.length && <button className="secondary-button load-more" type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>Show more hymns</button>}
    </>
  )
}
