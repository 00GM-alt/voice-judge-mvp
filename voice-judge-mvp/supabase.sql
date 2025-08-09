-- Create tables
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamptz default now()
);

create table if not exists prompts (
  id bigserial primary key,
  text text not null,
  lang text default 'ko',
  active boolean default true,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table if not exists recordings (
  id bigserial primary key,
  prompt_id bigint references prompts(id) on delete cascade,
  user_id uuid,
  audio_url text not null,
  duration_sec numeric,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists ratings (
  id bigserial primary key,
  recording_id bigint references recordings(id) on delete cascade,
  rater_id uuid,
  score int check (score between 1 and 5),
  created_at timestamptz default now(),
  unique (recording_id, rater_id)
);

create table if not exists likes (
  recording_id bigint references recordings(id) on delete cascade,
  user_id uuid,
  created_at timestamptz default now(),
  primary key (recording_id, user_id)
);

create table if not exists reports (
  id bigserial primary key,
  recording_id bigint references recordings(id) on delete cascade,
  reporter_id uuid,
  reason text,
  created_at timestamptz default now()
);

-- Simple materialized view alternative: create a view for stats
create or replace view recording_stats as
select
  r.id as recording_id,
  coalesce(avg(rt.score),0)::numeric(3,2) as avg_score,
  count(rt.*) as rating_count,
  (select count(*) from likes l where l.recording_id=r.id) as like_count
from recordings r
left join ratings rt on rt.recording_id=r.id
group by r.id;
