/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useGetUserDetailsQuery } from "@/redux/features/user/user.api";
import Loader from "@/pages/Spinner";

const UserDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetUserDetailsQuery(id);

  if (isLoading) {
    return <Loader></Loader>;
  }

  const user = data;
  if (!user) {
    return <div className="text-center py-10">User not found</div>;
  }

  return (
    <div className="w-full md:max-w-3xl mx-auto md:p-6">
      <Card className="shadow-xl rounded-2xl border">
        {/* Header */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-2xl font-bold">User Details</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={user.isActive === "ACTIVE" ? "default" : "secondary"}>
              {user.isActive}
            </Badge>
            {!user.isVerified && <Badge variant="outline">Unverified</Badge>}
            {user.isDeleted && <Badge variant="destructive">Deleted</Badge>}
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-8">
          {/* User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{user.isActive}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Verified</p>
              <p className="font-medium">{user.isVerified ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deleted</p>
              <p className="font-medium">{user.isDeleted ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">
                {format(new Date(user.createdAt), "PPP p")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated At</p>
              <p className="font-medium">
                {format(new Date(user.updatedAt), "PPP p")}
              </p>
            </div>
          </div>

          {/* Auth Providers */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Authentication Providers</h3>
            <div className="space-y-2">
              {user.auths?.map((auth: any, i: number) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <span className="font-medium capitalize">{auth.provider}</span>
                  <span className="text-sm text-gray-600">
                    {auth.providerId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
