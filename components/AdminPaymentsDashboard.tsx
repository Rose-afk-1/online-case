import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentRow from '@/components/PaymentRow';
import PaymentModal from '@/components/PaymentModal';
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

interface PaymentStatistics {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalCompletedAmount: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPayments: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaymentFilters {
  page: number;
  limit: number;
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const AdminPaymentsDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics>({
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    totalCompletedAmount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 20,
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/payments', {
        params: filters
      });
      
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: string | number): void => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? (typeof value === 'number' ? value : parseInt(value.toString())) : 1 // Reset to first page when filtering, except for page changes
    }));
  };

  const handleExport = async (): Promise<void> => {
    try {
      const response = await axios.get('/api/admin/payments/export', {
        params: { ...filters, format: 'csv' },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting payments:', error);
      alert('Error exporting payments');
    }
  };

  const handleViewPayment = (payment: Payment): void => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Payment Management</h1>
        <p>Manage and monitor all payments in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statisticsGrid}>
        <div className={styles.statCard}>
          <h3>Total Payments</h3>
          <p className={styles.statValue}>{statistics.totalPayments || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Amount</h3>
          <p className={styles.statValue}>₹{(statistics.totalAmount || 0).toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completed</h3>
          <p className={`${styles.statValue} ${styles.textGreen}`}>{statistics.completedPayments || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <p className={`${styles.statValue} ${styles.textYellow}`}>{statistics.pendingPayments || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Failed</h3>
          <p className={`${styles.statValue} ${styles.textRed}`}>{statistics.failedPayments || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Revenue</h3>
          <p className={styles.statValue}>₹{(statistics.totalCompletedAmount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersRow}>
          <input
            type="text"
            placeholder="Search by transaction ID, case number..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className={styles.dateInput}
            placeholder="From Date"
          />
          
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className={styles.dateInput}
            placeholder="To Date"
          />
          
          <button onClick={handleExport} className={styles.exportBtn}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>Loading payments...</div>
        ) : (
          <table className={styles.paymentsTable}>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Case</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.noData}>No payments found</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <PaymentRow 
                    key={payment._id} 
                    payment={payment}
                    onViewPayment={handleViewPayment}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button 
          onClick={() => handleFilterChange('page', filters.page - 1)}
          disabled={!pagination.hasPrev}
          className={styles.paginationBtn}
        >
          Previous
        </button>
        
        <span className={styles.paginationInfo}>
          Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
          <br />
          Total: {pagination.totalPayments || 0} payments
        </span>
        
        <button 
          onClick={() => handleFilterChange('page', filters.page + 1)}
          disabled={!pagination.hasNext}
          className={styles.paginationBtn}
        >
          Next
        </button>
      </div>

      {/* Payment Modal - Rendered outside the table structure */}
      {showModal && selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={handleCloseModal}
          onRefresh={fetchPayments}
        />
      )}
    </div>
  );
};

export default AdminPaymentsDashboard; 