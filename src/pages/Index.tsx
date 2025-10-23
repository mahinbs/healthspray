import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import CategoryShowcase from "@/components/CategoryShowcase";
import ConcernShowcase from "@/components/ConcernShowcase";
import ShopByVideo from "@/components/ShopByVideo";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Statistics from "@/components/Statistics";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <ProductShowcase />
      <CategoryShowcase />
      <ConcernShowcase />
      <ShopByVideo />
      <About />
      <Testimonials />
      <Statistics />
      <BlogSection />
      <Footer />
    </Layout>
  );
};

export default Index;
