// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface College {
  id: number;
  name: string;
  location: string;
  fees: number;
  rating: number;
  overview: string;
  courses: string[];
  placements: {
    highest: number;
    average: number;
    topRecruiters: string[];
  };
}

export default function CollegeDiscoveryPlatform() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [maxFees, setMaxFees] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (maxFees) queryParams.append('maxFees', maxFees);
      if (minRating) queryParams.append('minRating', minRating);

      const response = await fetch(`/api/colleges?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to synchronize with backend records.');
      
      const data = await response.json();
      setColleges(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchColleges();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, maxFees, minRating]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-gradient-to-r border-b from-blue-700 to-indigo-800 text-white py-6 px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EduSelect</h1>
            <p className="text-blue-100 text-sm">Production-Grade College Discovery & Comparison Portal</p>
          </div>
          <div className="bg-blue-600/40 text-xs px-3 py-1.5 rounded-md border border-blue-400/30 font-mono">
            ⚡ Neon Live Connection Enabled
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit space-y-6">
          <div>
            <h2 className="font-semibold text-lg text-gray-800 mb-1">Search Filters</h2>
            <p className="text-xs text-gray-500">Narrow your academic choices instantly</p>
          </div>
          <hr className="border-gray-100" />

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Keyword Search</label>
            <input
              type="text"
              placeholder="e.g., IIT, Mumbai, NIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Max Annual Fees</label>
            <select
              value={maxFees}
              onChange={(e) => setMaxFees(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Any Budget Limit</option>
              <option value="160000">Up to ₹1,60,000</option>
              <option value="220000">Up to ₹2,20,000</option>
              <option value="300000">Up to ₹3,00,000</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Minimum Rating</label>
            <div className="flex gap-2">
              {['4.0', '4.5', '4.8'].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setMinRating(minRating === rating ? '' : rating)}
                  className={`flex-1 py-1.5 px-2 border rounded-lg text-xs font-medium transition-all ${
                    minRating === rating
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {rating}★+
                </button>
              ))}
            </div>
          </div>

          {(searchTerm || maxFees || minRating) && (
            <button
              onClick={() => { setSearchTerm(''); setMaxFees(''); setMinRating(''); }}
              className="w-full text-center text-xs text-red-600 hover:text-red-700 font-medium py-1 hover:underline transition-all"
            >
              Clear All Active Filters
            </button>
          )}
        </section>

        {/* Results Panel */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-white px-5 py-3 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-600">
              {loading ? 'Analyzing data...' : `Discovered ${colleges.length} Elite Institutions`}
            </span>
            <div className="text-xs text-gray-400">Sorted by Rating (Desc)</div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
              🚨 <strong>API Sync Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-xl h-64 shadow-sm"></div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm max-w-md mx-auto">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-4 font-semibold text-lg text-gray-800">No Matching Colleges Found</h3>
              <p className="text-sm text-gray-500 mt-1">Adjust your search parameters to broaden the search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colleges.map((college) => (
                <article 
                  key={college.id} 
                  className="bg-white border border-gray-200 hover:border-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                >
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white flex-1">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        ⭐ {college.rating ? Number(college.rating).toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        Avg Pack: {formatINR(college.placements.average)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 tracking-tight leading-snug">
                      {college.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      📍 {college.location}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-3 leading-relaxed">
                      {college.overview}
                    </p>
                  </div>

                  <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Annual Tuition</div>
                      <div className="text-base font-bold text-gray-900">{formatINR(college.fees)}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => alert(`Navigating to profile details for ${college.name}...`)}
                      className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-sm"
                    >
                      View Details →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}