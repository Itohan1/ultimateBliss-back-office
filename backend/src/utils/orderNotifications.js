export function getOrderStatusMessage(status, orderId) {
  switch (status) {
    case "PAID":
      return `Your payment for Order #${orderId} was successful.`;
    case "PROCESSING":
      return `Order #${orderId} is now being processed.`;
    case "SHIPPED":
      return `Order #${orderId} has been shipped.`;
    case "DELIVERED":
      return `Order #${orderId} has been delivered.`;
    case "FAILED":
      return `Payment for Order #${orderId} failed.`;
    default:
      return `Order #${orderId} status updated to ${status}.`;
  }
}

export function getTransactionStatusMessage(transactionStatus, orderId) {
  switch (transactionStatus) {
    case "successful":
      return `Order #${orderId} transaction status has been updated to ${transactionStatus}.`;
    case "failed":
      return `Order #${orderId} transaction status has been updated to ${transactionStatus}.`;
    default:
      return `Order #${orderId} transaction status has been updated to ${transactionStatus}.`;
  }
}
