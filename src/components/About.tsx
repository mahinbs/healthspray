import { Button } from "@/components/ui/button";
import { Zap, Heart, Cpu, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Advanced Formulations",
    description:
      "Scientifically developed products with cutting-edge ingredients for maximum performance and recovery.",
  },
  {
    icon: Heart,
    title: "Health & Performance",
    description:
      "Designed to enhance athletic performance, reduce injury risk, and accelerate recovery for optimal health.",
  },
  {
    icon: Cpu,
    title: "Smart Solutions",
    description:
      "Innovative products that adapt to your training needs and provide targeted relief when you need it most.",
  },
  {
    icon: Shield,
    title: "Safe & Tested",
    description:
      "Every product is rigorously tested and made with premium, safe ingredients for professional athletes.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                Where{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  science
                </span>{" "}
                meets performance
              </h2>
              <p className="text-lg text-muted-foreground">
                At Painssy, we've combined cutting-edge science with
                proven results to create a range of premium sports health products
                designed to enhance performance, accelerate recovery, and keep you
                moving at your best. Because your health isn't just important—it's essential.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.open('/about', '_blank')}
            >
              Learn More About Our Mission
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-card rounded-3xl p-8 border border-border shadow-soft">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">Quality & Innovation</h3>
                  <p className="text-muted-foreground">
                    Trusted by athletes and fitness enthusiasts across India
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">5k+</div>
                    <div className="text-sm text-muted-foreground">
                      Active Athletes
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">4.9★</div>
                    <div className="text-sm text-muted-foreground">
                      Average Rating
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">
                      Recovery Rate
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">
                      Expert Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
