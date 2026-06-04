'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface College {
  id: string; // 🔑 Changed to string to perfectly match your UUID database schema
  name: string;
  location: string;
  fees: number;
  rating: any;
  overview?: string;
  courses?: string;
  placements?: string;
  averagePackageDisplay?: string;
  highestPackageDisplay?: string;
  coreRecruitersDisplay?: string;
}

export default function CollegeDiscoveryPlatform() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [maxFees, setMaxFees] = useState<number>(600000);
  
  // Feature 3: Selected comparison tracking state using string UUIDs
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<College[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(search)}&maxFees=${maxFees}`);
        if (res.ok) {
          const data = await res.json();
          setColleges(data);
        }
      } catch (err) {
        console.error("Failed syncing asset array:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, [search, maxFees]);

  const handleSelectCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        alert("You can compare a maximum of 3 institutions simultaneously.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const fetchComparisonMatrix = async () => {
    if (selectedForCompare.length < 2) return;
    setCompareLoading(true);
    setIsModalOpen(true);
    try {
      // Sends clean string array values directly down to your /api/compare route
      const res = await fetch(`/api/compare?ids=${selectedForCompare.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        setCompareData(data);
      }
    } catch (err) {
      console.error("Error executing comparative matrix compile:", err);
    } finally {
      setCompareLoading(false);
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Search Header Banner */}
      <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-12 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight">National Institute Analytics Hub</h1>
          <p className="text-sm text-slate-300 max-w-xl">Filter metrics, evaluate dynamic career placement parameters, and benchmark institutions side-by-side.</p>
        </div>
      </header>

      {/* Control Panel Grid */}
      <section className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Institutional Search</label>
          <input 
            type="text" 
            placeholder="Search by name or technical major..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium"
          />
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2 md:col-span-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Annual Tuition Threshold</label>
            <span className="text-xs font-bold font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{formatINR(maxFees)} max</span>
          </div>
          <input 
            type="range" 
            min="100000" 
            max="600000" 
            step="25000"
            value={maxFees}
            onChange={(e) => setMaxFees(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </section>

      {/* Grid Display Area */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 font-medium animate-pulse">Syncing matching infrastructure profiles...</div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl bg-white">No active institutional records match your parameters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => {
              const isSelected = selectedForCompare.includes(college.id);
              return (
                <div key={college.id} className={`bg-white rounded-xl border transition-all duration-200 shadow-sm flex flex-col justify-between relative overflow-hidden ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                  {/* Top Checkbox Overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      onClick={() => handleSelectCompare(college.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm border transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {isSelected ? '✓ Selected' : '+ Compare'}
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mb-1">📍 {college.location}</div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight leading-tight line-clamp-1 pr-16">{college.name}</h2>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        ⭐ {college.rating ? Number(college.rating).toFixed(1) : 'N/A'}
                      </span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 block">
                          {college.placements ? college.placements.split('|')[0].replace('Average Package:', '').trim() : "See Details"}
                        </span>
                        <span className="text-[9px] uppercase tracking-wide text-gray-400 font-medium block">Avg Compensation</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">{formatINR(college.fees)}<span className="text-[10px] text-gray-400 font-normal">/yr</span></span>
                    {/* 🔑 Safe routing via UUID strings */}
                    <Link href={`/colleges/${college.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-all">
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Action Dock */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white py-4 px-6 shadow-2xl border-t border-slate-800 z-40">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-slate-300">
              Selected <span className="text-white font-bold font-mono bg-slate-800 px-2 py-1 rounded mx-1">{selectedForCompare.length}</span> / 3 institutions for comparative analysis.
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedForCompare([])}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-all"
              >
                Clear All
              </button>
              <button
                disabled={selectedForCompare.length < 2}
                onClick={fetchComparisonMatrix}
                className={`text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all ${selectedForCompare.length >= 2 ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {selectedForCompare.length < 2 ? 'Select at least 2 to Compare' : 'Generate Comparison Matrix 📊'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900">Side-by-Side Comparative Matrix</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-white text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200 transition-all text-xs font-bold"
              >
                ✕ Close Matrix
              </button>
            </div>

            <div className="p-6 flex-1 overflow-x-auto">
              {compareLoading ? (
                <div className="text-center py-12 text-sm text-gray-400 font-medium animate-pulse">Running analytical comparisons cross-checks...</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-3 px-4 text-xs font-bold tracking-wider text-gray-400 uppercase w-1/4">Key Metrics</th>
                      {compareData.map(col => (
                        <th key={col.id} className="py-3 px-4 font-extrabold text-sm text-gray-900 w-1/4">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider bg-gray-50/30">Location</td>
                      {compareData.map(col => (
                        <td key={col.id} className="py-3.5 px-4 text-gray-600 font-medium">📍 {col.location}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider bg-gray-50/30">Evaluation Score</td>
                      {compareData.map(col => (
                        <td key={col.id} className="py-3.5 px-4 font-black text-amber-600">⭐ {col.rating ? Number(col.rating).toFixed(1) : 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider bg-gray-50/30">Tuition Fees (Annual)</td>
                      {compareData.map(col => (
                        <td key={col.id} className="py-3.5 px-4 font-bold text-gray-900">{formatINR(col.fees)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider bg-gray-50/30">Average Package</td>
                      {compareData.map(col => (
                        <td key={col.id} className="py-3.5 px-4 font-bold text-sm text-emerald-600">
                          {col.averagePackageDisplay || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider bg-gray-50/30">Highest Package</td>
                      {compareData.map(col => (
                        <td key={col.id} className="py-3.5 px-4 font-extrabold text-sm text-blue-600">
                          {col.highestPackageDisplay || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider bg-gray-50/30">Core Recruiters</td>
                      {compareData.map(col => (
                        <td key={col.id} className="py-3.5 px-4 text-xs font-medium text-gray-600 whitespace-pre-line max-w-xs leading-relaxed">
                          {col.coreRecruitersDisplay || "N/A"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}
    </main>
  );
}