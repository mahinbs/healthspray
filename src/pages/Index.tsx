import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Statistics from "@/components/Statistics";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProductShowcase />
        <About />
        <Testimonials />
        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
