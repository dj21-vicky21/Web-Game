import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flappy Bird | Game hub",
  description:
    "Flappy Bird is a game in which the player controls a bird, attempting to fly between sequentially-arranged pipes without hitting them.",
};

function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default layout;
