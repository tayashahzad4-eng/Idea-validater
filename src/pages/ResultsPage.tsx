import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { User, Validation } from "../types";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Download, 
  Lock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import jsPDF from "jspdf";
import Markdown from "react-markdown";

interface ResultsPageProps {
  user: User;
}

export default function ResultsPage({ user }: ResultsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [validation, setValidation] = useState<Validation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/validations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setValidation(data);
        setLoading(false);
      });
  }, [id]);

  const handleDownloadPDF = () => {
    if (!validation) return;
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`Validation Report: ${validation.idea_name}`, 20, 20);
    
    doc.setFontSize(16);
    doc.text("Market Scorecard", 20, 40);
    doc.setFontSize(12);
    doc.text(`Verdict: ${validation.ai_output.verdict}`, 20, 50);
    doc.text(`Demand Score: ${validation.ai_output.demand_score}/10`, 20, 60);
    doc.text(`Competition Intensity: ${validation.ai_output.competition_intensity}/10`, 20, 70);
    doc.text(`Scalability: ${validation.ai_output.scalability_score}/10`, 20, 80);
    
    doc.setFontSize(16);
    doc.text("Niche Refinement", 20, 100);
    doc.setFontSize(10);
    const splitNiche = doc.splitTextToSize(validation.ai_output.niche_narrowing, 170);
    doc.text(splitNiche, 20, 110);
    
    doc.save(`${validation.idea_name.replace(/\s+/g, "_")}_Validation.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!validation) return <div>Not found</div>;

  const { ai_output: out } = validation;
  const isPro = user.plan === "pro";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold tracking-tight">{validation.idea_name}</h1>
          <p className="text-gray-500 mt-2">Validated on {new Date(validation.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          {isPro ? (
            <button
              onClick={handleDownloadPDF}
              className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/5"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          ) : (
            <Link
              to="/dashboard"
              className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all"
            >
              <Lock className="w-4 h-4" />
              Unlock PDF Export
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Market Scorecard */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              Market Scorecard
            </h2>
            <VerdictBadge verdict={out.verdict} />
          </div>

          <div className="space-y-6">
            <ScoreRow label="Demand Score" score={out.demand_score} reason={out.demand_reason} />
            <ScoreRow label="Competition Intensity" score={out.competition_intensity} reason={out.competition_reason} />
            <ScoreRow label="Differentiation Potential" score={out.differentiation_potential} />
            <ScoreRow label="Monetization Difficulty" score={out.monetization_difficulty} />
            <ScoreRow label="Scalability Score" score={out.scalability_score} />
          </div>
        </div>

        {/* Suggested Pricing */}
        <div className="bg-black text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Suggested Pricing</h3>
            <p className="text-gray-400 text-sm mb-6">Based on market standards and product format.</p>
            <div className="text-3xl font-bold text-emerald-400 mb-2">{out.suggested_price_range}</div>
          </div>
          <div className="text-xs text-gray-500 italic">
            * This is an AI recommendation based on perceived value.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Niche Refinement */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            Niche Refinement
          </h2>
          <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed">
            {out.niche_narrowing}
          </div>
        </div>

        {/* Positioning Angles */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-400" />
            Positioning Angles
          </h2>
          <div className="space-y-3">
            {out.unique_positioning_angles.map((angle, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border border-gray-50 flex items-center gap-3 transition-all ${
                  !isPro && i >= 2 ? "blur-sm select-none opacity-50" : "bg-gray-50/50"
                }`}
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold border border-gray-100 shrink-0">
                  0{i + 1}
                </div>
                <span className="text-sm font-medium text-gray-700">{angle}</span>
              </div>
            ))}
          </div>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] mt-20">
              <Link
                to="/dashboard"
                className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl"
              >
                <Lock className="w-3 h-3" />
                Upgrade to see all angles
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* First 100 Customers Strategy */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden mb-12">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          First 100 Customers Plan
        </h2>
        <div className={`space-y-6 ${!isPro ? "blur-md select-none opacity-30" : ""}`}>
          <div className="markdown-body prose prose-sm max-w-none text-gray-600 leading-relaxed">
            <Markdown>{out.first_100_customer_strategy}</Markdown>
          </div>
        </div>
        {!isPro && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Unlock Your Go-To-Market Strategy</h3>
            <p className="text-gray-500 max-w-md mb-8">
              Upgrade to Pro to see the full step-by-step plan to acquire your first 100 customers for this idea.
            </p>
            <Link
              to="/dashboard"
              className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
            >
              Upgrade to Pro Plan
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRow({ label, score, reason }: { label: string; score: number; reason?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className="text-sm font-bold">{score}/10</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            score >= 8 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : "bg-red-500"
          }`}
        />
      </div>
      {reason && <p className="text-xs text-gray-500 leading-relaxed mt-1">{reason}</p>}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles = {
    BUILD: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "BUILD WITH REFINEMENT": "bg-amber-50 text-amber-600 border-amber-100",
    "DO NOT BUILD": "bg-red-50 text-red-600 border-red-100",
  }[verdict] || "bg-gray-50 text-gray-600 border-gray-100";

  return (
    <span className={`${styles} border px-6 py-2 text-sm font-bold rounded-full uppercase tracking-wider shadow-sm`}>
      {verdict}
    </span>
  );
}
