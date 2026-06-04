import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const Returns = () => {
  return (
    <Layout>
      
      
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-full">
                <RotateCcw className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">
              Returns Policy
            </h1>
            <p className="text-xl text-white/90">
              Request a return after delivery within our return window. Refunds are processed after review.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Policy Overview */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <RotateCcw className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold text-primary">How returns work</h2>
              </div>
              
              <div className="bg-muted/30 p-6 rounded-lg border space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">When you can request a return:</strong> only after your order
                  is marked <strong>Delivered</strong> (not while it is paid, processing, or shipped).
                </p>
                <p>
                  <strong className="text-foreground">Time limit:</strong> a store-wide return window applies (set in
                  admin, typically 7 days from delivery). Some products may have a shorter window if configured.
                </p>
                <p>
                  <strong className="text-foreground">How to request:</strong> use{' '}
                  <Link to="/track-order" className="text-primary underline">Track Order</Link> with your order code
                  and checkout email, or open the order in your account if you are signed in.
                </p>
                <p>
                  <strong className="text-foreground">Refund:</strong> submitting a return request does not refund
                  automatically. Our team reviews it and processes the refund via the original payment method after
                  approval.
                </p>
                <p className="text-sm">
                  Hygiene products must be unopened unless damaged or incorrect. Contact support for damaged-on-arrival
                  cases.
                </p>
              </div>
            </GlassCard>

            {/* Quality Assurance */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-8 text-primary text-center">Quality Assurance</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-green-400">✅ What We Guarantee</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-3">
                    <li>High-quality, tested products</li>
                    <li>Products arrive in perfect condition</li>
                    <li>Accurate product descriptions</li>
                    <li>Safe materials for athletes</li>
                    <li>Products match advertised specifications</li>
                  </ul>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-blue-400">📞 Customer Support</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-3">
                    <li>Detailed product information provided</li>
                    <li>Product usage guidance</li>
                    <li>Technical support for smart products</li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Contact Information */}
            <GlassCard className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6 text-primary">Questions Before Purchase?</h2>
              <p className="text-muted-foreground mb-6">
                Our customer service team is here to help you make the right choice:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-muted-foreground">support@zippty.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-muted-foreground">+91 6367189188</p>
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
    </Layout>
  );
};

export default Returns;