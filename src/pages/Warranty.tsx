import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle } from "lucide-react";

const Warranty = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-full">
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">
              Product Quality & Safety
            </h1>
            <p className="text-xl text-white/90">
              We stand behind the quality and safety of our sports health products.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Quality Commitment */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Quality Commitment</h2>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-6 rounded-lg border border-green-500/30">
                <h3 className="text-xl font-semibold mb-3 text-green-400">Premium Sports Health Products</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All Painssy products are manufactured to the highest standards using premium, athlete-safe materials. 
                  We ensure every product meets our strict quality and safety criteria before shipping.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔧</div>
                    <p className="text-sm font-semibold">Quality Testing</p>
                    <p className="text-xs text-muted-foreground">Rigorous standards</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🛡️</div>
                    <p className="text-sm font-semibold">Safe Materials</p>
                    <p className="text-xs text-muted-foreground">Athlete-safe only</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📞</div>
                    <p className="text-sm font-semibold">Support</p>
                    <p className="text-xs text-muted-foreground">Always available</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Contact Information */}
            <GlassCard className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6 text-primary">Quality Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Our team is here to help with any product quality concerns:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-muted-foreground">quality@physiq.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-muted-foreground">+91 9876543210</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Live Chat</h4>
                  <p className="text-muted-foreground">Available 24/7</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Warranty;