import './App.scss'
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom'
import { Suspense, useMemo } from 'react'
import BaseRouter, { paths } from '@/router'

export default () => <Router>
  <div className="main-work">
    <Suspense fallback={<div className="text-center mt-[48vh] text-black">Loading...</div>}>
      <AppRoutes />
    </Suspense>
  </div>
</Router>

function AppRoutes() {
  const router = useNavigate()
  const location = useLocation()
  function routerTo(name: string) {
    router(`/${name.toLowerCase()}`)
  }
  const showHeader = useMemo<boolean>(() => {
    return !(location.pathname.includes('music') && location.pathname.split('/').length > 2)
  }, [location])

  return <>
    {showHeader && <div className="nav-btns">
      {
        ['/home'].concat(paths
          .filter((path: string) => path !== '/' && path !== '*'))
          .map((path: string) => {
            const name = path.slice(1)
            return <div key={name} onClick={() => { routerTo(name) }}>{ name }</div>
          })
      }
      
    </div>}
    <BaseRouter />
    
  </>
  
}
