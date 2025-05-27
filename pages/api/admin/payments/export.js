import dbConnect from '../../../../lib/db';
import Payment from '../../../../models/Payment';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// Simple CSV converter function
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify admin session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (session.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { format = 'csv', dateFrom, dateTo, status } = req.query;

    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.paymentDate = {};
      if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(filter)
      .populate('userId', 'name email')
      .populate('caseId', 'caseNumber title')
      .sort({ paymentDate: -1 });

    if (format === 'csv') {
      const csv = payments.map(payment => ({
        'Payment ID': payment._id.toString(),
        'Transaction ID': payment.transactionId || '',
        'User Name': payment.userId?.name || 'N/A',
        'User Email': payment.userId?.email || 'N/A',
        'Case Number': payment.caseId?.caseNumber || 'N/A',
        'Case Title': payment.caseId?.title || 'N/A',
        'Amount': payment.amount || 0,
        'Currency': payment.currency || 'INR',
        'Payment Method': payment.paymentMethod || 'N/A',
        'Status': payment.status || 'pending',
        'Payment Date': payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A',
        'Razorpay Order ID': payment.razorpayOrderId || 'N/A',
        'Razorpay Payment ID': payment.razorpayPaymentId || 'N/A',
        'Description': payment.description || 'N/A',
        'Admin Notes': payment.adminNotes || 'N/A',
        'Created At': payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payments-${new Date().toISOString().split('T')[0]}.csv`);
      
      const csvContent = convertToCSV(csv);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({ 
        payments,
        exportedAt: new Date(),
        totalRecords: payments.length,
        filters: { dateFrom, dateTo, status }
      });
    }

  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({ error: 'Failed to export payments' });
  }
} 