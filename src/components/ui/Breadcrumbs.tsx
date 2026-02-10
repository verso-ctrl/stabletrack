'use client';

import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Find the last item with an href (parent link for mobile back arrow)
  const parentItem = [...items].reverse().find((item) => item.href);

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      {/* Mobile: show back arrow to parent */}
      {parentItem && (
        <Link
          href={parentItem.href!}
          className="sm:hidden inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {parentItem.label}
        </Link>
      )}

      {/* Desktop: full breadcrumb trail */}
      <ol className="hidden sm:flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
              {isLast || !item.href ? (
                <span className="text-foreground font-medium">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
