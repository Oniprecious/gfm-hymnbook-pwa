import { ArrowLeft, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from './IconButton'

export function ScreenHeader({ title, subtitle, onMenu, back = false, actions }: { title: string; subtitle?: string; onMenu?: () => void; back?: boolean; actions?: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <IconButton aria-label={back ? 'Go back' : 'Open navigation menu'} onClick={back ? () => navigate(-1) : onMenu}>
          {back ? <ArrowLeft aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </IconButton>
        <div className="app-header__titles">
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </div>
        {actions && <div className="app-header__actions">{actions}</div>}
      </div>
    </header>
  )
}
