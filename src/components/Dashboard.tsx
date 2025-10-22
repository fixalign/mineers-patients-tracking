"use client";

import { useState } from "react";
import PatientTable from "@/components/PatientTable";
import { usePatients } from "@/hooks/useSupabase";

export default function Dashboard() {
  const { patients, loading, error, addPatient, deletePatient } = usePatients();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = async () => {
    const name = prompt("Enter patient name:");
    if (name && name.trim()) {
      try {
        setIsAdding(true);
        await addPatient(name.trim());
      } catch (err) {
        alert(
          `Failed to add patient: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
      } catch (err) {
        alert(
          `Failed to delete patient: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Patient Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and track patients at your dental center
          </p>
        </div>

        <div className="mb-6 flex gap-4 flex-col sm:flex-row">
          {/* <button
            onClick={handleAddPatient}
            disabled={isAdding}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            {isAdding ? "Adding..." : "+ Add New Patient"}
          </button> */}

          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {filteredPatients.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              No patients found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {filteredPatients.length > 0 && (
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        )}

        <PatientTable
          patients={filteredPatients}
          onDelete={handleDeletePatient}
        />
      </div>
    </div>
  );
}
