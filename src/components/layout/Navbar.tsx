
import React, { useEffect, useState } from "react";
import logoLight from "../../assets/images/logo/logo.png";
import logoDark from "../../assets/images/logo/logo.png";
import { Link, NavLink } from "react-router";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { ModeToggle } from "./ModeToggler";
import { Button } from "../ui/button";
import { FaFacebookF, FaLinkedinIn, FaPhone, FaYoutube } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import UserProfileMenu from "./UserProfileMenu";

const Navbar = () => {
  const [navToggle, setNavToggle] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { data } = useUserInfoQuery(undefined);
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);


    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigationLinks = [
    { href: "/", label: "Home", role: "PUBLIC" },
    { href: "/about", label: "About", role: "PUBLIC" },
    { href: "/team", label: "Our Team", role: "PUBLIC" },
    { href: "/track", label: "Tracking", role: "PUBLIC" },
    { href: "/faq", label: "FAQ", role: "PUBLIC" },
    { href: "/contact", label: "Contact Us", role: "PUBLIC" },
    // { href: "/admin", label: "Dashboard", role: role.admin },
    // { href: "/admin", label: "Dashboard", role: role.superAdmin },
    // { href: "/sender", label: "Dashboard", role: role.sender },
    // { href: "/receiver", label: "Dashboard", role: role.receiver },
  ];

  return (
    <header>
      <nav className={`z-50  fixed top-[-5px] left-0 right-0 w-full py-2 lg:py-1 ${isSticky ? "border-b bg-background" : "bg-background"}`}>
        <div className={`nav_top  bg-[#111827] py-2 ${isSticky ? " hidden" : "hidden md:block"}`}>
          <div className="main-container flex items-center justify-between">
            <div className="email_and_number flex items-center gap-8">
              <p className="flex items-center gap-2 text-primary">
                <span><FaPhone /></span>
                <span className="text-white">+88 01327-357894</span>
              </p>
              <p className="flex items-center gap-2 text-primary">
                <span className="text-xl"><MdOutlineEmail /></span>
                <span className="text-white">dev.mrshimul@gmail.com</span>
              </p>
            </div>
            <div className="social_media_link">
              <div className="flex items-center gap-3">
                <span>Follow Us:</span>
                <a href="https://www.facebook.com/joltorongo.awt" className="flex items-center justify-center transition text-primary text-base">
                  <FaFacebookF />
                </a>
                <a href="https://www.instagram.com/jol.torongo.coxbazar" className="flex items-center justify-center transition text-primary text-base">
                  <IoLogoInstagram />
                </a>
                <a href="https://www.linkedin.com/company/joltorongo" className="flex items-center justify-center transition text-primary text-base">
                  <FaLinkedinIn />
                </a>
                <a
                  href="https://www.youtube.com/@JoltorongoAWT"
                  className="flex items-center justify-center transition text-primary text-base"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={`main-container flex justify-between items-center`}>
          {/* Logo side here >>>>>>>>>>>>>>>> */}
          <div className="nav_logo_side">
            <Link className="flex flex-col items-center" to="/">

              {/* Logo for Light Mode (Hidden in Dark Mode) */}
              <img
                src={logoLight}
                alt="DropX Logo"
                width={200}
                height={100}
                className="w-40 block dark:hidden"
              />

              {/* Logo for Dark Mode (Hidden in Light Mode) */}
              <img
                src={logoDark}
                alt="DropX Logo"
                width={200}
                height={100}
                className="w-40 hidden dark:block"
              />

            </Link>
          </div>
          {/* NAv manu side here >>>>>>>>>>>>>>>> */}
          <div className={`absolute ${navToggle ? "left-0" : "left-[-120%] w-1/2 "
            } top-[5.2rem] flex w-full shadow md:shadow-none flex-col py-2 transition-all duration-300  lg:static lg:w-[unset] lg:flex-row  bg-background lg:bg-transparent lg:pb-0 lg:pt-0 `}
          >
            <ul className="capitalize flex pb-20 md:pb-0 pl-10 md:pl-0 flex-col lg:flex-row items-start md:items-center justify-center gap-5 md:gap-3 px-1">
              {
                navigationLinks.map((link, index) => {
                  return (
                    <React.Fragment key={index}>
                      {
                        link.role === "PUBLIC" && (
                          <li className=" md:mx-2 py-2 lg:py-6 relative">
                            <NavLink
                              onClick={() => setNavToggle(false)}
                              to={link.href}
                              className={`flex font-semibold transition capitalize text-sm md:text-base items-center gap-2  hover:text-primary`}
                            >
                              {link.label}
                            </NavLink>
                          </li>
                        )
                      }
                      {
                        link.role === data?.data?.role && (
                          <li className=" md:mx-2 py-2 lg:py-6 relative">
                            <NavLink
                              onClick={() => setNavToggle(false)}
                              to={link.href}
                              className={`flex font-semibold transition uppercase text-sm items-center gap-2  hover:text-primary`}
                            >
                              {link.label}
                            </NavLink>
                          </li>
                        )
                      }
                    </React.Fragment>
                  )
                })}
            </ul>
          </div>
          {/* Right side here >>>>>>>>>>>>>>>> */}
          <div className="nav_right_side hidden lg:block ">
            <div className="flex justify-end items-center gap-2">
              <ModeToggle />
              {data?.data?.email && (
                <UserProfileMenu userInfo={data.data} />
              )}
              {!data?.data?.email && (
                <Button asChild className="text-sm md:text-base px-3 md:px-6">
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
          {/* Right toggle bar for mobile  */}
          {/* Mobile Toggle Button */}
          <div className="lg:hidden">
            <div className="flex justify-end items-center gap-2">
              <ModeToggle />
              {data?.data?.email && (
                <UserProfileMenu userInfo={data?.data} />
              )}
              {!data?.data?.email && (
                <Button asChild className="text-sm md:text-base px-3 md:px-6">
                  <Link to="/login">Login</Link>
                </Button>
              )}

              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={navToggle}
                  onChange={() => setNavToggle((prev) => !prev)}
                />
                {navToggle ? (
                  <svg
                    className="fill-current text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 512 512"
                  >
                    <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                  </svg>
                ) : (
                  <svg
                    className="fill-current text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 512 512"
                  >
                    <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                  </svg>
                )}
              </label>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
