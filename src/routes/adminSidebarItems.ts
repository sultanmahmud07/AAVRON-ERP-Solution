
import AllAdminList from "@/components/modules/User/AllAdmins";
import { ISidebarItem } from "@/types";
import {
  BarChart3,
  Shield,
  User,
  HousePlus,
  Calendar1,
  MapPinHouse,
  PhoneCall,
} from "lucide-react";
import Analytics from "@/pages/Analytics/Analytics";
import MyProfile from "@/pages/Profile/MyProfile";
import AvailabilitiesList from "@/components/modules/Availability/AvalabilityList";
import ManageAvailability from "@/components/modules/Availability/ManageAvailability";
import AllInspectionList from "@/components/modules/Inspection/inspections";
import FollowUpList from "@/components/modules/Inspection/FollowUpList";


export const adminSidebarItems: ISidebarItem[] = [
  {
    title: "Inspection Management",
    items: [
      {
        title: "Analytics",
        url: "/analytics",
        component: Analytics,
        icon: BarChart3,
      },
      {
        title: "Follow-ups / Leads",
        url: "/follow-ups",
        component: FollowUpList,
        icon: PhoneCall,
      },
      {
        title: "Inspections",
        url: "/inspection-requests",
        component: AllInspectionList,
        icon: HousePlus,
      },
      {
        title: "Locations",
        url: "/available-locations",
        component: AvailabilitiesList,
        icon: MapPinHouse,
      }, 
      {
        title: "Availabilities",
        url: "/availabilities",
        component: ManageAvailability,
        icon: Calendar1,
      }, 
    ],
  },
  {
    title: "Access Management",
    items: [
      {
        title: "Profile",
        url: "/profile",
        component: MyProfile,
        icon: User,
      },
      {
        title: "Admins",
        url: "/admin",
        component: AllAdminList,
        icon: Shield,
      },
    ],
  },
];
