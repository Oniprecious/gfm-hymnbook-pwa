import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AboutPage } from './pages/AboutPage'
import { CataloguePage } from './pages/CataloguePage'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { ThemesPage } from './pages/ThemesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue/:language" element={<CataloguePage />} />
        <Route path="themes" element={<ThemesPage />} />
        <Route path="themes/:themeId/:language" element={<CataloguePage />} />
        <Route path="favourites" element={<CataloguePage favouritesOnly />} />
        <Route path="hymn/:stableId" element={<ReaderPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
