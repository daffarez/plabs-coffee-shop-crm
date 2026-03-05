import { Edit3, Trash2, Coffee, User } from "lucide-react";
import { Pagination } from "./pagination";
import { Dispatch, SetStateAction } from "react";

type Customer = {
  id: string;
  name: string;
  contact: string | null;
  favorite: string | null;
  customer_tags: {
    interest_tags: {
      name: string;
    };
  }[];
};

interface CustomerListProps {
  customers: Customer[] | undefined;
  isFetching: boolean;
  onClickEditButton: (data: Customer) => void;
  onClickDeleteButton: (data: Customer) => void;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}

export const CustomerList = ({
  customers,
  isFetching,
  onClickEditButton,
  onClickDeleteButton,
  totalCount,
  pageSize,
  currentPage,
  setCurrentPage,
}: CustomerListProps) => {
  const isEmpty = !isFetching && (!customers || customers.length === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 h-6">
        <h2 className="font-bold text-[#2D2424]">Customer List</h2>
        {isFetching && (
          <span className="text-xs text-[#7E6363] animate-pulse italic">
            Updating list...
          </span>
        )}
      </div>

      <div className="hidden md:block bg-white border border-[#EBE3D5] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFCF8] border-b border-[#EBE3D5]">
                <th className="px-6 py-4 text-xs font-bold text-[#7E6363] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#7E6363] uppercase tracking-wider">
                  Preferences
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#7E6363] uppercase tracking-wider">
                  Interests
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#7E6363] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FDFCF8]">
              {isEmpty ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[#7E6363] italic"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers?.map((data) => (
                  <tr
                    key={data.id}
                    className="hover:bg-[#FDFCF8]/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBE3D5] flex items-center justify-center text-[#7E6363]">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-[#2D2424] leading-none">
                            {data.name}
                          </p>
                          <p className="text-xs text-[#7E6363] mt-1">
                            {data.contact || "No contact"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2D2424]">
                      {data.favorite ? (
                        <span className="flex items-center gap-2">
                          <Coffee size={14} className="text-[#D2691E]" />
                          {data.favorite}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap items-center">
                        {data.customer_tags?.slice(0, 2).map((tags, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold uppercase bg-[#EBE3D5]/40 text-[#7E6363] px-2 py-0.5 rounded"
                          >
                            {tags.interest_tags.name}
                          </span>
                        ))}
                        {data.customer_tags &&
                          data.customer_tags.length > 2 && (
                            <span className="text-[10px] text-[#D2691E] font-bold ml-1">
                              +{data.customer_tags.length - 2}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={() => onClickEditButton(data)}
                          className="p-2 text-[#7E6363] hover:text-[#D2691E] hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => onClickDeleteButton(data)}
                          className="p-2 text-[#7E6363] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isEmpty ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-[#EBE3D5] text-[#7E6363] italic">
            No customers found.
          </div>
        ) : (
          customers?.map((data) => (
            <div
              key={data.id}
              className="bg-white p-5 rounded-2xl border border-[#EBE3D5] shadow-sm active:bg-[#FDFCF8] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBE3D5] flex items-center justify-center text-[#7E6363]">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D2424]">{data.name}</h3>
                    <p className="text-xs text-[#7E6363]">
                      {data.contact || "No contact"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    title="Edit"
                    onClick={() => onClickEditButton(data)}
                    className="p-2 bg-[#FDFCF8] text-[#7E6363] rounded-xl border border-[#EBE3D5]"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => onClickDeleteButton(data)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-[#FDFCF8] pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#7E6363] font-medium">
                    Favorite Drink:
                  </span>
                  <span className="text-[#2D2424] font-bold flex items-center gap-1">
                    <Coffee size={14} className="text-[#D2691E]" />{" "}
                    {data.favorite || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[#7E6363] text-sm font-medium">
                    Interests:
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {data.customer_tags?.length > 0 ? (
                      data.customer_tags.map((tags, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold uppercase bg-[#EBE3D5]/40 text-[#7E6363] px-2 py-0.5 rounded"
                        >
                          {tags.interest_tags.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7E6363] italic">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <div className="px-4 py-2 bg-[#EBE3D5]/20 border border-[#EBE3D5] rounded-full text-[10px] text-[#7E6363] font-bold uppercase tracking-widest">
          Total: {totalCount} Customers
        </div>

        <Pagination
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
