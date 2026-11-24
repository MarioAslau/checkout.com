import { useRef } from "react";
import { Container, EmptyBox, ErrorBox, Spinner, TableWrapper, Title } from "./components";
import { I18N } from "../constants/i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  pageChanged,
  selectPage,
  selectPaymentQueryArgs,
} from "../features/payments/paymentFiltersSlice";
import { useGetPaymentsQuery } from "../features/payments/paymentsApi";
import type { PaymentSearchResponse } from "../types/payment";
import { getErrorMessage } from "../utils/errors";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentsFilters } from "./PaymentsFilters";
import { Pagination } from "./Pagination";

export const PaymentsPage = () => {
  const dispatch = useAppDispatch();
  const page = useAppSelector(selectPage);
  const queryArgs = useAppSelector(selectPaymentQueryArgs);
  const { currentData, error, isLoading, isFetching, isError } =
    useGetPaymentsQuery(queryArgs);
  const shownRef = useRef<PaymentSearchResponse | undefined>(undefined);

  if (currentData) {
    shownRef.current = currentData;
  }

  const shown = currentData ?? shownRef.current;
  let content = null;

  if (isLoading) {
    content = (
      <div role="status">
        <Spinner />
        <span className="sr-only">{I18N.LOADING}</span>
      </div>
    );
  } else if (isError) {
    content = <ErrorBox role="alert">{getErrorMessage(error)}</ErrorBox>;
  } else if (currentData && currentData.payments.length === 0) {
    content = <EmptyBox>{I18N.NO_PAYMENTS_FOUND}</EmptyBox>;
  } else if (shown && shown.payments.length > 0) {
    content = (
      <div aria-busy={isFetching} className={isFetching ? "opacity-50" : undefined}>
        <TableWrapper>
          <PaymentsTable payments={shown.payments} />
          <Pagination
            page={page}
            pageSize={shown.pageSize}
            total={shown.total}
            onPageChange={(nextPage) => dispatch(pageChanged(nextPage))}
          />
        </TableWrapper>
      </div>
    );
  }

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <PaymentsFilters />
      {content}
    </Container>
  );
};
