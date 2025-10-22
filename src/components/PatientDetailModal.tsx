"use client";

import { Patient, calculatePatientTotals } from "@/types/patient";
import { useState } from "react";
import EditProcedureModal from "./EditProcedureModal";

import { Procedure } from "@/types/patient";

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onUpdate: (patient: Patient) => void;
  onAddProcedure: (procedure: Procedure) => void;
}

export default function PatientDetailModal({
  patient,
  onClose,
  onUpdate,
  onAddProcedure,
}: PatientDetailModalProps) {
  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(
    null
  );
  const [noteContent, setNoteContent] = useState("");
  const { totalPrice, totalPaid, balance } = calculatePatientTotals(patient);

  const handleDeleteProcedure = (procedureId: string) => {
    const updatedPatient = {
      ...patient,
      procedures: patient.procedures.filter((p) => p.id !== procedureId),
    };
    onUpdate(updatedPatient);
  };

  const handleUpdateProcedure = (updatedProcedure: Procedure) => {
    const updatedPatient = {
      ...patient,
      procedures: patient.procedures.map((p) =>
        p.id === updatedProcedure.id ? updatedProcedure : p
      ),
    };
    onUpdate(updatedPatient);
    setEditingProcedureId(null);
  };

  const handleAddNote = (content: string) => {
    if (content.trim()) {
      const updatedPatient = {
        ...patient,
        notes: [
          ...patient.notes,
          {
            id: Date.now().toString(),
            content: content.trim(),
            date: new Date().toLocaleDateString(),
          },
        ],
      };
      onUpdate(updatedPatient);
      setNoteContent("");
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedPatient = {
      ...patient,
      notes: patient.notes.filter((n) => n.id !== noteId),
    };
    onUpdate(updatedPatient);
  };

  const procedureToEdit = editingProcedureId
    ? patient.procedures.find((p) => p.id === editingProcedureId)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-indigo-200 text-sm mt-1">
              {patient.procedures.length} procedure
              {patient.procedures.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-gray-200 transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                balance > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <p className="text-sm text-gray-600 mb-1">Balance</p>
              <p
                className={`text-2xl font-bold ${
                  balance > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                ${balance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Procedures Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Procedures
              </h3>
              <button
                onClick={() => setShowAddProcedure(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition text-sm"
              >
                + Add Procedure
              </button>
            </div>

            {patient.procedures.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No procedures added yet. Click &quot;Add Procedure&quot; to get
                started.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {patient.procedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {procedure.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Dr. {procedure.doctor} • {procedure.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProcedureId(procedure.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          title="Edit procedure"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProcedure(procedure.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                          title="Delete procedure"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="font-semibold text-gray-900">
                          ${procedure.price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Paid</p>
                        <p className="font-semibold text-gray-900">
                          ${procedure.moneyPaid.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Balance</p>
                        <p
                          className={`font-semibold ${
                            procedure.price - procedure.moneyPaid > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          ${(procedure.price - procedure.moneyPaid).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>

            {/* Add Note Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNote(noteContent);
              }}
              className="mb-4 space-y-3 p-3 bg-blue-50 rounded border border-blue-200"
            >
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                rows={3}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition text-sm"
              >
                Add Note
              </button>
            </form>

            {/* Notes List */}
            {patient.notes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No notes yet. Add one above!
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {patient.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-yellow-50 p-3 rounded border border-yellow-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-600">{note.date}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        title="Delete note"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-800">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
          >
            Close
          </button>
        </div>

        {showAddProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="bg-black bg-opacity-50 absolute inset-0"
              onClick={() => setShowAddProcedure(false)}
            />
            <div className="relative z-10">
              <AddProcedureModal
                onClose={() => setShowAddProcedure(false)}
                onAdd={(procedure) => {
                  onAddProcedure(procedure);
                  setShowAddProcedure(false);
                }}
              />
            </div>
          </div>
        )}

        {procedureToEdit && editingProcedureId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="bg-black bg-opacity-50 absolute inset-0"
              onClick={() => setEditingProcedureId(null)}
            />
            <div className="relative z-10">
              <EditProcedureModal
                procedure={procedureToEdit}
                onClose={() => setEditingProcedureId(null)}
                onEdit={handleUpdateProcedure}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Procedure Modal Component (inline)
function AddProcedureModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (procedure: Procedure) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    doctor: "",
    price: "",
    moneyPaid: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price) || 0;
    const moneyPaid = parseFloat(formData.moneyPaid) || 0;

    onAdd({
      id: Date.now().toString(),
      name: formData.name,
      date: formData.date,
      doctor: formData.doctor,
      price,
      moneyPaid,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Add Procedure</h2>
        <button
          onClick={onClose}
          className="text-2xl leading-none hover:text-gray-600 transition"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Procedure Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="E.g., Cleaning, Root Canal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor
          </label>
          <input
            type="text"
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter doctor name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Money Paid
          </label>
          <input
            type="number"
            name="moneyPaid"
            value={formData.moneyPaid}
            onChange={handleChange}
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
          <p>
            Balance: $
            {(
              parseFloat(formData.price) - parseFloat(formData.moneyPaid) || 0
            ).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
