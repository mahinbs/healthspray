import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  animated?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, intensity = "medium", animated = false, children, ...props }, ref) => {
    const intensityClasses = {
      light: "bg-white/5 border-white/10 backdrop-blur-sm",
      medium: "bg-white/10 border-white/20 backdrop-blur-md",
      heavy: "bg-white/20 border-white/30 backdrop-blur-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-glass transition-glass",
          intensityClasses[intensity],
          animated && "hover:bg-white/15 hover:border-white/25 hover:shadow-float hover:scale-105",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };