export type Recording = {
  id: number;
  prompt_id: number;
  user_id: string | null;
  audio_url: string;
  duration_sec: number | null;
  status: string;
  created_at: string;
};

export type Prompt = {
  id: number;
  text: string;
  lang: string;
  active: boolean;
  created_at: string;
};
