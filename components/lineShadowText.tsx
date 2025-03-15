"use client";

import { LineShadowText } from "./magicui/line-shadow-text";


export function LineShadowTextComp({lineshadowText}:{lineshadowText:string}) {
    
  return (
    <h1 className="text-balance text-5xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-gray-300">
      <LineShadowText className="italic whitespace-nowrap" shadowColor={"yellow"}>
        {lineshadowText}
      </LineShadowText>
    </h1>
  );
}
