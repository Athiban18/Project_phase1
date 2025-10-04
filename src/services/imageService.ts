export async function generateImage(prompt: string): Promise<string> {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
  return imageUrl;
}
