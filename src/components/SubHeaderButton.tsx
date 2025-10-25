import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";

interface SubHeaderButtonProps extends Omit<ButtonProps, "size" | "variant"> {
  icon: LucideIcon;
  children: React.ReactNode;
}

const SubHeaderButton = React.forwardRef<HTMLButtonElement, SubHeaderButtonProps>(({
  icon: IconComponent,
  children,
  className,
  ...props
}, ref) => (
  <Button
    ref={ref}
    size="sm"
    variant="ghost"
    className={cn("flex items-center gap-1 text-neutral-600", className)}
    {...props}
  >
    <IconComponent size={16} />
    {children}
  </Button>
));

SubHeaderButton.displayName = 'SubHeaderButton';

export default SubHeaderButton;
