import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory | Game hub',
  description: 'Memory is a card game in which all of the cards are laid face down on a surface and two cards are flipped face up over each turn. The object of the game is to turn over pairs of matching cards.',
}

function layout({children}: {children: React.ReactNode}) {
  return (
    <>
    {children}
    </>
  )
}

export default layout