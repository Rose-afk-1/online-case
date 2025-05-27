import User from '@/models/User';
import dbConnect from '@/lib/db';
import { sendAdminNotificationEmail } from '@/lib/email';

/**
 * Get all admin user emails for sending notifications
 * This function connects to the database and retrieves all users with the 'admin' role
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    await dbConnect();
    
    // Find all users with admin role
    const adminUsers = await User.find({ role: 'admin' }).select('email').lean();
    
    // Extract email addresses
    return adminUsers.map(user => user.email);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
}

/**
 * Send notifications to all admins about new user registrations
 * @param userData - Data about the newly registered user
 */
export async function notifyAdminsOfNewUser(userData: any): Promise<boolean> {
  try {
    // Get all admin emails
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.log('No admin users found to notify about new registration');
      return false;
    }
    
    // Prepare user data for the notification
    const notificationData = {
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      registeredAt: userData.createdAt || new Date()
    };
    
    // Send the notification
    const result = await sendAdminNotificationEmail(
      adminEmails,
      'New User Registration',
      'new_user',
      notificationData
    );
    
    return result;
  } catch (error) {
    console.error('Error notifying admins of new user:', error);
    return false;
  }
} 