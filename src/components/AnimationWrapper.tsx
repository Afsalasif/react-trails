import { ReactNode } from 'react'
import { AnimationConfig } from '../types'

interface AnimationWrapperProps {
  children: ReactNode
  config?: Partial<AnimationConfig>
  index?: number
}

export function AnimationWrapper({ children, config, index = 0 }: AnimationWrapperProps) {
  if (!config?.enabled || config.type === 'none') {
    return <>{children}</>
  }

  const animationClasses = {
    fade: 'animate-fadeIn',
    slide: 'animate-slideIn', 
    scale: 'animate-scaleIn',
    bounce: 'animate-bounceIn'
  }

  const animationClass = animationClasses[config.type || 'fade']
  const duration = config.duration || 300
  const stagger = config.stagger || 50
  const delay = config.stagger ? index * stagger : 0
  
  return (
    <div 
      className={animationClass}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationTimingFunction: config.easing || 'ease-out'
      }}
    >
      {children}
    </div>
  )
}