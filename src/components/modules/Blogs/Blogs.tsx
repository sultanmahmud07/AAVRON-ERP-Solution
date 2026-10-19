/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router";
import BlogCard from "./BlogCard";
import { IBlog } from "@/types/blog.type";
import { useGetAllBlogsQuery } from "@/redux/features/blog/blog.api";
import Loader from "@/pages/Spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
/* ================= COMPONENT ================= */

const Blogs: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder] = useState("");

  const { data, isLoading } = useGetAllBlogsQuery({ page: currentPage, limit, searchTerm, sort: sortOrder });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const totalPage = data?.meta?.totalPage || 1;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex py-1 px-3 justify-between items-center gap-2">
        <h1 className="text-xl font-bold">News</h1>
        <Input
          className="w-full sm:w-[250px] bg-gray-50 dark:bg-zinc-900"
          type="text"
          placeholder="Search news..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Link
          to="/new/create"
          className="text-white py-3 px-6 bg-primary font-bold rounded-lg"
        >
          + Add News
        </Link>
      </div>

      <div>
        <div className="my-5 grid grid-cols-3 gap-5 p-5 py-6 rounded-lg shadow">
          {data?.data?.map((blog: IBlog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPage > 1 && (
          <div className="flex justify-end mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPage }, (_, index) => index + 1).map(
                  (page) => (
                    <PaginationItem
                      key={page}
                      onClick={() => setCurrentPage(page)}
                    >
                      <PaginationLink
                        className="cursor-pointer"
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
                    className={
                      currentPage === totalPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;