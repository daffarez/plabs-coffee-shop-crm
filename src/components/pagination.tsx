import { Dispatch, SetStateAction } from "react";

interface PaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}

export const Pagination = ({
  totalCount,
  pageSize,
  currentPage,
  setCurrentPage,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-[#EBE3D5] mt-4">
      <p className="text-xs text-[#7E6363] font-medium mr-2.5">
        Showing{" "}
        <span className="text-[#2D2424] font-bold">
          {(currentPage - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="text-[#2D2424] font-bold">
          {Math.min(currentPage * pageSize, totalCount)}
        </span>{" "}
        of <span className="text-[#2D2424] font-bold">{totalCount}</span>{" "}
        customers
      </p>

      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 text-xs font-bold bg-white border border-[#EBE3D5] rounded-xl disabled:opacity-50 hover:bg-[#FDFCF8] transition-all"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 text-xs font-bold bg-[#2D2424] text-white rounded-xl disabled:opacity-50 hover:bg-[#433434] transition-all shadow-lg shadow-black/10"
        >
          Next
        </button>
      </div>
    </div>
  );
};
