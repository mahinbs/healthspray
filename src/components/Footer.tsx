import { Facebook, Twitter, Instagram, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import zipptyLogo from "@/assets/zippty-logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      // Here you would typically send the email to your backend
      console.log("Subscribed:", email);
    }
  };
  const handleSocialClick = (platform: string) => {
    const socialLinks = {
      facebook: "https://www.facebook.com/share/19hGbSKx48/",
      twitter: "#",
      instagram: "https://www.instagram.com/zippty_official?igsh=MXR0d2RxNDM2ejd5Yg==",
      email: "#",
    };
    if (socialLinks[platform as keyof typeof socialLinks]) {
      // Open the actual social media links
      window.open(socialLinks[platform as keyof typeof socialLinks], "_blank");
    }
  };
  return (
    <footer className="bg-[#abd5ff] border-t text-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link to="/">
              <img
                src={zipptyLogo}
                alt="Zippty - Premium Pet Care"
                className="h-20 w-auto transition-transform duration-300 p-3 rounded"
              />
            </Link>
            <p className="text-slate-900 max-w-xs">
              The smarter way to shop for your pet. Cutting-edge technology
              meets irresistible fun.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSocialClick("facebook")}
                className="h-5 w-5 text-slate-900 hover:text-blue-800 cursor-pointer transition-all duration-300 hover:scale-110"
                title="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSocialClick("twitter")}
                className="h-5 w-5 text-slate-900 hover:text-blue-800 cursor-pointer transition-all duration-300 hover:scale-110"
                title="Twitter (Coming Soon)"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSocialClick("instagram")}
                className="h-5 w-5 text-slate-900 hover:text-pink-400 cursor-pointer transition-all duration-300 hover:scale-110"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSocialClick("email")}
                className="h-5 w-5 text-slate-900 hover:text-blue-800 cursor-pointer transition-all duration-300 hover:scale-110"
                title="Email (Coming Soon)"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 md:flex flex-col items-end">
            <div className="space-y-4">
              <h4 className="font-semibold">Products</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/shop"
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1"
                >
                  Interactive Robots
                </Link>

                <Link
                  to="/shop"
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1"
                >
                  Cat Toys
                </Link>
                <Link
                  to="/shop"
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1"
                >
                  Dog Toys
                </Link>
              </div>
            </div>
          </div>

          <div className="md:flex flex-col items-end">
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/contact"
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1"
                >
                  Contact Us
                </Link>
                <button
                  onClick={() => window.open("/shipping", "_blank")}
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1 text-left w-full"
                >
                  Shipping Info
                  <ExternalLink className="inline h-3 w-3 ml-1" />
                </button>
                <button
                  onClick={() => window.open("/returns", "_blank")}
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1 text-left w-full"
                >
                  Returns
                  <ExternalLink className="inline h-3 w-3 ml-1" />
                </button>
                <button
                  onClick={() => window.open("/warranty", "_blank")}
                  className="block text-slate-900 hover:text-blue-800 transition-all duration-300 hover:translate-x-1 text-left w-full"
                >
                  Warranty
                  <ExternalLink className="inline h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* <div className="space-y-4">
            <h4 className="font-semibold text-white">Newsletter</h4>
            <p className="text-sm text-slate-900">
              Get the latest updates on new products and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md text-sm transition-all duration-300 hover:scale-105"
              >
                {isSubscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
            {isSubscribed && (
              <p className="text-xs text-green-400 animate-pulse">
                ✓ Thank you for subscribing!
              </p>
            )}
          </div> */}
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-900">
          <p>
            &copy; {new Date().getFullYear()} Zippty. All rights reserved. Made
            with ❤️ for pet lovers everywhere.
          </p>
          <div className="mt-4 space-x-6">
            <Link
              to="/privacy"
              className="hover:text-blue-800 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-blue-800 transition-colors duration-300"
            >
              Terms of Service
            </Link>
            <Link
              to="/about"
              className="hover:text-blue-800 transition-colors duration-300"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
