import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import toast, { Toast as ToastType } from 'react-hot-toast'

interface ToastProps {
  t: ToastType
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

export function CustomToast({ t, type, title, message }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  const Icon = icons[type]

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border ${colors[type]}`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${colors[type]}`} />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-gray-500">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Helper functions for different toast types
export const showToast = {
  success: (title: string, message?: string) =>
    toast.custom((t) => <CustomToast t={t} type="success" title={title} message={message} />),
  error: (title: string, message?: string) =>
    toast.custom((t) => <CustomToast t={t} type="error" title={title} message={message} />),
  warning: (title: string, message?: string) =>
    toast.custom((t) => <CustomToast t={t} type="warning" title={title} message={message} />),
  info: (title: string, message?: string) =>
    toast.custom((t) => <CustomToast t={t} type="info" title={title} message={message} />),
}