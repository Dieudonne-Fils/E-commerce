'use client'

import { ReactNode, HTMLAttributes, useState, useEffect, useRef } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface AnimatedElementProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  animation?: 'fade-in' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'scale' | 'rotate-in' | 'bounce-in'
  delay?: number
  duration?: number
  threshold?: number
}

export function AnimatedElement({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = '',
  ...props
}: AnimatedElementProps) {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: true,
  })

  const animationClass = `observe-${animation}`
  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {}
  const durationStyle = { transitionDuration: `${duration}ms` }

  return (
    <div
      ref={elementRef}
      className={`${animationClass} ${isVisible ? 'in-view' : ''} ${className}`}
      style={{ ...delayStyle, ...durationStyle }}
      {...props}
    >
      {children}
    </div>
  )
}

interface StaggeredListProps {
  children: ReactNode[]
  staggerDelay?: number
  animation?: 'fade-in' | 'slide-left' | 'slide-right' | 'scale'
  className?: string
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  animation = 'fade-in',
  className = '',
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedElement
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          className="mb-4"
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  )
}

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({
  end,
  start = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: true,
  })

  return (
    <div ref={elementRef} className={className}>
      {isVisible && (
        <AnimatedCounter
          start={start}
          end={end}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
        />
      )}
    </div>
  )
}

function AnimatedCounter({
  start,
  end,
  duration,
  prefix,
  suffix,
}: {
  start: number
  end: number
  duration: number
  prefix: string
  suffix: string
}) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    let startTime: number
    let animationId: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      setCount(Math.floor(progress * (end - start) + start))
      
      if (progress < 1) {
        animationId = requestAnimationFrame(updateCount)
      }
    }

    animationId = requestAnimationFrame(updateCount)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [start, end, duration])

  return <>{prefix}{count.toLocaleString()}{suffix}</>
}

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: true,
  })

  useEffect(() => {
    if (!isVisible) return

    let timeoutId: NodeJS.Timeout
    
    const startTyping = () => {
      let index = 0
      const typing = () => {
        if (index < text.length) {
          setDisplayText(prev => prev + text.charAt(index))
          index++
          timeoutId = setTimeout(typing, speed)
        } else if (onComplete) {
          onComplete()
        }
      }
      typing()
    }

    timeoutId = setTimeout(startTyping, delay)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [text, speed, delay, isVisible, onComplete])

  return (
    <div ref={elementRef} className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </div>
  )
}

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const [offsetY, setOffsetY] = useState(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const scrolled = window.pageYOffset
        const rate = scrolled * speed
        setOffsetY(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={elementRef}
      className={`parallax ${className}`}
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      {children}
    </div>
  )
}

