import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; procedureId: string }> }
) {
  try {
    const { patientId, procedureId } = await params;
    const body = await request.json();

    if (body.doctors) {
      delete body.doctors;
    }

    console.log("Updating procedure:", { patientId, procedureId, body });

    const { data, error } = await supabase
      .from("pp_procedures_and_payments")
      .update(body)
      .eq("id", procedureId)
      .eq("patient_id", patientId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Procedure not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
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
