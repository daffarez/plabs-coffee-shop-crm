import { NextResponse } from "next/server";
import { callOpenRouter } from "@/src/lib/openrouter";
import { supabase } from "@/src/lib/supabase";

export const POST = async (req: Request) => {
  const { message } = await req.json();

  const { data: customers } = await supabase
    .from("customers")
    .select("name, favorite");

  const systemPrompt = `
    You are a CRM Assistant for Kopi Kita. 
    Context data: ${JSON.stringify(customers)}
    Answer user questions in a friendly and professional manner with coffee-shop tone based on the data.
  `;

  try {
    const data = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
