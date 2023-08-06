import './App.scss'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { Suspense } from 'react'
import BaseRouter from '@/router'

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
        ['Home', 'Game/Stream', 'Game/Selection', "RX/of", "RX/interval", "RX/merge", "RX/reduce", "RX/combine", "RX/partition", "RX/error"].map((name: string) => <div key={name} onClick={() => { routerTo(name) }}>{ name }</div>)
      }
      
    </div>
    <BaseRouter />
  </>
  
}
