import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const runtime = 'nodejs';

export async function POST(req: NextRequest){
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const promptId = Number(form.get('promptId') || 0);
  if(!file || !promptId) return NextResponse.json({ error:'bad_request' }, { status:400 });

  // Upload to storage
  const buf = Buffer.from(await file.arrayBuffer());
  const filename = `rec_${Date.now()}.webm`;
  const bucket = process.env.STORAGE_BUCKET || 'recordings';
  const { data: up, error: upErr } = await supabase.storage.from(bucket).upload(filename, buf, {
    contentType: file.type || 'audio/webm',
    upsert: false
  });
  if(upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(up.path);

  // Insert DB row
  const { error: insErr } = await supabase.from('recordings').insert({
    prompt_id: promptId,
    user_id: null,
    audio_url: pub.publicUrl,
    status: 'active'
  });
  if(insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, url: pub.publicUrl });
}
