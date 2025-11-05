import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all procedures with patient and service info
    const { data: procedures, error: procError } = await supabase.from(
      "pp_procedures_and_payments"
    ).select(`
        id,
        price,
        paid,
        service_id,
        patient_id,
        service:service_id(name),
        patient:patient_id(full_name)
      `);

    if (procError) {
      return NextResponse.json({ error: procError.message }, { status: 500 });
    }

    // Calculate overall revenue stats
    const totalRevenue = procedures.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalPaid = procedures.reduce((sum, p) => sum + (p.paid || 0), 0);
    const totalBalance = totalRevenue - totalPaid;

    const revenueStats = {
      totalRevenue,
      totalPaid,
      totalBalance,
      proceduresCount: procedures.length,
      totalOwedToUs: 0,
      totalOwedToPatients: 0,
    };

    // Calculate service statistics
    const serviceMap = new Map<
      string | null,
      {
        service_id: string | null;
        service_name: string;
        total_revenue: number;
        total_paid: number;
        total_balance: number;
        total_owed_to_us: number;
        total_owed_to_patients: number;
        procedure_count: number;
      }
    >();

    procedures.forEach((proc) => {
      const serviceId = proc.service_id;
      const serviceName =
        proc.service &&
        typeof proc.service === "object" &&
        "name" in proc.service
          ? (proc.service as { name: string }).name
          : "No Service";

      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          service_id: serviceId,
          service_name: serviceName,
          total_revenue: 0,
          total_paid: 0,
          total_balance: 0,
          total_owed_to_us: 0,
          total_owed_to_patients: 0,
          procedure_count: 0,
        });
      }

      const stats = serviceMap.get(serviceId)!;
      const balance = (proc.price || 0) - (proc.paid || 0);

      stats.total_revenue += proc.price || 0;
      stats.total_paid += proc.paid || 0;
      stats.total_balance += balance;

      if (balance > 0) {
        stats.total_owed_to_us += balance;
      } else if (balance < 0) {
        stats.total_owed_to_patients += Math.abs(balance);
      }

      stats.procedure_count += 1;
    });

    const serviceStats = Array.from(serviceMap.values()).sort(
      (a, b) => b.total_revenue - a.total_revenue
    );

    // Calculate patient statistics
    const patientMap = new Map<
      string,
      {
        patient_id: string;
        patient_name: string;
        total_revenue: number;
        total_paid: number;
        total_balance: number;
        total_owed_to_us: number;
        total_owed_to_patients: number;
        procedure_count: number;
      }
    >();

    procedures.forEach((proc) => {
      const patientId = proc.patient_id;
      const patientName =
        proc.patient &&
        typeof proc.patient === "object" &&
        "full_name" in proc.patient
          ? (proc.patient as { full_name: string }).full_name
          : "Unknown";

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patient_id: patientId,
          patient_name: patientName,
          total_revenue: 0,
          total_paid: 0,
          total_balance: 0,
          total_owed_to_us: 0,
          total_owed_to_patients: 0,
          procedure_count: 0,
        });
      }

      const stats = patientMap.get(patientId)!;
      const balance = (proc.price || 0) - (proc.paid || 0);

      stats.total_revenue += proc.price || 0;
      stats.total_paid += proc.paid || 0;
      stats.total_balance += balance;

      stats.procedure_count += 1;
    });

    // After aggregating all procedures per patient, calculate owed amounts based on total balance
    let totalOwedToUs = 0;
    let totalOwedToPatients = 0;

    patientMap.forEach((stats) => {
      if (stats.total_balance > 0) {
        stats.total_owed_to_us = stats.total_balance;
        stats.total_owed_to_patients = 0;
        totalOwedToUs += stats.total_balance;
      } else if (stats.total_balance < 0) {
        stats.total_owed_to_us = 0;
        stats.total_owed_to_patients = Math.abs(stats.total_balance);
        totalOwedToPatients += Math.abs(stats.total_balance);
      } else {
        stats.total_owed_to_us = 0;
        stats.total_owed_to_patients = 0;
      }
    });

    // Update revenue stats with calculated totals
    revenueStats.totalOwedToUs = totalOwedToUs;
    revenueStats.totalOwedToPatients = totalOwedToPatients;

    const patientStats = Array.from(patientMap.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 20); // Top 20 patients

    return NextResponse.json({
      revenue: revenueStats,
      services: serviceStats,
      patients: patientStats,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
