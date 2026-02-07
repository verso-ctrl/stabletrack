'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your payment...')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setMessage('Invalid session. Please try again.')
      return
    }

    // Verify the session and create the barn
    const verifyAndCreateBarn = async () => {
      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to verify payment')
        }

        setStatus('success')
        setMessage('Barn created successfully!')

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (error) {
        console.error('Error verifying session:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Failed to verify payment')
      }
    }

    verifyAndCreateBarn()
  }, [sessionId, router])

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-sm border border-border p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Processing Payment</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Success!</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => router.push('/onboarding/create-barn')}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function BarnCreationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-card rounded-xl shadow-sm border border-border p-8 text-center">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we process your request.</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}
