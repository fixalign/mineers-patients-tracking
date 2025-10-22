export interface PatientNote {
  id: string;
  content: string;
  date: string;
}

export interface Procedure {
  id: string;
  name: string;
  date: string;
  doctor: string;
  price: number;
  moneyPaid: number;
}

export interface Patient {
  id: string;
  name: string;
  procedures: Procedure[];
  notes: PatientNote[];
}

// Helper to calculate totals
export const calculatePatientTotals = (patient: Patient) => {
  const totalPrice = patient.procedures.reduce(
    (sum, proc) => sum + proc.price,
    0
  );
  const totalPaid = patient.procedures.reduce(
    (sum, proc) => sum + proc.moneyPaid,
    0
  );
  const balance = totalPrice - totalPaid;

  return { totalPrice, totalPaid, balance };
};
