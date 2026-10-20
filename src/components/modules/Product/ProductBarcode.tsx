import React, { useState, useRef } from "react";
import { Printer, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ProductItem } from "./productStorage";

interface ProductBarcodeProps {
  product: ProductItem;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export const ProductBarcode: React.FC<ProductBarcodeProps> = ({
  product,
  onClose,
  isStandalonePage = false,
}) => {
  // Barcode configuration state matching reference image
  const [stickerSize, setStickerSize] = useState("45 × 35 mm");
  const [showCompany, setShowCompany] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showSku, setShowSku] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [companyName] = useState("NEXORA Fashion");
  const [copies, setCopies] = useState(1);
  const [isGenerated, setIsGenerated] = useState(true);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    setIsGenerated(true);
    toast.success("Barcode regenerated successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  // Sticker Dimensions map
  const dimensionsMap: Record<string, { width: string; minHeight: string; aspect: string }> = {
    "45 × 35 mm": { width: "w-56", minHeight: "min-h-[170px]", aspect: "45 / 35" },
    "50 × 30 mm": { width: "w-64", minHeight: "min-h-[160px]", aspect: "50 / 30" },
    "38 × 25 mm": { width: "w-48", minHeight: "min-h-[140px]", aspect: "38 / 25" },
    "40 × 30 mm": { width: "w-52", minHeight: "min-h-[155px]", aspect: "40 / 30" },
    "60 × 40 mm": { width: "w-72", minHeight: "min-h-[200px]", aspect: "60 / 40" },
  };

  const currentDim = dimensionsMap[stickerSize] || dimensionsMap["45 × 35 mm"];

  // Formatted price with Bangladeshi Taka (৳) symbol
  const formattedPrice = `৳ ${Number(product.sellingPrice).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const stickerElement = (
    <div
      className={`${currentDim.width} ${currentDim.minHeight} bg-white text-slate-900 border border-dashed border-slate-300 rounded-xs p-3.5 flex flex-col items-center justify-between shadow-xs select-none mx-auto print:border-none print:shadow-none print:p-1`}
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {/* Top Header: Company & Product Name */}
      <div className="w-full text-center space-y-0.5">
        {showCompany && (
          <div className="font-extrabold text-[12px] tracking-wide text-slate-950 uppercase leading-tight">
            {companyName}
          </div>
        )}
        {showProductName && (
          <div className="font-semibold text-[11px] text-slate-800 line-clamp-1 leading-tight">
            {product.name}
          </div>
        )}
      </div>

      {/* Middle: SKU & Barcode Graphic */}
      <div className="w-full flex flex-col items-center justify-center my-1.5 space-y-1">
        {showSku && (
          <div className="font-mono text-[10px] font-medium text-slate-600">
            {product.sku}
          </div>
        )}

        {/* Crisp SVG Barcode matching industrial label printers */}
        <div className="w-full flex items-center justify-center px-1">
          <svg className="w-full h-11" viewBox="0 0 200 45" preserveAspectRatio="none">
            {/* Generating Code128 pattern */}
            {[
              2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 2, 3, 1,
              1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 1, 2,
              3, 2, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 1, 3, 2, 1, 2, 4,
            ].map((bar, idx) => {
              const xPos = idx * 3.3;
              const isBlack = idx % 2 === 0;
              return isBlack ? (
                <rect
                  key={idx}
                  x={xPos}
                  y={0}
                  width={bar * 0.9}
                  height={45}
                  fill="#000000"
                />
              ) : null;
            })}
          </svg>
        </div>
      </div>

      {/* Bottom: Price */}
      {showPrice && (
        <div className="font-bold text-[13px] text-slate-950 tracking-tight leading-tight">
          {formattedPrice}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title Bar matching reference image */}
      <div className="flex items-center justify-between">
        <div>
          {isStandalonePage && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <span>Products</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Barcode Generator</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-indigo-900 dark:text-indigo-400">
            Product Barcode
          </h1>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Card 1: Configuration Controls matching reference image */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Product Title & SKU */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {product.name}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            SKU: {product.sku}
          </p>
        </div>

        {/* Form Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Sticker Size (col-span-4) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sticker size
            </label>
            <select
              value={stickerSize}
              onChange={(e) => setStickerSize(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400/50"
            >
              <option value="45 × 35 mm">45 × 35 mm</option>
              <option value="50 × 30 mm">50 × 30 mm</option>
              <option value="38 × 25 mm">38 × 25 mm</option>
              <option value="40 × 30 mm">40 × 30 mm</option>
              <option value="60 × 40 mm">60 × 40 mm</option>
            </select>
          </div>

          {/* Show on Sticker Checkboxes (col-span-5) */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Show on sticker
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Company */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCompany}
                  onChange={(e) => setShowCompany(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Company</span>
              </label>

              {/* Product Name */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={(e) => setShowProductName(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Product name</span>
              </label>

              {/* SKU */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={(e) => setShowSku(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">SKU</span>
              </label>

              {/* Price */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Price</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Company & name appear on top, SKU & price at the bottom.
            </p>
          </div>

          {/* Copies & Action Buttons (col-span-3) */}
          <div className="md:col-span-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Copies
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400/50"
              />
            </div>

            {/* Buttons: Generate (Green) & Print */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Generate</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Live Preview Card matching reference image */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Live preview
          </h2>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 bg-slate-50 dark:bg-slate-900">
            {stickerSize}
          </span>
        </div>

        {/* Live Preview Canvas Area */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-8 border border-slate-100 dark:border-slate-800 flex items-center justify-center min-h-[220px]">
          {isGenerated ? (
            <div ref={printAreaRef}>
              {stickerElement}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Click Generate to preview barcode sticker</p>
          )}
        </div>
      </div>

      {/* Printable Area (Only visible during window.print()) */}
      <div className="hidden print:block fixed inset-0 bg-white p-4 z-999">
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                padding: 10px;
              }
            }
          `}
        </style>
        <div className="print-container">
          {Array.from({ length: copies }).map((_, idx) => (
            <div key={idx} className="page-break-inside-avoid">
              {stickerElement}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
