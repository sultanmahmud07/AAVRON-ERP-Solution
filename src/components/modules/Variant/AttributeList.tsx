import React, { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredAttributes,
  addStoredAttribute,
  updateStoredAttribute,
  deleteStoredAttribute,
  AttributeItem,
} from "./attributeStorage";

export default function AttributeList() {
  // Storage state
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);

  // Form state for Create / Edit Attribute
  const [editingAttr, setEditingAttr] = useState<AttributeItem | null>(null);
  const [attrName, setAttrName] = useState("");
  const [attrStatus, setAttrStatus] = useState<"Active" | "Inactive">("Active");

  // Options Modal State (for the yellow + action button)
  const [optionModalAttr, setOptionModalAttr] = useState<AttributeItem | null>(null);
  const [newOptionValue, setNewOptionValue] = useState("");

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<AttributeItem | null>(null);

  // Load data
  const loadData = () => {
    setAttributes(getStoredAttributes());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_attributes_updated", handleUpdate);
    return () => window.removeEventListener("nexora_attributes_updated", handleUpdate);
  }, []);

  // Submit Create or Edit Attribute
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim()) {
      toast.error("Please enter an attribute name");
      return;
    }

    if (editingAttr) {
      updateStoredAttribute(editingAttr.id, {
        name: attrName.trim(),
        status: attrStatus,
      });
      toast.success(`Attribute "${attrName}" updated successfully`);
      setEditingAttr(null);
    } else {
      addStoredAttribute(attrName.trim(), [], attrStatus);
      toast.success(`Attribute "${attrName}" created successfully`);
    }

    setAttrName("");
    setAttrStatus("Active");
    loadData();
  };

  // Add Option to Attribute
  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionModalAttr || !newOptionValue.trim()) return;

    const trimmed = newOptionValue.trim();
    if (optionModalAttr.options.includes(trimmed)) {
      toast.error("Option already exists");
      return;
    }

    const updatedOptions = [...optionModalAttr.options, trimmed];
    updateStoredAttribute(optionModalAttr.id, { options: updatedOptions });
    setOptionModalAttr({ ...optionModalAttr, options: updatedOptions });
    setNewOptionValue("");
    loadData();
    toast.success(`Added "${trimmed}" to ${optionModalAttr.name}`);
  };

  // Remove Option from Attribute
  const handleRemoveOption = (optionToRemove: string) => {
    if (!optionModalAttr) return;
    const updatedOptions = optionModalAttr.options.filter((o) => o !== optionToRemove);
    updateStoredAttribute(optionModalAttr.id, { options: updatedOptions });
    setOptionModalAttr({ ...optionModalAttr, options: updatedOptions });
    loadData();
    toast.success(`Removed "${optionToRemove}"`);
  };

  // Confirm Delete Attribute
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredAttribute(deleteTarget.id);
    toast.success(`Attribute "${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
    loadData();
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header Title matching Reference Image */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#4338ca] dark:text-indigo-400 tracking-tight">
          Manage Attributes
        </h1>
      </div>

      {/* 2-Column Layout matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* =========================================================================
            LEFT COLUMN: CREATE / EDIT ATTRIBUTE CARD (lg:col-span-4)
            ========================================================================= */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Header: Title and "New" badge */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAttr ? "Edit Attribute" : "Create Attribute"}
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent">
                New
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Attribute Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attribute Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  placeholder="e.g. Color"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-xs transition-all"
                />
              </div>

              {/* Field 2: Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={attrStatus}
                  onChange={(e) => setAttrStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-xs transition-all cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-lg bg-[#4338ca] hover:bg-[#3730a3] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {editingAttr ? "Update Attribute" : "Save Attribute"}
                </button>
                {editingAttr && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAttr(null);
                      setAttrName("");
                      setAttrStatus("Active");
                    }}
                    className="py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: MANAGE ATTRIBUTES TABLE CARD (lg:col-span-8)
            ========================================================================= */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#181b24] border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            {/* Header: Title and "2 Attributes" badge */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Manage Attributes
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eef2ff] dark:bg-indigo-950/40 text-[#6366f1] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                {attributes.length} Attributes
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                    <th className="py-3.5 px-4 w-12 text-slate-400 font-semibold">#</th>
                    <th className="py-3.5 px-4 font-bold">Name</th>
                    <th className="py-3.5 px-4 font-bold">Options</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {attributes.map((attr, idx) => {
                    const visibleOptions = attr.options.slice(0, 3);
                    const remainingCount = attr.options.length - 3;

                    return (
                      <tr
                        key={attr.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Index */}
                        <td className="py-4 px-4 text-slate-400 font-medium">{idx + 1}</td>

                        {/* Name */}
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          {attr.name}
                        </td>

                        {/* Options Pill Tags */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {visibleOptions.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                              >
                                {opt}
                              </span>
                            ))}

                            {/* +N more badge if more than 3 options */}
                            {remainingCount > 0 && (
                              <button
                                onClick={() => setOptionModalAttr(attr)}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                                title="View all options"
                              >
                                +{remainingCount} more
                              </button>
                            )}

                            {attr.options.length === 0 && (
                              <span className="text-slate-400 italic text-[11px]">
                                No options yet
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status with green dot indicator */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{attr.status}</span>
                          </span>
                        </td>

                        {/* Direct Action Buttons: Edit, Delete, and Plus (Add Options) */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Purple Edit Button */}
                            <button
                              onClick={() => {
                                setEditingAttr(attr);
                                setAttrName(attr.name);
                                setAttrStatus(attr.status);
                              }}
                              className="w-7 h-7 rounded-full bg-[#eef2ff] hover:bg-[#e0e7ff] dark:bg-indigo-950/40 text-[#6366f1] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Edit Attribute"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Pink / Rose Delete Button */}
                            <button
                              onClick={() => setDeleteTarget(attr)}
                              className="w-7 h-7 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] dark:bg-rose-950/40 text-[#ef4444] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Delete Attribute"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Amber / Yellow Plus Button (Add Options) */}
                            <button
                              onClick={() => setOptionModalAttr(attr)}
                              className="w-7 h-7 rounded-full bg-[#fffbeb] hover:bg-[#fef3c7] dark:bg-amber-950/40 text-[#d97706] dark:text-amber-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title={`Add options to ${attr.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: MANAGE ATTRIBUTE OPTIONS (Triggered by yellow + button)
          ========================================================================= */}
      {optionModalAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Options for {optionModalAttr.name}
                </h3>
              </div>
              <button
                onClick={() => setOptionModalAttr(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Options as tags with remove 'x' */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Current Values ({optionModalAttr.options.length}):
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl min-h-[50px] border border-slate-100 dark:border-slate-800">
                {optionModalAttr.options.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No values added yet.</span>
                ) : (
                  optionModalAttr.options.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Add New Option Input Form */}
            <form onSubmit={handleAddOption} className="space-y-3 pt-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Add New Value:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  placeholder="e.g. XL or Navy Blue"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-xs transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOptionModalAttr(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Attribute
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to delete "{deleteTarget.name}"?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This action cannot be undone. Any products configured with this variant attribute may need to be adjusted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
