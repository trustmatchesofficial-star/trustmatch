import { BadgeCheck, MapPin, ShieldCheck, Heart, X, Star, Bell } from 'lucide-react';

export default function LandingPhoneMockups() {
  return (
    <div className="relative h-[460px] hidden md:block">
      {/* Discover phone */}
      <div className="absolute left-0 top-2 w-56 bg-slate-900 rounded-[2rem] p-2 shadow-2xl rotate-[-5deg]">
        <div className="relative rounded-[1.6rem] overflow-hidden aspect-[9/16]">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d35?w=400&h=700&fit=crop"
            alt="Discover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Online
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-400/90 text-slate-900 text-[9px] px-2 py-0.5 rounded-full font-semibold">
            <BadgeCheck size={11} /> Verified
          </span>
          <div className="absolute bottom-16 inset-x-0 p-3 text-white">
            <h3 className="font-bold text-lg flex items-center gap-1">
              Jessica, 27 <BadgeCheck size={16} className="text-amber-400" />
            </h3>
            <p className="text-xs text-white/70 mb-1.5">Product Designer · 2 km away</p>
            <div className="flex gap-1.5">
              <span className="bg-teal-400/90 text-slate-900 text-[9px] px-2 py-0.5 rounded-full font-semibold">Trusted</span>
              <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold">Photo Verified</span>
            </div>
          </div>
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <X size={18} className="text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center">
              <Star size={16} className="text-slate-900 fill-slate-900" />
            </button>
            <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Heart size={22} className="text-white fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Safety phone */}
      <div className="absolute right-0 bottom-0 w-56 bg-slate-900 rounded-[2rem] p-2 shadow-2xl rotate-[5deg]">
        <div className="rounded-[1.6rem] overflow-hidden aspect-[9/16] p-3 text-white bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-400" /> Safety Hub
            </span>
            <Bell size={14} className="text-white/60" />
          </div>
          <div className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-3 mb-3">
            <ShieldCheck className="text-teal-400 mb-1" size={18} />
            <p className="text-[10px] text-white/80 leading-snug">
              Date Safety Mode is active. Sharing is private and you control it.
            </p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="text-teal-400" size={16} />
            <div className="flex-1">
              <p className="text-xs font-medium">Town Centre</p>
              <p className="text-[9px] text-white/50">Updated just now</p>
            </div>
            <div className="w-8 h-4 rounded-full bg-teal-400 relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-slate-900" />
            </div>
          </div>
          <div className="h-20 rounded-xl bg-slate-700/50 flex items-center justify-center">
            <MapPin className="text-teal-400" size={24} />
          </div>
          <button className="w-full mt-3 py-2 rounded-full bg-primary text-white text-[11px] font-semibold">
            Stop sharing
          </button>
        </div>
      </div>
    </div>
  );
}