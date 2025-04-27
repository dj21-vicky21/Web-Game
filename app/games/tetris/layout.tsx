import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tetris Game | Game hub',
  description: 'Play the classic Tetris game built with React and Framer Motion',
};

function layout({children}: {children: React.ReactNode}) {
  return (
    <>
    {children}
    </>
  )
}

export default layout;