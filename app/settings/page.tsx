'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { Card, SectionTitle, Button } from '@/components/ui';
import { loadProgress, saveStudentName, resetProgress, isStorageAvailable } from '@/lib/progress';
import { User, Trash2, Info, BookOpen, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStorageOk(isStorageAvailable());
      const p = loadProgress();
      setName(p.studentName);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveStudentName(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetProgress();
    setResetConfirm(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Settings & Help</h1>
          <p className="text-slate-500 text-sm mt-1">Personalise your learning experience</p>
        </div>

        {/* Profile */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-violet-600" />
            <SectionTitle>Your Name</SectionTitle>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Enter your name"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Your name"
              maxLength={40}
            />
            <Button onClick={handleSaveName} disabled={!name.trim()} size="md">
              {saved ? '✓ Saved!' : 'Save'}
            </Button>
          </div>
        </Card>

        {/* Storage notice */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <SectionTitle>About Your Progress</SectionTitle>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Your progress is saved locally in <strong>this browser on this device</strong> only.</p>
            <p>• It is <strong>not synced</strong> across different devices or browsers.</p>
            <p>• Clearing your browser data or using a private window will remove your progress.</p>
            {!storageOk && (
              <p className="text-amber-700 bg-amber-50 rounded-lg p-3 mt-2">
                ⚠️ Your browser does not support local storage. Progress cannot be saved.
              </p>
            )}
          </div>
        </Card>

        {/* Quick links */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-green-600" />
            <SectionTitle>Quick Links</SectionTitle>
          </div>
          <div className="space-y-2">
            <Link href="/subjects">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <BookOpen className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-slate-700">Browse All Lessons</span>
              </div>
            </Link>
            <Link href="/tutor">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="w-4 h-4 flex items-center justify-center text-violet-600">🧠</span>
                <span className="text-sm font-medium text-slate-700">Open AI Tutor</span>
              </div>
            </Link>
            <Link href="/progress">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="w-4 h-4 flex items-center justify-center text-violet-600">📊</span>
                <span className="text-sm font-medium text-slate-700">View Progress Dashboard</span>
              </div>
            </Link>
          </div>
        </Card>

        {/* About */}
        <Card className="p-5 bg-violet-50 border-violet-100">
          <h3 className="font-bold text-violet-900 mb-2">About ShikshaMitra AI</h3>
          <div className="text-sm text-violet-800 space-y-1.5">
            <p>ShikshaMitra AI is a free educational tool for primary school students.</p>
            <p>Subjects: <strong>Mathematics, Science & EVS, English</strong> — Grade 4</p>
            <p>No account required · No personal data collected · Works offline (lessons & quizzes)</p>
            <p className="text-violet-600 text-xs mt-3">AI tutoring requires an internet connection and API key configuration. AI responses are for learning support — always verify with your teacher.</p>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="p-5 border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <SectionTitle>Reset Progress</SectionTitle>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            This will permanently delete all your saved lessons, quiz scores, and progress. This action cannot be undone.
          </p>
          {!resetConfirm ? (
            <Button variant="danger" onClick={() => setResetConfirm(true)}>
              Reset All Progress
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700">Are you sure? This will erase everything!</p>
              <div className="flex gap-3">
                <Button variant="danger" onClick={handleReset}>Yes, Delete Everything</Button>
                <Button variant="secondary" onClick={() => setResetConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
