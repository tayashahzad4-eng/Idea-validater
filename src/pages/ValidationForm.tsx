import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Loader2, Info } from "lucide-react";

interface ValidationFormProps {
  user: User;
}

export default function ValidationForm({ user }: ValidationFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ideaName: "",
    ideaDescription: "",
    targetAudience: "",
    productFormat: "SaaS",
    expectedPrice: "",
    targetCountry: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/validations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        navigate(`/results/${data.id}`);
      } else {
        setError(data.error || "Analysis failed. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Validate Your Idea</h1>
        <p className="text-gray-500 text-lg">
          Fill in the details below. Our AI will analyze the market, competition, and potential for your product.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Idea Name</label>
            <input
              required
              value={formData.ideaName}
              onChange={(e) => setFormData({ ...formData, ideaName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              placeholder="e.g. AI Content Planner for Etsy Sellers"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Idea Description</label>
            <textarea
              required
              rows={4}
              value={formData.ideaDescription}
              onChange={(e) => setFormData({ ...formData, ideaDescription: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
              placeholder="Describe what your product does, the problem it solves, and how it works..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Target Audience</label>
              <input
                required
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="e.g. Solopreneurs, Etsy Sellers"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Product Format</label>
              <select
                value={formData.productFormat}
                onChange={(e) => setFormData({ ...formData, productFormat: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none"
              >
                <option>SaaS</option>
                <option>Course</option>
                <option>Ebook</option>
                <option>Template</option>
                <option>Membership</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Expected Price</label>
              <input
                required
                value={formData.expectedPrice}
                onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="e.g. $19/mo or $99 one-time"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Target Country (Optional)</label>
              <input
                value={formData.targetCountry}
                onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="e.g. Global, USA, UK"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-600">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-black/10"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Validate This Idea
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        AI analysis typically takes 10-20 seconds.
      </p>
    </div>
  );
}
