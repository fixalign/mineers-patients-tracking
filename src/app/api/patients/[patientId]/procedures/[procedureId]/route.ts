import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; procedureId: string }> }
) {
  try {
    const { patientId, procedureId } = await params;
    const body = await request.json();

    // Extract doctor_ids if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { doctor_ids, doctor, doctors, ...procedureUpdates } = body;

    console.log("Updating procedure:", {
      patientId,
      procedureId,
      procedureUpdates,
      doctor_ids,
    });

    // Update the procedure
    const { data, error } = await supabase
      .from("pp_procedures_and_payments")
      .update(procedureUpdates)
      .eq("id", procedureId)
      .eq("patient_id", patientId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Procedure not found" },
        { status: 404 }
      );
    }

    // If doctor_ids are provided, update the associations
    if (doctor_ids !== undefined) {
      // Delete existing associations
      await supabase
        .from("pp_procedure_doctors")
        .delete()
        .eq("procedure_id", procedureId);

      // Insert new associations
      if (doctor_ids.length > 0) {
        const doctorLinks = doctor_ids.map((docId: string) => ({
          procedure_id: procedureId,
          doctor_id: docId,
        }));

        await supabase.from("pp_procedure_doctors").insert(doctorLinks);
      }
    }

    // Fetch the complete procedure with doctors and service
    const { data: doctorData } = await supabase
      .from("pp_procedure_doctors")
      .select(`doctor:doctor_id(id, full_name)`)
      .eq("procedure_id", procedureId);

    const procDoctors = (doctorData || [])
      .map((d) => d.doctor)
      .filter((d) => d !== null) as unknown as {
      id: string;
      full_name: string;
    }[];

    // Fetch service if service_id exists
    let serviceData = null;
    if (data.service_id) {
      const { data: service } = await supabase
        .from("services")
        .select("id, name, description, price")
        .eq("id", data.service_id)
        .single();
      serviceData = service;
    }

    return NextResponse.json({
      ...data,
      doctors: procDoctors,
      doctor_ids: procDoctors.map((d) => d.id),
      service: serviceData,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update procedure" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; procedureId: string }> }
) {
  try {
    const { patientId, procedureId } = await params;

    const { error } = await supabase
      .from("pp_procedures_and_payments")
      .delete()
      .eq("id", procedureId)
      .eq("patient_id", patientId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete procedure" },
      { status: 500 }
    );
  }
}
