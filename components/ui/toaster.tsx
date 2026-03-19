'use client'
import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(({ id, title, description, variant }) => (
        <div key={id} className={`rounded-xl border p-4 shadow-lg animate-fade-in-up ${variant === 'destructive' ? 'border-red-200 bg-red-50 text-red-800' : 'border-gray-200 bg-white text-gray-900'}`}>
          {title && <div className="font-semibold text-sm">{title}</div>}
          {description && <div className="text-sm opacity-80 mt-0.5">{description}</div>}
        </div>
      ))}
    </div>
  )
}
