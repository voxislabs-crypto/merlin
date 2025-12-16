"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { StarfieldBackground } from '@/components/cosmic/StarfieldBackground'
import { GlassmorphicCard } from '@/components/cosmic/GlassmorphicCard'
import { CosmicButton } from '@/components/cosmic/CosmicButton'
import { Sparkles, Zap, Brain, TrendingUp, Shield, Star } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'Accurate Forecasts',
      description: 'Personalized daily and weekly insights based on your unique birth chart and current transits.',
    },
    {
      icon: Brain,
      title: 'MBTI Integration',
      description: 'Combines astrology with personality science for deeper, more relevant guidance.',
    },
    {
      icon: TrendingUp,
      title: 'Resonance Intelligence',
      description: 'Learns from your feedback to deliver increasingly accurate predictions over time.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your cosmic data is encrypted and never shared. Your journey is yours alone.',
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Your Personal Oracle Awaits</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight">
              <span className="gradient-text">See What's</span>
              <br />
              <span className="text-foreground">Coming</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Merlin combines ancient astrological wisdom with modern AI to deliver{' '}
              <span className="text-accent font-semibold">highly accurate</span>,{' '}
              <span className="text-primary font-semibold">personalized forecasts</span>{' '}
              that evolve with you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <CosmicButton size="lg" variant="primary">
                  <Zap className="w-5 h-5 inline mr-2" />
                  Begin Your Journey
                </CosmicButton>
              </Link>
              <Link href="#features">
                <CosmicButton size="lg" variant="ghost">
                  Explore Features
                </CosmicButton>
              </Link>
            </div>
          </motion.div>
          
          {/* Floating cosmic orb */}
          <motion.div
            className="mx-auto w-64 h-64 md:w-96 md:h-96 relative"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 blur-3xl"></div>
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/50 via-secondary/30 to-accent/40 blur-2xl"></div>
            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20"></div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span className="gradient-text">Powered by Cosmic Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience astrology that adapts to you, learns from you, and grows with you.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassmorphicCard className="p-8 h-full">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/20 cosmic-glow-static">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-2 text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
              Your Journey in <span className="gradient-text">Four Steps</span>
            </h2>
          </motion.div>
          
          <div className="space-y-8">
            {[
              { step: 1, title: 'Share Your Cosmic Identity', desc: 'Tell us your birth details to unlock your unique celestial blueprint.' },
              { step: 2, title: 'Add Your Personality Matrix', desc: 'Integrate your MBTI type for personalized astrological insights.' },
              { step: 3, title: 'Receive Daily Guidance', desc: 'Get accurate forecasts tailored to your chart and personality.' },
              { step: 4, title: 'Evolve Together', desc: 'Your feedback trains Merlin to become more accurate over time.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassmorphicCard className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white cosmic-glow-static">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-1 text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassmorphicCard className="p-12 text-center" glow="cosmic">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Ready to See Your Future?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands who trust Merlin for daily cosmic guidance.
              </p>
              <Link href="/login">
                <CosmicButton size="lg" variant="primary">
                  <Star className="w-5 h-5 inline mr-2" />
                  Start Free Today
                </CosmicButton>
              </Link>
            </motion.div>
          </GlassmorphicCard>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Merlin. Your Personal Oracle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}