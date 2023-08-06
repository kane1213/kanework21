
import { lazy } from 'react'
import { useRoutes, Route, Routes, Navigate } from 'react-router-dom'
import { Suspense } from 'react'


const routes = [
  { path: '/', key: 'home', ele: lazy(() => import('@/pages/Home')), children: [] },
  { path: '/game', key: 'game', ele: lazy(() => import('@/pages/Game')), children: [
    { path: 'stream', key: 'stream', ele: lazy(() => import('@/pages/Game/Stream')) },
    { path: 'selection', key: 'selection', ele: lazy(() => import('@/pages/Game/Selection')) },
  ] },
  { path: '/rx', key: 'rx', ele: lazy(() => import('@/pages/RX')), children: [
    { path: 'interval', key: 'interval', ele: lazy(() => import('@/pages/RX/Interval')) },
    { path: 'of', key: 'of', ele: lazy(() => import('@/pages/RX/Of')) },
    { path: 'merge', key: 'merge', ele: lazy(() => import('@/pages/RX/Merge')) },
    { path: 'reduce', key: 'reduce', ele: lazy(() => import('@/pages/RX/Reduce')) },
    { path: 'combine', key: 'combine', ele: lazy(() => import('@/pages/RX/Combine')) },
    { path: 'partition', key: 'partition', ele: lazy(() => import('@/pages/RX/Partition')) },
    { path: 'error', key: 'error', ele: lazy(() => import('@/pages/RX/Error')) },
  ] },
  { path: '*', key: 'none', ele: lazy(() => import('@/pages/None')), children: [] },
];

export const routeName: {[key: string ]: string} = routes.reduce((sum, cur) => ({ ...sum, [cur.key]: cur.path, [cur.path]: cur.key }), {})

export default function Index() {
  const element = useRoutes(
    routes.map((route: any, index: number) => ({ 
      path: route.path,
      element: <route.ele key={index} children={generateSuspectRoutes(route.children)} childlist={route.children.map((child:any) => ({ path: child.path, name: child.path } ))} />,
      ...(!(route.children && route.children.length > 0) 
        ? {}
        : {
            children: route.children.map((routeChild: any, cindex: number) => ({
              path: routeChild.path,
              element: <routeChild.ele key={index + '-' + cindex} />
            }) )
        })
    })).concat({
      path: '/home',
      element: <Navigate to="/" />
    })
  )
  return element
}

function generateSuspectRoutes (children: { path: string, ele: any }[]) {
  return <Suspense fallback={<div className="text-black text-center py-48 ">Loading...</div>}>
    <Routes>
      {
        children.map((child: any) => <Route key={child.path} path={child.path} element={<child.ele />} />)
      }
    </Routes>  
  </Suspense>
}
