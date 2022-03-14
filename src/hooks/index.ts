import { reaction } from 'mobx'
import { useState, useRef, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { loadingStore } from 'src/stores'
import { isEqual } from 'lodash'

export function useLatest<T> (value: T) {
  const ref = useRef(value)
  ref.current = value

  return ref
}

export function usePrevious (value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export function useWindowSize () {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  })

  useEffect(() => {
    function handleResize () {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export function useDomSize (ref: any) {
  const [domSize, setDomSize] = useState({ clientWidth: 0, clientHeight: 0 })

  useEffect(() => {
    if (!ref?.current) return

    let timer: any = -1
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          const { clientWidth, clientHeight } = entry.target
          const now = { clientWidth, clientHeight }
          setDomSize(prev => isEqual(prev, now) ? prev : now)
        }, 200)
      }
    })

    ro.observe(ref.current)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
    }
  }, [])

  return domSize
}

export function useIsLoading (path: string, allPath: boolean = false) {
  const [loading, setLoading] = useState(false)
  useEffect(() => reaction(
    () => allPath ? loadingStore.visible : loadingStore.isVisible[path],
    (value) => setLoading(value)
  ), [])

  return loading
}