import { Button } from "@/components/ui/button";
import {
      DropdownMenu,
      DropdownMenuItem,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import config from "@/config";
import { IProduct } from "@/types/product.type";
import { CopyIcon, Edit, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function ProductActionMenu({ product }: { product: IProduct }) {
      const navigate = useNavigate();

      const copyToClipboard = () => {
            // navigator.clipboard.writeText(`${window.location.origin}/product/view/${product.slug}`);
            navigator.clipboard.writeText(`${config.clientUrl}/products/${product.slug}`);
            toast.success("Product slug copied to clipboard!");
      };

      return (
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                              <MoreVertical size={16} />
                        </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => navigate(`/product/edit/${product.slug}`)}
                        >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Product</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={copyToClipboard}
                        >
                              <CopyIcon className="mr-2 h-4 w-4" />
                              <span>Copy Slug</span>
                        </DropdownMenuItem>
                  </DropdownMenuContent>
            </DropdownMenu>
      );
}