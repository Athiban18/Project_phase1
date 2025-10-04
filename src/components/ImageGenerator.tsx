import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateImage } from '../services/imageService';
import { Sparkles, Loader2, LogOut, Trash2, Download } from 'lucide-react';

interface SavedImage {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

export function ImageGenerator() {
  const { user, signOut } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`images_${user?.id}`);
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }
  }, [user?.id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);

      const newImage: SavedImage = {
        id: crypto.randomUUID(),
        prompt,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const updated = [newImage, ...savedImages];
      setSavedImages(updated);
      localStorage.setItem(`images_${user?.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    const updated = savedImages.filter(img => img.id !== id);
    setSavedImages(updated);
    localStorage.setItem(`images_${user?.id}`, JSON.stringify(updated));
    if (savedImages.find(img => img.id === id)?.image_url === generatedImage) {
      setGeneratedImage('');
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Image Studio</h1>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition flex items-center gap-2 border border-slate-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Generate Image</h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Describe your image
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition resize-none"
                    placeholder="A serene mountain landscape at sunset with vibrant colors..."
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-500 focus:ring-4 focus:ring-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {generatedImage && (
              <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Generated Image</h3>
                  <button
                    onClick={() => handleDownload(generatedImage, prompt)}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition flex items-center gap-2 border border-blue-500/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          <div>
            <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Your Gallery</h2>

              {savedImages.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No images generated yet</p>
                  <p className="text-sm text-slate-500 mt-2">Create your first AI image to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {savedImages.map((image) => (
                    <div
                      key={image.id}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition group"
                    >
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full rounded-lg mb-3 shadow-md cursor-pointer"
                        onClick={() => setGeneratedImage(image.image_url)}
                      />
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2">{image.prompt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {new Date(image.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleDownload(image.image_url, image.prompt)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
