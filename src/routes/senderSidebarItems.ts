import CreateParcel from "@/pages/Sender/CreateParcel";
import MyProfile from "@/pages/Sender/MyProfile";
import Overview from "@/pages/Sender/Overview";
import Parcels from "@/pages/Sender/Parcels";
import { ISidebarItem } from "@/types";
import { LayoutDashboard, Package, PlusSquare, User } from "lucide-react";

export const senderSidebarItems: ISidebarItem[] = [
  {
    title: "History",
    items: [
      {
        title: "Overview",
        url: "/sender/overview",
        component: Overview,
        icon: LayoutDashboard,
      },
      {
        title: "My Parcels",
        url: "/sender/parcels",
        component: Parcels,
        icon: Package,
      },
      {
        title: "Add Listing",
        url: "/sender/parcel/create",
        component: CreateParcel,
        icon: PlusSquare,
      },
    ],
  },
  {
    title: "Manage",
    items: [
      {
        title: "My Profile",
        url: "/sender/profile",
        component: MyProfile,
        icon: User,
      },
    ],
  },
];
