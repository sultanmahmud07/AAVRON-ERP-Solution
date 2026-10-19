import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type PaginationProps = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const handlePageClick = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 my-6 pt-5">
      <button
        className="shadow-sm rounded p-2 py-3 bg-white border-[1px] border-[#E2E2E2]"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
        (page: number) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`shadow-sm rounded p-2 px-3 ${
              page === currentPage
                ? "bg-[#1BAE70] text-white"
                : "bg-white border-[1px] border-[#E2E2E2] text-black"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        className="shadow-sm rounded p-2 py-3 bg-white border-[1px] border-[#E2E2E2]"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;