'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry)
    setIsVisible(entry.isIntersecting)
  }

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin, frozen])

  return { elementRef, entry, isVisible }
}

// Hook for multiple elements with staggered animations
export function useStaggeredIntersectionObserver(
  count: number,
  options?: UseIntersectionObserverProps
) {
  const [visibleItems, setVisibleItems] = useState(new Set<number>())
  const refs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const {
      threshold = 0.1,
      root = null,
      rootMargin = '0px',
    } = options || {}

    refs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleItems(prev => new Set([...prev, index]))
            }
          },
          { threshold, root, rootMargin }
        )
        
        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [count, options])

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }

  const isVisible = (index: number) => visibleItems.has(index)

  return { setRef, isVisible }
}