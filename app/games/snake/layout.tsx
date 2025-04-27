import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Snake | Game hub',
  description: 'Snake is a video game genre where the player maneuvers a growing line that becomes a snake. The player then reapplies pressure to the line to shrink the snake\'s head, make it move faster, or change its direction without changing the rest of its body.',
}

function layout({children}: {children: React.ReactNode}) {
  return (
    <>
    {children}
    </>
  )
}

export default layout