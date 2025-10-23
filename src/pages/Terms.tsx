import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { FileText, Scale, AlertTriangle, CheckCircle } from "lucide-react";

const Terms = () => {
  return (
    <Layout>
      
      
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
                These Terms of Service ("Terms") govern your use of the Physiq sports health platform and services. 
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
                Physiq provides premium sports health products and services, including:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Product Sales</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Recovery gels and pain relief products</li>
                    <li>Compression wear and performance apparel</li>
                    <li>Warm-up and cooldown solutions</li>
                    <li>Sports injury prevention products</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Support Services</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Expert sports health consultation</li>
                    <li>Personalized product recommendations</li>
                    <li>Educational content and training resources</li>
                    <li>Warranty and product support services</li>
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
                    <li>Orders typically ship within 3-5 business days</li>
                    <li>Free shipping on all orders over ₹500</li>
                    <li>Tracking information provided via email and SMS</li>
                    <li>Express delivery available for urgent recovery needs</li>
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
                      <li>Contact customer support for any issues with damaged or defective sports health products</li>
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

            {/* Sports Health Product Usage */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Sports Health Product Usage</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-orange-800 dark:text-orange-200">Important Safety Notice</h3>
                  <p className="text-orange-700 dark:text-orange-300 leading-relaxed mb-4">
                    Our sports health products are designed for athletic performance and recovery. 
                    Please use them responsibly and in accordance with the provided instructions.
                  </p>
                  <ul className="list-disc list-inside text-orange-700 dark:text-orange-300 space-y-2">
                    <li>Always read and follow product instructions carefully</li>
                    <li>Consult with a healthcare professional before use if you have medical conditions</li>
                    <li>Discontinue use if you experience any adverse reactions</li>
                    <li>Keep products out of reach of children</li>
                    <li>Store products in a cool, dry place as directed</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Product Recommendations</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    While we provide expert guidance and product recommendations, you are responsible for:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Choosing products appropriate for your fitness level and goals</li>
                    <li>Following proper application and usage instructions</li>
                    <li>Monitoring your body's response to products</li>
                    <li>Seeking professional medical advice when needed</li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Limitation of Liability */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Limitation of Liability</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                To the maximum extent permitted by law, Physiq shall not be liable for any indirect, 
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
                  <p className="text-muted-foreground">legal@physiq.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-muted-foreground">+91 9876543210</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-muted-foreground">123 Sports Health Plaza, Fitness District, Mumbai, Maharashtra -400001</p>
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

export default Terms; 