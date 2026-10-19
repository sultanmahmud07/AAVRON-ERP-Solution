/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, UserMinus } from "lucide-react";
import { useGetAllUserQuery } from "@/redux/features/user/user.api";
import Loader from "@/pages/Spinner";

const UserCardForOverview = () => {
  const { data, isLoading } = useGetAllUserQuery(undefined);
    if(isLoading){
      return(<Loader></Loader>)
  }
const users = data?.data;
  const totalUsers = users.length;
  const verifiedUsers = users.filter((u: any) => u.isVerified).length;
  const unverifiedUsers = users.filter((u: any) => !u.isVerified).length;
  const blockedUsers = users.filter((u: any) => u.isActive === "BLOCKED").length;


  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Users</CardTitle>
            <Users className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Verified</CardTitle>
            <UserCheck className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{verifiedUsers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Unverified</CardTitle>
            <UserMinus className="h-6 w-6 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{unverifiedUsers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Blocked</CardTitle>
            <UserX className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{blockedUsers}</p>
          </CardContent>
        </Card>
      </div>
  );
};

export default UserCardForOverview;
