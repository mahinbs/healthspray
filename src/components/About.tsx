import { Button } from "@/components/ui/button";
import { Zap, Heart, Cpu, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Science-Backed Formulations",
    description:
      "Developed through research-driven innovation to enhance endurance, support muscle health, and promote faster recovery.",
  },
  {
    icon: Heart,
    title: "Performance-Ready Care",
    description:
      "Targeted solutions that help reduce soreness, improve flexibility, and keep you active without compromise.",
  },
  {
    icon: Cpu,
    title: "Smart & Adaptive Solutions",
    description:
      "Designed to respond to your body’s needs — whether you’re training, recovering, or maintaining everyday strength.",
  },
  {
    icon: Shield,
    title: "Safe, Tested & Reliable",
    description:
      "Made with premium, skin-safe ingredients and tested for quality, stability, and long-term use.",
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
                <span className="text-[#ef4e23] font-bold">
                  Consistency
                </span>{" "}
                Fuels Performance
              </h2>
              <div className="text-lg text-muted-foreground space-y-4">
                <p>
                  At Physiq, we believe performance isn’t built in a single workout — it’s built through 
                  consistent recovery, care, and balance.
                </p>
                <p>
                  That’s why we created the R² philosophy — Recover & Recharge — a science-backed 
                  approach that helps your body bounce back faster, stay energized longer, and perform better 
                  every day.
                </p>
              </div>
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
              className="px-10 py-6"
            >
              Learn More About Our Mission
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-card rounded-3xl p-8 border border-border shadow-soft">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">Built on Science. Driven by Results</h3>
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
                    <div className="text-3xl font-bold text-primary">90%+</div>
                    <div className="text-sm text-muted-foreground">
                      Repeat Users
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
