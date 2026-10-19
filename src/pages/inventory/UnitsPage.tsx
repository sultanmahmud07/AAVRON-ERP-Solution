import React, { useState } from "react";
import {
  Compass,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Download,
  ChevronRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface Unit {
  id: string;
  name: string;
  shortName: string;
  allowDecimal: boolean;
  productCount: number;
  status: "Active" | "Inactive";
}

const initialUnits: Unit[] = [
  { id: "1", name: "Kilogram", shortName: "kg", allowDecimal: true, productCount: 142, status: "Active" },
  { id: "2", name: "Piece", shortName: "pc", allowDecimal: false, productCount: 389, status: "Active" },
  { id: "3", name: "Liter", shortName: "L", allowDecimal: true, productCount: 84, status: "Active" },
  { id: "4", name: "Box (24 Units)", shortName: "bx", allowDecimal: false, productCount: 65, status: "Active" },
  { id: "5", name: "Meter", shortName: "m", allowDecimal: true, productCount: 112, status: "Active" },
  { id: "6", name: "Gram", shortName: "g", allowDecimal: true, productCount: 47, status: "Active" },
  { id: "7", name: "Carton", shortName: "ctn", allowDecimal: false, productCount: 29, status: "Inactive" },
];

export const UnitsPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", shortName: "", allowDecimal: true });

  const filteredUnits = units.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.name || !newUnit.shortName) {
      toast.error("Please provide both Unit name and short code");
      return;
    }
    const created: Unit = {
      id: String(Date.now()),
      name: newUnit.name,
      shortName: newUnit.shortName,
      allowDecimal: newUnit.allowDecimal,
      productCount: 0,
      status: "Active",
    };
    setUnits([created, ...units]);
    setNewUnit({ name: "", shortName: "", allowDecimal: true });
    setIsAddOpen(false);
    toast.success(`Unit "${created.name}" created successfully`);
  };

  const handleDelete = (id: string, name: string) => {
    setUnits(units.filter((u) => u.id !== id));
    toast.success(`Unit "${name}" deleted`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Inventory</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200">Units of Measurement</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Units Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage unit definitions, decimal permissions, and conversion metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Units</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{units.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Units</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {units.filter((u) => u.status === "Active").length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Linked Products</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {units.reduce((acc, curr) => acc + curr.productCount, 0)}
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => toast.info("Filter applied: All units")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => toast.success("Exporting units list as CSV...")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Short Code</th>
                <th className="py-3 px-4">Allow Decimal</th>
                <th className="py-3 px-4">Linked Products</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{unit.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                    {unit.shortName}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {unit.allowDecimal ? "Yes (e.g. 1.25)" : "No (Whole only)"}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {unit.productCount} items
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        unit.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {unit.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toast.info(`Editing unit ${unit.name}`)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id, unit.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Unit</h3>
            <p className="text-xs text-slate-400 mt-0.5">Define unit identifier and decimal rule</p>

            <form onSubmit={handleAddUnit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barrel"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bbl"
                  value={newUnit.shortName}
                  onChange={(e) => setNewUnit({ ...newUnit, shortName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="decimalCheck"
                  checked={newUnit.allowDecimal}
                  onChange={(e) => setNewUnit({ ...newUnit, allowDecimal: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="decimalCheck" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Allow fractional quantities (decimals)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsPage;
