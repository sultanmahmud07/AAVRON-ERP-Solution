# 🏡 Texas Precision Roofing — Admin & Management Dashboard (TP-Dashboard)

A premium, enterprise-grade administrative dashboard built with **React 19**, **TypeScript**, **Redux Toolkit (RTK Query)**, and **Tailwind CSS v4**. 

This system serves as the central operational hub for **Texas Precision Roofing** (DFW's trusted roofing provider), enabling team members to manage inspection bookings, schedules, service locations, product catalogs, customer contact requests, and community news/blogs.

---

## 🚀 Key Modules & Features

### 1. 📅 Availability & Booking Engine
* **Visual Calendar Interface**: Fully custom calendar displaying day cells, today markers, and active selections.
* **Booked Slot Safeguards**: 
  * Displays active bookings directly in the calendar grid with subtle red indicators.
  * Disables modification of booked time slots so admins cannot accidentally delete client appointments.
  * Disables calendar removal of dates containing active inspection bookings.
* **Granular Time Blocks**: Manage available slots in defined intervals (e.g. 9:00 AM, 10:30 AM, 12:00 PM) for different timezone regions (Central Time, Eastern Time, etc.).

### 2. 🗺️ Location & Coverage Control
* Add, update, and remove service coverage maps.
* Configure street addresses and zip codes that integrate with local booking systems.

### 3. 📝 Content Management System (CMS)
* Full article management for community updates, roofing tips, and news releases.
* Automatic slug generation and rich text editors for dynamic blogs.

### 4. 📦 Product & Material Catalog
* Manage roofing materials, employee/public pricing models, and categories.
* Edit details, uploading product showcase images.

### 5. 🔐 Role-Based Access Control (RBAC)
* Secured by a high-order React authentication utility (`withAuth`) that validates roles dynamically.
* Supported roles: **Super Admin**, **Admin**, **Sender**, and **Receiver**.
* Automatically handles non-authenticated and unauthorized redirects.

### 6. 📊 Analytics & Reporting
* Displays service requests and inspection success rates with modern charts.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, TypeScript, React Router v7 | Modern type-safe components with high-performance routing |
| **State & API** | Redux Toolkit, RTK Query | Automatic data fetching, local state tracking, and tag invalidation |
| **Styling & Motion** | Tailwind CSS v4, Framer Motion | Fluid animations, glassmorphic themes, and responsive layout grids |
| **UI Components** | Radix UI Primitives, Lucide Icons | Accessible, keyboard-navigable dialogs, menus, and visual symbols |
| **Form Handling** | React Hook Form, Zod | Rigid schema-based validation for all admin inputs |

---

## ⛓️ Backend Integration Info (`texas-precision-server`)

The dashboard interfaces with a TypeScript-based Node.js backend. Major server technologies include:
* **Framework**: Express v5 with custom middlewares and TypeScript-based routing.
* **Database**: MongoDB (via Mongoose ODM) with schemas for users, inspections, availability, and products.
* **Caching**: Redis for session tracking.
* **Assets**: AWS S3 & Cloudinary storage for product showcase files.

---

## 📁 Repository Structure (Dashboard Frontend)

```text
src/
├── assets/                  # Public assets, static images & logos
├── components/              # Reusable UI elements & modules
│   ├── layout/              # Navbars, Sidebars, and footers
│   ├── modules/             # Section-specific components (Availability, Inspection, User)
│   └── ui/                  # Shadcn UI primitives (Buttons, Cards, Dialogs)
├── constants/               # Client-side constants & role dictionaries
├── hooks/                   # Custom utility React hooks
├── lib/                     # Third-party styling configurations
├── pages/                   # Router layout view pages
├── redux/                   # State stores, Base API slices, features slices
├── routes/                  # Client-side routing mappings
├── types/                   # TypeScript interfaces (Auth, Inspection, Availability)
└── utils/                   # Formatting, date validation, and routing helpers
```

---

## ⚙️ Setup & Installation

### 1. Requirements
* **Node.js** (v18 or higher recommended)
* **npm** or **bun** package manager

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the `Dashboard` directory and set the API endpoints:
```env
VITE_BASE_URL=http://localhost:5000/api/v1
```

### 4. Running Locally
Launch the local development server:
```bash
npm run dev
```
The application will start at `http://localhost:3000` (or the port defined by Vite).

### 5. Production Compilation
Verify type safety and compile for deployment:
```bash
npm run build
```

---

💡 *Developed for Texas Precision Roofing. Engineered for performance and clean user experience.*
