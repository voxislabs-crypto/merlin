"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CosmicButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

export function CosmicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
  fullWidth = false,
}: CosmicButtonProps) {
  const baseStyles = 'cosmic-button rounded-lg font-medium transition-all duration-300 relative overflow-hidden'
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 cosmic-glow-static hover:cosmic-glow',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary/50',
    ghost: 'bg-transparent text-foreground hover:bg-primary/10 border border-border hover:border-primary',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}