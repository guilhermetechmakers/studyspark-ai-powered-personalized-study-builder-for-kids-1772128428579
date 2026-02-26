import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from '@/routes'
import { ToastProvider } from '@/components/status-ui'
import { AuthProvider } from '@/contexts/auth-context'

function App() {
  return (
    <AuthProvider>
      <ToastProvider position="top-left">
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
