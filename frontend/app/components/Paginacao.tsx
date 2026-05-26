'use client';

interface PaginacaoProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Paginacao({ currentPage, lastPage, onPageChange }: PaginacaoProps) {
  if (lastPage <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(lastPage, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const buttonClass = (isActive: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-xl transition-all text-xs font-bold ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
    }`;

  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={buttonClass(currentPage === i)}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex gap-1 items-center">
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={buttonClass(currentPage === 1)}>
            1
          </button>
          {start > 2 && <span className="px-1 text-slate-400 font-medium">...</span>}
        </>
      )}
      {pages}
      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="px-1 text-slate-400 font-medium">...</span>}
          <button onClick={() => onPageChange(lastPage)} className={buttonClass(currentPage === lastPage)}>
            {lastPage}
          </button>
        </>
      )}
    </div>
  );
}
