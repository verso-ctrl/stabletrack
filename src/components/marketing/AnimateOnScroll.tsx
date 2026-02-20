'use client'

import React, { useRef, useEffect, useState } from 'react'

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right'
  delay?: number
  threshold?: number
}

export function AnimateOnScroll({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay)
          } else {
            setIsVisible(true)
          }
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  return (
    <div
      ref={ref}
      className={`scroll-animate scroll-animate--${animation} ${isVisible ? 'scroll-animate--visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
