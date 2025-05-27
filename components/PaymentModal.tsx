import React, { useState } from 'react';
import axios from 'axios';
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

interface PaymentModalProps {
  payment: Payment;
  onClose: () => void;
  onRefresh: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ payment, onClose, onRefresh }) => {
  const [status, setStatus] = useState<string>(payment.status);
  const [adminNotes, setAdminNotes] = useState<string>(payment.adminNotes || '');
  const [loading, setLoading] = useState<boolean>(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  const formatAmount = (amount: number, currency: string = 'INR'): string => {
    return `₹${amount.toLocaleString()}`;
  };

  const handleUpdatePayment = async (): Promise<void> => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/payments/${payment._id}/status`, {
        status,
        notes: adminNotes
      });
      
      alert('Payment updated successfully');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Payment Details</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailGroup}>
              <h3>Transaction Information</h3>
              <div className={styles.detailItem}>
                <label>Transaction ID:</label>
                <span>{payment.transactionId}</span>
              </div>
              <div className={styles.detailItem}>
                <label>Amount:</label>
                <span>{formatAmount(payment.amount, payment.currency)}</span>
              </div>
              <div className={styles.detailItem}>
                <label>Payment Method:</label>
                <span>{payment.paymentMethod}</span>
              </div>
              <div className={styles.detailItem}>
                <label>Payment Date:</label>
                <span>{formatDate(payment.paymentDate)}</span>
              </div>
              {payment.razorpayOrderId && (
                <div className={styles.detailItem}>
                  <label>Razorpay Order ID:</label>
                  <span>{payment.razorpayOrderId}</span>
                </div>
              )}
              {payment.razorpayPaymentId && (
                <div className={styles.detailItem}>
                  <label>Razorpay Payment ID:</label>
                  <span>{payment.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            <div className={styles.detailGroup}>
              <h3>User Information</h3>
              {payment.userId ? (
                <>
                  <div className={styles.detailItem}>
                    <label>Name:</label>
                    <span>{payment.userId.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Email:</label>
                    <span>{payment.userId.email}</span>
                  </div>
                  {payment.userId.phoneNumber && (
                    <div className={styles.detailItem}>
                      <label>Phone:</label>
                      <span>{payment.userId.phoneNumber}</span>
                    </div>
                  )}
                </>
              ) : (
                <p>User information not available</p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <h3>Case Information</h3>
              {payment.caseId ? (
                <>
                  <div className={styles.detailItem}>
                    <label>Case Number:</label>
                    <span>{payment.caseId.caseNumber}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Case Title:</label>
                    <span>{payment.caseId.title}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Case Status:</label>
                    <span>{payment.caseId.status}</span>
                  </div>
                </>
              ) : (
                <p>Case information not available</p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <h3>Administrative</h3>
              <div className={styles.detailItem}>
                <label>Created:</label>
                <span>{formatDate(payment.createdAt)}</span>
              </div>
              <div className={styles.detailItem}>
                <label>Last Updated:</label>
                <span>{formatDate(payment.updatedAt)}</span>
              </div>
              {payment.description && (
                <div className={styles.detailItem}>
                  <label>Description:</label>
                  <span>{payment.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.adminSection}>
            <h3>Admin Actions</h3>
            <div className={styles.adminControls}>
              <div className={styles.formGroup}>
                <label htmlFor="status">Update Status:</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="adminNotes">Admin Notes:</label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this payment..."
                  className={styles.notesTextarea}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button 
            onClick={handleUpdatePayment} 
            disabled={loading}
            className={styles.updateBtn}
          >
            {loading ? 'Updating...' : 'Update Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 