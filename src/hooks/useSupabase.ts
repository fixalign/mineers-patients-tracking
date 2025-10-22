import { useState, useEffect } from "react";

export interface PatientDashboard {
  id: string;
  full_name: string;
  procedures_count: number;
  total_price: number;
  total_paid: number;
  balance: number;
}

export interface Doctor {
  id: string;
  full_name: string;
}

export interface Procedure {
  id: string;
  patient_id: string;
  procedure_name: string;
  date: string;
  doctor_id: string | null;
  price: number;
  paid: number;
  created_at: string;
  updated_at: string;
  doctor?: Doctor | null;
}

export interface PatientNote {
  id: string;
  patient_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  procedures?: Procedure[];
  notes?: PatientNote[];
}

export const usePatients = () => {
  const [patients, setPatients] = useState<PatientDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPatients();
  }, []);

  const addPatient = async (name: string) => {
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to add patient");
      // Refetch all patients to get updated dashboard view
      await fetchPatients();
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete patient");
      setPatients(patients.filter((p) => p.id !== patientId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  return {
    patients,
    loading,
    error,
    fetchPatients,
    addPatient,
    deletePatient,
  };
};
export const useProcedures = (patientId: string) => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/procedures`);
      if (!response.ok) throw new Error("Failed to fetch procedures");
      const data = await response.json();
      setProcedures(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      void fetchProcedures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const addProcedure = async (
    procedureData: Omit<Procedure, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/procedures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(procedureData),
      });
      if (!response.ok) throw new Error("Failed to add procedure");
      const newProcedure = await response.json();
      setProcedures([newProcedure, ...procedures]);
      return newProcedure;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  const updateProcedure = async (
    procedureId: string,
    updates: Partial<Procedure>
  ) => {
    try {
      const response = await fetch(
        `/api/patients/${patientId}/procedures/${procedureId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (!response.ok) throw new Error("Failed to update procedure");
      const updated = await response.json();
      setProcedures(
        procedures.map((p) => (p.id === procedureId ? updated : p))
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  const deleteProcedure = async (procedureId: string) => {
    try {
      const response = await fetch(
        `/api/patients/${patientId}/procedures/${procedureId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete procedure");
      setProcedures(procedures.filter((p) => p.id !== procedureId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  return {
    procedures,
    loading,
    error,
    addProcedure,
    updateProcedure,
    deleteProcedure,
  };
};

export const useNotes = (patientId: string) => {
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/notes`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      void fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const addNote = async (content: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: content }),
      });
      if (!response.ok) throw new Error("Failed to add note");
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      return newNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  const updateNote = async (noteId: string, content: string) => {
    try {
      const response = await fetch(
        `/api/patients/${patientId}/notes/${noteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: content }),
        }
      );
      if (!response.ok) throw new Error("Failed to update note");
      const updated = await response.json();
      setNotes(notes.map((n) => (n.id === noteId ? updated : n)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(
        `/api/patients/${patientId}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
  };
};

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/doctors");
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading, error };
};

export const usePatientDetail = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const fetchPatientDetail = async () => {
      try {
        setLoading(true);
        // Fetch patient from dashboard view
        const response = await fetch(`/api/patients`);
        if (!response.ok) throw new Error("Failed to fetch patient");
        const patients = await response.json();
        // Find patient by ID from dashboard view
        const found = patients.find(
          (p: PatientDashboard) => p.id === patientId
        );

        if (!found) throw new Error("Patient not found");

        // Convert dashboard view to Patient type for compatibility
        const patientData: Patient = {
          id: found.id,
          name: found.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setPatient(patientData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetail();
  }, [patientId]);

  return { patient, loading, error };
};
