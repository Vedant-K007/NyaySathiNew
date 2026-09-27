import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Users, 
  Gavel, 
  Home, 
  Loader2,
  Star,
  BookUser,
  Medal,
  LogIn,
  LogOut,
  Download,
  Volume2,
  StopCircle,
  Scroll,
  Scale, 
  CalendarDays, 
  Landmark,
  ChevronRight,
  // --- Icons for the homepage ---
  Mic,
  Search,
  Shield,
  Clock,
  Zap,
  Globe,
  FileSearch,
  Upload
} from 'lucide-react';
import { db, auth } from './firebase'; // Import from firebase.ts
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // Import the login tracker
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import jsPDF from 'jspdf'; // Import the PDF library

// --- STYLING NOTE ---
// This new design uses a consistent, modern color palette (bg-slate-50, text-slate-900, text-blue-600)
// and applies premium styling (shadows, rounded-lg, transitions) to all components.

// --- Reusable Disclaimer Component ---
const LegalDisclaimer = () => (
  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg my-4" role="alert">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.031-1.742 3.031H4.42c-1.53 0-2.493-1.697-1.743-3.031l5.58-9.92zM10 13a1 1 0 100-2 1 1 0 000 2zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium">Important Disclaimer</h3>
        <div className="text-sm mt-1">
          This content is AI-generated for informational purposes only and does not constitute legal advice. Always consult a qualified legal professional for advice on your specific situation.
        </div>
      </div>
    </div>
  </div>
);

// ==========================================================
// ** NEW UPGRADED HOME PAGE **
// ==========================================================
const HomePage = ({ onNavClick }: { onNavClick: (page: string) => void }) => {
  
  // --- Data for Feature Cards (from your screenshots) ---
  const features1 = [
    { title: "AI-Powered Explanations", description: "Complex legal jargon transformed into crystal-clear explanations.", icon: "Chat", color: "blue", action: () => onNavClick('predict') },
    { title: "Multi-Language Voice", description: "Speak naturally in Hindi, English, or 15+ regional languages.", icon: "Mic", color: "green", action: null },
    // ** UPDATED: This now links to 'analyze' which is the new Analyzer page **
    { title: "Smart Document Analysis", description: "Upload legal documents and receive AI-generated summaries.", icon: "File", color: "purple", action: () => onNavClick('analyze') },
    { title: "Instant IPC Lookup", description: "Lightning-fast access to 500+ Indian Penal Code sections.", icon: "Search", color: "orange", action: null },
    { title: "Penalty Calculator", description: "Precise penalty information with case precedents.", icon: "Scale", color: "red", action: null },
    { title: "Case Law Database", description: "Access to 10,000+ legal precedents with AI-curated cases.", icon: "Book", color: "indigo", action: () => onNavClick('predict') },
  ];
  
  const features2 = [
    { title: "Constitutional Rights", description: "Comprehensive guide to fundamental rights.", icon: "Shield", color: "teal", action: null },
    { title: "24/7 AI Assistant", description: "Round-the-clock legal guidance with sub-2-second responses.", icon: "Clock", color: "pink", action: () => onNavClick('predict') },
    { title: "Legal Reasoning", description: "Advanced AI that understands context and provides logical chains.", icon: "Brain", color: "blue", action: null },
    { title: "Instant Alerts", description: "Real-time notifications about legal updates and deadlines.", icon: "Zap", color: "yellow", action: null },
    { title: "Multi-Jurisdiction", description: "Support for Central, State, and Local laws.", icon: "Globe", color: "green", action: null },
    { title: "Community Forum", description: "Connect with legal experts and citizens for collaboration.", icon: "Users", color: "purple", action: null },
  ];

  // --- Reusable Feature Card Component ---
  const FeatureCard = ({ title, description, icon, color, action }: any) => {
    // --- THIS OBJECT IS NOW FIXED ---
    const icons: { [key: string]: React.ElementType } = {
      Chat: FileText,
      Mic: Mic,
      File: FileSearch, // Updated Icon
      Search: Search,
      Scale: Scale,
      Book: BookUser,
      Shield: Shield,
      Clock: Clock,
      Brain: BrainCircuit,
      Zap: Zap,
      Globe: Globe,
      Users: Users,
    };
    const IconComponent = icons[icon] || Gavel;
    const colorClasses: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
      teal: "bg-teal-100 text-teal-600",
      pink: "bg-pink-100 text-pink-600",
      yellow: "bg-yellow-100 text-yellow-600",
    };

    const cardContent = (
      <>
        <div className={`w-14 h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-5`}>
          <IconComponent className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
      </>
    );

    if (action) {
      return (
        <button 
          onClick={action}
          className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 text-left w-full"
        >
          {cardContent}
          <div className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Get Started &rarr;
          </div>
        </button>
      );
    }

    return (
      <div 
        className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 text-left opacity-70"
      >
        {cardContent}
        <div className="font-semibold text-slate-400">
          Coming Soon
        </div>
      </div>
    );
  };

  // --- Main HomePage Layout ---
  return (
    <div className="animate-fade-in space-y-24 py-10">
      {/* 1. Hero Section */}
      <section className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Decode Indian Law with
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
          Transform complex legal documents into crystal-clear explanations.
          Your intelligent legal companion for every citizen.
        </p>
        <button 
          onClick={() => onNavClick('predict')}
          className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-all text-lg flex items-center gap-2 mx-auto"
        >
          Start Legal Query <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* 2. Revolutionary Features Section */}
      <section>
        <h2 className="text-4xl font-bold text-slate-900 mb-10 text-center">
          Revolutionary Features for Modern Legal Understanding
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features1.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* 3. More Features Section */}
      <section>
        <h2 className="text-4xl font-bold text-slate-900 mb-10 text-center">
          A Comprehensive Legal Toolkit
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features2.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
};

// ==========================================================
// ** FEATURE IS BACK **
// 2. Document Generator (This is the original)
// ==========================================================
const DocumentGenerator = () => {
  const [docType, setDocType] = useState('rental-agreement');
  const [formData, setFormData] = useState<any>({});
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!generatedDoc) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(generatedDoc);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Generated Legal Document", 14, 22);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(generatedDoc, 180);
    doc.text(splitText, 14, 35);
    doc.save("NyaySaathi_Document.pdf");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const getFormFields = () => {
    switch (docType) {
      case 'rental-agreement':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Landlord's Full Name</label>
              <input name="landlordName" onChange={handleInputChange} placeholder="Enter landlord's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tenant's Full Name</label>
              <input name="tenantName" onChange={handleInputChange} placeholder="Enter tenant's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </>
        );
      case 'divorce-papers':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Spouse 1 Full Name</label>
              <input name="spouse1Name" onChange={handleInputChange} placeholder="Enter spouse 1's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Spouse 2 Full Name</label>
              <input name="spouse2Name" onChange={handleInputChange} placeholder="Enter spouse 2's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </>
        );
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setGeneratedDoc(''); setError(null);
    try {
      const response = await fetch('http://localhost:8001/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: docType, formData: formData })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate document');
      }
      const { text } = await response.json();
      setGeneratedDoc(text);
    } catch (err: any) { 
      setError(err.message); 
    } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">AI Document Generator</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
          <select id="docType" value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="rental-agreement">Rental Agreement</option>
            <option value="divorce-papers">Divorce Papers (Mutual Consent)</option>
          </select>
        </div>
        <div className="space-y-4">{getFormFields()}</div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-slate-400 flex items-center justify-center">
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Generate Document'}
        </button>
      </form>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && <div className="text-center p-10 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />Generating...</div>}
      {generatedDoc && (
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-3xl font-semibold text-slate-900">Generated Document Draft</h3>
            <div className="flex gap-3">
              {isSpeaking ? (
                <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                  <StopCircle className="w-5 h-5" /> Stop
                </button>
              ) : (
                <button onClick={handleSpeak} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                  <Volume2 className="w-5 h-5" /> Speak
                </button>
              )}
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
          <LegalDisclaimer />
          <pre className="bg-slate-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm text-slate-700 border border-slate-200">{generatedDoc}</pre>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// ** NEW FEATURE: This is your new file uploader **
// 3. Document Analyzer
// ==========================================================
const DocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  // --- Text-to-Speech Logic ---
  const handleSpeak = () => {
    if (!summary) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  // --- End Text-to-Speech ---

  // --- PDF Download Logic ---
  const handleDownloadPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Document Summary", 14, 22);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(summary, 180);
    doc.text(splitText, 14, 35);
    doc.save("NyaySaathi_Summary.pdf");
  };
  // --- End PDF Download ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { 
      setError("Please select a file to upload."); 
      return; 
    }
    
    setIsLoading(true); setSummary(''); setError(null);
    
    // We must use FormData to send a file
    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      // Send the file to the new backend endpoint
      const response = await fetch('http://localhost:8001/api/upload-and-summarize', {
        method: 'POST',
        body: formData, // No 'Content-Type' header, browser sets it for FormData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to summarize document');
      }
      const { text } = await response.json();
      setSummary(text);
    } catch (err: any) { 
      setError(err.message); 
    } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-2 text-center">Smart Document Analysis</h2>
      <p className="text-lg text-slate-600 mb-6 text-center">Upload your legal document (PDF or TXT) to get a simple, clear summary.</p>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-5 relative overflow-hidden">
        {/* Subtle gradient glow */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-purple-600 via-transparent to-transparent opacity-10 animate-spin-slow" style={{ animationDuration: '10s' }} />
        
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload your document</label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <div className="mt-4 flex text-sm leading-6 text-slate-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">PDF or TXT up to 10MB</p>
            </div>
          </div>
          {selectedFile && (
            <div className="mt-4 text-center text-sm text-green-700 font-medium">
              Selected file: {selectedFile.name}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-md disabled:hover:translate-y-0 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Analyze Document'}
        </button>
      </form>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && <div className="text-center p-10 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />Analyzing...</div>}
      
      {summary && (
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-3xl font-semibold text-slate-900">Document Summary</h3>
            <div className="flex gap-3">
              {isSpeaking ? (
                <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                  <StopCircle className="w-5 h-5" /> Stop
                </button>
              ) : (
                <button onClick={handleSpeak} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                  <Volume2 className="w-5 h-5" /> Speak
                </button>
              )}
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
          <LegalDisclaimer />
          {/* Use 'prose' for beautiful formatting of the AI's response */}
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap">{summary}</div>
        </div>
      )}
    </div>
  );
};


// --- 4. Case Predictor (AI Query) ---
const CasePredictor = () => {
  const [caseDescription, setCaseDescription] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (caseDescription.trim().length < 20) { 
      setError("Please provide a more detailed description (at least 20 characters)."); 
      return; 
    }
    setIsLoading(true); setPredictionResult(null); setError(null);
    try {
      const response = await fetch('http://localhost:8001/api/predict-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDescription: caseDescription })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze case');
      }
      const result = await response.json();
      setPredictionResult(result);
    } catch (err: any) { 
      setError(err.message); 
    } 
    finally { setIsLoading(false); }
  };

  const handleDownloadPDF = () => {
    if (!predictionResult?.text) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AI Case Analysis", 14, 22);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(predictionResult.text, 180);
    doc.text(splitText, 14, 35);
    doc.save("NyaySaathi_Case_Analysis.pdf");
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-2 text-center">AI Legal Query</h2>
      <p className="text-lg text-slate-600 mb-6 text-center">Get AI-Powered Explanations & Case Insights</p>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-5 relative overflow-hidden">
        {/* Subtle gradient glow */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-blue-600 via-transparent to-transparent opacity-10 animate-spin-slow" style={{ animationDuration: '10s' }} />
        
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">Ask your legal question</label>
          <textarea 
            value={caseDescription} 
            onChange={(e) => setCaseDescription(e.target.value)} 
            placeholder="e.g., What is the punishment for theft in India? OR I was in a car accident where the other driver ran a red light..." 
            className="w-full h-48 p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-md disabled:hover:translate-y-0 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Get Legal Explanation'}
        </button>
      </form>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && <div className="text-center p-10 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />Analyzing...</div>}
      {predictionResult && (
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-3xl font-semibold text-slate-900">AI-Generated Response</h3>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>
          <LegalDisclaimer />
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap">{predictionResult.text}</div>
          {predictionResult.sources && predictionResult.sources.length > 0 && (
            <div className="mt-8">
              <h4 className="text-2xl font-semibold text-slate-900 mb-4">Related Public Sources</h4>
              <ul className="list-disc pl-5 space-y-3">
                {predictionResult.sources.map((source: any, index: number) => (
                  <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{source.title || 'View Source'}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 5. Advocate Finder (REDESIGNED) ---
const AdvocateFinder = () => {
  const [allLawyers, setAllLawyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  
  useEffect(() => {
    setIsLoading(true); setError(null);
    const collectionPath = "advocates";
    const q = query(collection(db, collectionPath));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lawyers: any[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        lawyers.push({ id: doc.id, ...doc.data() });
      });
      setAllLawyers(lawyers);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to load advocates. Check console.");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cities = ['All', ...new Set(allLawyers.map(l => l.city))];
  const specialties = ['All', ...new Set(allLawyers.map(l => l.specialty))];
  const filteredLawyers = allLawyers.filter(lawyer => 
    (cityFilter === 'All' || lawyer.city === cityFilter) &&
    (specialtyFilter === 'All' || lawyer.specialty === specialtyFilter)
  );
  
  // --- Premium Advocate Card ---
  const LawyerProfileCard = ({ lawyer }: { lawyer: any }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
      <img 
        src={lawyer.imageUrl} 
        alt={lawyer.name} 
        className="w-28 h-28 rounded-full border-4 border-slate-100 shadow-md"
        onError={(e: any) => e.target.src = 'https://placehold.co/112x112/E2E8F0/4A5568?text=Profile'}
      />
      <div className="flex-1">
        <h3 className="text-3xl font-bold text-slate-900">{lawyer.name}</h3>
        <p className="text-green-600 font-semibold text-lg mb-2">{lawyer.specialty}</p>
        <p className="text-slate-500 mb-4">{lawyer.city}</p>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"><Medal className="w-4 h-4" /><strong>{lawyer.experience}</strong> Years Exp.</div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"><Gavel className="w-4 h-4" /><strong>{lawyer.casesWon}</strong> Cases Won</div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"><Star className="w-4 h-4" /><strong>{lawyer.rating}</strong>/5.0 Rating</div>
        </div>
      </div>
      <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all">
        View Profile
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">Find an Advocate</h2>
      {/* --- Filter Bar --- */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-10 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="cityFilter" className="block text-sm font-medium text-slate-700 mb-2">City:</label>
          <select id="cityFilter" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="specialtyFilter" className="block text-sm font-medium text-slate-700 mb-2">Specialty:</label>
          <select id="specialtyFilter" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>
        </div>
      </div>
      
      {/* --- Results --- */}
      {isLoading && <div className="text-center p-10"><Loader2 className="animate-spin w-10 h-10 mx-auto text-blue-600" /></div>}
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {!isLoading && !error && (
        <div className="space-y-8">
          {filteredLawyers.length > 0 ? (
            filteredLawyers.map(lawyer => <LawyerProfileCard key={lawyer.id} lawyer={lawyer} />)
          ) : (
            <p className="text-center text-slate-600 text-lg p-10 bg-white rounded-2xl shadow-lg border border-slate-200">No lawyers found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

// --- 6. Recent Verdicts (REDESIGNED) ---
// --- New VerdictCard Component ---
const VerdictCard = ({ verdict }: { verdict: any }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const ttsText = `
    Case: ${verdict.caseName}.
    Court: ${verdict.court}.
    Date: ${verdict.date}.
    Summary: ${verdict.summary}
  `;

  const handleSpeak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-xl p-4">
          <Scale className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{verdict.caseName}</h3>
          <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm text-slate-600 mb-4">
            <span className="flex items-center gap-1.5 font-medium"><Landmark className="w-4 h-4" /> {verdict.court}</span>
            <span className="flex items-center gap-1.5 font-medium"><CalendarDays className="w-4 h-4" /> {verdict.date}</span>
          </div>
          <p className="text-slate-700 leading-relaxed"><strong className="font-semibold text-slate-900">Summary:</strong> {verdict.summary}</p>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-slate-100 flex justify-end">
        {isSpeaking ? (
          <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm">
            <StopCircle className="w-5 h-5" /> Stop
          </button>
        ) : (
          <button onClick={handleSpeak} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm">
            <Volume2 className="w-5 h-5" /> Read Aloud
          </button>
        )}
      </div>
    </div>
  );
};

// --- This function parses the AI's text block into structured objects ---
const parseVerdicts = (text: string): any[] => {
  try {
    const verdictBlocks = text.split(/\n?(?=\d\.\s*\*\*Case Name:\*\*)/);
    if (verdictBlocks.length > 0 && !verdictBlocks[0].startsWith('1.')) {
      verdictBlocks.shift();
    }
    return verdictBlocks.map((block, index) => {
      const caseName = block.match(/\*\*Case Name:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || `Verdict ${index + 1}`;
      const court = block.match(/\*\*Court:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || 'N/A';
      const date = block.match(/\*\*Date:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || 'N/A';
      const summary = block.match(/\*\*Summary:\*\* ([\s\S]*)/)?.[1]?.replace(/\*/g, '').trim() || block;
      return { id: index, caseName, court, date, summary };
    });
  } catch (e) {
    console.error("Failed to parse verdicts:", e);
    return [{ id: 0, caseName: "Recent Verdicts", court: "N/A", date: "N/A", summary: text }];
  }
};

const RecentVerdicts = () => {
  const [verdicts, setVerdicts] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerdicts = async () => {
      setIsLoading(true); setError(null);
      try {
        const response = await fetch('http://localhost:8001/api/recent-verdicts');
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to fetch verdicts');
        }
        const result = await response.json();
        const parsedVerdicts = parseVerdicts(result.text);
        setVerdicts(parsedVerdicts);
        setSources(result.sources || []);
      } catch (err: any) { 
        setError(err.message); 
      } 
      finally { setIsLoading(false); }
    };
    fetchVerdicts();
  }, []);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">Recent Indian Court Verdicts</h2>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && (
        <div className="text-center p-10 text-slate-600">
          <Loader2 className="animate-spin w-10 h-10 mx-auto mb-3 text-blue-600" />
          Fetching latest verdicts...
        </div>
      )}
      {!isLoading && !error && (
        <div className="space-y-8">
          <LegalDisclaimer />
          {verdicts.map((verdict) => (
            <VerdictCard key={verdict.id} verdict={verdict} />
          ))}
          {sources.length > 0 && (
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <h4 className="text-2xl font-semibold text-slate-900 mb-4">Sources</h4>
              <ul className="list-disc pl-5 space-y-3">
                {sources.map((source: any, index: number) => (
                  <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{source.title || 'View Source'}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 7. Contact Page (REMOVED as requested) ---
// ...

// --- 8. Login/Sign Up Page (REDESIGNED) ---
const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null); setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Logged in successfully! Redirecting...');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Signed up successfully! You are now logged in.');
      }
    } catch (err: any) { 
      setError(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto mt-12">
      <div className="flex justify-center items-center gap-3 mb-6">
        <Gavel className="w-10 h-10 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900">Nyay Saathi</h1>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" required minLength={6} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-slate-400 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-blue-600 hover:underline mt-6 font-medium">
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {message && <div className="mt-6 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg">{message}</div>}
    </div>
  );
}

// --- Main App Component (REDESIGNED) ---
function App() {
  const { currentUser } = useAuth(); // Get login status
  const [currentPage, setCurrentPage] = useState('home');

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home'); // Go to home on logout
  };
  
  const renderPage = () => {
    // If NOT logged in, show Auth page
    if (!currentUser) {
      return <AuthPage />;
    }
    
    // If logged in, show the requested page
    switch (currentPage) {
      case 'docs':
        return <DocumentGenerator />; // Your original feature
      case 'analyze':
        return <DocumentAnalyzer />; // Your NEW feature
      case 'predict':
        return <CasePredictor />;
      case 'find':
        return <AdvocateFinder />;
      case 'verdicts':
        return <RecentVerdicts />;
      // ** CONTACT PAGE REMOVED **
      // case 'contact':
      //   return <ContactPage />;
      case 'home':
      default:
        return <HomePage onNavClick={setCurrentPage} />;
    }
  };
  
  // --- Polished Nav Button ---
  const NavButton = ({ page, label, icon: Icon, current }: { page: string, label: string, icon: any, current: string }) => {
    const isActive = currentPage === page;
    return (
      <button 
        onClick={() => setCurrentPage(page)} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
        {label}
      </button>
    );
  };
  
  const LogoutButton = () => (
    <button 
      onClick={handleLogout} 
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  );

  return (
    // New background color for the "SaaS" feel
    <div className="bg-slate-50 min-h-screen">
      
      {/* Polished, Sticky Header */}
      {/* This header will only show if the user is logged in */}
      {currentUser && (
        <header className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200 mb-8 sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Gavel className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Nyay Saathi</h1>
            </div>
            
            {/* This div now groups the main links and separates the logout button */}
            <div className="flex items-center divide-x divide-slate-200">
              <div className="flex flex-wrap justify-center gap-2 pr-4">
                <NavButton page="home" label="Home" icon={Home} current={currentPage} />
                <NavButton page="predict" label="AI Query" icon={BrainCircuit} current={currentPage} />
                {/* ** UPDATED: Both features are now here ** */}
                <NavButton page="docs" label="Doc Generator" icon={FileText} current={currentPage} />
                <NavButton page="analyze" label="Doc Analyzer" icon={FileSearch} current={currentPage} />
                <NavButton page="find" label="Find Advocate" icon={BookUser} current={currentPage} />
                <NavButton page="verdicts" label="Recent Verdicts" icon={Scroll} current={currentPage} />
                {/* ** CONTACT BUTTON REMOVED ** */}
                {/* <NavButton page="contact" label="Contact" icon={MessageSquare} current={currentPage} /> */}
              </div>
              <div className="pl-4">
                <LogoutButton />
              </div>
            </div>
          </nav>
        </header>
      )}
      
      {/* Page Content */}
      <main className="container mx-auto px-6 py-8">
        {renderPage()}
      </main>
      
      {/* Redesigned Footer */}
      {/* This footer will only show if the user is logged in */}
      {currentUser && (
        <footer className="text-center py-10 mt-16 bg-slate-100 border-t border-slate-200 text-slate-500 text-sm">
          <p>© 2025 Nyay Saathi. All rights reserved.</p>
          <p className="font-medium mt-1">This is a technology demo and does not provide legal advice.</p>
        </footer>
      )}
    </div>
  );
}

export default App;