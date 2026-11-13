import { useState } from 'react';
import { Clock, Calculator, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const MULTIPLIER = 1.555;

export default function App() {
  const [hoursWorked, setHoursWorked] = useState<string>('');
  const [roundingMode, setRoundingMode] = useState<'up' | 'nearest'>('up');
  const [copied, setCopied] = useState(false);

  const parsedHours = Number(hoursWorked);
  const exactPayHours = hoursWorked && !isNaN(parsedHours) && parsedHours > 0
    ? parsedHours * MULTIPLIER
    : 0;

  const roundedPayHours = exactPayHours > 0
    ? (roundingMode === 'up'
        ? Math.ceil(Number((exactPayHours * 4).toFixed(6))) / 4
        : Math.round(Number((exactPayHours * 4).toFixed(6))) / 4)
    : 0;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 text-slate-900 font-sans p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Clock size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl uppercase">
            Sunday Overtime Calculator
          </h1>
          <p className="mt-2 text-slate-600 font-medium">
            Calculate pay hours using the <span className="font-bold text-blue-600 underline decoration-2 underline-offset-4">1.555x</span> multiplier
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-1">
          {/* Main Calculator Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl shadow-red-200/50 border-2 border-blue-600 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Input Section */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="hours" className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                      Hours Worked
                    </label>
                    <div className="relative">
                      <input
                        id="hours"
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="e.g. 7.5"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(e.target.value)}
                        className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all text-lg font-bold"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        hrs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Section */}
                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Calculator size={80} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <p className="text-blue-600 font-black text-sm uppercase tracking-widest">
                        Hours to be Paid (Rounded .25)
                      </p>
                      <div className="inline-flex rounded-lg bg-white p-1 border border-blue-200">
                        <button
                          type="button"
                          onClick={() => setRoundingMode('up')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${
                            roundingMode === 'up'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          Round Up
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoundingMode('nearest')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${
                            roundingMode === 'nearest'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          Nearest
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-blue-900 tabular-nums tracking-tighter">
                        {roundedPayHours.toFixed(2)}
                      </span>
                      <span className="text-blue-700 font-black uppercase text-sm">hours</span>
                    </div>

                    <p className="mt-2 text-xs font-bold text-blue-700/80 uppercase tracking-wider tabular-nums">
                      Exact (× 1.555): {exactPayHours.toFixed(3)} hrs
                    </p>
                    
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCopy(roundedPayHours.toFixed(2))}
                        disabled={!hoursWorked || exactPayHours <= 0}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl text-sm font-black shadow-sm border-2 border-blue-100 hover:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy Result'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-400 text-xs font-black uppercase tracking-widest pb-12">
          <p>© {new Date().getFullYear()} Sunday Overtime Calculator</p>
          <p className="mt-2">Designed for quick timesheet entry</p>
        </footer>
      </div>
    </div>
  );
}
