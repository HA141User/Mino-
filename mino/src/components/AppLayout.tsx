import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>
      <Navbar />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
