"use client"

import { motion } from "framer-motion"
import React, { useEffect, useState, useRef } from "react"

export const FlashWrapper = React.forwardRef<any, { 
  id: string, children: React.ReactNode, className?: string, style?: React.CSSProperties, isTableRow?: boolean, [key: string]: any 
}>(({ id, children, className, style, isTableRow = false, ...props }, forwardedRef) => {
  const [isFlashing, setIsFlashing] = useState(false)
  const localRef = useRef<any>(null)

  const setRefs = (element: any) => {
    localRef.current = element
    if (typeof forwardedRef === 'function') forwardedRef(element)
    else if (forwardedRef) forwardedRef.current = element
  }

  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === `#${id}`) {
        setIsFlashing(true)
        setTimeout(() => {
          localRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        }, 100)
        setTimeout(() => setIsFlashing(false), 2000)
      }
    }
    
    handleHashCheck()
    window.addEventListener('hashchange', handleHashCheck)
    return () => window.removeEventListener('hashchange', handleHashCheck)
  }, [id])

  const flashAnim = { 
    filter: ['drop-shadow(0 0 0px #111)', 'drop-shadow(0 0 15px #4ade80)', 'drop-shadow(0 0 0px #111)', 'drop-shadow(0 0 15px #4ade80)', 'drop-shadow(0 0 0px #111)'],
  }
  
  const trans = { duration: 1.5, ease: "easeInOut" } as const

  if (isTableRow) {
    return (
      <motion.tr ref={setRefs} id={id} className={className} style={style} animate={isFlashing ? flashAnim : {}} transition={trans} {...props}>
        {children}
      </motion.tr>
    )
  }

  return (
    <motion.div ref={setRefs} id={id} className={className} style={style} animate={isFlashing ? flashAnim : {}} transition={trans} {...props}>
      {children}
    </motion.div>
  )
})
FlashWrapper.displayName = "FlashWrapper"
