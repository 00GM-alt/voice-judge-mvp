import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Heart from "@/components/Heart";

async function getFeed(){
  const { data } = await supabase.from('recordings').select('id,audio_url,created_at,prompt_id,status').order('created_at', { ascending:false }).limit(50);
  const ids = data?.map(d=>d.id) ?? [];
  const { data: stats } = await supabase.from('recording_stats').select('*').in('recording_id', ids);
  const statsMap = new Map(stats?.map(s=>[s.recording_id, s]) ?? []);
  const { data: prompts } = await supabase.from('prompts').select('id,text');
  const pMap = new Map(prompts?.map(p=>[p.id, p.text]) ?? []);
  return (data??[]).map(r=>({ ...r, stats: statsMap.get(r.id), prompt: pMap.get(r.prompt_id) }));
}

async function toggleLike(id:number){
  'use server';
  const { data: rec } = await supabase.from('recordings').select('id').eq('id', id).single();
  if(!rec) return { liked:false, count:0 };
  // Simple toggle: if exists -> delete, else -> insert
  const { data: existing } = await supabase.from('likes').select('*').eq('recording_id', id).limit(1);
  if(existing && existing.length>0){
    await supabase.from('likes').delete().eq('recording_id', id);
  }else{
    await supabase.from('likes').insert({ recording_id: id, user_id: null });
  }
  const { count } = await supabase.from('likes').select('*', { count:'exact', head:true }).eq('recording_id', id);
  const liked = !(existing && existing.length>0);
  return { liked, count: count ?? 0 };
}

export default async function Page(){
  const feed = await getFeed();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">최신 녹음</h1>
      {feed.length === 0 && <p className="text-gray-500">아직 녹음이 없습니다.</p>}
      <ul className="space-y-3">
        {feed.map(item=>(
          <li key={item.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">{item.prompt ?? '문장'}</div>
                <audio src={item.audio_url} controls preload="none" className="w-full" />
                <div className="text-sm text-gray-600 mt-1">
                  ⭐ {item.stats?.avg_score ?? 0} · {item.stats?.rating_count ?? 0}명 평가 · ❤️ {item.stats?.like_count ?? 0}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Heart initialLiked={false} count={item.stats?.like_count ?? 0} onToggle={()=>toggleLike(item.id)} />
                <Link href={`/recording/${item.id}`} className="btn btn-ghost">자세히</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
