'use client';
import { useState, useTransition } from 'react';

export default function Heart({ initialLiked, count, onToggle }:{ initialLiked:boolean; count:number; onToggle:()=>Promise<{liked:boolean; count:number}>; }){
  const [liked, setLiked] = useState(initialLiked);
  const [c, setC] = useState(count);
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="text-sm"
      onClick={() => startTransition(async()=>{
        const res = await onToggle();
        setLiked(res.liked); setC(res.count);
      })}
      disabled={pending}
      aria-label="like"
      title="하트"
    >
      {liked ? '❤️' : '🤍'} {c}
    </button>
  );
}
