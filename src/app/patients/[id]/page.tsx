"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  usePatientDetail,
  useProcedures,
  useNotes,
  useDoctors,
  useServices,
  Procedure,
  Doctor,
  Service,
} from "@/hooks/useSupabase";

interface PatientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PatientPage({ params }: PatientPageProps) {
  const { id } = use(params);
  const {
    patient,
    loading: patientLoading,
    error: patientError,
  } = usePatientDetail(id);
  const { procedures, addProcedure, updateProcedure, deleteProcedure } =
    useProcedures(id);
  const { notes, addNote, updateNote, deleteNote } = useNotes(id);
  const { doctors } = useDoctors();
  const { services } = useServices();

  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<Partial<Procedure>>({});
  const [noteContent, setNoteContent] = useState("");
  const [noteDate, setNoteDate] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [editingNoteDate, setEditingNoteDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "procedure" | "note";
    id: string;
  } | null>(null);

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col items-center justify-center gap-4 min-h-64">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-lg">
                Loading patient details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-red-800">
              {patientError || "Patient not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = procedures.reduce((sum, proc) => sum + proc.price, 0);
  const totalPaid = procedures.reduce((sum, proc) => sum + proc.paid, 0);
  const balance = totalPrice - totalPaid;

  const procedureToEdit = editingProcedureId
    ? procedures.find((p) => p.id === editingProcedureId)
    : null;

  // Initialize edit form data when procedure to edit changes
  if (procedureToEdit && editFormData.id !== procedureToEdit.id) {
    setEditFormData({ ...procedureToEdit });
  }

  const handleDeleteProcedure = async (procedureId: string) => {
    setDeleteConfirm({ type: "procedure", id: procedureId });
  };

  const confirmDeleteProcedure = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "procedure") return;
    try {
      setIsSubmitting(true);
      await deleteProcedure(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      alert(
        `Failed to delete: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;

    try {
      setIsSubmitting(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { service, doctors, doctor, ...procedureData } = editFormData;
      await updateProcedure(editFormData.id, procedureData);
      setEditingProcedureId(null);
      setEditFormData({});
    } catch (err) {
      alert(
        `Failed to update: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProcedureSubmit = async (newProcedure: Procedure) => {
    try {
      setIsSubmitting(true);
      await addProcedure({
        patient_id: patient.id,
        description: newProcedure.description,
        date: newProcedure.date,
        doctor_id: newProcedure.doctor_id || null,
        doctor_ids: newProcedure.doctor_ids,
        price: newProcedure.price,
        paid: newProcedure.paid,
        service_id: newProcedure.service_id || null,
      });
      setShowAddProcedure(false);
    } catch (err) {
      alert(
        `Failed to add procedure: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim()) {
      try {
        setIsSubmitting(true);
        const customDate = noteDate
          ? new Date(noteDate).toISOString()
          : undefined;
        await addNote(noteContent.trim(), customDate);
        setNoteContent("");
        setNoteDate("");
      } catch (err) {
        alert(
          `Failed to add note: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeleteConfirm({ type: "note", id: noteId });
  };

  const confirmDeleteNote = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "note") return;
    try {
      setIsSubmitting(true);
      await deleteNote(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      alert(
        `Failed to delete: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditingNoteContent(note.note);
      setEditingNoteDate(new Date(note.created_at).toISOString().split("T")[0]);
    }
  };

  const handleSaveEditNote = async (noteId: string) => {
    if (editingNoteContent.trim()) {
      try {
        setIsSubmitting(true);
        const customDate = editingNoteDate
          ? new Date(editingNoteDate).toISOString()
          : undefined;
        await updateNote(noteId, editingNoteContent.trim(), customDate);
        setEditingNoteId(null);
        setEditingNoteContent("");
        setEditingNoteDate("");
      } catch (err) {
        alert(
          `Failed to save: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
    setEditingNoteDate("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {patient.name}
          </h1>
          <p className="text-gray-600">
            {procedures.length} procedure
            {procedures.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className={`p-6 rounded-lg border shadow ${
              balance > 0
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <p className="text-sm text-gray-600 mb-2">Balance</p>
            <p
              className={`text-3xl font-bold ${
                balance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
              <p className="text-xs text-gray-600 mb-1">Total Price</p>
              <p className="text-xl font-bold text-blue-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
              <p className="text-xs text-gray-600 mb-1">Total Paid</p>
              <p className="text-xl font-bold text-green-600">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Procedures Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Procedures</h2>
            <button
              onClick={() => setShowAddProcedure(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              + Add Procedure
            </button>
          </div>

          {procedures.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              No procedures added yet. Click &quot;Add Procedure&quot; to get
              started.
            </p>
          ) : (
            <div className="space-y-4">
              {procedures.map((procedure) => (
                <div
                  key={procedure.id}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-indigo-300 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {procedure.date} - {procedure.service?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {procedure.doctors && procedure.doctors.length > 0
                          ? procedure.doctors.map((d) => d.full_name).join(", ")
                          : procedure.doctor?.full_name || "No doctor assigned"}
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

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Price</p>
                      <p className="font-semibold text-gray-900">
                        ${procedure.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paid</p>
                      <p className="font-semibold text-gray-900">
                        ${procedure.paid.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Balance</p>
                      <p
                        className={`font-semibold ${
                          procedure.price - procedure.paid > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ${(procedure.price - procedure.paid).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notes</h2>

          {/* Add Note Form */}
          <form
            onSubmit={handleAddNote}
            className="mb-6 space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date (optional - defaults to today)
              </label>
              <input
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
              rows={3}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                "Add Note"
              )}
            </button>
          </form>

          {/* Notes List */}
          {notes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No notes yet. Add one above!
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                >
                  {editingNoteId === note.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editingNoteDate}
                          onChange={(e) => setEditingNoteDate(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <textarea
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEditNote(note.id)}
                          disabled={isSubmitting}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded transition text-sm flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          onClick={handleCancelEditNote}
                          disabled={isSubmitting}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded transition text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-600 font-medium">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditNote(note.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="Edit note"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            title="Delete note"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-800">{note.note}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Procedure Modal */}
      {procedureToEdit && editingProcedureId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-transparent overflow-y-auto">
          <div
            className="absolute inset-0"
            onClick={() => setEditingProcedureId(null)}
          />
          <div className="relative z-10 w-full max-w-2xl my-8">
            <div className="bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Procedure
                </h2>
                <button
                  onClick={() => setEditingProcedureId(null)}
                  className="text-2xl leading-none hover:text-gray-600 transition"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateProcedure} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service (optional)
                  </label>
                  <select
                    value={editFormData.service_id || ""}
                    onChange={(e) => {
                      const serviceId = e.target.value;
                      console.log("Edit - Selected service ID:", serviceId);

                      if (!serviceId) {
                        setEditFormData((prev) => ({
                          ...prev,
                          service_id: null,
                        }));
                        return;
                      }

                      const selectedService = services.find(
                        (s) => String(s.id) === String(serviceId)
                      );
                      console.log("Edit - Found service:", selectedService);

                      if (selectedService) {
                        setEditFormData((prev) => ({
                          ...prev,
                          service_id: serviceId,
                          description: selectedService.name || "",
                          price:
                            selectedService.price !== null
                              ? selectedService.price
                              : 0,
                        }));
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select a service --</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                        {service.price ? ` - $${service.price.toFixed(2)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editFormData.description || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => {
                      setEditFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctors (select multiple)
                  </label>
                  <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto bg-white">
                    {doctors.map((doctor) => (
                      <label
                        key={doctor.id}
                        className="flex items-center gap-2 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            editFormData.doctor_ids?.includes(doctor.id) ||
                            false
                          }
                          onChange={(e) => {
                            const currentDoctorIds =
                              editFormData.doctor_ids || [];
                            if (e.target.checked) {
                              setEditFormData((prev) => ({
                                ...prev,
                                doctor_ids: [...currentDoctorIds, doctor.id],
                              }));
                            } else {
                              setEditFormData((prev) => ({
                                ...prev,
                                doctor_ids: currentDoctorIds.filter(
                                  (id) => id !== doctor.id
                                ),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-900">
                          {doctor.full_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.date || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => {
                      setEditFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.price || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => {
                      setEditFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Money Paid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.paid || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => {
                      setEditFormData((prev) => ({
                        ...prev,
                        paid: parseFloat(e.target.value) || 0,
                      }));
                    }}
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                  <p>
                    Balance: $
                    {(
                      (editFormData.price || 0) - (editFormData.paid || 0)
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProcedureId(null);
                      setEditFormData({});
                    }}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Procedure Modal */}
      {showAddProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-transparent overflow-y-auto">
          <div
            className="absolute inset-0"
            onClick={() => !isSubmitting && setShowAddProcedure(false)}
          />
          <div className="relative z-10 w-full max-w-2xl my-8">
            <AddProcedureModal
              onClose={() => setShowAddProcedure(false)}
              onAdd={handleAddProcedureSubmit}
              doctors={doctors}
              services={services}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-transparent">
          <div
            className="absolute inset-0"
            onClick={() => !isSubmitting && setDeleteConfirm(null)}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                {deleteConfirm.type === "procedure"
                  ? "Are you sure you want to delete this procedure? This action cannot be undone."
                  : "Are you sure you want to delete this note? This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    deleteConfirm.type === "procedure"
                      ? confirmDeleteProcedure
                      : confirmDeleteNote
                  }
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function AddProcedureModal({
  onClose,
  onAdd,
  doctors,
  services,
  isSubmitting,
}: {
  onClose: () => void;
  onAdd: (procedure: Procedure) => void;
  doctors: Doctor[];
  services: Service[];
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    description: "",
    date: new Date().toISOString().split("T")[0],
    doctor_id: "",
    doctor_ids: [] as string[],
    price: "",
    paid: "",
    service_id: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price) || 0;
    const paid = parseFloat(formData.paid) || 0;

    onAdd({
      id: Date.now().toString(),
      patient_id: "",
      description: formData.description,
      date: formData.date,
      doctor_id: formData.doctor_id,
      doctor_ids: formData.doctor_ids,
      price,
      paid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service_id: formData.service_id || null,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto">
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
            Service (optional)
          </label>
          <select
            name="service_id"
            value={formData.service_id}
            onChange={(e) => {
              const serviceId = e.target.value;
              console.log("Selected service ID:", serviceId);
              console.log("Available services:", services);

              if (!serviceId) {
                setFormData((prev) => ({
                  ...prev,
                  service_id: "",
                }));
                return;
              }

              const selectedService = services.find(
                (s) => String(s.id) === String(serviceId)
              );
              console.log("Found service:", selectedService);

              if (selectedService) {
                setFormData((prev) => ({
                  ...prev,
                  service_id: serviceId,
                  description: selectedService.name || "",
                  price:
                    selectedService.price !== null
                      ? String(selectedService.price)
                      : "",
                }));
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select a service --</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
                {service.price !== null
                  ? ` - $${service.price.toFixed(2)}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="E.g., Cleaning, Root Canal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Doctors (select multiple)
          </label>
          <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto bg-white">
            {doctors.map((doctor) => (
              <label
                key={doctor.id}
                className="flex items-center gap-2 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.doctor_ids.includes(doctor.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData((prev) => ({
                        ...prev,
                        doctor_ids: [...prev.doctor_ids, doctor.id],
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        doctor_ids: prev.doctor_ids.filter(
                          (id) => id !== doctor.id
                        ),
                      }));
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-900">
                  {doctor.full_name}
                </span>
              </label>
            ))}
          </div>
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
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Money Paid
          </label>
          <input
            type="number"
            name="paid"
            value={formData.paid}
            onChange={handleChange}
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
          <p>
            Balance: $
            {(
              parseFloat(formData.price) - parseFloat(formData.paid) || 0
            ).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded transition"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
