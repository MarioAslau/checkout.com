import { I18N } from "../constants/i18n";
import { PaginationButton, PaginationRow } from "./components";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const lastPage = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

  return (
    <PaginationRow>
      <PaginationButton
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {I18N.PREVIOUS_BUTTON}
      </PaginationButton>
      <span aria-live="polite">
        {I18N.PAGE_LABEL} {page}
      </span>
      <PaginationButton
        type="button"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        {I18N.NEXT_BUTTON}
      </PaginationButton>
    </PaginationRow>
  );
}
