import { Outlet, useLocation } from 'react-router-dom'

export default () => {
  const location = useLocation()
  return <>
  
    PATH: { location.pathname }
    <Outlet key={location.pathname} />
  </>
}