'use client';

import { useEffect, useRef, useState } from 'react';

export default function RecordPage(){
  const [prompts, setPrompts] = useState<{id:number; text:string}[]>([]);
  const [promptId, setPromptId] = useState<number|undefined>();
  const [rec, setRec] = useState<MediaRecorder|null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    fetch('/api/prompts').then(r=>r.json()).then(setPrompts);
  },[]);

  const start = async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunks.current = [];
    mr.ondataavailable = (e)=> chunks.current.push(e.data);
    mr.onstop = ()=>{
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      setBlobUrl(URL.createObjectURL(blob));
    };
    mr.start();
    setRec(mr);
  };

  const stop = ()=>{
    rec?.stop();
    setRec(null);
  };

  const upload = async ()=>{
    if(!promptId || !blobUrl) return;
    setBusy(true);
    const blob = await fetch(blobUrl).then(r=>r.blob());
    const fd = new FormData();
    fd.append('file', blob, 'voice.webm');
    fd.append('promptId', String(promptId));
    const res = await fetch('/api/recordings', { method: 'POST', body: fd });
    setBusy(false);
    if(res.ok){ alert('업로드 완료'); location.href = '/'; }
    else{ alert('업로드 실패'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">녹음 업로드</h1>
      <div className="card space-y-3">
        <label>읽을 문장</label>
        <select value={promptId ?? ''} onChange={e=>setPromptId(Number(e.target.value))}>
          <option value="" disabled>문장 선택</option>
          {prompts.filter(p=>p).map(p=>(<option key={p.id} value={p.id}>{p.text}</option>))}
        </select>

        <div className="flex gap-2">
          {!rec ? <button className="btn btn-primary" onClick={start}>녹음 시작</button>
                : <button className="btn" onClick={stop}>정지</button>}
          {blobUrl && <audio src={blobUrl} controls className="flex-1" />}
        </div>

        <button className="btn btn-ghost" onClick={upload} disabled={!promptId || !blobUrl || busy}>
          {busy ? '업로드 중...' : '업로드'}
        </button>
      </div>
    </div>
  );
}
