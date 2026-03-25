import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "../../lib/brand";

type Props = {
  variant?: "full" | "icon" | "wordmark";
  className?: string;
  priority?: boolean;
};

export function TrndinnLogo({ variant = "full", className, priority }: Props) {
  if (variant === "icon") {
    return (
      <Image
        src={BRAND.icon.color}
        alt="Trndinn icon"
        width={512}
        height={512}
        priority={priority}
        className={cn("h-9 w-9 md:h-10 md:w-10 object-contain", className)}
        sizes="40px"
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("relative inline-block", className)}>
        <Image
          src={BRAND.wordmark.light}
          alt=""
          width={1400}
          height={560}
          priority={priority}
          className="h-9 w-auto max-w-[380px] object-contain dark:hidden"
          sizes="380px"
        />
        <Image
          src={BRAND.wordmark.dark}
          alt="Trndinn"
          width={1400}
          height={560}
          priority={priority}
          className="h-9 w-auto max-w-[380px] object-contain hidden dark:block"
          sizes="380px"
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center justify-center gap-1.5 min-w-0", className)} role="img" aria-label="Trndinn">
      <Image
        src={BRAND.icon.color}
        alt=""
        width={512}
        height={512}
        priority={priority}
        className="h-[22px] w-[22px] md:h-6 md:w-6 object-contain shrink-0"
        sizes="24px"
      />
      <Image
        src={BRAND.wordmark.light}
        alt=""
        width={1400}
        height={560}
        priority={priority}
        className="h-11 w-auto max-w-[460px] object-contain dark:hidden"
        sizes="460px"
      />
      <Image
        src={BRAND.wordmark.dark}
        alt=""
        width={1400}
        height={560}
        priority={priority}
        className="h-11 w-auto max-w-[460px] object-contain hidden dark:block"
        sizes="460px"
      />
    </span>
  );
}
