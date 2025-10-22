# Supabase Integration Setup Guide

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign in or create an account
3. Create a new project
4. Wait for it to initialize

## Step 2: Create Database Tables

Run the following SQL in the Supabase SQL editor:

### Create patients table

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Create doctors table

```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Create pp_procedures_and_payments table

```sql
CREATE TABLE pp_procedures_and_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  date DATE NOT NULL,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  price DECIMAL(10, 2) NOT NULL,
  paid DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Create pp_notes table

```sql
CREATE TABLE pp_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Create indexes for better performance

```sql
CREATE INDEX idx_procedures_patient ON pp_procedures_and_payments(patient_id);
CREATE INDEX idx_notes_patient ON pp_notes(patient_id);
```

### Create view for patient dashboard (IMPORTANT FOR PERFORMANCE)

```sql
CREATE VIEW patient_dashboard_view AS
SELECT
  p.id,
  p.name,
  COUNT(DISTINCT pr.id) as procedures_count,
  COALESCE(SUM(pr.price), 0) as total_price,
  COALESCE(SUM(pr.paid), 0) as total_paid,
  COALESCE(SUM(pr.price) - SUM(pr.paid), 0) as balance
FROM patients p
LEFT JOIN pp_procedures_and_payments pr ON p.id = pr.patient_id
GROUP BY p.id, p.name
ORDER BY p.name;
```

This view fetches all patient data with totals in ONE query instead of multiple API calls!

## Step 3: Configure Environment Variables

1. Get your Supabase project URL and anon key from Settings > API
2. Update `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: (Optional) Set Row Level Security

To enable Row Level Security (RLS) for security:

1. Go to Authentication > Policies in Supabase
2. Enable RLS on each table
3. Create policies as needed

For development, you can allow all operations:

```sql
-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_procedures_and_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_notes ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (for development only)
CREATE POLICY "Allow all operations" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON pp_procedures_and_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON pp_notes FOR ALL USING (true) WITH CHECK (true);
```

## Step 5: Start Using the App

The app now has the following features:

- Fetch all patients from Supabase
- Add new patients
- Add procedures for each patient
- Track payments and balance
- Add, edit, and delete notes
- Delete patients (cascades to procedures and notes)

## API Endpoints

### Patients

- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create a new patient
- `DELETE /api/patients/[patientId]` - Delete a patient

### Procedures

- `GET /api/patients/[patientId]/procedures` - Get procedures for a patient
- `POST /api/patients/[patientId]/procedures` - Add a procedure
- `PATCH /api/patients/[patientId]/procedures/[procedureId]` - Update a procedure
- `DELETE /api/patients/[patientId]/procedures/[procedureId]` - Delete a procedure

### Notes

- `GET /api/patients/[patientId]/notes` - Get notes for a patient
- `POST /api/patients/[patientId]/notes` - Add a note
- `PATCH /api/patients/[patientId]/notes/[noteId]` - Update a note
- `DELETE /api/patients/[patientId]/notes/[noteId]` - Delete a note

### Doctors

- `GET /api/doctors` - Get all doctors

## Next Steps

The components still use localStorage. To fully integrate Supabase:

1. Update `Dashboard.tsx` to use the `usePatients` hook
2. Update `/patients/[id]/page.tsx` to use `useProcedures` and `useNotes` hooks
3. Update the modals to use Supabase API calls

The hooks and API routes are already set up - just connect them to your components!
