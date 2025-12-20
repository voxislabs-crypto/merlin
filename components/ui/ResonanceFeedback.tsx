'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
interface ResonanceFeedbackProps {
  itemId: string
  itemType: 'theme' | 'aspect'
  onFeedback?: (score: number) => void
  className?: string
}
export function ResonanceFeedback({ 
  itemId, 
  itemType,
  onFeedback,
  className = '' 
}: ResonanceFeedbackProps) {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleFeedback = async (score: number) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/resonance/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          itemId,
          itemType,
          score,
          mbtiType: user?.publicMetadata?.mbtiType || 'UNKNOWN',
          note: '',
          forecastId: `daily-${new Date().toISOString().split('T')[0]}`
        }),
      })
      if (!response.ok) throw new Error('Failed to submit feedback')
      toast.success('Merlin is learning from your feedback ✨')
      onFeedback?.(score)
      console.log(`Feedback submitted: ${score > 0 ? '+1' : '-1'} for ${itemType} ${itemId}`)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className={`flex items-center gap-2 mt-3 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleFeedback(1)}
        disabled={isSubmitting}
        className="p-1.5 rounded-full hover:bg-green-500/10 text-green-500 hover:text-green-400 transition-colors"
        aria-label="This resonates"
      >
        <ThumbsUp className="w-5 h-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleFeedback(-1)}
        disabled={isSubmitting}
        className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors"
        aria-label="This doesn't resonate"
      >
        <ThumbsDown className="w-5 h-5" />
      </motion.button>
    </div>
  )
}
