import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-sports-health-bg.webp";
import logo from "../assets/physiq-final-logo-new.png";

const Contact = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-hero overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <img
              src={logo}
              alt="Physiq"
              className="w-28 mx-auto object-contain"
            />
            <h2 className="text-2xl md:text-3xl">
              Ready to elevate your performance?
            </h2>
            <p className="text-lg text-white/90">
              Get in touch with us for any questions about our sports health
              and recovery products.
            </p>
            <Link to="/shop">
              <Button variant="hero" size="lg" className="px-10 py-6 border-2 border-white/90 rounded-xl">
                Shop Now →
              </Button>
            </Link>
            <div className="text-white/80">Professional-grade sports health solutions</div>
          </div>
        </div>
      </section>

      {/* Contact Information and Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                Get in{" "}
                <span className="text-[#ef4e23] font-bold">
                  touch with us
                </span>
              </h2>
              <p className="text-muted-foreground">
                Contact us for any questions about our sports health products,
                recovery solutions, and performance enhancement services.
              </p>
            </div>

            <div className="">
              {/* Contact Information */}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-soft space-y-6">
                <h3 className="text-2xl font-bold">Contact Information</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Address</h4>
                      <p className="text-muted-foreground">
                        123 Sports Health Plaza, Fitness District, Mumbai, Maharashtra -400001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="text-muted-foreground">info@physiq.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phone</h4>
                      <p className="text-muted-foreground">+91 9876543210</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Business Hours</h4>
                      <p className="text-muted-foreground">
                        Mon - Fri: 10AM - 10PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
};

export default Contact;
