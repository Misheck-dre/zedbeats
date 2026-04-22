import { motion } from 'framer-motion';
import { Check, Crown, Music2, Download, Zap, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const FEATURES_FREE = [
  'Stream all Zambian music',
  'Browse charts and genres',
  'Create playlists',
  'Ads between songs',
  'Limited skips',
];

const FEATURES_PREMIUM = [
  'Everything in Free',
  'No ads — ever',
  'Unlimited skips',
  'Offline downloads',
  'High quality audio (320kbps)',
  'Early access to new releases',
  'Exclusive artist content',
  'Cancel anytime',
];

const PERKS = [
  { icon: Radio, label: 'Ad-free listening', desc: 'Enjoy uninterrupted music' },
  { icon: Download, label: 'Offline downloads', desc: 'Listen without internet' },
  { icon: Zap, label: 'High quality audio', desc: '320kbps crystal clear sound' },
  { icon: Music2, label: 'Exclusive content', desc: 'Behind-the-scenes access' },
];

export default function PremiumPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  function handleUpgrade() {
    if (!user) {
      navigate('/register');
    } else {
      // In production, redirect to Stripe Checkout
      window.location.href = '/api/subscriptions/checkout';
    }
  }

  return (
    <div className="px-6 py-8 pb-12 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F97316]/20 to-[#EF4444]/20 border border-[#F97316]/30 text-[#F97316] text-sm font-medium mb-6"
        >
          <Crown size={16} />
          ZedBeats Premium
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Music without limits
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 text-lg max-w-md mx-auto"
        >
          Support Zambian artists directly while enjoying the best listening experience.
        </motion.p>
      </div>

      {/* Perks grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {PERKS.map((perk, i) => (
          <motion.div
            key={perk.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EF4444]/10 flex items-center justify-center mx-auto mb-3">
              <perk.icon size={20} className="text-[#F97316]" />
            </div>
            <p className="text-sm font-semibold mb-1">{perk.label}</p>
            <p className="text-xs text-white/40">{perk.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Free */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-1">Free</h3>
          <p className="text-3xl font-bold mb-1">K0<span className="text-lg font-normal text-white/40">/month</span></p>
          <p className="text-white/40 text-sm mb-6">Forever free</p>

          <ul className="space-y-3 mb-6">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                <Check size={16} className="text-white/30 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => !user && navigate('/register')}
            disabled={!!user}
            className="w-full py-3 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-default"
          >
            {user ? 'Current Plan' : 'Get Started Free'}
          </button>
        </div>

        {/* Premium */}
        <div className="relative bg-gradient-to-br from-[#F97316]/15 to-[#EF4444]/5 border border-[#F97316]/30 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-br from-[#F97316] to-[#EF4444] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
            POPULAR
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-[#F97316]" />
            <h3 className="text-lg font-bold">Premium</h3>
          </div>
          <p className="text-3xl font-bold mb-1">
            K49<span className="text-lg font-normal text-white/40">/month</span>
          </p>
          <p className="text-white/40 text-sm mb-6">Billed monthly · Cancel anytime</p>

          <ul className="space-y-3 mb-6">
            {FEATURES_PREMIUM.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-[#F97316] mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EF4444] text-sm font-bold hover:opacity-90 transition"
          >
            {user?.tier === 'PREMIUM' ? '✓ You\'re Premium' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="text-center">
        <p className="text-white/30 text-sm">
          🔒 Secure payment · 💳 Airtel Money & MTN supported · 🇿🇲 Made for Zambia
        </p>
        <p className="text-white/20 text-xs mt-2">
          By upgrading, you directly support Zambian artists. 70% of subscription revenue goes to artists.
        </p>
      </div>
    </div>
  );
}
