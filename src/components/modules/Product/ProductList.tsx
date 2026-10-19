import { useState } from "react";
import { Link } from "react-router";
import { EyeIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from "@/components/ui/table";
import {
      Pagination,
      PaginationContent,
      PaginationItem,
      PaginationLink,
      PaginationNext,
      PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductTableSkeleton from "../loader/Product/TableSkeleton";

// Import the separated Action Menu component (Adjust path if needed)
import { ProductActionMenu } from "./ProductActionMenu";

// Redux hooks and Types
import { useGetAllProductsQuery, useRemoveProductMutation } from "@/redux/features/product/product.api";
import { IProduct } from "@/types/product.type"; // Adjust path if needed
import { formatDate } from "@/utils/getDateFormater";


export default function ProductList() {
      const [currentPage, setCurrentPage] = useState(1);
      const [limit] = useState(10);
      const [searchTerm, setSearchTerm] = useState("");
      const [sortOrder, setSortOrder] = useState("");

      const { data, isLoading } = useGetAllProductsQuery({ page: currentPage, limit, searchTerm, sort: sortOrder });
      const [removeProduct] = useRemoveProductMutation();

      const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
      };

      const handleSortChange = (value: string) => {
            setSortOrder(value);
      };

      const handleRemoveProduct = async (productId: string) => {
            const toastId = toast.loading("Removing product...");
            try {
                  const res = await removeProduct(productId).unwrap();
                  if (res.success) {
                        toast.success("Product removed successfully!");
                        toast.dismiss(toastId);
                  }
            } catch (err) {
                  toast.dismiss(toastId);
                  console.error(err);
                  toast.error("Failed to remove product");
            }
      };

      const totalPage = data?.meta?.totalPage || 1;

      return (
            <div className="w-full ">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold">All Products</h1>
                        <Input
                              className="w-full md:w-sm"
                              type="text"
                              placeholder="Search products..."
                              value={searchTerm}
                              onChange={handleSearchChange}
                        />
                        <Select onValueChange={handleSortChange} value={sortOrder}>
                              <SelectTrigger className="md:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectGroup>
                                          <SelectLabel>Order By</SelectLabel>
                                          <SelectItem value="-createdAt">Newest First</SelectItem>
                                          <SelectItem value="createdAt">Oldest First</SelectItem>
                                          <SelectItem value="basePrice">Price: Low to High</SelectItem>
                                          <SelectItem value="-basePrice">Price: High to Low</SelectItem>
                                    </SelectGroup>
                              </SelectContent>
                        </Select>
                  </div>

                  {isLoading ? (
                        <ProductTableSkeleton />
                  ) : (
                        <Table>
                              <TableHeader>
                                    <TableRow>
                                          <TableHead>Image</TableHead>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Slug</TableHead>
                                          <TableHead>Base Price</TableHead>
                                          <TableHead>Date Added</TableHead>
                                          <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                              </TableHeader>
                              <TableBody>
                                    {data?.data?.map((product: IProduct) => (
                                          <TableRow key={product._id}>
                                                <TableCell>
                                                      {product.images && product.images.length > 0 ? (
                                                            <img
                                                                  src={product.images[0]}
                                                                  alt={product.name}
                                                                  className="w-12 h-12 rounded-md object-cover border"
                                                            />
                                                      ) : (
                                                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                                                                  No Img
                                                            </div>
                                                      )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                      {product.name.length > 30
                                                            ? product.name.slice(0, 30) + "..."
                                                            : product.name}
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-sm">{product.slug}</TableCell>
                                                <TableCell className="font-semibold">${product.basePrice.toFixed(2)}</TableCell>
                                                <TableCell>{formatDate(product.createdAt)}</TableCell>
                                                <TableCell className="flex justify-end items-center gap-2">
                                                      <Link to={`/product/view/${product.slug}`}>
                                                            <Button size="icon" variant="outline" title="View Details">
                                                                  <EyeIcon size={16} />
                                                            </Button>
                                                      </Link>
                                                      <DeleteConfirmation
                                                            onConfirm={() => handleRemoveProduct(product._id || "")}
                                                      >
                                                            <Button size="icon" variant="destructive" title="Delete Product">
                                                                  <Trash2 size={16} />
                                                            </Button>
                                                      </DeleteConfirmation>

                                                      <ProductActionMenu product={product} />
                                                </TableCell>
                                          </TableRow>
                                    ))}
                              </TableBody>
                        </Table>
                  )}

                  {totalPage > 1 && (
                        <div className="flex justify-end mt-4">
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
                                          {Array.from({ length: totalPage }, (_, index) => index + 1).map((page) => (
                                                <PaginationItem
                                                      key={page}
                                                      onClick={() => setCurrentPage(page)}
                                                >
                                                      <PaginationLink className="cursor-pointer" isActive={currentPage === page}>
                                                            {page}
                                                      </PaginationLink>
                                                </PaginationItem>
                                          ))}
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
      );
}