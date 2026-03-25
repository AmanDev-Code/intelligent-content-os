import * as React from "react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";

type ConfettiButtonProps = React.ComponentProps<typeof Button>;

export const fireConfettiSnip = () => {
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 35,
    ticks: 120,
    scalar: 0.9,
    origin: { y: 0.7 },
  });
};

export function ConfettiButton({ onClick, children, ...props }: ConfettiButtonProps) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    fireConfettiSnip();
    onClick?.(event);
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}
