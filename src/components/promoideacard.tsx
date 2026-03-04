import {
  Calendar,
  Target,
  Lightbulb,
  MessageSquare,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { PromoIdea } from "../app/(protected)/promo-ideas/page";

interface PromoIdeaCardProps {
  idea: PromoIdea;
  index: number;
  isCopied: boolean;
  onCopy: (text: string, index: number) => void;
}

export const PromoIdeaCard = ({
  idea,
  index,
  isCopied,
  onCopy,
}: PromoIdeaCardProps) => {
  return (
    <div className="flex-1 bg-white border border-[#EBE3D5] rounded-[2.5rem] p-8 md:p-10 shadow-sm group-hover:shadow-xl group-hover:shadow-orange-900/5 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-[#2D2424] tracking-tight">
          {idea.theme}
        </h2>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FDFCF8] rounded-xl border border-[#EBE3D5] text-[#7E6363] text-xs font-bold">
          <Calendar size={14} className="text-[#D2691E]" />
          {idea.best_time_window || "Anytime"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#D2691E] text-[10px] font-black uppercase tracking-widest">
            <Target size={14} /> Target
          </div>
          <p className="text-[#7E6363] text-sm leading-relaxed">
            {idea.segment_description}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#D2691E] text-[10px] font-black uppercase tracking-widest">
            <Lightbulb size={14} /> Why now?
          </div>
          <p className="text-[#7E6363] text-sm leading-relaxed">
            {idea.why_now}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-[#2D2424] rounded-2xl p-6 text-white group/msg transition-all">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-white/50">
            <MessageSquare size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Marketing Copy
            </span>
          </div>
          <button
            onClick={() => onCopy(idea.ready_message, index)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            {isCopied ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <Copy size={18} className="text-white/70" />
            )}
          </button>
        </div>
        <p className="text-lg font-medium leading-relaxed italic pr-8">
          "{idea.ready_message}"
        </p>

        {isCopied && (
          <div className="absolute top-4 right-14 bg-green-500 text-[10px] font-bold py-1 px-3 rounded-full animate-in fade-in slide-in-from-right-2">
            COPIED!
          </div>
        )}
      </div>
    </div>
  );
};
