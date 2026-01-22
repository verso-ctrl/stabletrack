// Simple toast utility that can be called from anywhere
// Uses a global event emitter pattern for simplicity

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastEvent {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

type ToastListener = (toast: ToastEvent) => void

// Global toast event system
const listeners: Set<ToastListener> = new Set()

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emitToast(toast: ToastEvent) {
  listeners.forEach(listener => listener(toast))
}

function createToast(type: ToastType, title: string, message?: string, duration = 5000): void {
  const id = Math.random().toString(36).slice(2)
  emitToast({ id, type, title, message, duration })
}

// Main toast API
export const toast = {
  success: (title: string, message?: string) => createToast('success', title, message),
  error: (title: string, message?: string) => createToast('error', title, message),
  warning: (title: string, message?: string) => createToast('warning', title, message),
  info: (title: string, message?: string) => createToast('info', title, message),
}

// Helper for error handling
export function showError(error: unknown, fallbackMessage = 'An error occurred') {
  const message = error instanceof Error ? error.message : fallbackMessage
  toast.error('Error', message)
}

// Helper for demo mode messages
export function showDemoMessage(feature: string) {
  toast.info('Demo Mode', `${feature} is disabled in demo mode.`)
}
