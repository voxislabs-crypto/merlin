import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

export interface GlassmorphicCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const GlassmorphicCard = forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300",
          hover && "hover:bg-white/10 hover:shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassmorphicCard.displayName = "GlassmorphicCard";

export default GlassmorphicCard;
