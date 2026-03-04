import { Search, Filter } from "lucide-react";

interface CustomerFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  filterTag: string;
  setFilterTag: (value: string) => void;
}

export const CustomerSearchFilters = ({
  searchInput,
  setSearchInput,
  filterTag,
  setFilterTag,
}: CustomerFiltersProps) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#EBE3D5] shadow-sm flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E6363]"
          size={18}
        />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl focus:ring-2 focus:ring-[#D2691E] outline-none transition-all text-sm text-[#2D2424] placeholder:text-[#7E6363]/50"
          placeholder="Search by name (min 3 chars)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="relative flex-1">
        <Filter
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E6363]"
          size={18}
        />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl focus:ring-2 focus:ring-[#D2691E] outline-none transition-all text-sm text-[#2D2424] placeholder:text-[#7E6363]/50"
          placeholder="Filter by interests"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
      </div>
    </div>
  );
};
