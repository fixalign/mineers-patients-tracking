# Patient Tracking Dashboard

A modern Next.js dashboard for tracking patients at dental centers. Manage patient records, track procedures, payments, and add notes for each patient.

## Features

✨ **Core Features:**

- 📋 **Patient Management** - View all patients in a searchable table
- 📊 **Multiple Procedures** - Track multiple procedures per patient
- 💳 **Payment Tracking** - Track price, money paid, and balance for each procedure
- � **Automatic Calculations** - Balance auto-calculates (Price - Money Paid)
- 📝 **Notes System** - Add, edit, and delete unlimited notes per patient
- ✏️ **Edit Capabilities** - Edit procedures and notes anytime
- 🗑️ **Delete Options** - Remove patients, procedures, and notes
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 📱 **Mobile-Friendly** - Works seamlessly on all devices
- 💾 **Local Storage** - Data persists in browser storage

## Technology Stack

- **Frontend Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState)
- **UI Components:** Custom React components

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies (already done):

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Tailwind styling
│   ├── page.tsx            # Dashboard page (patient list)
│   ├── globals.css         # Global styles
│   └── patients/
│       └── [id]/
│           └── page.tsx    # Patient detail page (procedures & notes)
├── components/
│   ├── Dashboard.tsx       # Main dashboard component
│   ├── PatientTable.tsx    # Patient list table
│   ├── PatientRow.tsx      # Individual patient row with navigation
│   └── EditProcedureModal.tsx  # Modal for editing procedures
└── types/
    └── patient.ts          # TypeScript interfaces and helpers
```

### Key Files

- **src/types/patient.ts**: Defines `Patient`, `Procedure`, and `PatientNote` interfaces with balance calculation helpers
- **src/app/page.tsx**: Dashboard that lists all patients
- **src/app/patients/[id]/page.tsx**: Dynamic route showing patient details, procedures, and notes
- **src/components/**: Reusable React components

## Usage

### Adding a Patient

1. Click the **"+ Add New Patient"** button on the dashboard
2. Enter the patient's name in the prompt
3. The patient will be created and added to the table

### Viewing Patient Details

1. **Click on any patient row** in the table to open their detail page
2. You'll see:
   - Patient summary (Total Price, Total Paid, Balance)
   - All procedures for this patient
   - All notes for this patient

### Managing Procedures

1. On the patient detail page, click **"+ Add Procedure"**
2. Fill in the procedure details:
   - Procedure Name (e.g., Cleaning, Root Canal)
   - Date performed
   - Doctor Name
   - Price
   - Money Paid
3. The balance per procedure calculates automatically
4. **Edit** any procedure by clicking "Edit" button
5. **Delete** any procedure by clicking "Delete" button

### Managing Notes

1. On the patient detail page, scroll to **"Notes"** section
2. **Add a note**: Type in the text area and click "Add Note"
3. **Edit a note**: Click "Edit" button on any note to modify it
4. **Delete a note**: Click "Delete" button on any note
5. Notes are optional and not mandatory to fill

### Deleting a Patient

1. From the dashboard table, click the **"Delete"** button on the patient row
2. The entire patient record (with all procedures and notes) will be removed

## Features Details

### Balance Tracking

For each procedure, the balance is calculated as: **Price - Money Paid**

- **Red balance** (positive): Patient owes money
- **Green balance** (zero or negative): Patient has paid in full

### Summary Cards

When viewing a patient, three cards show:

- **Total Price** - Sum of all procedures
- **Total Paid** - Sum of all payments received
- **Balance** - Total amount still owed (or overpaid)

### Notes System

- Add unlimited notes per patient
- Edit any note at any time
- Delete individual notes
- Each note is timestamped with creation date
- Notes are completely optional

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Data Storage

Currently, all data is stored in the browser's component state. For persistent storage, consider implementing:

- LocalStorage for browser persistence
- Backend database (Firebase, MongoDB, PostgreSQL, etc.)
- API endpoints for data management

## Future Enhancements

- 📊 Dashboard statistics and charts
- 📥 Export patient data to CSV/PDF
- 🔍 Search and filter patients
- 📅 Calendar view for appointments
- 💾 Data persistence with database
- 👥 Multi-user support with authentication
- 🔐 Role-based access control
- 📱 Mobile app

---

**Created:** October 21, 2025
**Framework:** Next.js 15
**License:** MIT
