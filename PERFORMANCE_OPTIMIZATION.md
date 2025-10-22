# Performance Optimization: Database View Strategy

## What Changed

We optimized the dashboard to **eliminate the N+1 query problem** by using a PostgreSQL database view instead of fetching procedures separately.

### Before (Inefficient):

```
1. Fetch all patients (1 query)
2. For EACH patient, fetch their procedures (N queries)
Total: 1 + N queries
```

### After (Optimized):

```
1. Fetch patient_dashboard_view (1 query with all totals calculated)
Total: 1 query
```

## How It Works

### 1. Database View

Created `patient_dashboard_view` in Supabase that calculates:

- Patient name & ID
- Number of procedures
- Total price (sum of all procedures)
- Total paid (sum of payments)
- Balance (difference)

**SQL:**

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

### 2. API Change

`/api/patients` now queries the view instead of the patients table:

```typescript
// Before
const { data, error } = await supabase.from("patients").select("*");

// After
const { data, error } = await supabase
  .from("patient_dashboard_view")
  .select("*");
```

### 3. Components Updated

- **Dashboard** - Shows summary with totals from view (no separate API calls for procedures)
- **PatientRow** - Displays procedures_count, total_price, total_paid, balance from view
- **PatientTable** - Uses new PatientDashboard type

### 4. Data Flow

```
Dashboard Component
    ↓
usePatients() hook
    ↓
Fetch /api/patients
    ↓
Query patient_dashboard_view (1 query)
    ↓
Get all patients with calculated totals
    ↓
Display in table
```

## Performance Gains

| Metric           | Before                             | After                |
| ---------------- | ---------------------------------- | -------------------- |
| API Calls        | 1 + N                              | 1                    |
| Query Time       | Linear (slow with many patients)   | Constant             |
| Network Requests | N procedures fetches               | 0 (included in view) |
| Bandwidth        | Fetching each procedure separately | Single query         |

### Example:

- 100 patients → 101 queries → 101 API calls
- 100 patients (with view) → 1 query → 1 API call

## When Do Procedures Load?

- **Dashboard**: Only shows COUNT and TOTALS from view ✅ (fast)
- **When you click a patient**: Then procedures load separately via `useProcedures()` hook ✅ (lazy loading)

This way:

- Dashboard loads instantly (no N+1 problem)
- Detail page only fetches procedures when needed
- Database does all calculations (faster than JavaScript)

## Files Modified

1. **SUPABASE_SETUP.md** - Added view creation SQL
2. **src/app/api/patients/route.ts** - Changed to query view
3. **src/hooks/useSupabase.ts** - Added PatientDashboard interface, updated usePatients
4. **src/components/PatientTable.tsx** - Uses PatientDashboard type
5. **src/components/PatientRow.tsx** - Displays totals from view

## Next Steps

1. Create the view in your Supabase database by running the SQL:

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

2. Restart the dev server: `npm run dev`

3. Dashboard will now load instantly with totals! 🚀

## Notes

- View automatically updates when procedures are added/deleted (because it's a view)
- No need to manually refresh after adding procedures
- Backup of original Patient interface kept for detail page compatibility
