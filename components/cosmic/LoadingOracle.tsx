"use client"

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface LoadingOracleProps {
  message?: string
  submessage?: string
}

export function LoadingOracle({ message = "Consulting the cosmos...", submessage }: LoadingOracleProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="relative w-20 h-20 mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary"></div>
        <motion.div
          className="absolute inset-2 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </motion.div>
      
      <motion.h3
        className="text-xl font-serif font-bold text-foreground mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.h3>
      
      {submessage && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {submessage}
        </p>
      )}
      
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}