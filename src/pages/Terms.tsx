import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { FileText, Scale, AlertTriangle, CheckCircle } from "lucide-react";

const Terms = () => {
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
                <FileText className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">
              Terms of Service
            </h1>
            <p className="text-xl text-white/90">
              Please read these terms carefully before using our services.
            </p>
            <p className="text-sm text-white/70">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Introduction */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms of Service ("Terms") govern your use of the Zippty website and services. 
                By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you disagree with any part of these terms, you may not access our services.
              </p>
            </GlassCard>

            {/* Services Description */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Our Services</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Zippty provides premium pet care products and services, including:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Product Sales</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Interactive pet toys and accessories</li>
                    <li>Smart feeding solutions</li>
                    <li>Pet health monitoring devices</li>
                    <li>Premium pet care products</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Support Services</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Customer support and assistance</li>
                    <li>Product recommendations</li>
                    <li>Educational content and resources</li>
                    <li>Warranty and repair services</li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* User Accounts */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">User Accounts</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Account Creation</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    To access certain features of our services, you may be required to create an account. 
                    You are responsible for maintaining the confidentiality of your account information.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>You are responsible for all activities under your account</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Account Termination</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to terminate or suspend your account at any time for violations 
                    of these Terms or for any other reason at our sole discretion.
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Payment Terms */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-blue-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Payment & Billing</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Payment Methods</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We accept various payment methods including credit cards, debit cards, and digital wallets. 
                    All payments are processed securely through our payment partners.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-xl mb-2">💳</div>
                      <p className="text-sm">Credit/Debit Cards</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-xl mb-2">📱</div>
                      <p className="text-sm">Digital Wallets</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-xl mb-2">🏦</div>
                      <p className="text-sm">Bank Transfers</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Pricing & Taxes</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>All prices are listed in INR unless otherwise specified</li>
                    <li>Sales tax will be added where applicable</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Free shipping on all orders</li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Shipping Policy */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Shipping Policy</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Shipping Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Orders typically ship within 5-7 business days</li>
                    <li>Free shipping on all orders</li>
                    <li>Tracking information provided via email</li>
                    <li>International shipping available to select countries</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">No Return Policy</h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 font-medium mb-2">Important Notice:</p>
                    <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1">
                      <li>All sales are final once orders are placed</li>
                      <li>No returns, exchanges, or refunds are accepted</li>
                      <li>Please review your order carefully before confirming</li>
                      <li>Contact customer support for any issues with damaged or defective items</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Prohibited Uses */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Prohibited Uses</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                You agree not to use our services for any unlawful purpose or in any way that could damage, 
                disable, overburden, or impair our servers or networks.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Prohibited Activities</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Violating any applicable laws or regulations</li>
                    <li>Attempting to gain unauthorized access</li>
                    <li>Interfering with service functionality</li>
                    <li>Harassing or threatening other users</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Content Restrictions</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Posting false or misleading information</li>
                    <li>Sharing inappropriate or offensive content</li>
                    <li>Violating intellectual property rights</li>
                    <li>Spamming or excessive messaging</li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Limitation of Liability */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Limitation of Liability</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                To the maximum extent permitted by law, Zippty shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
              
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Important Notice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our total liability to you for any claims arising from these Terms or your use of our 
                  services shall not exceed the amount you paid to us in the 12 months preceding the claim.
                </p>
              </div>
            </GlassCard>

            {/* Contact Information */}
            <GlassCard className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6 text-primary">Questions & Support</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-muted-foreground">legal@zippty.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-muted-foreground">+91 6367189188</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-muted-foreground">123 Pet Street, Tech City, TC 12345</p>
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

export default Terms; 