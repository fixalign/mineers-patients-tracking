"use client";

import { PatientDashboard } from "@/hooks/useSupabase";
import PatientRow from "./PatientRow";

interface PatientTableProps {
  patients: PatientDashboard[];
  onDelete: (id: string) => void | Promise<void>;
}

export default function PatientTable({
  patients,
  onDelete,
}: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">
          No patients added yet. Click &quot;Add New Patient&quot; to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Patient Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Procedures
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Total Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Money Paid
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Balance
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
