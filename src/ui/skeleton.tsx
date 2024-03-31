import { cn } from "../lib/content-script/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("ab-animate-pulse ab-rounded-md ab-bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
