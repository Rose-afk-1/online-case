# 🏛️ Online Case Filing and Tracking App

This is a **full-stack web application** that allows users to **file and track court cases online**, and admins (court officials) to manage those cases. Built using **Next.js App Router**, **MongoDB**, **NextAuth.js**, **Tailwind CSS**, and **ShadCN UI**.

---

## 💡 What the App Does

### 👥 For Users
- Register and log in
- File a legal case online
- Upload evidence
- Make payments
- Track case status and hearing schedule

### 🛡️ For Admins
- Log in securely
- Review and manage submitted cases
- Update case status (approved, rejected, pending)
- Manage hearing schedules
- View uploaded evidence
- Generate reports

---

## 🧱 Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Database**: MongoDB
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + ShadCN UI
- **State Management**: React/Next.js built-in state
- **Routing**: File-based routing with app/

---

## 🗂️ Folder Structure

```
app/
├── (auth)/         → login and register pages
├── (user)/         → user dashboard, cases, payments, evidence
├── (admin)/        → admin dashboard, case review, hearings, reports
├── api/            → API routes for auth, cases, payments, evidence, hearings
components/
├── ui/             → ShadCN components
├── shared/         → components used by both user and admin
├── user/           → user-specific components
├── admin/          → admin-specific components
models/
├── User.ts         → User schema
├── Case.ts         → Case schema
├── Payment.ts      → Payment schema
├── Evidence.ts     → Evidence schema
├── Hearing.ts      → Hearing schema
lib/
├── auth.ts         → NextAuth config
├── db.ts           → MongoDB connection
middleware.ts       → Role-based access control
```

---

## 👮 Role-Based Access

- `middleware.ts` is used to protect routes
- Users cannot access admin pages
- Admins can access everything inside `(admin)/`
- Session-based protection via `NextAuth.js`

---

## 🧠 Data Flow (Based on DFD)

1. **User registers/logs in** → stored in `users` collection
2. **User files case** → saved in `cases`
3. **User uploads evidence** → saved in `evidence`
4. **User makes payment** → recorded in `payments`
5. **Admin reviews case and schedules hearings** → updates `hearings` collection
6. **User tracks case progress from dashboard**

---

## 🧰 What Cursor AI Can Help With

Ask Cursor AI to:
- Generate Mongoose models for `User`, `Case`, `Payment`, `Evidence`, `Hearing`
- Create protected API routes using Next.js App Router
- Build reusable UI components with ShadCN and Tailwind
- Implement role-based middleware using `NextAuth`
- Suggest folder/file structure and layout components
- Handle form submissions, file uploads, and status updates

---

## 📌 Notes

This project is part of a college academic submission. It is not deployed and runs locally. Only free tools and technologies are used.

## Email Notifications Setup with SendGrid

The application uses SendGrid for sending email notifications. Follow these steps to set up:

1. Create a free SendGrid account at https://sendgrid.com/
2. Create an API key in your SendGrid dashboard
3. Add the API key to your `.env.local` file:

```
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email@example.com
```

4. In SendGrid, verify your sender email address
5. Update the `EMAIL_FROM` variable with your verified email address

Types of emails the system will send:
- Case creation confirmation
- Case status updates
- Evidence approval/rejection notifications
- Hearing schedule notifications

## Getting Started
