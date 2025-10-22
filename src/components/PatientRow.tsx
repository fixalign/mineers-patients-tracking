"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PatientDashboard } from "@/hooks/useSupabase";

interface PatientRowProps {
  patient: PatientDashboard;
  onDelete: (id: string) => void | Promise<void>;
}

export default function PatientRow({ patient, onDelete }: PatientRowProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRowClick = () => {
    router.push(`/patients/${patient.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this patient?")) {
      setIsDeleting(true);
      try {
        await onDelete(patient.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-indigo-100 transition cursor-pointer"
    >
      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
        {patient.full_name}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {patient.procedures_count}
      </td>
      <td className="px-6 py-4 text-sm font-semibold">
        <span
          className={patient.balance > 0 ? "text-red-600" : "text-green-600"}
        >
          ${patient.balance.toFixed(2)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        ${patient.total_price.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        ${patient.total_paid.toFixed(2)}
      </td>

      <td
        className="px-6 py-4 text-sm space-x-2 flex"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-3 py-1 rounded transition text-sm"
          title="Delete patient"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}
