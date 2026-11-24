import { Container, EmptyBox, Spinner, Title } from "./components";
import { I18N } from "../constants/i18n";
import { useAppSelector } from "../store/hooks";
import { selectPaymentQueryArgs } from "../features/payments/paymentFiltersSlice";
import { useGetPaymentsQuery } from "../features/payments/paymentsApi";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentsFilters } from "./PaymentsFilters";

export const PaymentsPage = () => {
  const queryArgs = useAppSelector(selectPaymentQueryArgs);
  const { data, isLoading, isFetching } = useGetPaymentsQuery(queryArgs);

  let content = null;

  if (isLoading) {
    content = (
      <div role="status">
        <Spinner />
        <span className="sr-only">{I18N.LOADING}</span>
      </div>
    );
  } else if (data && data.payments.length === 0) {
    content = <EmptyBox>{I18N.NO_PAYMENTS_FOUND}</EmptyBox>;
  } else if (data) {
    content = (
      <div aria-busy={isFetching} className={isFetching ? "opacity-50" : undefined}>
        <PaymentsTable payments={data.payments} />
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
