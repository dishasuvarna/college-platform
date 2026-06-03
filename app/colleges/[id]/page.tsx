'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface College {
  id: number;
  name: string;
  location: string;
  fees: number;
  rating: any; // Using any to safely parse string numbers from Postgres
  overview: string;
  courses: string[];
  placements: {
    highest: number;
    average: number;
    topRecruiters: string[];
  };
}

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/colleges/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Requested college asset could not be located.');
        const data = await response.json();
        setCollege(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [resolvedParams.id]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm font-medium text-gray-500 animate-pulse">Syncing complete institution portfolio files...</div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md text-center">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-gray-800 mt-4">Profile Unavailable</h2>
          <p className="text-sm text-gray-500 mt-2">{error || "The profile matching this asset identifier could not be verified."}</p>
          <Link href="/" className="inline-block mt-5 text-xs bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
            ← Return to Discovery Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all">
            ← Back to Discovery Grid
          </Link>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">ID Reference: #{college.id}</span>
        </div>
      </div>

      <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-12 px-6 shadow-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded shadow-sm">
              ★ {college.rating ? Number(college.rating).toFixed(1) : 'N/A'} Rating
            </span>
            <span className="bg-slate-800/80 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700">📍 {college.location}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-3xl leading-tight text-white">{college.name}</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Financial Metrics</h3>
            <div>
              <div className="text-2xl font-black text-gray-900">{formatINR(college.fees)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Estimated Annual General Tuition Fee</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Placement Benchmarks</h3>
            <div className="border-b border-gray-100 pb-3">
              <div className="text-xl font-bold text-emerald-600">{formatINR(college.placements.highest)}</div>
              <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Highest Package Secured</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{formatINR(college.placements.average)}</div>
              <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Average Compensation Metric</div>
            </div>
          </div>
        </section>

        <section className="md:col-span-2 space-y-6">
          <article className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-gray-800">Institutional Overview</h2>
            <hr className="border-gray-100" />
            <p className="text-sm text-gray-600 leading-relaxed font-normal">{college.overview}</p>
          </article>

          <article className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Available Courses & Majors</h2>
            <hr className="border-gray-100" />
            <div className="flex flex-wrap gap-2">
              {college.courses.map((course, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                  📚 {course}
                </span>
              ))}
            </div>
          </article>

          <article className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-gray-800">Top Strategic Recruiters</h2>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-2 gap-3">
              {college.placements.topRecruiters.map((recruiter, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 text-center">
                  💼 {recruiter}
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}