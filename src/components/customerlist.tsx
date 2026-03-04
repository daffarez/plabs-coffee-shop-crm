import { Edit3, Trash2, Coffee, User, MoreVertical } from "lucide-react";

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
  deleteCustomer: (id: string) => void;
}

export const CustomerList = ({
  customers,
  isFetching,
  onClickEditButton,
  deleteCustomer,
}: CustomerListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="font-bold text-[#2D2424]">Customer List</h2>
        {isFetching && (
          <span className="text-xs text-[#7E6363] animate-pulse italic">
            Updating list...
          </span>
        )}
      </div>

      <div className="bg-white border border-[#EBE3D5] rounded-2xl overflow-hidden shadow-sm">
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
              {!isFetching && customers?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[#7E6363] italic"
                  >
                    No customers found. Try adjusting your filters.
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
                    <td className="px-6 py-4">
                      {data.favorite ? (
                        <div className="flex items-center gap-2 text-sm text-[#2D2424]">
                          <Coffee size={14} className="text-[#D2691E]" />
                          {data.favorite}
                        </div>
                      ) : (
                        <span className="text-xs text-[#EBE3D5]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap max-w-50">
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
                            <span className="text-[10px] text-[#D2691E] font-bold">
                              +{data.customer_tags.length - 2}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onClickEditButton(data)}
                          className="p-2 text-[#7E6363] hover:text-[#D2691E] hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCustomer(data.id)}
                          className="p-2 text-[#7E6363] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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

        <div className="px-6 py-3 bg-[#FDFCF8] border-t border-[#EBE3D5] flex justify-between items-center text-[10px] text-[#7E6363] font-bold uppercase tracking-widest">
          <span>Total: {customers?.length || 0} Customers</span>
        </div>
      </div>
    </div>
  );
};
