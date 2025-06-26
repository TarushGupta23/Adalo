import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    src?: string;
    name: string;
    fallback?: string;
  }[];
  max?: number;
}

export function AvatarGroup({
  items,
  max = 4,
  className,
  ...props
}: AvatarGroupProps) {
  const itemsToShow = items.slice(0, max)
  const overflowCount = items.length - max
  
  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {itemsToShow.map((item, index) => (
        <Avatar key={index} className="border-2 border-white">
          <AvatarImage src={item.src} alt={item.name} />
          <AvatarFallback>
            {item.fallback || item.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflowCount > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-sm font-medium">
          +{overflowCount}
        </div>
      )}
    </div>
  )
}
