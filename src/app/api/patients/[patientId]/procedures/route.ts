import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    // First, get all procedures
    const { data: procedures, error: procError } = await supabase
      .from("pp_procedures_and_payments")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false });

    if (procError) {
      return NextResponse.json({ error: procError.message }, { status: 500 });
    }

    // Then, get all doctor associations for these procedures
    const procedureIds = procedures.map((p) => p.id);

    if (procedureIds.length > 0) {
      const { data: doctorLinks, error: linkError } = await supabase
        .from("pp_procedure_doctors")
        .select(
          `
          procedure_id,
          doctor:doctor_id(id, full_name)
        `
        )
        .in("procedure_id", procedureIds);

      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }

      // Combine procedures with their doctors
      const proceduresWithDoctors = procedures.map((proc) => {
        const links =
          doctorLinks?.filter((link) => link.procedure_id === proc.id) || [];
        const procDoctors = links
          .map((link) => link.doctor)
          .filter((d) => d !== null && typeof d === "object") as unknown as {
          id: string;
          full_name: string;
        }[];

        return {
          ...proc,
          doctors: procDoctors,
          doctor_ids: procDoctors.map((d) => d.id),
        };
      });

      return NextResponse.json(proceduresWithDoctors);
    }

    return NextResponse.json(procedures);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch procedures" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const body = await request.json();
    const { procedure_name, date, doctor_id, doctor_ids, price, paid } = body;

    if (!procedure_name || !date || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the procedure
    const { data: procedureData, error: procError } = await supabase
      .from("pp_procedures_and_payments")
      .insert([
        {
          patient_id: patientId,
          procedure_name,
          date,
          doctor_id, // Keep for backward compatibility
          price,
          paid: paid || 0,
        },
      ])
      .select()
      .single();

    if (procError) {
      return NextResponse.json({ error: procError.message }, { status: 500 });
    }

    // Insert doctor associations
    const doctorIdsToInsert = doctor_ids || (doctor_id ? [doctor_id] : []);

    if (doctorIdsToInsert.length > 0) {
      const doctorLinks = doctorIdsToInsert.map((docId: string) => ({
        procedure_id: procedureData.id,
        doctor_id: docId,
      }));

      const { error: linkError } = await supabase
        .from("pp_procedure_doctors")
        .insert(doctorLinks);

      if (linkError) {
        // Rollback: delete the procedure if doctor link fails
        await supabase
          .from("pp_procedures_and_payments")
          .delete()
          .eq("id", procedureData.id);
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }

      // Fetch the complete procedure with doctors
      const { data: doctors } = await supabase
        .from("pp_procedure_doctors")
        .select(`doctor:doctor_id(id, full_name)`)
        .eq("procedure_id", procedureData.id);

      const procDoctors = (doctors || [])
        .map((d) => d.doctor)
        .filter((d) => d !== null) as unknown as {
        id: string;
        full_name: string;
      }[];

      return NextResponse.json(
        {
          ...procedureData,
          doctors: procDoctors,
          doctor_ids: procDoctors.map((d) => d.id),
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        ...procedureData,
        doctors: [],
        doctor_ids: [],
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create procedure" },
      { status: 500 }
    );
  }
}
