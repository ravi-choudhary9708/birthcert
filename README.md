# 🏛️ Birth Certificate Portal

A comprehensive **online birth certificate registration system** built with **Next.js 14** and **MongoDB**. This application digitizes the traditional birth certificate registration process with a **40-hospital multi-institutional architecture**, allowing parents to submit applications online and enabling government staff to process them efficiently through a two-tier verification system with row-level security.

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Hospital-Based Architecture](#-hospital-based-architecture)
- [User Roles & Workflow](#-user-roles--workflow)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Row-Level Security](#-row-level-security)
- [Email System](#-email-system)
- [Security Features](#-security-features)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🚀 Features

### For Parents (Public Users)
- **Hospital Selection**: Choose from 40 registered hospitals where birth occurred
- **Online Application Submission**: Complete multi-step form with child, parent, and address details
- **Instant Application Number**: Generated upon submission (Format: `BC-YYYY-XXXXXXXX`)
- **Real-time Tracking**: Track application status using the application number
- **Email Notifications**: Automated updates at each stage of the process
- **Mobile-Responsive Design**: Works seamlessly on all devices

### For Hospital Staff (40 Hospitals)
- **Hospital-Scoped Dashboard**: Each hospital staff member sees only their hospital's applications
- **Row-Level Security**: Cannot access or modify other hospitals' applications
- **Verification Workflow**: Review and approve applications from their own hospital
- **Bulk Processing**: Efficient review interface for high-volume processing
- **Rejection with Reasons**: Provide detailed feedback for rejected applications

### For Government Operators
- **Cross-Hospital View**: See all verified applications from all 40 hospitals
- **Final Approval Authority**: Provide final approval for certificate issuance
- **Quality Control**: Second-tier verification ensures accuracy
- **Certificate Issuance**: Mark applications as ready for certificate collection

### For System Administrator
- **Complete System Overview**: Unscoped access to all applications across all hospitals
- **Analytics Dashboard**: 
  - Total applications and certificates issued
  - Applications by status breakdown
  - Hospital-wise performance metrics
  - Average processing turnaround time
  - Common rejection reasons analysis
  - Monthly issuance trends
- **Application Search**: Query and trace any application across all hospitals
- **System Monitoring**: Track system health and performance

### System Features
- **40-Hospital Architecture**: Independent verification queues for each hospital
- **Automatic Application Number Generation**: Collision-resistant unique IDs
- **Email Automation**: SMTP-based email system for all notifications
- **Data Validation**: Comprehensive client and server-side validation
- **Audit Trail**: Timestamps and user tracking for all status changes
- **Responsive Design**: Modern UI with CSS Grid and Flexbox

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Public Web    │    │  40 Hospitals    │    │   Operator      │
│   (Parents)     │    │  Staff Portals   │    │   Portal        │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                        │
          │                      │                        │
          └──────────────────────┼────────────────────────┼─────────┐
                                 │                        │         │
                    ┌────────────▼────────────────────────▼─────┐   │
                    │     Next.js API Routes                   │   │
                    │                                          │   │
                    │ • /api/applications (row-level security) │   │
                    │ • /api/hospitals                         │   │
                    │ • /api/auth/*                           │   │
                    │ • /api/track                            │   │
                    │ • /api/admin/analytics                  │◄──┤
                    │ • /api/admin/applications               │   │
                    │ • /api/seed (dev only)                  │   │
                    └────────────┬────────────────────────────┘   │
                                 │                                │
                    ┌────────────▼────────────┐                  │
                    │     MongoDB Atlas       │                  │
                    │                         │                  │
                    │ Collections:            │                  │
                    │ • hospitals (40 docs)  │                  │
                    │ • applications         │                  │
                    │ • users                │                  │
                    └─────────────────────────┘                  │
                                                                 │
                           Admin Dashboard ──────────────────────┘
                           (unscoped queries)
```

## 🏥 Hospital-Based Architecture

### Key Concept: Decentralized Verification

This system implements a **40-hospital decentralized verification model** where:

1. **Each hospital verifies only their own applications**
   - Hospital 1 staff cannot see Hospital 2's applications
   - Row-level security enforced at the database query level
   - JWT tokens include `hospitalId` for authentication

2. **Parents select the hospital during application**
   - Required field in the application form
   - Hospital selection determines which verification queue the application enters

3. **Operators see all verified applications**
   - Cross-hospital view for final approval
   - Second-tier verification ensures quality control

4. **Admin has complete system access**
   - Single admin account with unscoped queries
   - Analytics across all hospitals
   - Application tracing and system monitoring

### Hospital Data Model

40 hospitals are pre-seeded with:
- **Hospital Number** (H01 - H40)
- **Hospital Name** (e.g., "All India Institute of Medical Sciences")
- **District** (Geographic location)
- **Contact Number** (Administrative contact)

## 👥 User Roles & Workflow

### Application Workflow

```mermaid
graph TD
    A[Parent Submits Application] --> B[Selects Hospital from 40 options]
    B --> C[Application Created - Status: pending]
    C --> D[Routed to Selected Hospital's Queue]
    D --> E[Hospital Staff Reviews - Row-Level Security]
    E --> F{Hospital Staff Decision}
    F -->|Approve| G[Status: verifier_approved]
    F -->|Reject| H[Status: rejected]
    G --> I[Operator Reviews - Cross-Hospital Queue]
    I --> J{Operator Decision}
    J -->|Approve| K[Status: operator_approved - Certificate Ready]
    J -->|Reject| H
    H --> L[Parent Notified - Can Resubmit]
    K --> M[Parent Notified - Visit Hospital to Collect]
```

### User Roles

1. **Parents (Public)**
   - Submit birth certificate applications
   - Select hospital from dropdown (40 options)
   - Track application status
   - Receive email notifications

2. **Hospital Staff (40 separate hospitals)**
   - Login: `hospital1@example.com` / `Hospital@123` (and hospital2, etc.)
   - **Row-level security**: See only their hospital's applications
   - Review and verify applications from their hospital
   - Verify details against hospital birth records
   - Approve valid applications or reject with detailed reasons
   - Cannot access other hospitals' data

3. **Operator Staff (Government Central)**
   - Login: `operator@example.com` / `Operator@123`
   - Review verified applications from **all 40 hospitals**
   - Provide final approval for certificate issuance
   - Second-tier quality control
   - Handle final rejection if needed

4. **System Administrator (Single Account)**
   - Login: `admin@system.gov` / `Admin@System@2025`
   - **Unscoped access** to all applications across all hospitals
   - View analytics dashboard with system-wide metrics
   - Search and trace any application
   - Monitor hospital performance
   - System health monitoring

## 🛠️ Tech Stack

**Frontend:**
- **Next.js 14** (App Router)
- **React 19** with TypeScript
- **CSS3** (Custom styling with CSS Variables)
- **Responsive Design** (Mobile-first approach)

**Backend:**
- **Next.js API Routes** (Server-side logic)
- **MongoDB** with **Mongoose** (Database & ODM)
- **JWT** (Authentication)
- **bcryptjs** (Password hashing)

**Infrastructure:**
- **MongoDB Atlas** (Cloud database)
- **Nodemailer** (Email service)
- **Vercel** (Deployment platform)

**Utilities:**
- **nanoid** (Unique ID generation)
- **ESLint** (Code linting)
- **TypeScript** (Type safety)

## 💻 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- SMTP email service (Gmail, etc.)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd birthcert
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/birthcert

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Database
The system will automatically create database collections on first use. To create default staff accounts:

```bash
# Run the development server first
npm run dev

# Then visit the seed endpoint (development only)
curl http://localhost:3000/api/seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## ⚙️ Configuration

### Email Setup (Gmail Example)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use your Gmail address as `SMTP_USER`
4. Use the generated app password as `SMTP_PASS`

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get the connection string and add it to `MONGODB_URI`
4. Whitelist your IP address or use 0.0.0.0/0 for development

### JWT Secret Generation
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📖 Usage

### For Parents

1. **Submit Application**:
   - Visit the homepage
   - Click "Apply Now"
   - Fill out the 5-step form:
     - Child Information & Birth Details
     - Father's Details
     - Mother's Details & Contact Info
     - Address Information
     - Review & Submit
   - Receive application number via email

2. **Track Application**:
   - Use "Track Application" from the homepage
   - Enter your application number (e.g., `BC-2025-ABC12345`)
   - View current status and progress timeline

### For Staff

1. **Login**:
   - Click "Staff Login" from the homepage
   - Use provided credentials or seeded accounts

2. **Process Applications**:
   - **Verifiers**: Review pending applications at `/verify`
   - **Operators**: Review verified applications at `/approve`
   - View detailed application information
   - Approve or reject with reasons

## 🔌 API Documentation

### Public Endpoints

#### Get Hospitals List
```http
GET /api/hospitals
```
Returns all 40 registered hospitals for application form dropdown.

#### Submit Application
```http
POST /api/applications
Content-Type: application/json

{
  "hospitalId": "64abc123...",  // REQUIRED: Selected hospital ObjectId
  "dateOfBirth": "2025-01-01",
  "sex": "male",
  "fatherName": "John Doe",
  // ... other required fields
}
```

#### Track Application
```http
GET /api/track?app=BC-2025-ABC12345
```

### Protected Endpoints (Require Authentication)

#### Get Applications (Role-based with Row-Level Security)
```http
GET /api/applications
Authorization: Bearer <jwt-token>
```

**Behavior by Role:**
- **hospital_staff**: Returns only their hospital's pending applications
- **operator**: Returns all verifier_approved applications from all hospitals
- **admin**: Use `/api/admin/applications` for unscoped access

#### Update Application Status
```http
PATCH /api/applications/{id}
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "action": "approve" | "reject",
  "rejectionReason": "Optional reason for rejection"
}
```

**Row-Level Security:** Hospital staff can only update applications where `application.hospitalId === user.hospitalId`

#### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "hospital1@example.com",
  "password": "Hospital@123"
}
```

Returns JWT token with `hospitalId` for hospital_staff role.

### Admin-Only Endpoints

#### Analytics Dashboard
```http
GET /api/admin/analytics
Authorization: Bearer <jwt-token> (admin role required)
```

Returns:
- Total applications and hospitals
- Applications by status
- Hospital-wise performance
- Average verification turnaround time
- Common rejection reasons
- Monthly issuance trends

#### Admin Application Search
```http
GET /api/admin/applications?page=1&limit=50&status=pending&hospitalId=64abc...
Authorization: Bearer <jwt-token> (admin role required)
```

Unscoped query with pagination and filters.
```

## 🗄️ Database Schema

### Hospitals Collection (40 documents)
```javascript
{
  _id: ObjectId,
  hospitalNo: Number,  // 1-40, unique
  name: String,        // e.g., "All India Institute of Medical Sciences"
  district: String,    // e.g., "New Delhi"
  contactNo: String,   // e.g., "+91-11-10011234"
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  applicationNumber: "BC-2025-ABC12345",
  
  // Hospital Assignment (NEW)
  hospitalId: ObjectId,   // Reference to Hospital - which hospital will verify
  hospitalNo: Number,     // Denormalized for quick display (1-40)
  
  // Child Information
  dateOfBirth: Date,
  sex: "male" | "female" | "transgender",
  childName: String, // Optional
  
  // Father Details
  fatherName: String,
  fatherMobile: String,
  fatherEmail: String,
  fatherAadhaar: String, // Optional
  fatherReligion: String,
  fatherEducation: String,
  fatherOccupation: String,
  
  // Mother Details
  motherName: String,
  motherMobile: String,
  motherEmail: String,
  motherAadhaar: String, // Optional
  motherReligion: String,
  motherEducation: String,
  motherOccupation: String,
  motherAgeAtDelivery: Number,
  
  // Contact & Address
  contactEmail: String,
  addressAtBirth: String,
  permanentAddress: String,
  village: String,
  subDistrict: String,
  district: String,
  state: String,
  pinCode: String,
  
  // Birth Details
  placeOfBirth: "hospital" | "home" | "other",
  institutionName: String, // Optional
  institutionAddress: String, // Optional
  informantName: String,
  informantMobile: String,
  birthWeight: Number, // Optional
  gestationPeriod: Number, // Optional
  deliveryMethod: "normal" | "caesarean" | "forceps" | "other",
  
  // Workflow
  status: "pending" | "verifier_approved" | "operator_approved" | "rejected",
  rejectionReason: String, // Optional
  verifiedBy: ObjectId, // Reference to User
  verifiedAt: Date, // Optional
  approvedBy: ObjectId, // Reference to User
  approvedAt: Date, // Optional
  
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // Unique
  passwordHash: String,
  role: "hospital_staff" | "operator" | "admin",  // Updated roles
  hospitalId: ObjectId,  // Required for hospital_staff, null for operator/admin
  createdAt: Date,
  updatedAt: Date
}
```

## � Row-Level Security

The system implements **strict row-level security** to ensure data isolation:

### Hospital Staff Restrictions
```javascript
// Hospital staff can ONLY query their own hospital's applications
GET /api/applications 
→ Filters: { status: 'pending', hospitalId: user.hospitalId }

// Hospital staff can ONLY update their own hospital's applications
PATCH /api/applications/:id
→ Checks: application.hospitalId === user.hospitalId
→ Returns 403 Forbidden if mismatch
```

### Operator Access
```javascript
// Operators see ALL verifier_approved applications across all hospitals
GET /api/applications
→ Filters: { status: 'verifier_approved' }  // No hospitalId filter
```

### Admin Access
```javascript
// Admin has UNSCOPED access to all data
GET /api/admin/applications
→ No filters applied (can query by status, hospital, etc.)
```

### Implementation Details
- **JWT tokens include `hospitalId`** for hospital_staff role
- **Database queries automatically filtered** based on user role
- **Application updates verify ownership** before allowing modifications
- **Mongoose middleware** could be added for additional protection

## �📧 Email System

The application sends automated emails at these stages:

1. **Application Submitted**: Confirmation with application number
2. **Hospital Verified**: Notification that hospital has verified the application
3. **Operator Approved**: Final approval notification
4. **Application Rejected**: Rejection notification with reason (from either hospital or operator)

### Email Templates
All emails use a consistent HTML template with:
- Government branding
- Application number prominently displayed
- Clear action buttons
- Professional styling

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication for staff
- **Row-Level Security**: Hospital staff can only access their hospital's data
- **Hospital ID in JWT**: Tokens include hospitalId for fine-grained access control
- **Password Hashing**: bcryptjs with salt rounds
- **Role-Based Access Control**: Verifiers and Operators see different application queues
- **Input Validation**: Client and server-side validation
- **CORS Protection**: API routes protected against unauthorized access
- **Environment Variables**: Sensitive data stored securely
- **Unique Application Numbers**: Collision-resistant ID generation

## 🚀 Development

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── analytics/      # Admin analytics endpoint
│   │   │   └── applications/   # Admin unscoped queries
│   │   ├── applications/       # Main application CRUD (with row-level security)
│   │   ├── auth/              # Authentication endpoints
│   │   ├── hospitals/         # Hospital list endpoint
│   │   ├── seed/              # Database seeding (dev only)
│   │   └── track/             # Public tracking endpoint
│   ├── admin/                  # Admin dashboard page
│   ├── apply/                  # Application form page
│   ├── approve/                # Operator dashboard page
│   ├── hospital/               # Hospital staff dashboard page
│   ├── login/                  # Staff login page
│   ├── track/                  # Application tracking page
│   └── globals.css             # Global styles
├── lib/
│   ├── models/
│   │   ├── Application.ts      # Application schema (with hospitalId)
│   │   ├── Hospital.ts         # Hospital schema (NEW)
│   │   └── User.ts             # User schema (with hospitalId)
│   ├── auth-middleware.ts      # JWT authentication
│   ├── db.ts                   # Database connection
│   ├── email.ts                # Email service
│   ├── jwt.ts                  # JWT utilities (with hospitalId in payload)
│   └── application-number.ts   # Unique ID generation
```
```

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Database Seeding
For development, seed 40 hospitals and default staff accounts:
```bash
curl http://localhost:3000/api/seed
```

Creates:
- **39 Hospitals**: H01-H39 (Madhubani district, Bihar)
- **39 Hospital Staff Accounts**: One for each hospital
  - `hospital1@madhubani.gov` through `hospital39@madhubani.gov`
  - All passwords: `Hospital@123`
  - Each staff assigned to their respective hospital
- **Operator**: `operator@madhubani.gov` / `Operator@123`
- **Admin**: `admin@madhubani.gov` / `Admin@System@2025`

**Security Note**: The `/api/seed` endpoint is automatically disabled in production (`NODE_ENV=production`)

## 🌐 Deployment

### Vercel Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on commits

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=production-email@domain.com
SMTP_PASS=production_app_password
SMTP_FROM=noreply@domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Production Checklist
- [ ] Set secure JWT secret
- [ ] Configure production email service
- [ ] Set up MongoDB production database
- [ ] Add custom domain (optional)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Test email functionality
- [ ] Verify all environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add proper error handling
- Write meaningful commit messages
- Test thoroughly before submitting PR
- Update documentation if needed

## 📞 Support

For issues and questions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include error logs and environment details

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Built with ❤️ for digital governance and citizen services**
