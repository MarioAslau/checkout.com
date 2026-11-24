import { Container, Title } from "./components";
import { I18N } from "../constants/i18n";
import { useAppSelector } from "../store/hooks";
import { selectPaymentQueryArgs } from "../features/payments/paymentFiltersSlice";
import { useGetPaymentsQuery } from "../features/payments/paymentsApi";
import { PaymentsTable } from "./PaymentsTable";

export const PaymentsPage = () => {
  const queryArgs = useAppSelector(selectPaymentQueryArgs);
  const { data } = useGetPaymentsQuery(queryArgs);

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      {data ? <PaymentsTable payments={data.payments} /> : null}
    </Container>
  );
};
