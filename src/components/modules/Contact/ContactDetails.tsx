import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/getDateFormater";
import Loader from "@/pages/Spinner";
import { 
  ArrowLeft, 
  CalendarDays, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  Package,
  ExternalLink
} from "lucide-react";
import { useGetContactDetailsQuery } from "@/redux/features/contact/contact.api";

// Assuming you have IProduct imported
import { IProduct } from "@/types/product.type"; 

const ContactDetails = () => {
  const { id } = useParams();
  const { data: responseData, isLoading } = useGetContactDetailsQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  // Extract the actual contact data from the nested response
  // Adjust this based on how your RTK Query endpoint returns the data (e.g., responseData?.data)
  const contact = responseData?.data || responseData; 
  
  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Inquiry not found</p>
        <Link to="/contact">
          <Button variant="outline" className="dark:border-zinc-700 dark:hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inquiries
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-5">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/contact" 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inquiries
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <CalendarDays className="w-4 h-4" />
          {formatDate(contact.createdAt)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* ================= LEFT COLUMN: MESSAGE & PRODUCTS ================= */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Main Message Card */}
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <MessageSquare className="w-5 h-5 text-[#1BAE70]" /> 
                  Inquiry Message
                </CardTitle>
                <Badge 
                  className={`px-3 py-1 text-xs border-0 ${
                    contact.inquiryType === "PRODUCT" 
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100" 
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100"
                  }`}
                >
                  {contact.inquiryType === "PRODUCT" ? "Product Inquiry" : "General Inquiry"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                {contact.message}
              </p>
            </CardContent>
          </Card>

          {/* Associated Products Card (Only shows if there are products) */}
          {contact.products && contact.products.length > 0 && (
            <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
              <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Package className="w-5 h-5 text-gray-400" /> 
                  Requested Products ({contact.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  {contact.products.map((product: IProduct) => (
                    <div key={product._id} className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                      
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 bg-white dark:bg-zinc-900">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
                            <Package className="w-6 h-6 text-gray-300 dark:text-zinc-600" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                          ${product.basePrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>

                      {/* Action Link */}
                      <Link to={`/product/view/${product.slug}`}>
                        <Button variant="outline" size="sm" className="flex-shrink-0 dark:border-zinc-700 cursor-pointer dark:hover:bg-zinc-800">
                          View <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ================= RIGHT COLUMN: SENDER DETAILS ================= */}
        <div className="space-y-6 lg:space-y-8">
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl sticky top-6 bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Sender Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Name */}
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                  <a 
                    href={`mailto:${contact.email}`} 
                    className="font-semibold text-[#1BAE70] hover:text-[#16965f] dark:text-[#25d38a] hover:underline break-all transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  {contact.phone ? (
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="font-semibold text-gray-900 dark:text-white hover:text-[#1BAE70] dark:hover:text-[#1BAE70] transition-colors"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-zinc-600 italic font-medium">Not provided</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ContactDetails;