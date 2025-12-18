"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GlassmorphicCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'cosmic' | 'neon' | 'pink' | 'none'
  animate?: boolean
  onClick?: () => void
}

export function GlassmorphicCard({
  children,
  className,
  hover = true,
  glow = 'cosmic',
  animate = true,
  onClick,
}: GlassmorphicCardProps) {
  const glowClass = {
    cosmic: 'cosmic-glow-static hover:cosmic-glow',
    neon: 'neon-glow',
    pink: 'pink-glow',
    none: '',
  }[glow]

  const CardComponent = animate ? motion.div : 'div'

  return (
    <CardComponent
      className={cn(
        'glass-card rounded-xl transition-all duration-300',
        hover && 'hover:scale-[1.02] hover:shadow-2xl',
        glowClass,
        className
      )}
      onClick={onClick}
      {...(animate && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      })}
    >
      {children}
    </CardComponent>
  )
}