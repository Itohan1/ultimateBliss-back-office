import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";

interface TextAd {
  id: number;
  content: string;
}

interface ImageAd {
  id: number;
  url: string;
}

export default function AdvertisementManagement() {
  const [textAds, setTextAds] = useState<TextAd[]>([
    { id: 1, content: "50% OFF all skincare this week!" },
  ]);

  const [imageAds, setImageAds] = useState<ImageAd[]>([
    { id: 1, url: "/example-banner.jpg" },
  ]);

  const [newText, setNewText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ---------------- TEXT ADS ---------------- //
  const addTextAd = () => {
    if (!newText.trim()) return;

    setTextAds([...textAds, { id: Date.now(), content: newText.trim() }]);
    setNewText("");
  };

  const deleteTextAd = (id: number) => {
    setTextAds(textAds.filter((a) => a.id !== id));
  };

  const editTextAd = (id: number, value: string) => {
    setTextAds(
      textAds.map((a) => (a.id === id ? { ...a, content: value } : a))
    );
  };

  // ---------------- IMAGE ADS ---------------- //
  const addImageAd = () => {
    if (!imageFile) return;

    const previewURL = URL.createObjectURL(imageFile);

    setImageAds([...imageAds, { id: Date.now(), url: previewURL }]);
    setImageFile(null);
  };

  const deleteImageAd = (id: number) => {
    setImageAds(imageAds.filter((i) => i.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-purple-950/20">
      {/* Sidebar */}
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Section */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* PAGE CONTENT */}
        <section className="mt-16 md:ml-64 p-6 space-y-10">
          <h1 className="text-3xl font-semibold text-purple-700 dark:text-purple-300">
            Advertisement Management
          </h1>

          {/* ---------------- TEXT ADS ---------------- */}
          <div className="bg-white dark:bg-purple-900 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-pink-600 mb-4">
              Text Advertisements
            </h2>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter advertisement text..."
                className="flex-1 px-4 py-2 rounded-xl border dark:bg-purple-800 dark:text-white"
              />
              <button
                onClick={addTextAd}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl"
              >
                Upload
              </button>
            </div>

            {/* LIST */}
            <ul className="space-y-3">
              {textAds.map((ad) => (
                <li
                  key={ad.id}
                  className="bg-gray-100 dark:bg-purple-800 p-4 rounded-xl flex justify-between items-center"
                >
                  <input
                    type="text"
                    value={ad.content}
                    onChange={(e) => editTextAd(ad.id, e.target.value)}
                    className="flex-1 bg-transparent outline-none dark:text-white"
                  />

                  <button
                    onClick={() => deleteTextAd(ad.id)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- IMAGE ADS ---------------- */}
          <div className="bg-white dark:bg-purple-900 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-pink-600 mb-4">
              Image Advertisements
            </h2>

            <div className="flex gap-3 mb-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="flex-1 dark:text-white"
              />
              <button
                onClick={addImageAd}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl"
              >
                Upload
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageAds.map((ad) => (
                <div key={ad.id} className="relative">
                  <img
                    src={ad.url}
                    className="w-full h-40 object-cover rounded-xl shadow"
                    alt="Advertisement"
                  />
                  <button
                    onClick={() => deleteImageAd(ad.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
