import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div className="min-w-0">
        <p className="section-kicker">{eyebrow}</p>
        <h3 className="section-title">{title}</h3>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}
