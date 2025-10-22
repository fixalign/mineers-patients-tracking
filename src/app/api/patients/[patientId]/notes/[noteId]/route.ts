import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; noteId: string }> }
) {
  try {
    const { patientId, noteId } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("pp_notes")
      .update(body)
      .eq("id", noteId)
      .eq("patient_id", patientId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; noteId: string }> }
) {
  try {
    const { patientId, noteId } = await params;

    const { error } = await supabase
      .from("pp_notes")
      .delete()
      .eq("id", noteId)
      .eq("patient_id", patientId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
