import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import { UserView } from './UserView/UserView'
import './index.less'
import { AdminView } from './AdminView/AdminView'

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserView />
  },
  {
    path: '/admin',
    element: <AdminView />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
