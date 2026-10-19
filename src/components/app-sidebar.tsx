import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import logoLight from "../assets/images/logo/logo-light.jpeg";
import logoDark from "../assets/images/logo/logo.png";
import { Link, NavLink } from "react-router";
import { getSidebarItems } from "@/utils/getSidebarItems";
import { authApi, useLogoutMutation, useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { FiLogOut } from "react-icons/fi";
import { useAppDispatch } from "@/redux/hook";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useUserInfoQuery(undefined);
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    await logout(undefined);
    dispatch(authApi.util.resetApiState());
  };

  const data = {
    navMain: getSidebarItems(userData?.data?.role),
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link to="/" className="md:ml-5">
          {/* Logo for Light Mode (Hidden in Dark Mode) */}
          <img
            src={logoLight}
            alt="DropX Logo"
            width={200}
            height={100}
            className="w-32 block dark:hidden"
          />

          {/* Logo for Dark Mode (Hidden in Light Mode) */}
          <img
            src={logoDark}
            alt="DropX Logo"
            width={200}
            height={100}
            className="w-32 hidden  dark:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem className="py-1" key={subItem.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={subItem.url}
                        className={({ isActive }) =>
                          `group relative flex  items-center w-full px-4 py-3 rounded-xl font-medium overflow-hidden transition-all duration-300 ease-out ${isActive
                            ? "text-white shadow-black/5"
                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* 1. Animated Background Shape */}
                            {/* Slides in from the left when active, creating a smooth fill effect */}
                            <div
                              className={`absolute inset-0 bg-[linear-gradient(135deg,#4fc3ff_0%,#0c7ac3_100%)] rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] z-0 ${isActive ? "translate-x-0 scale-100" : "-translate-x-full scale-95 opacity-0"
                                }`}
                            />

                            {/* 2. Content Wrapper */}
                            {/* Needs relative & z-10 to sit on top of the absolute background */}
                            <div className={`relative z-10  flex items-center justify-between w-full ${isActive ? "text-white" : ""}`}>

                              {/* Left Side: Icon & Text */}
                              <div className="flex items-center gap-3">
                                {/* Icon with bounce/scale effect */}
                                {subItem.icon && (
                                  <span
                                    className={`w-5 h-5 transition-transform duration-300 flex items-center justify-center ${isActive
                                      ? "scale-110"
                                      : "group-hover:scale-110 group-hover:-rotate-3"
                                      }`}
                                  >
                                    <subItem.icon />
                                  </span>
                                )}

                                <span className="tracking-wide text-sm ">{subItem.title}</span>
                              </div>

                              {/* 3. Right Side: Vector Indicator */}
                              {/* A chevron that fades and slides in when active */}
                              <div
                                className={`flex items-center justify-center transition-all duration-400 ease-out ${isActive
                                  ? "opacity-100 translate-x-0"
                                  : "opacity-0 -translate-x-3"
                                  }`}
                              >
                                {/* If you are using Lucide React, import { ChevronRight } */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m9 18 6-6-6-6" />
                                </svg>
                              </div>

                            </div>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* --- 5. LOGOUT --- */}
      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
        <button
          onClick={handleSignOut}
          className="w-full cursor-pointer text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 hover:text-bold dark:bg-zinc-900 hover:text-red-600 transition-colors"
          role="menuitem"
          type="button"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
