
import { Link } from "react-router";
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, ChevronRight } from "lucide-react"; // npm install lucide-react

import logoDark from "../../assets/images/logo/logo.png";   // Assuming this has white text

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    // Background: Dark Navy for a professional logistics look
    <footer className="bg-[#111827] text-white pt-20 pb-8 relative overflow-hidden">

      {/* Optional: Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FA4318] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="main-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* === Column 1: Brand Info === */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              {/* Since footer background is dark, we prefer the Light Mode logo (usually white text) 
                   or the Dark Mode logo depending on your asset naming. 
                   Here I force the White Text version. */}
              <img
                src={logoDark} // Assuming logoDark is the version with White text
                alt="DropX Logo"
                className="w-48"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience fast, secure, and affordable parcel services. From local documents to heavy international shipments, we ensure your deliveries reach on time.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[
                { icon: <Facebook size={18} />, link: "#" },
                { icon: <Twitter size={18} />, link: "#" },
                { icon: <Linkedin size={18} />, link: "#" },
                { icon: <Instagram size={18} />, link: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#FA4318] hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* === Column 2: Quick Links === */}
          <div>
            <h4 className="text-lg font-bold uppercase tracking-wider mb-6 border-b-2 border-[#FA4318] inline-block pb-1">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { name: "About Us", path: "/about" },
                { name: "Our Services", path: "/service/sea-transportation" },
                { name: "Pricing Plans", path: "/" },
                { name: "Delivery Team", path: "/privacy-policy" },
                { name: "Contact Us", path: "/contact" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#FA4318] hover:pl-2 transition-all duration-300 flex items-center gap-1 text-sm"
                  >
                    <ChevronRight size={14} className="text-[#FA4318]" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === Column 3: Services === */}
          <div>
            <h4 className="text-lg font-bold uppercase tracking-wider mb-6 border-b-2 border-[#FA4318] inline-block pb-1">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Sea Transport", path: "/service/sea-transportation" },
                { name: "Air Freight", path: "/service/air-transportation" },
                { name: "Warehousing", path: "/service/warehousing" },
                { name: "Help Center", path: "/help" },
                { name: "Privacy Policy", path: "/privacy-policy" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#FA4318] hover:pl-2 transition-all duration-300 flex items-center gap-1 text-sm"
                  >
                    <ChevronRight size={14} className="text-[#FA4318]" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === Column 4: Contact Info === */}
          <div>
            <h4 className="text-lg font-bold uppercase tracking-wider mb-6 border-b-2 border-[#FA4318] inline-block pb-1">
              Contact Us
            </h4>
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#FA4318]/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-[#FA4318]" />
                </div>
                <div>
                  <h6 className="font-bold text-white">Call Us</h6>
                  <p className="text-gray-400 text-sm mt-1 hover:text-[#FA4318] cursor-pointer transition-colors">
                    +880 132 735 7894
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#FA4318]/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-[#FA4318]" />
                </div>
                <div>
                  <h6 className="font-bold text-white">Email Us</h6>
                  <p className="text-gray-400 text-sm mt-1 hover:text-[#FA4318] cursor-pointer transition-colors">
                    dev.mrshimul@gmail.com
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#FA4318]/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#FA4318]" />
                </div>
                <div>
                  <h6 className="font-bold text-white">Visit Us</h6>
                  <p className="text-gray-400 text-sm mt-1">
                    Banani, Dhaka 1213, Bangladesh.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* === Bottom Bar === */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {currentYear} <span className="text-white font-bold">DropX</span>. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-[#FA4318] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#FA4318] transition-colors">Terms & Conditions</Link>
            <Link to="/sitemap" className="hover:text-[#FA4318] transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;