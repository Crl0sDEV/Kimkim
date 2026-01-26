import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Supabase (Admin Client para makapag-write)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    // 1. Check Date Today (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 2. Check DB kung may quote na
    const { data: existingQuote } = await supabaseAdmin
      .from("daily_quotes")
      .select("*")
      .eq("date", today)
      .single();

    if (existingQuote) {
      return NextResponse.json(existingQuote);
    }

    // 3. Kung WALA pa, tawagin si Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt: Tagalog/English mix na malalim
    const prompt = `
      Generate a short, deep, and poetic quote about life, the universe, stars, or emotions. 
      It can be in Tagalog or English. 
      Maximum of 20 words. 
      Make it sound like a whisper from the void. 
      Do not include quotation marks.
      Just the text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // 4. Save sa Database para sa susunod na user
    const { data: newQuote, error } = await supabaseAdmin
      .from("daily_quotes")
      .insert([{ date: today, content: text, author: "Kalawakan" }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newQuote);

  } catch (error) {
    console.error("Daily Quote Error:", error);
    // Fallback kung sira si Gemini/DB
    return NextResponse.json({ 
        content: "Ang katahimikan ay sagot din.", 
        author: "Kalawakan" 
    });
  }
}