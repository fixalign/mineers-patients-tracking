import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Use the patient_dashboard_view instead of fetching procedures separately
    const { data, error } = await supabase
      .from("patient_dashboard_view")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Patient name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("patients")
      .insert([{ name }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
