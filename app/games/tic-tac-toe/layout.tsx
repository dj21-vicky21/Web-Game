import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tic Tac Toe | Game hub',
  description: 'Tic Tac Toe is a paper-and-pencil game for two players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game.',
}

function layout({children}: {children: React.ReactNode}) {
  return (
    <>
    {children}
    </>
  )
}

export default layout