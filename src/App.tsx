import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from '@/routes'
import { ToastProvider } from '@/components/status-ui'

function App() {
  return (
    <ToastProvider position="top-left">
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </ToastProvider>
  )
}

export default App
