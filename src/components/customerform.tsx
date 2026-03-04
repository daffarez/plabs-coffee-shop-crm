import { Edit3, UserPlus, Coffee, Tag as TagIcon, XCircle } from "lucide-react";
import React from "react";

interface CustomerFormProps {
  editingId: string | null;
  formData: {
    name: string;
    contact: string;
    favorite: string;
    tagsInput: string;
  };
  errors: {
    name?: string;
    favorite?: string;
    tags?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  onClickCancelEditButton: () => void;
}

export const CustomerForm = ({
  editingId,
  formData,
  errors,
  handleChange,
  handleSubmit,
  onClickCancelEditButton,
}: CustomerFormProps) => {
  const { name, contact, favorite, tagsInput } = formData;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EBE3D5] shadow-sm sticky top-8">
      <h2 className="text-lg font-bold text-[#2D2424] mb-4 flex items-center gap-2">
        {editingId ? (
          <Edit3 size={20} className="text-[#D2691E]" />
        ) : (
          <UserPlus size={20} className="text-[#D2691E]" />
        )}
        {editingId ? "Edit Customer" : "Add New Customer"}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#7E6363] uppercase mb-1 block ml-1">
            Full Name
          </label>
          <input
            className={`w-full px-4 py-2.5 bg-[#FDFCF8] border rounded-xl outline-none transition-all ${
              errors.name
                ? "border-red-500"
                : "border-[#EBE3D5] focus:border-[#D2691E]"
            }`}
            placeholder="e.g. John Doe"
            value={name}
            name="name"
            onChange={handleChange}
          />
          {errors.name && (
            <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">
              {errors.name}
            </span>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-[#7E6363] uppercase mb-1 block ml-1">
            Contact
          </label>
          <input
            className="w-full px-4 py-2.5 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl outline-none focus:border-[#D2691E] transition-all"
            placeholder="WhatsApp or Instagram"
            value={contact}
            name="contact"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#7E6363] uppercase mb-1 block ml-1">
            Favorite Item
          </label>
          <div className="relative">
            <Coffee
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EBE3D5]"
              size={16}
            />
            <input
              className={`w-full pl-10 pr-4 py-2.5 bg-[#FDFCF8] border rounded-xl outline-none transition-all ${
                errors.favorite
                  ? "border-red-500"
                  : "border-[#EBE3D5] focus:border-[#D2691E]"
              }`}
              placeholder="e.g. Oatmilk Latte"
              value={favorite}
              name="favorite"
              onChange={handleChange}
            />
          </div>
          {errors.favorite && (
            <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">
              {errors.favorite}
            </span>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-[#7E6363] uppercase mb-1 block ml-1">
            Interests (Comma separated)
          </label>
          <div className="relative">
            <TagIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EBE3D5]"
              size={16}
            />
            <input
              className={`w-full pl-10 pr-4 py-2.5 bg-[#FDFCF8] border rounded-xl outline-none transition-all ${
                errors.tags
                  ? "border-red-500"
                  : "border-[#EBE3D5] focus:border-[#D2691E]"
              }`}
              placeholder="morning, arabica, sweet"
              value={tagsInput}
              name="tagsInput"
              onChange={handleChange}
            />
          </div>
          {errors.tags && (
            <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">
              {errors.tags}
            </span>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#2D2424] text-white py-3 rounded-xl font-bold hover:bg-[#433434] transition-all shadow-md shadow-orange-900/10"
          >
            {editingId ? "Save Changes" : "Add Customer"}
          </button>
          {editingId && (
            <button
              onClick={onClickCancelEditButton}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#7E6363] py-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <XCircle size={16} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
