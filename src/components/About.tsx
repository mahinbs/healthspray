import { Button } from "@/components/ui/button";
import { Zap, Heart, Cpu, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Smart Technology",
    description:
      "AI-powered toys that adapt to your pet's behavior and preferences for endless engagement.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Designed to promote physical activity and mental stimulation for optimal pet well-being.",
  },
  {
    icon: Cpu,
    title: "Interactive Features",
    description:
      "Smart toys that engage your pet's natural instincts and behaviors.",
  },
  {
    icon: Shield,
    title: "Pet-Safe Design",
    description:
      "Every product is rigorously tested and made with non-toxic, durable materials.",
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
                  technology
                </span>{" "}
                meets play
              </h2>
              <p className="text-lg text-muted-foreground">
                At Zippty, we've combined cutting-edge technology with
                irresistible fun to create a range of interactive toys and
                robots designed to engage, excite, and enrich your furry
                friend's life. Because playtime isn't just fun—it's essential.
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
                    Trusted by pet owners all over India
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">2k+</div>
                    <div className="text-sm text-muted-foreground">
                      Happy Pets
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
                      Satisfaction Rate
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">
                      Pet Support
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
