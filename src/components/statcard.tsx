import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  iconColorClass?: string;
  bgColorClass?: string;
  badgeText?: string;
  badgeColorClass?: string;
  children: ReactNode;
  isRelative?: boolean;
}

const StatCard = ({
  title,
  icon: Icon,
  iconColorClass = "text-[#D2691E]",
  bgColorClass = "bg-orange-50",
  badgeText,
  badgeColorClass = "text-[#D2691E] bg-orange-50",
  children,
  isRelative = false,
}: StatCardProps) => {
  return (
    <div
      className={`bg-white border border-[#EBE3D5] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${isRelative ? "relative overflow-hidden" : ""}`}
    >
      {/* Decorative circle for AI/Campaign cards */}
      {isRelative && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D2691E]/5 rounded-full -mr-8 -mt-8" />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${bgColorClass} ${iconColorClass}`}>
          <Icon size={20} />
        </div>
        {badgeText && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${badgeColorClass}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-[#7E6363]">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
};

export default StatCard;
