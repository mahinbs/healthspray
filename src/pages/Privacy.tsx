import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { Shield, Lock, Eye, Database } from "lucide-react";

const Privacy = () => {
  return (
    <Layout>
      
      
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-full">
                <Shield className="h-12 w-12 text-blue-400" />
              </Layout>
            </Layout>
            <h1 className="text-4xl md:text-6xl font-bold">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/90">
              Your privacy is important to us. Learn how we protect and handle your information.
            </p>
            <p className="text-sm text-white/70">
              Last updated: December 2024
            </p>
          </Layout>
        </Layout>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Introduction */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At Painssy, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
                website or use our services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </GlassCard>

            {/* Information We Collect */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <Database className="h-8 w-8 text-blue-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Information We Collect</h2>
              </Layout>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Name and contact information (email, phone number, address)</li>
                    <li>Payment and billing information</li>
                    <li>Account credentials and preferences</li>
                    <li>Communication history with our support team</li>
                  </ul>
                </Layout>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Website usage patterns and preferences</li>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </Layout>
              </Layout>
            </GlassCard>

            {/* How We Use Information */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <Eye className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">How We Use Your Information</h2>
              </Layout>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Service Provision</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Process and fulfill your orders</li>
                    <li>Provide customer support</li>
                    <li>Send order confirmations and updates</li>
                    <li>Manage your account and preferences</li>
                  </ul>
                </Layout>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Improvement & Communication</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Improve our products and services</li>
                    <li>Send marketing communications (with consent)</li>
                    <li>Analyze website usage and trends</li>
                    <li>Prevent fraud and ensure security</li>
                  </ul>
                </Layout>
              </Layout>
            </GlassCard>

            {/* Data Protection */}
            <GlassCard className="p-8">
              <div className="flex items-center mb-6">
                <Lock className="h-8 w-8 text-red-500 mr-3" />
                <h2 className="text-3xl font-bold text-primary">Data Protection & Security</h2>
              </Layout>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🔒</Layout>
                  <h4 className="font-semibold mb-2">Encryption</h4>
                  <p className="text-sm text-muted-foreground">All data is encrypted in transit and at rest</p>
                </Layout>
                
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🛡️</Layout>
                  <h4 className="font-semibold mb-2">Access Control</h4>
                  <p className="text-sm text-muted-foreground">Strict access controls and authentication</p>
                </Layout>
                
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl mb-2">📊</Layout>
                  <h4 className="font-semibold mb-2">Monitoring</h4>
                  <p className="text-sm text-muted-foreground">24/7 security monitoring and alerts</p>
                </Layout>
              </Layout>
            </GlassCard>

            {/* Your Rights */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Your Privacy Rights</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Access & Control</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Access your personal information</li>
                    <li>Update or correct your data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                  </ul>
                </Layout>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Data Portability</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Export your data in a portable format</li>
                    <li>Transfer your data to another service</li>
                    <li>Restrict processing of your data</li>
                    <li>Object to certain data processing</li>
                  </ul>
                </Layout>
              </Layout>
            </GlassCard>

            {/* Contact Information */}
            <GlassCard className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6 text-primary">Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-muted-foreground">privacy@physiq.com</p>
                </Layout>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-muted-foreground">+91 6367189188</p>
                </Layout>
                <div>
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-muted-foreground">123 Pet Street, Tech City, TC 12345</p>
                </Layout>
              </Layout>
            </GlassCard>
          </Layout>
        </Layout>
      </section>

      <Footer />
    </Layout>
  );
};

export default Privacy; 