import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface PaginationProps {
  current_page: number;
  total_pages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  current_page,
  total_pages,
  onPageChange,
  className,
}) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= total_pages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, current_page - 1))}
        disabled={current_page <= 1}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {getPages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'h-8 w-8 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
              current_page === page
                ? 'bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900'
                : 'hover:bg-slate-100 text-slate-900 dark:text-slate-50 dark:hover:bg-slate-800'
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(total_pages, current_page + 1))}
        disabled={current_page >= total_pages}
        className="gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
