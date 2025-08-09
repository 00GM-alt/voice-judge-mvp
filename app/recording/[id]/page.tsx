import { supabase } from "@/lib/supabaseClient";

async function getItem(id:number){
  const { data: rec } = await supabase.from('recordings').select('*').eq('id', id).single();
  if(!rec) return null;
  const { data: prompt } = await supabase.from('prompts').select('text').eq('id', rec.prompt_id).single();
  const { data: stats } = await supabase.from('recording_stats').select('*').eq('recording_id', id).single();
  return { rec, prompt, stats };
}

async function setRating(recordingId:number, score:number){
  'use server';
  await supabase.from('ratings').upsert({ recording_id: recordingId, rater_id: null, score });
  const { data: stats } = await supabase.from('recording_stats').select('*').eq('recording_id', recordingId).single();
  return stats;
}

export default async function Page({ params }:{ params:{ id:string }}){
  const id = Number(params.id);
  const item = await getItem(id);
  if(!item) return <div className="text-red-600">존재하지 않는 녹음입니다.</div>;
  const stats = item.stats;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">녹음 상세</h1>
      <div className="card space-y-3">
        <div className="text-sm text-gray-600">{item.prompt?.text ?? '문장'}</div>
        <audio src={item.rec.audio_url} controls className="w-full" />
        <div>⭐ 평균 {stats?.avg_score ?? 0} ({stats?.rating_count ?? 0}명)</div>
        <form action={async (formData)=>{
          const score = Number(formData.get('score') || 0);
          await setRating(id, score);
        }} className="flex items-center gap-2">
          <label htmlFor="score">내 별점</label>
          <select name="score" id="score" defaultValue="5" className="w-24">
            {[1,2,3,4,5].map(s=>(<option key={s} value={s}>{s}</option>))}
          </select>
          <button className="btn btn-primary" type="submit">저장</button>
        </form>
      </div>
    </div>
  );
}
