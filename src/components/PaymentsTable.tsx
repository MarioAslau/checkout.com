import type { Payment } from "../types/payment";
import { I18N } from "../constants/i18n";
import { formatAmount, formatDate } from "../utils/format";
import {
  StatusBadge,
  Table,
  TableBodyWrapper,
  TableCell,
  TableHeader,
  TableHeaderRow,
  TableHeaderWrapper,
  TableRow,
} from "./components";

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  return (
    <Table>
      <TableHeaderWrapper>
        <TableHeaderRow>
          <TableHeader scope="col">{I18N.TABLE_HEADER_PAYMENT_ID}</TableHeader>
          <TableHeader scope="col">{I18N.TABLE_HEADER_DATE}</TableHeader>
          <TableHeader scope="col">{I18N.TABLE_HEADER_AMOUNT}</TableHeader>
          <TableHeader scope="col">{I18N.TABLE_HEADER_CUSTOMER}</TableHeader>
          <TableHeader scope="col">{I18N.TABLE_HEADER_CURRENCY}</TableHeader>
          <TableHeader scope="col">{I18N.TABLE_HEADER_STATUS}</TableHeader>
        </TableHeaderRow>
      </TableHeaderWrapper>
      <TableBodyWrapper>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.id}</TableCell>
            <TableCell>{formatDate(payment.date)}</TableCell>
            <TableCell>{formatAmount(payment.amount)}</TableCell>
            <TableCell>{payment.customerName ?? I18N.EMPTY_CUSTOMER}</TableCell>
            <TableCell>{payment.currency ?? I18N.EMPTY_CURRENCY}</TableCell>
            <TableCell>
              <StatusBadge $status={payment.status}>{payment.status}</StatusBadge>
            </TableCell>
          </TableRow>
        ))}
      </TableBodyWrapper>
    </Table>
  );
}
