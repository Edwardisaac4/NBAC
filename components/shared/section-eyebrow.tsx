import { cn } from "@/lib/utils";

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <span
      className={cn(
        "font-sans text-xs uppercase tracking-widest font-medium text-nbac-emerald-light block mb-2",
        className
      )}
    >
      {children}
    </span>
  );
}
