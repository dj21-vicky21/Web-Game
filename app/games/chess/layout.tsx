import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chess | Game hub',
  description: 'Chess is a two-player strategy board game played on a square board with 64 squares of alternating colors. It is one of the oldest and most popular games in the world.',
}

function layout({children}: {children: React.ReactNode}) {
  return (
    <>
    {children}
    </>
  )
}

export default layout