import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Package,
  X,
  Heart,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import zipptyLogo from "@/assets/zippty-logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();
  const { state: wishlistState } = useWishlist();
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full backdrop-blur-3xl border-b border-slate-800/50 sticky top-0 z-50 bg-white/20">
        <GlassCard
          intensity="heavy"
          className="border-0 border-b border-slate-800/50 rounded-none backdrop-blur-xl shadow-lg"
        >
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/">
                <img
                  src={zipptyLogo}
                  alt="Zippty - Premium Pet Care"
                  className="h-12 w-auto transition-transform duration-300 hover:scale-105 cursor-pointer"
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              <Link
                to="/"
                className={`hover:text-blue-500 transition-all duration-300 font-medium text-lg relative group ${
                  isActive("/") ? "text-blue-500" : ""
                }`}
              >
                Home
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ${
                    isActive("/") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
              <Link
                to="/shop"
                className={`hover:text-blue-500 transition-all duration-300 font-medium text-lg relative group ${
                  isActive("/shop") ? "text-blue-500" : ""
                }`}
              >
                Products
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ${
                    isActive("/shop") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
              <Link
                to="/about"
                className={`hover:text-blue-500 transition-all duration-300 font-medium text-lg relative group ${
                  isActive("/about") ? "text-blue-500" : ""
                }`}
              >
                About
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ${
                    isActive("/about") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
              <Link
                to="/contact"
                className={`hover:text-blue-500 transition-all duration-300 font-medium text-lg relative group ${
                  isActive("/contact") ? "text-blue-500" : ""
                }`}
              >
                Contact
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ${
                    isActive("/contact") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/wishlist")}
                className="sm:flex hidden relative bg-slate-200/50 hover:bg-slate-300/50 backdrop-blur-md border border-slate-700/50 rounded-full h-12 w-12 hover:text-red-400"
              >
                <Heart className="h-6 w-6" />
                {wishlistState.count > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full text-xs text-white flex items-center justify-center animate-bounce">
                    {wishlistState.count > 99 ? "99+" : wishlistState.count}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/cart")}
                className="relative bg-slate-200/50 hover:bg-slate-300/50 backdrop-blur-md border border-slate-700/50 rounded-full h-12 w-12 hover:text-blue-500"
              >
                <ShoppingCart className="h-6 w-6" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-xs text-white flex items-center justify-center animate-bounce">
                    {state.itemCount > 99 ? "99+" : state.itemCount}
                  </span>
                )}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-slate-200/50 hover:bg-slate-300/50 backdrop-blur-md border border-slate-700/50 rounded-full h-12 w-12 hover:text-blue-500"
                    >
                      <User className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">
                        {user.user_metadata?.name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/cart")}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Cart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAuthClick("login")}
                    className="bg-slate-200/50 hover:bg-slate-300/50 backdrop-blur-md border border-slate-700/50 text-slate-800 hover:text-blue-500"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => handleAuthClick("register")}
                    className="md:block hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden bg-slate-200/50 hover:bg-slate-300/50 backdrop-blur-md border border-slate-700/50 rounded-full h-12 w-12 hover:text-blue-500"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </GlassCard>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authMode}
        />
      </header>

      {/* Mobile Menu Offcanvas */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-500 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-500 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleMobileMenuClose}
        />

        {/* Offcanvas Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl border-l border-slate-200/50 shadow-2xl transform transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
            <img src={zipptyLogo} alt="Zippty" className="h-8 w-auto" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileMenuClose}
              className="rounded-full h-10 w-10 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="p-6 space-y-6">
            <div
              onClick={() => handleMobileNavClick("/")}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                isActive("/")
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50"
                  : "hover:bg-slate-100/50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive("/") ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
              <span className="font-medium text-lg">Home</span>
            </div>

            <div
              onClick={() => handleMobileNavClick("/shop")}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                isActive("/shop")
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50"
                  : "hover:bg-slate-100/50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive("/shop") ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
              <span className="font-medium text-lg">Products</span>
            </div>

            <div
              onClick={() => handleMobileNavClick("/about")}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                isActive("/about")
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50"
                  : "hover:bg-slate-100/50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive("/about") ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
              <span className="font-medium text-lg">About</span>
            </div>

            <div
              onClick={() => handleMobileNavClick("/contact")}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                isActive("/contact")
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50"
                  : "hover:bg-slate-100/50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive("/contact") ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
              <span className="font-medium text-lg">Contact</span>
            </div>
          </nav>

          {/* User Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200/50 bg-gradient-to-t from-slate-50/50 to-transparent">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-100/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.user_metadata?.name?.charAt(0) ||
                      user.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {user.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/cart");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Cart ({state.itemCount})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/wishlist");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/orders");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    handleAuthClick("login");
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    handleAuthClick("register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Header;
