import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    const { data, error } = await supabase
      .from("pp_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
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
    const { note, created_at } = body;

    if (!note) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    const noteData: {
      patient_id: string;
      note: string;
      created_at?: string;
    } = {
      patient_id: patientId,
      note: note,
    };

    // Only add created_at if provided
    if (created_at) {
      noteData.created_at = created_at;
    }

    const { data, error } = await supabase
      .from("pp_notes")
      .insert([noteData])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
