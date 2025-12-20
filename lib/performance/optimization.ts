/**
 * Performance Optimization Utilities
 * 
 * This module provides caching, memoization, and optimization strategies
 * for Merlin's core astrological calculations and API responses.
 */

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  hits: number
}

class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
  }

  set(key: string, data: T): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.getOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key)
      return null
    }

    entry.hits++
    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  getStats(): { size: number; hitRate: number; oldestEntry: number } {
    let totalHits = 0
    let oldestEntry = Date.now()

    for (const entry of this.cache.values()) {
      totalHits += entry.hits
      oldestEntry = Math.min(oldestEntry, entry.timestamp)
    }

    return {
      size: this.cache.size,
      hitRate: totalHits,
      oldestEntry
    }
  }
}

// Cache instances for different data types
export const ephemerisCache = new MemoryCache<any>({
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 100
})

export const aspectCache = new MemoryCache<any>({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 50
})

export const themeCache = new MemoryCache<any>({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 30
})

export const resonanceCache = new MemoryCache<any>({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 20
})

/**
 * Memoization decorator for expensive functions
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  cache: MemoryCache<any>,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    const cached = cache.get(key)
    if (cached !== null) {
      return cached
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Throttle function for performance-critical operations
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Batch processing utility for multiple operations
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private processing = false
  private batchSize: number
  private processor: (items: T[]) => Promise<void>

  constructor(
    processor: (items: T[]) => Promise<void>,
    batchSize = 10
  ) {
    this.processor = processor
    this.batchSize = batchSize
  }

  add(item: T): void {
    this.queue.push(item)
    this.process()
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    const batch = this.queue.splice(0, this.batchSize)

    try {
      await this.processor(batch)
    } catch (error) {
      console.error('Batch processing error:', error)
      // Re-add failed items to queue
      this.queue.unshift(...batch)
    } finally {
      this.processing = false
      
      // Process next batch if there are more items
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), 10)
      }
    }
  }

  flush(): Promise<void> {
    return new Promise((resolve) => {
      const checkQueue = () => {
        if (this.queue.length === 0 && !this.processing) {
          resolve()
        } else {
          setTimeout(checkQueue, 100)
        }
      }
      checkQueue()
    })
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()

  startTimer(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, [])
      }
      
      const durations = this.metrics.get(name)!
      durations.push(duration)
      
      // Keep only last 100 measurements
      if (durations.length > 100) {
        durations.shift()
      }
    }
  }

  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const durations = this.metrics.get(name)
    if (!durations || durations.length === 0) return null

    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)

    return { avg, min, max, count: durations.length }
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [name] of this.metrics.entries()) {
      const metrics = this.getMetrics(name)
      if (metrics) {
        result[name] = metrics
      }
    }
    
    return result
  }

  clear(): void {
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Resource optimization for large datasets
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Lazy loading utility for expensive operations
 */
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  cache?: MemoryCache<T>
): () => Promise<T> {
  let loaded: T | null = null
  let loading: Promise<T> | null = null

  return async (): Promise<T> => {
    if (loaded !== null) return loaded

    // Check cache first
    if (cache) {
      const cached = cache.get('lazy-loaded')
      if (cached !== null) {
        loaded = cached
        return cached
      }
    }

    // Load if not already loading
    if (!loading) {
      loading = loader()
    }

    const result = await loading
    loaded = result
    
    // Cache the result
    if (cache) {
      cache.set('lazy-loaded', result)
    }

    loading = null
    return result
  }
}

/**
 * Web Workers for background processing
 */
export function createWorkerPool<T, R>(
  workerScript: string,
  poolSize = navigator.hardwareConcurrency || 4
): {
  execute: (data: T) => Promise<R>
  terminate: () => void
} {
  const workers: Worker[] = []
  const taskQueue: Array<{ data: T; resolve: (result: R) => void; reject: (error: Error) => void }> = []
  let availableWorkers = 0

  // Initialize workers
  for (let i = 0; i < poolSize; i++) {
    const worker = new Worker(workerScript)
    workers.push(worker)
    
    worker.onmessage = () => {
      availableWorkers++
      processQueue()
    }
  }

  const processQueue = () => {
    while (availableWorkers > 0 && taskQueue.length > 0) {
      const task = taskQueue.shift()!
      const worker = workers.pop()!
      availableWorkers--

      worker.onmessage = (event) => {
        task.resolve(event.data)
        workers.push(worker)
        availableWorkers++
        processQueue()
      }

      worker.onerror = (error) => {
        task.reject(new Error(error.message || 'Worker error'))
        workers.push(worker)
        availableWorkers++
        processQueue()
      }

      worker.postMessage(task.data)
    }
  }

  return {
    execute: (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        taskQueue.push({ data, resolve, reject })
        processQueue()
      })
    },
    terminate: () => {
      workers.forEach(worker => worker.terminate())
    }
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    }
  }

  // Fallback for browsers without memory API
  return { used: 0, total: 0, percentage: 0 }
}

/**
 * Optimized astrological calculation wrapper
 */
export function createOptimizedCalculator<T extends (...args: any[]) => any>(
  calculator: T,
  cache: MemoryCache<any>,
  complexityThreshold = 100 // ms
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return memoize(
    async (...args: Parameters<T>) => {
      const timer = performanceMonitor.startTimer('astro-calculation')
      
      try {
        const result = await calculator(...args)
        timer()
        return result
      } catch (error) {
        timer()
        throw error
      }
    },
    cache,
    (...args) => JSON.stringify(args)
  )
}

/**
 * Cleanup utilities
 */
export function scheduleCleanup(
  cleanupFn: () => void,
  intervalMs: number
): () => void {
  const intervalId = setInterval(cleanupFn, intervalMs)
  
  return () => {
    clearInterval(intervalId)
  }
}

// Auto-cleanup schedules
export const cleanupSchedules = [
  scheduleCleanup(() => {
    console.log('[Performance] Cleaning expired cache entries')
    // Cache cleanup is handled automatically by MemoryCache
  }, 60 * 60 * 1000), // Every hour
  
  scheduleCleanup(() => {
    console.log('[Performance] Memory usage:', getMemoryUsage())
  }, 5 * 60 * 1000) // Every 5 minutes
]
