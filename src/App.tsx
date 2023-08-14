import './App.scss'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { Suspense } from 'react'
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
  function routerTo(name: string) {
    router(`/${name.toLowerCase()}`)
  }

  return <>
    <div className="nav-btns">
      {
        ['/home'].concat(paths
          .filter((path: string) => path !== '/' && path !== '*'))
          .map((path: string) => {
            const name = path.slice(1)
            return <div key={name} onClick={() => { routerTo(name) }}>{ name }</div>
          })
      }
      
    </div>
    <BaseRouter />
    
  </>
  
}
