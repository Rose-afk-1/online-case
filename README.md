# 🏛️ Online Case Filing and Tracking System

A comprehensive **full-stack web application** for digital case management, allowing users to file and track legal cases online while providing court administrators with powerful case management tools. Built with **Next.js 15**, **MongoDB**, **NextAuth.js**, and modern web technologies.

![Application Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

---

## ✨ Key Features

### 👤 **User Portal**
- 🔐 **Secure Authentication** - User registration, login, and email verification
- 📋 **Case Filing** - Comprehensive case creation with automated filing fees
- 📄 **Evidence Management** - Upload, organize, and track case evidence
- 💳 **Payment Processing** - Integrated Razorpay payment gateway
- 📊 **Payment History** - Complete transaction tracking and invoice downloads
- 📅 **Hearing Management** - View scheduled hearings and updates
- 🔔 **Notifications** - Real-time updates on case status
- 👤 **Profile Management** - Update personal information and preferences

### 🛡️ **Admin Portal**
- 📊 **Dashboard Analytics** - Complete system overview and statistics
- ⚖️ **Case Review** - Review, approve, or reject filed cases
- 📅 **Hearing Scheduling** - Schedule and manage court hearings
- 👥 **User Management** - Manage user accounts and verification
- 📄 **Evidence Review** - Review and approve uploaded evidence
- ⚙️ **System Settings** - Configure system parameters and fees
- 📈 **Reporting** - Generate comprehensive system reports

### 🔧 **Technical Features**
- 🔒 **Role-based Access Control** - Secure route protection
- 📧 **Email Notifications** - Automated email system with Brevo API
- 💰 **Payment Integration** - Razorpay payment processing
- 📱 **Responsive Design** - Mobile-first, modern UI
- 🔄 **Real-time Updates** - Live status tracking
- 🗃️ **File Management** - Secure file upload and storage

---

## 🧱 Technology Stack

### **Frontend**
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Icons**: React Icons
- **State Management**: React Hooks & Context

### **Backend**
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js 4.24.8
- **File Storage**: Local file system with planned cloud integration
- **Email Service**: Brevo API
- **Payment Gateway**: Razorpay

### **Development Tools**
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript
- **Development Server**: Next.js Dev Server with Hot Reload

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- MongoDB instance (local or cloud)
- Brevo account for email services
- Razorpay account for payments

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-case-filing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/case-filing

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # Email Service (Brevo)
   BREVO_API_KEY=your-brevo-api-key
   EMAIL_FROM=noreply@yourdomain.com

   # Payment Gateway (Razorpay)
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret

   # File Upload
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760

   # Application
   FILING_FEE_RATE=100
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - User Portal: `http://localhost:3000`
   - Admin Portal: `http://localhost:3000/admin`

---

## 📁 Project Structure

```
online-case-filing/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages
│   │   ├── signin/
│   │   ├── register/
│   │   └── verify-email/
│   ├── user/                    # User portal
│   │   ├── dashboard/
│   │   ├── cases/
│   │   ├── evidence/
│   │   ├── hearings/
│   │   ├── payment-history/
│   │   └── profile/
│   ├── admin/                   # Admin portal
│   │   ├── dashboard/
│   │   ├── cases/
│   │   ├── users/
│   │   ├── hearings/
│   │   └── settings/
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── cases/
│   │   ├── payment/
│   │   ├── evidence/
│   │   └── hearings/
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── ui/                      # ShadCN UI components
│   ├── auth/                    # Authentication components
│   ├── forms/                   # Form components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── auth.ts                  # NextAuth configuration
│   ├── db.ts                    # Database connection
│   ├── email.ts                 # Email service
│   └── utils.ts                 # Utility functions
├── models/                      # Database schemas
│   ├── User.ts
│   ├── Case.ts
│   ├── Payment.ts
│   ├── Evidence.ts
│   └── Hearing.ts
├── types/                       # TypeScript definitions
└── middleware.ts                # Route protection
```

---

## 🔐 Authentication & Security

### **User Roles**
- **User**: Can file cases, upload evidence, make payments, view hearings
- **Admin**: Full system access including case management and user administration

### **Security Features**
- Password hashing with bcrypt
- Email verification for new accounts
- Role-based route protection
- Secure file upload validation
- Payment security with Razorpay integration

### **Default Admin Account**
Create an admin account through the `/auth/create-admin` route (development only)

---

## 💳 Payment System

### **Integrated Features**
- **Filing Fee Calculation**: Automatic fee calculation based on case type
- **Razorpay Integration**: Secure payment processing
- **Payment History**: Complete transaction tracking
- **Invoice Generation**: Downloadable payment receipts
- **Payment Verification**: Server-side payment confirmation

### **Supported Payment Methods**
- Credit/Debit Cards
- Net Banking
- UPI
- Digital Wallets

---

## 📧 Email Notifications

### **Automated Emails**
- Welcome emails for new users
- Email verification
- Case status updates
- Hearing notifications
- Payment confirmations

### **Email Templates**
- Professional, responsive design
- Branded with system identity
- Dynamic content based on user actions

---

## 🗄️ Database Schema

### **Collections**
- **users**: User profiles and authentication data
- **cases**: Filed cases with metadata
- **payments**: Payment transactions and history
- **evidence**: Uploaded case evidence
- **hearings**: Scheduled court hearings
- **notifications**: User notifications

---

## 🚀 Deployment

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Considerations**
- Ensure all environment variables are configured
- Set up MongoDB with proper indexes
- Configure email service for production
- Set up payment gateway in live mode
- Implement proper file storage solution

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is part of an academic submission. All rights reserved.

---

## 🆘 Support

For issues or questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

## 🎯 Recent Updates

- ✅ **Payment History Feature**: Complete transaction tracking and invoice downloads
- ✅ **Next.js 15 Compatibility**: Upgraded to latest Next.js with full compatibility
- ✅ **Code Cleanup**: Removed all test files and unnecessary documentation
- ✅ **Enhanced Security**: Improved authentication and route protection
- ✅ **UI Improvements**: Modern, responsive design with better user experience

---

**Built with ❤️ for efficient legal case management**

