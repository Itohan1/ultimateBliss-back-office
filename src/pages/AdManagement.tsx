import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import LoginPopup from "../components/LoginPopup.tsx";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  useGetTextAdsQuery,
  useCreateTextAdMutation,
  useDeleteTextAdMutation,
  useGetImageAdsQuery,
  useCreateImageAdMutation,
  useDeleteImageAdMutation,
} from "../services/adApi";

export default function AdvertisementManagement() {
  const [newText, setNewText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // ---------------- TEXT ADS ----------------
  const { data: textAds } = useGetTextAdsQuery();
  const [createTextAd] = useCreateTextAdMutation();
  const [deleteTextAd] = useDeleteTextAdMutation();

  const handleAddTextAd = async () => {
    if (!newText.trim()) return;
    try {
      await createTextAd({ text: newText.trim() }).unwrap();
      setNewText("");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const handleDeleteTextAd = async (id: string) => {
    try {
      await deleteTextAd(id).unwrap();
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  // ---------------- IMAGE ADS ----------------
  const { data: imageAds } = useGetImageAdsQuery();
  const [createImageAd] = useCreateImageAdMutation();
  const [deleteImageAd] = useDeleteImageAdMutation();

  const handleAddImageAd = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      await createImageAd(formData).unwrap();
      setImageFile(null);
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const handleDeleteImageAd = async (id: string) => {
    try {
      await deleteImageAd(id).unwrap();
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-purple-950/20">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 p-6 space-y-10">
          <h1 className="text-3xl font-semibold text-purple-700 dark:text-purple-300">
            Advertisement Management
          </h1>

          {/* TEXT ADS */}
          <div className="bg-white dark:bg-purple-900 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-pink-600 mb-4">
              Text Advertisements
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter advertisement text..."
                className="flex-1 px-4 py-2 rounded-xl border dark:bg-purple-800 dark:text-white"
              />
              <button
                onClick={handleAddTextAd}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl mt-2 sm:mt-0"
              >
                Upload
              </button>
            </div>

            <ul className="space-y-3">
              {textAds?.map((ad) => (
                <li
                  key={ad._id}
                  className="bg-gray-100 dark:bg-purple-800 p-4 rounded-xl flex justify-between items-center flex-wrap gap-2"
                >
                  <span className="flex-1">{ad.text}</span>
                  <button
                    onClick={() => handleDeleteTextAd(ad._id)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* IMAGE ADS */}
          <div className="bg-white dark:bg-purple-900 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-pink-600 mb-4">
              Image Advertisements
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="flex-1 dark:text-white"
              />
              <button
                onClick={handleAddImageAd}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl mt-2 sm:mt-0"
              >
                Upload
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {imageAds?.map((ad) => (
                <div key={ad._id} className="relative">
                  <img
                    src={`http://localhost:5000${ad.url}`}
                    className="w-full h-48 sm:h-40 object-cover rounded-xl shadow"
                    alt="Advertisement"
                  />
                  <button
                    onClick={() => handleDeleteImageAd(ad._id)}
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
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
