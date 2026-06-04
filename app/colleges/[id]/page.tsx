"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface CollegeData {
  id: number;
  name: string;
  location: string;
  fees: number;
  rating: number;
  overview?: string;
  courses?: string;
  placements?: string;
  examRequired?: string;
  cutoffRank?: number;
  averagePackageDisplay?: string;
  highestPackageDisplay?: string;
  coreRecruitersDisplay?: string;
}

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Cleanly pull and ensure the dynamic param is bound
  const id = typeof params?.id === "string" ? params.id : "";

  const [college, setCollege] = useState<CollegeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      // 🔑 Guard Gate: If Next.js hasn't populated the ID into the client router yet, halt execution
      if (!id) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/colleges/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to load college details.");
        }
        const data = await res.json();
        setCollege(data);
      } catch (err: any) {
        console.error("Profile detail fetch failure:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id]); // Hook tracking triggers cleanly as soon as 'id' updates from the router frame

  if (!id) return <div className="p-8 text-center text-gray-500">Initializing router parameters...</div>;
  if (loading) return <div className="p-8 text-center text-gray-600">Loading profile details...</div>;
  if (error || !college) return <div className="p-8 text-center text-red-500">Error: {error || "College profile not found."}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Navigation Button */}
      <button 
        onClick={() => router.back()} 
        className="text-blue-600 hover:underline flex items-center gap-2 mb-4 font-medium"
      >
        ← Back to Search
      </button>

      {/* Main Header Information Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">{college.name}</h1>
        <p className="text-gray-500 mt-1">{college.location}</p>
        
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-sm text-gray-500 block">Annual Fees</span>
            <span className="text-lg font-semibold text-gray-800">₹{college.fees?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Rating</span>
            <span className="text-lg font-semibold text-amber-500">⭐ {college.rating} / 5</span>
          </div>
          {college.examRequired && (
            <div>
              <span className="text-sm text-gray-500 block">Admission Exam</span>
              <span className="text-lg font-semibold text-purple-600">{college.examRequired}</span>
            </div>
          )}
        </div>
      </div>

      {/* Extended Profile Overview Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">About the Institution</h2>
        <p className="text-gray-700 leading-relaxed">{college.overview || "Detailed description pending update."}</p>
      </div>

      {/* Grid for Programs & Placement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Offered Programs</h3>
          <p className="text-gray-700 whitespace-pre-line">{college.courses || "Information pending update."}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Placement Highlights</h3>
          <div className="space-y-3 mt-2">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Average Package</span>
              <span className="text-sm font-bold text-emerald-600">{college.averagePackageDisplay || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Highest Package</span>
              <span className="text-sm font-bold text-blue-600">{college.highestPackageDisplay || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Core Recruiters</span>
              <p className="text-sm text-gray-600 font-medium whitespace-pre-line">{college.coreRecruitersDisplay || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}