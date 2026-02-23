import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Validation } from "../types";
import { motion } from "motion/react";
import { Plus, History, CreditCard, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/validations")
      .then((res) => res.json())
      .then((data) => {
        setValidations(data);
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back,</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Link
          to="/validate"
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/5"
        >
          <Plus className="w-5 h-5" />
          New Validation
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Usage Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Usage</h3>
            {user.plan === "pro" ? (
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Pro Plan
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Free Plan
              </span>
            )}
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-bold">{user.validations_this_month}</span>
            <span className="text-gray-400 text-xl font-medium mb-1">
              / {user.plan === "pro" ? "∞" : "2"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Validations used this month</p>
          {user.plan === "free" && (
            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gray-50 text-black border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
        </div>

        {/* Pro Benefits Card */}
        <div className="md:col-span-2 bg-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Build with confidence.</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">Unlimited AI Validations</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">Full Positioning Angles</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">100 Customer Strategy</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">PDF Report Export</span>
              </div>
            </div>
            {user.plan === "free" && (
              <button
                onClick={handleUpgrade}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Get Unlimited Access
              </button>
            )}
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold">Validation History</h2>
          </div>
          <span className="text-sm text-gray-400 font-medium">{validations.length} total</span>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p>Loading your history...</p>
          </div>
        ) : validations.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {validations.map((v) => (
              <Link
                key={v.id}
                to={`/results/${v.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all group"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-lg group-hover:text-black transition-colors">{v.idea_name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{v.product_format}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <VerdictBadge verdict={v.ai_output.verdict} small />
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">No validations yet</h3>
            <p className="text-gray-500 max-w-xs mb-8">
              Start by validating your first digital product idea to see it here.
            </p>
            <Link
              to="/validate"
              className="text-black font-bold flex items-center gap-2 hover:underline"
            >
              Start now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function VerdictBadge({ verdict, small = false }: { verdict: string; small?: boolean }) {
  const styles = {
    BUILD: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "BUILD WITH REFINEMENT": "bg-amber-50 text-amber-600 border-amber-100",
    "DO NOT BUILD": "bg-red-50 text-red-600 border-red-100",
  }[verdict] || "bg-gray-50 text-gray-600 border-gray-100";

  return (
    <span
      className={`${styles} border ${
        small ? "px-2 py-0.5 text-[10px]" : "px-4 py-2 text-sm"
      } font-bold rounded-full uppercase tracking-wider`}
    >
      {verdict}
    </span>
  );
}
