import React from 'react';
import styles from '@/styles/AdminPayments.module.css';

interface Payment {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  description?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  adminNotes?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  caseId?: {
    _id: string;
    caseNumber: string;
    title: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaymentRowProps {
  payment: Payment;
  onViewPayment: (payment: Payment) => void;
}

const PaymentRow: React.FC<PaymentRowProps> = ({ payment, onViewPayment }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string = 'INR'): string => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      case 'refunded':
        return styles.statusRefunded;
      default:
        return styles.statusDefault;
    }
  };

  const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <tr className={styles.paymentRow}>
      <td className={styles.transactionId}>
        {truncateText(payment.transactionId)}
      </td>
      <td className={styles.userInfo}>
        <div>
          <div className={styles.userName}>{payment.userId?.name || 'N/A'}</div>
          <div className={styles.userEmail}>{payment.userId?.email || 'N/A'}</div>
        </div>
      </td>
      <td className={styles.caseInfo}>
        {payment.caseId ? (
          <div>
            <div className={styles.caseNumber}>{payment.caseId.caseNumber}</div>
            <div className={styles.caseTitle}>{truncateText(payment.caseId.title, 15)}</div>
          </div>
        ) : (
          'N/A'
        )}
      </td>
      <td className={styles.amount}>
        {formatAmount(payment.amount, payment.currency)}
      </td>
      <td className={styles.paymentMethod}>
        {payment.paymentMethod}
      </td>
      <td className={styles.status}>
        <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
          {payment.status.toUpperCase()}
        </span>
      </td>
      <td className={styles.date}>
        {formatDate(payment.paymentDate)}
      </td>
      <td className={styles.actions}>
        <button
          onClick={() => onViewPayment(payment)}
          className={styles.viewBtn}
        >
          View
        </button>
      </td>
    </tr>
  );
};

export default PaymentRow; 