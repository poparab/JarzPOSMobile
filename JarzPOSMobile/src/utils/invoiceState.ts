type Column =
  | 'Received'
  | 'Processing'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Completed';

interface InvoiceDoc {
  status?: string;
  sales_invoice_state?: string;
}

export function deriveInvoiceState(doc: InvoiceDoc): Column {
  if (doc.sales_invoice_state) {
    switch (doc.sales_invoice_state) {
      case 'Out for Delivery':
        return 'Out for Delivery';
      case 'Completed':
      case 'Paid':
        return 'Completed';
      case 'Preparing':
        return 'Preparing';
      case 'Processing':
        return 'Processing';
    }
  }

  switch (doc.status) {
    case 'Paid':
      return 'Completed';
    case 'Submitted':
      return 'Received';
    default:
      return 'Received';
  }
}
