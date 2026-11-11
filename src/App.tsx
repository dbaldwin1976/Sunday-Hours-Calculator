import { useState, useEffect, useRef } from 'react';
import { Clock, Calculator, Copy, Trash2, Plus, History, Info, CheckCircle2, Download, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MULTIPLIER = 1.555;

interface Calculation {
  id: string;
  hoursWorked: number;
  payHours: number;
  timestamp: number;
  dateWorked: string;
  label?: string;
}

export default function App() {
  const [hoursWorked, setHoursWorked] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [dateWorked, setDateWorked] = useState<string>(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState<Calculation[]>([]);
  const [copied, setCopied] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('');
  
  const payHours = hoursWorked ? Number(hoursWorked) * MULTIPLIER : 0;

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('sunday_ot_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('sunday_ot_history', JSON.stringify(history));
  }, [history]);

  const handleAddCalculation = () => {
    if (!hoursWorked || isNaN(Number(hoursWorked))) return;

    const newCalc: Calculation = {
      id: crypto.randomUUID(),
      hoursWorked: Number(hoursWorked),
      payHours: Number(payHours.toFixed(3)),
      timestamp: Date.now(),
      dateWorked: dateWorked,
      label: label.trim() || undefined
    };

    setHistory([newCalc, ...history].slice(0, 100)); // Increased limit to 100
    setHoursWorked('');
    setLabel('');
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your calculation history?')) {
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const downloadCSV = (dateToFilter?: string) => {
    const dataToExport = dateToFilter 
      ? history.filter(item => item.dateWorked === dateToFilter)
      : history;

    if (dataToExport.length === 0) {
      alert('No entries found for the selected date.');
      return;
    }

    const headers = ['Date Worked', 'Employee/Label', 'Hours Worked', 'Pay Hours (1.555x)', 'Calculated At'];
    const rows = dataToExport.map(item => [
      item.dateWorked,
      item.label || 'N/A',
      item.hoursWorked,
      item.payHours,
      new Date(item.timestamp).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sunday_overtime_${dateToFilter || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = filterDate 
    ? history.filter(item => item.dateWorked === filterDate)
    : history;

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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="hours" className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                      Hours Worked
                    </label>
                    <div className="relative">
                      <input
                        id="hours"
                        type="number"
                        step="0.25"
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

                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                      Date Worked
                    </label>
                    <div className="relative">
                      <input
                        id="date"
                        type="date"
                        value={dateWorked}
                        onChange={(e) => setDateWorked(e.target.value)}
                        className="w-full h-14 pl-10 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all text-lg font-bold"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="label" className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                      Employee Name / Label (Optional)
                    </label>
                    <input
                      id="label"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all text-lg font-bold"
                    />
                  </div>
                </div>

                {/* Result Section */}
                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Calculator size={80} />
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-blue-600 font-black text-sm uppercase tracking-widest mb-1">
                      Hours to be Paid
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-blue-900 tabular-nums tracking-tighter">
                        {payHours.toFixed(3)}
                      </span>
                      <span className="text-blue-700 font-black uppercase text-sm">hours</span>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCopy(payHours.toFixed(3))}
                        disabled={!hoursWorked}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl text-sm font-black shadow-sm border-2 border-blue-100 hover:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy Result'}
                      </button>
                      
                      <button
                        onClick={handleAddCalculation}
                        disabled={!hoursWorked}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        <Plus size={18} />
                        Save to History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formula Info */}
                <div className="flex items-start gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100">
                  <Info className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Formula: <code className="bg-white px-1.5 py-0.5 rounded border border-red-200 font-mono font-black text-red-700">Hours Worked × 1.555</code>. 
                    This multiplier accounts for the Sunday overtime rate.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* History Section */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-2 gap-4">
              <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
                <History size={24} className="text-blue-600" />
                Calculation History
              </h2>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="h-10 pl-9 pr-3 bg-white border-2 border-blue-100 rounded-xl text-xs font-black focus:border-blue-600 focus:ring-0 transition-all"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={14} />
                  {filterDate && (
                    <button 
                      onClick={() => setFilterDate('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => downloadCSV(filterDate)}
                  disabled={filteredHistory.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  <Download size={14} />
                  CSV
                </button>

                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-red-600 hover:text-red-700 font-black flex items-center gap-1 transition-colors ml-2 uppercase tracking-widest"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredHistory.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-blue-200"
                >
                  <p className="text-slate-400 font-bold">
                    {filterDate ? `No entries for ${filterDate}` : 'No recent calculations yet.'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white p-5 rounded-2xl shadow-sm border-2 border-blue-100 hover:border-blue-600 flex items-center justify-between group transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black text-slate-900 tabular-nums">{item.payHours}</span>
                          <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Pay Hours</span>
                          {item.label && (
                            <span className="ml-2 px-2 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">
                              {item.label}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 font-bold">
                          <span className="text-blue-600">{item.dateWorked}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.hoursWorked} worked</span>
                          <span className="text-slate-300">•</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(item.payHours.toString())}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-200"
                          title="Copy result"
                        >
                          <Copy size={20} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
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
