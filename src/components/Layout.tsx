import Header from "@/components/Header";
import PromotionalBanner from "@/components/PromotionalBanner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionalBanner />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
