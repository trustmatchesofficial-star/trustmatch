import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Award, Crown, Star, Heart, Shield, Zap, Music, Camera, Plane,
  Coffee, Book, Dumbbell, Palette, Gamepad2, Mountain, ChefHat,
  Music2, Film, Sparkles, Trophy, Medal, Gift, Flame, Gem,
} from 'lucide-react';

const ICON_MAP = {
  Award, Crown, Star, Heart, Shield, Zap, Music, Camera, Plane,
  Coffee, Book, Dumbbell, Palette, Gamepad2, Mountain, ChefHat,
  Music2, Film, Sparkles, Trophy, Medal, Gift, Flame, Gem,
};

export default function BadgeDisplay({ badgeIds, size = 'sm' }) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!badgeIds || badgeIds.length === 0) return;
    let active = true;
    const load = async () => {
      try {
        const all = await base44.entities.Badge.list('-created_date', 100);
        if (active) setBadges(all.filter((b) => badgeIds.includes(b.id)));
      } catch (e) { console.error(e); }
    };
    load();
    return () => { active = false; };
  }, [badgeIds?.join(',')]);

  if (badges.length === 0) return null;

  const iconSize = size === 'sm' ? 12 : 16;
  const containerSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  const colorMap = {
    gold: 'bg-gold/15 border-gold/40 text-gold',
    teal: 'bg-teal/15 border-teal/40 text-teal',
    primary: 'bg-primary/15 border-primary/40 text-primary',
    purple: 'bg-purplecustom/15 border-purplecustom/40 text-purplecustom',
    destructive: 'bg-destructive/15 border-destructive/40 text-destructive',
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {badges.map((badge) => {
          const IconComp = ICON_MAP[badge.icon] || Award;
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div className={`${containerSize} rounded-full border flex items-center justify-center cursor-help ${colorMap[badge.color] || colorMap.gold}`}>
                  <IconComp size={iconSize} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold text-xs">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}