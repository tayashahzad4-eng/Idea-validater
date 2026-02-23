import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, ShieldCheck, BarChart3, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Stop Building in <br />
            <span className="text-gray-400">the Dark.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-10 mx-auto">
            Validate your digital product idea with structured AI scoring before you waste months building it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all flex items-center gap-2 group"
            >
              Validate My Idea
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="bg-gray-100 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
            >
              How it works
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="w-full bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Scientific Analysis</h3>
              <p className="text-gray-600">
                Our AI uses professional startup validation frameworks to score your idea across 5 key dimensions.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Data-Driven Scoring</h3>
              <p className="text-gray-600">
                Get a clear "BUILD" or "DO NOT BUILD" verdict based on market demand and competition intensity.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Go-To-Market Plan</h3>
              <p className="text-gray-600">
                Receive a step-by-step strategy to get your first 100 customers and unique positioning angles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Target Users */}
      <section className="w-full py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Built for the new generation of creators.</h2>
        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale">
          <span className="text-xl font-bold">Indie Hackers</span>
          <span className="text-xl font-bold">Gumroad Creators</span>
          <span className="text-xl font-bold">Etsy Sellers</span>
          <span className="text-xl font-bold">Micro-SaaS Founders</span>
          <span className="text-xl font-bold">Course Creators</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-6 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to validate your next big thing?</h2>
          <p className="text-gray-400 text-lg mb-10">
            Join 1,000+ creators who are building smarter, not harder.
          </p>
          <Link
            to="/auth"
            className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all inline-block"
          >
            Start Your First Validation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Validate Before You Build. All rights reserved.</p>
      </footer>
    </div>
  );
}
