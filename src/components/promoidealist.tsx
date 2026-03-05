import { Sparkles } from "lucide-react";
import { PromoIdea } from "../app/(protected)/promo-ideas/page";
import { PromoIdeaCard } from "./promoideacard";

interface PromoIdeaListProps {
  ideas: PromoIdea[];
  loading: boolean;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const PromoIdeaList = ({
  ideas,
  loading,
  copiedIndex,
  onCopy,
}: PromoIdeaListProps) => {
  if (ideas.length === 0 && !loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-[#FDFCF8] rounded-full flex items-center justify-center text-[#EBE3D5]">
          <Sparkles size={40} />
        </div>
        <p className="text-[#7E6363] font-medium italic">
          Generate your top 3 strategies for this week.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-[#EBE3D5] hidden md:block" />

      {ideas?.map((idea, index) => (
        <div
          key={index}
          className="relative flex flex-col md:flex-row gap-8 items-start group transition-all duration-500 animate-in slide-in-from-bottom-8"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="z-10 shrink-0 w-20 h-20 rounded-4xl bg-white border-2 border-[#EBE3D5] flex items-center justify-center text-3xl font-black text-[#D2691E] shadow-sm group-hover:border-[#D2691E] group-hover:bg-[#FDFCF8] transition-all duration-300">
            0{index + 1}
          </div>

          <PromoIdeaCard
            idea={idea}
            index={index}
            isCopied={copiedIndex === index}
            onCopy={onCopy}
          />
        </div>
      ))}
    </div>
  );
};
