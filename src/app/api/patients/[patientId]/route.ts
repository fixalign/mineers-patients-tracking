import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    // Delete associated notes and procedures first
    await supabase.from("pp_notes").delete().eq("patient_id", patientId);
    await supabase
      .from("pp_procedures_and_payments")
      .delete()
      .eq("patient_id", patientId);

    // Then delete the patient
    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", patientId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
