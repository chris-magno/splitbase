import Link from 'next/link'
import { ArrowRight, Camera, MessageSquare, Zap, Shield, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">SplitBase AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="gradient-brand text-white border-0">
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
          ✨ Powered by Google Gemini 2.0 Flash
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Split bills smarter.{' '}
          <span className="text-transparent bg-clip-text gradient-brand">
            Let AI handle the math.
          </span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Photograph a receipt and Gemini reads it instantly. Describe your split in plain English and the AI calculates it. No more awkward money conversations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="gradient-brand text-white border-0 text-base px-8 py-6 ai-glow">
              Start splitting for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required · Sign in with Google</p>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            AI that actually does the work
          </h2>
          <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
            Gemini 2.0 Flash handles every tedious part of splitting bills — so you can focus on enjoying time with friends.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                color: 'text-purple-600 bg-purple-50',
                title: 'Receipt Photo Parsing',
                desc: 'Photograph any receipt — Gemini extracts every line item, tax, and tip in under 2 seconds. No typing required.',
              },
              {
                icon: MessageSquare,
                color: 'text-blue-600 bg-blue-50',
                title: 'Natural Language Entry',
                desc: '"Dinner $80 — Alice had the steak so +$20 for her." Gemini parses the nuance and calculates exact splits.',
              },
              {
                icon: Zap,
                color: 'text-amber-600 bg-amber-50',
                title: 'AI-Drafted Reminders',
                desc: 'Gemini writes personalized, human-sounding debt reminders. Your friends will actually respond.',
              },
              {
                icon: Shield,
                color: 'text-green-600 bg-green-50',
                title: 'Bank-grade Security',
                desc: 'Row-level security in Supabase. Your Gemini API key never touches the client. Standard OAuth — no wallets.',
              },
              {
                icon: Users,
                color: 'text-rose-600 bg-rose-50',
                title: 'Unlimited Groups',
                desc: 'Bali Trip, House Bills, Weekly Lunch — manage all your expense groups in one place.',
              },
              {
                icon: TrendingUp,
                color: 'text-indigo-600 bg-indigo-50',
                title: 'Monthly AI Insights',
                desc: '"You paid for 40% of your group\'s dinners this month." Gemini turns data into readable stories.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to ditch the awkward money conversations?
          </h2>
          <p className="text-gray-500 mb-8">
            Join the smarter way to split expenses with friends, family, and housemates.
          </p>
          <Link href="/login">
            <Button size="lg" className="gradient-brand text-white border-0 text-base px-10 py-6 ai-glow">
              Sign in with Google — it's free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-semibold text-gray-600">SplitBase AI</span>
        </div>
        <p>Powered by Google Gemini 2.0 Flash · Built with Next.js & Supabase</p>
      </footer>
    </div>
  )
}
