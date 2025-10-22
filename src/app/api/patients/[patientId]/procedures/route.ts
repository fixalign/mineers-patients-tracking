import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    const { data, error } = await supabase
      .from("pp_procedures_and_payments")
      .select(
        `
        *,
        doctor_id(id, full_name)
      `
      )
      .eq("patient_id", patientId)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
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
    const { procedure_name, date, doctor_id, price, paid } = body;

    if (!procedure_name || !date || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pp_procedures_and_payments")
      .insert([
        {
          patient_id: patientId,
          procedure_name,
          date,
          doctor_id,
          price,
          paid: paid || 0,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create procedure" },
      { status: 500 }
    );
  }
}
