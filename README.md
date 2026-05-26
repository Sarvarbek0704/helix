# Helix — Healthcare Management Platform

> A full-stack, production-grade healthcare management system connecting patients, doctors, nurses, lab technicians, and administrators in a single unified platform — covering appointments, medical records, prescriptions, lab orders, vitals, billing, and insurance.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Database Schema](#5-database-schema)
6. [Getting Started](#6-getting-started)
7. [Environment Variables](#7-environment-variables)
8. [API Documentation](#8-api-documentation)
9. [Frontend Pages](#9-frontend-pages)
10. [Role System](#10-role-system)
11. [Project Structure](#11-project-structure)

---

## 1. Project Overview

**Helix** is a full-featured hospital and clinic management platform built as a production-level portfolio project. It models the real workflow of a modern healthcare facility:

- **Patients** register, book appointments with specific doctors, track their vitals over time, view medical records and prescriptions, receive lab results, manage their bills, and follow up on insurance claims
- **Doctors** manage their weekly schedule and availability, confirm and conduct appointments, create medical records and prescriptions, order lab tests, and monitor patient history
- **Nurses** record vital signs for patients during visits and assist with appointment flow
- **Lab Technicians** process incoming lab orders, update their status through the workflow, and upload completed results
- **Admins** have full oversight — managing all users, departments, billing, insurance plans, and platform analytics

The platform models the full clinical lifecycle: **Registration → OTP Verification → Appointment Booking → Consultation → Record Creation → Prescription → Lab Order → Results → Billing → Insurance Claim**.

---

## 2. Features

### Authentication & Security
- Email + password registration with OTP email verification (10-minute expiry)
- JWT access tokens (15 min) + refresh tokens (7 days)
- Forgot password / reset password via secure tokenized email link
- Role-based access control enforced at the controller level via `@Roles()` decorator
- Global JWT guard — all routes require authentication by default; public routes use `@Public()`

### Patient Features
- Patient profile with blood type, date of birth, height/weight, allergies, chronic conditions, emergency contact, and insurance details
- Auto-generated patient number (e.g. `P000001`) on first verification
- Book appointments with any doctor, select date/time, specify reason and symptoms
- View upcoming and past appointments with full status history
- Access full medical records created by doctors
- View all prescriptions with medication details, dosage, and frequency
- Track vitals history (BP, heart rate, temperature, O₂ saturation, weight, BMI, glucose)
- Download and view lab results
- View and manage bills — see outstanding, partial, and paid
- Submit and track insurance claims

### Doctor Features
- Doctor profile with specialization, sub-specialization, license number, consultation fee, languages, bio, and rating
- Set weekly schedule with per-day time ranges — available slots are auto-generated for patients to book
- Manage appointment queue: confirm → start → complete with diagnosis and notes
- Create detailed medical records linked to appointments
- Issue prescriptions with multiple medication items
- Order lab tests (routine, urgent, STAT priority)
- View assigned patients and their full history

### Nurse Features
- Record vital signs for any patient linked to appointments
- Browse the patient list and view patient profiles

### Lab Technician Features
- View all incoming lab orders with priority indicators (Routine / Urgent / STAT)
- Update order status: Ordered → Sample Collected → Processing → Completed
- Upload structured lab results (test name, value, unit, reference range, flag)

### Admin Features
- Full user management: view, search, update, suspend, activate, delete
- Department management: create and manage clinical departments
- Full billing oversight: create bills, record payments, view revenue summary
- Insurance plan administration: create/update plans, process submitted claims
- Platform analytics: total users by role, appointment volumes, revenue trends
- Medication catalog: seed and manage the medication database

### Notifications
- System-generated notifications for: appointment confirmed/cancelled/reminder, lab result ready, prescription ready, bill generated, insurance claim update
- In-app notification center with unread count badge, mark-one/mark-all-read, delete

---

## 3. Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| Language | TypeScript |
| ORM | TypeORM |
| Database | PostgreSQL |
| Auth | JWT (access + refresh), bcryptjs |
| Email | Nodemailer |
| Validation | class-validator, class-transformer |
| Config | @nestjs/config |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State / API | Redux Toolkit + RTK Query |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Notifications | Sonner |
| Icons | Lucide React |
| Date Handling | date-fns |
| Forms | React Hook Form |
| Theme | next-themes (dark/light) |
| Auth Storage | js-cookie |

---

## 4. Architecture

### Response Envelope
All API responses are wrapped by a global `TransformInterceptor`:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-17T12:00:00.000Z"
}
```

The frontend `store/api/baseQuery.ts` automatically unwraps `.data` from every response before delivering it to RTK Query hooks — so components always work with the raw data, never the envelope.

```typescript
// store/api/baseQuery.ts — the one place envelope unwrapping happens
const result = await rawBase(args, api, extra);
if (result.data && "success" in result.data) {
  return { ...result, data: result.data.data };
}
return result;
```

> **Critical:** All 14 API files import `baseQuery` from `./baseQuery`. Never use a raw `fetchBaseQuery` in any API slice — tokens and envelope unwrapping would both break.

### Auth Flow
```
POST /api/auth/register
  → User created (status: pending_verification)
  → OTP sent via email
  ↓
POST /api/auth/verify-otp
  → Status set to active
  → Patient profile auto-created (for patient role)
  → Access token + refresh token returned
  ↓
POST /api/auth/login
  → Returns user + tokens
  ↓
POST /api/auth/refresh
  → Returns new access token + refresh token
```

### Route Protection
- **Backend:** `JwtAuthGuard` is applied globally. `@Public()` decorator marks the few open routes (register, login, verify OTP, etc.).
- **Frontend:** `middleware.ts` intercepts every request, redirects unauthenticated users to `/login` and authenticated users away from auth pages.

### Role-Based Navigation
The `Sidebar` component reads `user.role` from Redux and renders a different navigation set per role:

| Role | Nav items |
|---|---|
| `admin` | Dashboard, Patients, Doctors, Appointments, Departments, Billing, Notifications, Settings |
| `patient` | Dashboard, Appointments, Medical Records, Vitals, Prescriptions, Lab Results, Billing, Notifications, Settings |
| `doctor` | Dashboard, Patients, Appointments, Records, Prescriptions, Lab Orders, My Schedule, Notifications, Settings |
| `nurse` | Dashboard, Patients, Appointments, Record Vitals, Notifications, Settings |
| `lab_tech` | Dashboard, Lab Orders, Notifications, Settings |

---

## 5. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| password | VARCHAR | select: false |
| firstName | VARCHAR | |
| lastName | VARCHAR | |
| role | ENUM | patient, doctor, nurse, lab_tech, admin |
| status | ENUM | active, pending_verification, suspended |
| phone | VARCHAR | nullable |
| avatar | VARCHAR | nullable |
| isEmailVerified | BOOLEAN | default false |
| otpCode | VARCHAR | select: false, nullable |
| otpExpires | TIMESTAMP | select: false, nullable |
| resetToken | VARCHAR | select: false, nullable |
| resetTokenExpires | TIMESTAMP | select: false, nullable |
| createdAt / updatedAt | TIMESTAMP | |

### `patient_profiles`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK → users | |
| dateOfBirth | DATE | nullable |
| gender | VARCHAR | nullable |
| address / city / country | VARCHAR | nullable |
| bloodType | ENUM | A+, A-, B+, B-, AB+, AB-, O+, O-, unknown |
| height | DECIMAL | cm, nullable |
| weight | DECIMAL | kg, nullable |
| allergies | SIMPLE-ARRAY | nullable |
| chronicConditions | SIMPLE-ARRAY | nullable |
| emergencyContactName/Phone/Relation | VARCHAR | nullable |
| insurancePlanId / insuranceMemberId | VARCHAR | nullable |
| patientNumber | VARCHAR | auto e.g. P000001 |
| createdAt / updatedAt | TIMESTAMP | |

### `doctor_profiles`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK → users | |
| departmentId | UUID FK → departments | nullable |
| specialization | VARCHAR | |
| subSpecialization | VARCHAR | nullable |
| licenseNumber / licenseExpiry | VARCHAR / DATE | nullable |
| yearsOfExperience | INT | nullable |
| education / bio | VARCHAR / TEXT | nullable |
| consultationFee / followUpFee | DECIMAL | nullable |
| languages | SIMPLE-ARRAY | nullable |
| isAcceptingPatients | BOOLEAN | default true |
| totalPatients / totalAppointments | INT | counter |
| rating | DECIMAL(3,2) | 0–5 |
| reviewCount | INT | |
| doctorNumber | VARCHAR | |
| createdAt / updatedAt | TIMESTAMP | |

### `departments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR UNIQUE | e.g. Cardiology |
| description | TEXT | nullable |
| headDoctorId | UUID FK → doctor_profiles | nullable |
| isActive | BOOLEAN | default true |
| createdAt / updatedAt | TIMESTAMP | |

### `appointments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patientId | UUID FK → users | |
| doctorId | UUID FK → doctor_profiles | |
| departmentId | UUID FK → departments | nullable |
| appointmentDate | DATE | |
| appointmentTime | TIME | |
| durationMinutes | INT | default 30 |
| status | ENUM | pending, confirmed, in_progress, completed, cancelled, no_show |
| type | ENUM | in_person, telemedicine, follow_up, emergency |
| reason / symptoms / notes | VARCHAR | nullable |
| doctorNotes / diagnosis | VARCHAR | nullable |
| cancelReason | VARCHAR | nullable |
| appointmentNumber | VARCHAR | |
| fee / isPaid | DECIMAL / BOOLEAN | |
| createdAt / updatedAt | TIMESTAMP | |

### `medical_records`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patientId | UUID FK → users | |
| doctorId | UUID FK → doctor_profiles | nullable |
| appointmentId | UUID FK → appointments | nullable |
| type | ENUM | visit_note, diagnosis, procedure, surgery, vaccination, allergy, chronic_condition |
| title | VARCHAR | |
| description | TEXT | nullable |
| icdCode | VARCHAR | nullable |
| attachments | SIMPLE-ARRAY | file URLs |
| recordDate | DATE | nullable |
| createdAt / updatedAt | TIMESTAMP | |

### `vital_signs`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patientId | UUID FK → users | |
| recordedById | UUID FK → users | nullable (nurse/doctor) |
| appointmentId | UUID | nullable |
| temperature | DECIMAL(5,1) | °C |
| systolicBP / diastolicBP | INT | mmHg |
| heartRate / respiratoryRate | INT | bpm / breaths/min |
| oxygenSaturation | DECIMAL(4,1) | % |
| weight / height | DECIMAL | kg / cm |
| bmi | DECIMAL(4,1) | auto-computed |
| glucoseLevel | INT | mg/dL |
| notes | VARCHAR | nullable |
| recordedAt | TIMESTAMP | |
| createdAt | TIMESTAMP | |

### `prescriptions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patientId | UUID FK → users | |
| doctorId | UUID FK → doctor_profiles | |
| appointmentId | UUID FK → appointments | nullable |
| items | OneToMany → prescription_items | |
| status | ENUM | active, completed, cancelled, expired |
| diagnosis / notes | VARCHAR | nullable |
| validUntil | DATE | nullable |
| prescriptionNumber | VARCHAR | |
| createdAt / updatedAt | TIMESTAMP | |

### `prescription_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| prescriptionId | UUID FK → prescriptions | |
| medicationName | VARCHAR | |
| dosage / frequency / duration | VARCHAR | e.g. "500mg", "twice daily", "7 days" |
| instructions | VARCHAR | nullable |
| quantity | INT | nullable |

### `lab_orders`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patientId | UUID FK → users | |
| doctorId | UUID FK → doctor_profiles | |
| appointmentId | UUID FK → appointments | nullable |
| results | OneToMany → lab_results | |
| status | ENUM | ordered, sample_collected, processing, completed, cancelled |
| priority | ENUM | routine, urgent, stat |
| tests | SIMPLE-ARRAY | list of test names |
| clinicalNotes | VARCHAR | nullable |
| orderNumber | VARCHAR | |
| collectedAt / completedAt | TIMESTAMP | nullable |
| createdAt / updatedAt | TIMESTAMP | |

### `lab_results`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| labOrderId | UUID FK → lab_orders | |
| testName | VARCHAR | |
| value / unit | VARCHAR | |
| referenceRange | VARCHAR | nullable |
| flag | VARCHAR | nullable (HIGH, LOW, CRITICAL) |
| notes | VARCHAR | nullable |
| resultDate | TIMESTAMP | |

### `bills`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patientId | UUID FK → users | |
| appointmentId | UUID FK → appointments | nullable |
| items | OneToMany → bill_items | eager loaded |
| status | ENUM | pending, partial, paid, overdue, cancelled, insurance_pending |
| subtotal / discountPercent / discountAmount | DECIMAL | |
| taxAmount / totalAmount / paidAmount | DECIMAL | |
| insuranceCoverage | DECIMAL | |
| paymentMethod | ENUM | cash, card, insurance, transfer |
| dueDate / paidAt | DATE / TIMESTAMP | nullable |
| billNumber | VARCHAR | |
| createdAt / updatedAt | TIMESTAMP | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK → users | |
| type | ENUM | appointment_confirmed, appointment_reminder, appointment_cancelled, lab_result_ready, prescription_ready, bill_generated, claim_update, system |
| title / message | VARCHAR / TEXT | |
| link / metadata | VARCHAR | nullable |
| isRead | BOOLEAN | default false |
| createdAt | TIMESTAMP | |

---

## 6. Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clone and Install

```bash
# Backend
cd helix/backend
npm install

# Frontend
cd helix/frontend
npm install
```

### 2. Configure Environment

Create `helix/backend/.env` (see [Environment Variables](#7-environment-variables)).

### 3. Start the Backend

```bash
cd helix/backend
npm run start:dev
# API running at http://localhost:5002/api
```

TypeORM will auto-sync the database schema on first run (`synchronize: true` in config).

### 4. Start the Frontend

```bash
cd helix/frontend
npm run dev
# App running at http://localhost:3002
```

### 5. Register Your First User

1. Open `http://localhost:3002/register`
2. Choose a role (Patient / Doctor / Nurse)
3. Submit — a 6-digit OTP will be sent to your email
4. Enter the OTP on the verify page
5. You are redirected to the role-specific dashboard

To create an Admin user, manually set `role = 'admin'` and `status = 'active'` in the database for a registered user.

---

## 7. Environment Variables

Create `helix/backend/.env`:

```env
# Application
PORT=5002
FRONTEND_URL=http://localhost:3002
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=helix_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM_NAME="Helix Health"
MAIL_FROM_EMAIL=your_email@gmail.com
```

---

## 8. API Documentation

**Base URL:** `http://localhost:5002/api`

All protected routes require the header:
```
Authorization: Bearer <accessToken>
```

All responses follow the envelope format:
```json
{ "success": true, "data": { ... }, "timestamp": "..." }
```

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/auth/register` | No | — | Register with email + password + role |
| POST | `/auth/verify-otp` | No | — | Verify email with 6-digit OTP |
| POST | `/auth/resend-otp` | No | — | Resend OTP to email |
| POST | `/auth/login` | No | — | Login, returns user + tokens |
| POST | `/auth/refresh` | No | — | Refresh access token |
| POST | `/auth/forgot-password` | No | — | Send password reset email |
| POST | `/auth/reset-password` | No | — | Reset password using token |
| GET | `/auth/me` | Yes | Any | Get current user from token |
| POST | `/auth/change-password` | Yes | Any | Change password (requires current) |

**Register body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "patient",
  "phone": "+1234567890"
}
```

**Login response:**
```json
{
  "user": { "id": "...", "firstName": "John", "role": "patient", "status": "active", ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Users — `/api/users`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/users/me` | Yes | Any | Get own user object |
| PATCH | `/users/me` | Yes | Any | Update own profile (firstName, lastName, phone) |
| GET | `/users/stats` | Yes | admin | User counts by role |
| GET | `/users` | Yes | admin | List all users (paginated, filterable) |
| GET | `/users/:id` | Yes | admin | Get user by ID |
| PATCH | `/users/:id` | Yes | admin | Admin update any user |
| POST | `/users/:id/suspend` | Yes | admin | Suspend a user |
| POST | `/users/:id/activate` | Yes | admin | Activate a user |
| DELETE | `/users/:id` | Yes | admin | Delete a user |

**Query params for `GET /users`:** `page`, `limit`, `role`, `status`, `search` (searches email)

---

### Patients — `/api/patients`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/patients/me` | Yes | patient | Get own patient profile |
| PATCH | `/patients/me` | Yes | patient | Update own patient profile |
| GET | `/patients` | Yes | admin, doctor, nurse | List all patients (paginated) |
| GET | `/patients/:id` | Yes | admin, doctor, nurse | Get patient by profile ID |

---

### Doctors — `/api/doctors`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/doctors/me` | Yes | doctor | Get own doctor profile |
| PATCH | `/doctors/me` | Yes | doctor | Update own doctor profile |
| GET | `/doctors` | No | — | List all doctors (public, paginated) |
| GET | `/doctors/:id` | No | — | Get doctor by profile ID (public) |

**Query params for `GET /doctors`:** `page`, `limit`, `search`, `department`, `specialty`

---

### Appointments — `/api/appointments`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/appointments` | Yes | patient | Book a new appointment |
| GET | `/appointments` | Yes | admin | Get all appointments |
| GET | `/appointments/my` | Yes | patient | Get own appointments |
| GET | `/appointments/doctor` | Yes | doctor | Get doctor's appointments |
| GET | `/appointments/doctor/today-stats` | Yes | doctor | Today's summary stats |
| GET | `/appointments/:id` | Yes | Any | Get single appointment |
| PATCH | `/appointments/:id/confirm` | Yes | doctor | Confirm a pending appointment |
| PATCH | `/appointments/:id/start` | Yes | doctor | Mark appointment as in-progress |
| PATCH | `/appointments/:id/complete` | Yes | doctor | Complete with diagnosis + notes |
| PATCH | `/appointments/:id/cancel` | Yes | Any | Cancel with reason |

**Book appointment body:**
```json
{
  "doctorId": "uuid",
  "appointmentDate": "2026-05-20",
  "appointmentTime": "10:00",
  "reason": "Chest pain",
  "symptoms": "Tightness, shortness of breath",
  "type": "in_person"
}
```

**Complete appointment body:**
```json
{
  "diagnosis": "Hypertension",
  "doctorNotes": "Prescribed beta-blockers. Follow-up in 4 weeks."
}
```

---

### Medical Records — `/api/medical-records`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/medical-records` | Yes | doctor, nurse | Create a record |
| GET | `/medical-records/my` | Yes | patient | Own records (paginated) |
| GET | `/medical-records/patient/:id` | Yes | doctor, nurse, admin | Records for a patient |
| GET | `/medical-records/:id` | Yes | Any | Single record |
| PATCH | `/medical-records/:id` | Yes | doctor | Update record |
| DELETE | `/medical-records/:id` | Yes | doctor, admin | Delete record |

---

### Vitals — `/api/vitals`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/vitals` | Yes | nurse, doctor, admin | Record vitals for a patient |
| GET | `/vitals/my` | Yes | patient | Own vitals history |
| GET | `/vitals/my/latest` | Yes | patient | Most recent reading |
| GET | `/vitals/patient/:id` | Yes | doctor, nurse, admin | Patient vitals history |
| GET | `/vitals/patient/:id/latest` | Yes | doctor, nurse, admin | Patient's latest reading |

**Record vitals body:**
```json
{
  "patientId": "uuid",
  "temperature": 36.8,
  "systolicBP": 120,
  "diastolicBP": 80,
  "heartRate": 72,
  "oxygenSaturation": 98.5,
  "weight": 75.0,
  "height": 178.0,
  "glucoseLevel": 95,
  "notes": "Pre-appointment check"
}
```

---

### Prescriptions — `/api/prescriptions`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/prescriptions` | Yes | doctor | Create prescription |
| GET | `/prescriptions/my` | Yes | patient | Own prescriptions |
| GET | `/prescriptions/doctor` | Yes | doctor | Prescriptions issued by doctor |
| GET | `/prescriptions/:id` | Yes | Any | Single prescription |
| PATCH | `/prescriptions/:id` | Yes | doctor | Update prescription |

**Create prescription body:**
```json
{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "diagnosis": "Type 2 Diabetes",
  "items": [
    {
      "medicationName": "Metformin",
      "dosage": "500mg",
      "frequency": "twice daily",
      "duration": "30 days",
      "instructions": "Take with meals",
      "quantity": 60
    }
  ],
  "notes": "Recheck HbA1c in 3 months",
  "validUntil": "2026-08-17"
}
```

---

### Lab Orders — `/api/lab`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/lab/orders` | Yes | doctor | Create a lab order |
| GET | `/lab/orders/my` | Yes | patient | Own lab orders |
| GET | `/lab/orders` | Yes | admin, lab_tech, doctor | All orders |
| GET | `/lab/orders/:id` | Yes | Any | Single order |
| PATCH | `/lab/orders/:id/status` | Yes | lab_tech, admin | Update order status |
| POST | `/lab/orders/:id/results` | Yes | lab_tech | Upload results |

**Create lab order body:**
```json
{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "tests": ["Complete Blood Count", "HbA1c", "Lipid Panel"],
  "priority": "routine",
  "clinicalNotes": "Rule out anemia"
}
```

**Upload results body:**
```json
{
  "results": [
    {
      "testName": "Hemoglobin",
      "value": "11.2",
      "unit": "g/dL",
      "referenceRange": "13.5-17.5",
      "flag": "LOW"
    }
  ]
}
```

---

### Billing — `/api/billing`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/billing` | Yes | admin | Create a bill |
| GET | `/billing/my` | Yes | patient | Own bills |
| GET | `/billing/summary` | Yes | admin | Revenue summary stats |
| GET | `/billing` | Yes | admin | All bills (paginated) |
| GET | `/billing/:id` | Yes | Any | Single bill |
| PATCH | `/billing/:id/payment` | Yes | admin | Record a payment |

---

### Insurance — `/api/insurance`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/insurance/plans` | No | — | List insurance plans (public) |
| GET | `/insurance/plans/:id` | No | — | Single plan (public) |
| POST | `/insurance/plans` | Yes | admin | Create plan |
| PATCH | `/insurance/plans/:id` | Yes | admin | Update plan |
| POST | `/insurance/claims` | Yes | patient, admin | Submit a claim |
| GET | `/insurance/claims/my` | Yes | patient | Own claims |
| GET | `/insurance/claims` | Yes | admin | All claims |
| PATCH | `/insurance/claims/:id` | Yes | admin | Process claim (approve/reject) |

---

### Schedules — `/api/schedules`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/schedules/my` | Yes | doctor | Get own schedule |
| POST | `/schedules/my` | Yes | doctor | Create a schedule slot |
| PATCH | `/schedules/my/:id` | Yes | doctor | Update a schedule slot |
| DELETE | `/schedules/my/:id` | Yes | doctor | Delete a schedule slot |
| GET | `/schedules/doctor/:doctorId` | No | — | Get doctor's schedule (public) |
| GET | `/schedules/doctor/:doctorId/slots` | No | — | Get available time slots for a date (public) |

---

### Departments — `/api/departments`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/departments` | No | — | All departments (public) |
| GET | `/departments/:id` | No | — | Single department (public) |
| POST | `/departments` | Yes | admin | Create department |
| PATCH | `/departments/:id` | Yes | admin | Update department |
| DELETE | `/departments/:id` | Yes | admin | Delete department |
| POST | `/departments/seed` | Yes | admin | Seed default departments |

---

### Medications — `/api/medications`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/medications` | No | — | Search medication catalog (public) |
| GET | `/medications/:id` | No | — | Single medication (public) |
| POST | `/medications` | Yes | admin | Add medication |
| PATCH | `/medications/:id` | Yes | admin | Update medication |
| DELETE | `/medications/:id` | Yes | admin | Remove medication |
| POST | `/medications/seed` | Yes | admin | Seed common medications |

---

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/notifications` | Yes | Any | Get notifications (paginated, filter by unread) |
| GET | `/notifications/unread-count` | Yes | Any | Get unread count |
| PATCH | `/notifications/:id/read` | Yes | Any | Mark one as read |
| PATCH | `/notifications/mark-all-read` | Yes | Any | Mark all as read |
| DELETE | `/notifications/:id` | Yes | Any | Delete a notification |

---

### Analytics — `/api/analytics`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/analytics/admin` | Yes | admin | Platform-wide dashboard data |
| GET | `/analytics/patient` | Yes | patient | Personal health summary |
| GET | `/analytics/doctor` | Yes | doctor | Doctor activity summary |

---

## 9. Frontend Pages

### Auth Routes (unauthenticated only)

| Route | Description |
|---|---|
| `/login` | Split-screen with brand panel. Email + password with show/hide. Detects unverified accounts and redirects to OTP page. |
| `/register` | Role selector (Patient / Doctor / Nurse), name, email, phone, password. On submit → redirects to verify-otp. |
| `/verify-otp` | Six individual digit inputs with auto-focus-advance and auto-submit on completion. 60-second resend countdown. |
| `/forgot-password` | Email input → shows confirmation state after submit. |
| `/reset-password` | Token from URL query param. New password input → redirects to login on success. |

### Dashboard — `/dashboard`

Role-based rendering — three distinct dashboards:

**Admin Dashboard:**
- 4 stat cards: Total Patients, Active Doctors, Today's Appointments, Monthly Revenue
- Recent activity panel with latest appointments and their status
- Department breakdown bar chart (relative widths)
- User overview: count per role

**Doctor Dashboard:**
- 4 stat cards: Today's Appointments, Total Patients, Pending, Completed Today
- Today's schedule list with time, patient name, reason, status badge
- Recent patients panel with quick links to their profiles
- Quick actions panel (navigate to appointments, patients, records, prescriptions, schedule)

**Patient Dashboard:**
- 6 quick-link cards (Book Appointment, Medical Records, Vitals, Prescriptions, Lab Results, Billing)
- Upcoming confirmed appointments with date block + doctor name
- Latest vitals grid (BP, heart rate, temperature, O₂)
- 4 summary counters (total appointments, records, prescriptions, pending bills)

### Feature Pages

| Route | Description |
|---|---|
| `/appointments` | Status filter tabs (all / pending / confirmed / in_progress / completed / cancelled). Date block + doctor or patient name + status badge + cancel link. Floating "Book Appointment" button for patients. |
| `/appointments/[id]` | Full detail: date, time, counterpart name, reason, notes, diagnosis. Doctor action buttons: Confirm → Start → Complete / Cancel. |
| `/appointments/BookAppointmentModal` | 2-step modal: Step 1 — search and pick a doctor. Step 2 — pick date, select from available time slots (or manual datetime), enter reason and notes. |
| `/patients` | Searchable table with patient number, email, join date. Paginated. |
| `/patients/[id]` | Patient profile card (blood type, DOB, allergies), latest vitals grid, recent medical records list. |
| `/doctors` | Card grid with specialty, department badge, rating stars. |
| `/medical-records` | Chronological list with title, diagnosis, doctor name, date. |
| `/medical-records/[id]` | Full record: type, title, description, ICD code, doctor, date, attachments. |
| `/vitals` | Latest readings panel (4 metrics with icons) + full history table. |
| `/prescriptions` | Cards grouped by status (active/dispensed/cancelled) with full medication item list per prescription. |
| `/lab` | Patient view: Orders tab + Results tab. Admin/lab_tech view: all orders with priority and status. |
| `/billing` | Admin: revenue summary cards + all bills with filter. Patient: own bills. Status filter tabs. |
| `/departments` | Card grid with department name and doctor count. Admin can add new via inline form or delete. |
| `/notifications` | List with unread dot indicator, click to mark read, hover to delete. "Mark all read" bulk action. |
| `/schedule` | Weekly availability toggle per day (Mon–Sun). Active days show time range pickers. Save button. |
| `/settings` | Two tabs: Profile (name, phone; email locked) and Password (current → new → confirm). |

---

## 10. Role System

| Role | Value | Description |
|---|---|---|
| Patient | `patient` | Registers publicly. Auto-creates patient profile on OTP verification. |
| Doctor | `doctor` | Registers publicly. Needs admin to set up department + specialization if not done via profile edit. |
| Nurse | `nurse` | Registers publicly. Can record vitals and view patient list. |
| Lab Technician | `lab_tech` | Registers publicly. Processes lab orders, uploads results. |
| Admin | `admin` | Created manually (set role in DB). Full platform access. |

**Status lifecycle:**

```
pending_verification  →  active  →  (suspended)
        ↑
   on register
```

Suspended users receive `401 Unauthorized` on login.

---

## 11. Project Structure

```
helix/
├── backend/
│   └── src/
│       ├── app.module.ts
│       ├── main.ts                          # Port 5002, global prefix /api
│       ├── common/
│       │   ├── decorators/
│       │   │   ├── current-user.decorator.ts
│       │   │   └── roles.decorator.ts       # @Roles(), @Public()
│       │   ├── filters/
│       │   │   └── http-exception.filter.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts        # Global guard
│       │   │   └── roles.guard.ts
│       │   ├── interceptors/
│       │   │   └── transform.interceptor.ts # Wraps all responses: { success, data, timestamp }
│       │   └── utils/
│       │       └── generate.util.ts         # OTP + reset token generators
│       ├── config/
│       │   ├── app.config.ts
│       │   ├── database.config.ts
│       │   ├── jwt.config.ts
│       │   └── mail.config.ts
│       ├── database/
│       │   └── entities/
│       │       ├── user.entity.ts
│       │       ├── patient-profile.entity.ts
│       │       ├── doctor-profile.entity.ts
│       │       ├── doctor-schedule.entity.ts
│       │       ├── department.entity.ts
│       │       ├── appointment.entity.ts
│       │       ├── medical-record.entity.ts
│       │       ├── vital-signs.entity.ts
│       │       ├── prescription.entity.ts
│       │       ├── prescription-item.entity.ts
│       │       ├── lab-order.entity.ts
│       │       ├── lab-result.entity.ts
│       │       ├── bill.entity.ts
│       │       ├── bill-item.entity.ts
│       │       ├── medication.entity.ts
│       │       ├── insurance-plan.entity.ts
│       │       ├── insurance-claim.entity.ts
│       │       └── notification.entity.ts
│       └── modules/
│           ├── auth/                        # Register, OTP verify, login, refresh, reset
│           ├── users/                       # User CRUD, suspend/activate, stats
│           ├── patients/                    # Patient profile management
│           ├── doctors/                     # Doctor profile management
│           ├── departments/                 # Department CRUD + seed
│           ├── appointments/                # Full appointment lifecycle
│           ├── schedules/                   # Doctor availability slots
│           ├── medical/                     # Medical record CRUD
│           ├── vitals/                      # Vital signs recording + history
│           ├── prescriptions/               # Prescription CRUD
│           ├── lab/                         # Lab orders + results
│           ├── medications/                 # Medication catalog + seed
│           ├── billing/                     # Bill management + payments
│           ├── insurance/                   # Plans + claims
│           ├── notifications/               # Notification delivery + read state
│           ├── analytics/                   # Role-based dashboard analytics
│           └── mailer/                      # Nodemailer — OTP + reset emails
│
└── frontend/
    ├── app/
    │   ├── layout.tsx                       # Root layout — providers, font, metadata
    │   ├── page.tsx                         # Redirects to /dashboard or /login
    │   ├── globals.css                      # CSS variables, Tailwind base
    │   ├── providers.tsx                    # Redux, ThemeProvider, Toaster
    │   ├── (auth)/                          # Auth route group (no sidebar)
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── verify-otp/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   └── (dashboard)/                     # Dashboard route group (with sidebar)
    │       ├── layout.tsx                   # Sidebar + Header shell
    │       ├── dashboard/
    │       │   ├── page.tsx                 # Role router
    │       │   ├── AdminDashboard.tsx
    │       │   ├── DoctorDashboard.tsx
    │       │   └── PatientDashboard.tsx
    │       ├── appointments/
    │       │   ├── page.tsx
    │       │   ├── BookAppointmentModal.tsx
    │       │   └── [id]/page.tsx
    │       ├── patients/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── doctors/page.tsx
    │       ├── medical-records/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── vitals/page.tsx
    │       ├── prescriptions/page.tsx
    │       ├── lab/page.tsx
    │       ├── billing/page.tsx
    │       ├── departments/page.tsx
    │       ├── notifications/page.tsx
    │       ├── schedule/page.tsx
    │       └── settings/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx                  # Collapsible, role-based nav
    │   │   └── Header.tsx                   # Title, search, theme toggle, notification badge, avatar
    │   └── ui/
    │       └── StatCard.tsx                 # Reusable metric card with icon + color variants
    ├── store/
    │   ├── index.ts                         # Redux store — 14 API reducers + auth slice
    │   ├── slices/
    │   │   └── authSlice.ts                 # User state, tokens, login/logout (syncs to cookies)
    │   └── api/
    │       ├── baseQuery.ts                 # fetchBaseQuery + auth header + envelope unwrap
    │       ├── authApi.ts
    │       ├── usersApi.ts
    │       ├── patientsApi.ts
    │       ├── doctorsApi.ts
    │       ├── appointmentsApi.ts
    │       ├── analyticsApi.ts
    │       ├── notificationsApi.ts
    │       ├── medicalApi.ts
    │       ├── vitalsApi.ts
    │       ├── billingApi.ts
    │       ├── prescriptionsApi.ts
    │       ├── labApi.ts
    │       ├── departmentsApi.ts
    │       ├── schedulesApi.ts
    │       ├── insuranceApi.ts
    │       └── medicationsApi.ts
    ├── middleware.ts                        # Edge middleware — route protection + auth redirects
    ├── tsconfig.json                        # @/* path alias
    ├── tailwind.config.js                   # helix (cyan), health (green), medical (slate) palettes
    ├── next.config.js
    └── package.json                         # Port 3002
```

---

*Built with NestJS + Next.js 14 · PostgreSQL · RTK Query · Tailwind CSS*
