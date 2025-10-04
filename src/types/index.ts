export interface GeneratedImage {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}
