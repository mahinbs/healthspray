import { Facebook, Twitter, Instagram, Mail, ExternalLink, MapPin, Phone, Clock, ArrowRight, Heart, Shield, Award, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import painssyLogo from "@/assets/painssy-logo-new.png";

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
      facebook: "https://www.facebook.com/painssy",
      twitter: "https://www.twitter.com/painssy",
      instagram: "https://www.instagram.com/painssy",
      email: "mailto:contact@painssy.com",
    };
    if (socialLinks[platform as keyof typeof socialLinks]) {
      // Open the actual social media links
      window.open(socialLinks[platform as keyof typeof socialLinks], "_blank");
    }
  };
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <div className="absolute inset-0 bg-muted/10 backdrop-blur-3xl" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-accent rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
            
            {/* Company Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Link to="/" className="inline-block">
                  <img
                    src={painssyLogo}
                    alt="Painssy - Premium Sports Health"
                    className="h-16 w-auto transition-transform duration-300 hover:scale-105"
                  />
                </Link>
                <p className="text-slate-300 leading-relaxed max-w-sm">
                  The smarter way to shop for sports health. Cutting-edge science
                  meets peak performance for athletes worldwide.
                </p>
              </div>
              
              {/* Social Media */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Follow Us</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleSocialClick("facebook")}
                    className="p-3 bg-white/10 hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md border border-white/20"
                    title="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSocialClick("twitter")}
                    className="p-3 bg-white/10 hover:bg-blue-400 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md border border-white/20"
                    title="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSocialClick("instagram")}
                    className="p-3 bg-white/10 hover:bg-pink-500 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md border border-white/20"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSocialClick("email")}
                    className="p-3 bg-white/10 hover:bg-red-500 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md border border-white/20"
                    title="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Products</h4>
              <div className="space-y-3">
                <Link
                  to="/shop"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Pain Relief
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Recovery Products
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Compression Wear
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Warm-up Products
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Support</h4>
              <div className="space-y-3">
                <Link
                  to="/contact"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Contact Us
                </Link>
                <button
                  onClick={() => window.open("/shipping", "_blank")}
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group w-full text-left"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Shipping Info
                  <ExternalLink className="h-3 w-3 ml-2" />
                </button>
                <button
                  onClick={() => window.open("/warranty", "_blank")}
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group w-full text-left"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Warranty
                  <ExternalLink className="h-3 w-3 ml-2" />
                </button>
                <Link
                  to="/terms"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                >
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Newsletter & Contact */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
              
              {/* Newsletter */}
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  Get the latest updates on new products and exclusive offers.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-md"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-glow text-white border-0 transition-all duration-300 hover:scale-105"
                  >
                    {isSubscribed ? "Subscribed!" : "Subscribe"}
                  </Button>
                </form>
                {isSubscribed && (
                  <p className="text-green-400 text-sm animate-pulse">
                    ✓ Thank you for subscribing!
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-white/20">
                <div className="flex items-center text-slate-300">
                  <MapPin className="h-4 w-4 mr-3 text-blue-400" />
                  <span className="text-sm">Mumbai, Maharashtra</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Phone className="h-4 w-4 mr-3 text-blue-400" />
                  <span className="text-sm">+91 9876543210</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Clock className="h-4 w-4 mr-3 text-blue-400" />
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <div className="grid md:grid-cols-3 gap-8">
              <GlassCard className="p-6 text-center" intensity="light">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h5 className="font-semibold mb-2">Secure & Safe</h5>
                <p className="text-sm text-slate-300">Your data and payments are protected</p>
              </GlassCard>
              <GlassCard className="p-6 text-center" intensity="light">
                <Award className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h5 className="font-semibold mb-2">Premium Quality</h5>
                <p className="text-sm text-slate-300">Professional-grade sports health products</p>
              </GlassCard>
              <GlassCard className="p-6 text-center" intensity="light">
                <Zap className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h5 className="font-semibold mb-2">Fast Delivery</h5>
                <p className="text-sm text-slate-300">Quick shipping for urgent recovery needs</p>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-slate-300 text-sm">
                  &copy; {new Date().getFullYear()} Painssy. All rights reserved. Made
                  with <Heart className="inline h-4 w-4 text-red-500" /> for athletes and fitness enthusiasts everywhere.
                </p>
              </div>
              <div className="flex space-x-6">
                <Link
                  to="/privacy"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
