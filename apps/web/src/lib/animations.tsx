"use client"

import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BaseProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

type MotionDivProps = BaseProps & Omit<HTMLMotionProps<"div">, keyof BaseProps>

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 }

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SlideUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { y: 20, opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { y: 20, opacity: 0 }}
      transition={{ ...springTransition, delay, duration }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  ...props
}: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { scale: 0.95, opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { scale: 0.95, opacity: 0 }}
      transition={{ ...springTransition, delay, duration }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  ...props
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
} & Omit<HTMLMotionProps<"div">, "children" | "className" | "staggerDelay">) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  ...props
}: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, type: "spring" as const, stiffness: 300, damping: 24 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function HoverCard({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 10px 40px -10px rgba(139, 92, 246, 0.15)" }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
