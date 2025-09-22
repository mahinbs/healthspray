import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Zap,
  Heart,
  Cpu,
  Shield,
  Award,
  Users,
  Clock,
  Star,
} from "lucide-react";
import heroImage from "@/assets/hero-sports-health-bg.webp";
import aboutTeam from "@/assets/about-sports-team.jpg";
import aboutStore from "@/assets/about-sports-facility.jpg";
import aboutAthletesTraining from "@/assets/about-athletes-training.jpg";
import aboutRecoveryProducts from "@/assets/about-recovery-products.jpg";
import aboutCompressionWear from "@/assets/about-compression-wear.jpg";
import aboutSportsInjury from "@/assets/about-sports-injury.jpg";
import aboutWarmupCooldown from "@/assets/about-warmup-cooldown.jpg";
import logo from "../assets/physiq-final-logo-new.png";

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We specialize in high-quality sports health products that help athletes recover faster, perform better, and stay injury-free.",
  },
  {
    icon: Shield,
    title: "Athlete-Safe Materials",
    description:
      "We believe athletes deserve only the safest, most effective products. That's why we offer sports health solutions from trusted brands you can rely on.",
  },
  {
    icon: Zap,
    title: "For Every Athlete",
    description:
      "Whether you're a professional athlete, weekend warrior, or fitness enthusiast, we have the perfect recovery and performance solutions for your needs.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description:
      "Finding the right sports health products has never been easier. Our team of experts provides personalized recommendations for your specific needs.",
  },
];
const services = [
  {
    icon: Clock,
    title: "Fast Recovery",
    description:
      "Fast, reliable shipping so you can get your sports health products right when you need them for training and recovery.",
  },
  {
    icon: Star,
    title: "Expert Advice",
    description:
      "We offer the guidance and resources you need to optimize your athletic performance and recovery.",
  },
  {
    icon: Heart,
    title: "Affordable Quality",
    description:
      "Premium sports health products at competitive prices, ensuring you get the best performance without breaking the bank.",
  },
];
const stats = [
  {
    number: "5k+",
    label: "Active Athletes",
  },
  {
    number: "15+",
    label: "Premium Brands",
  },
  {
    number: "50+",
    label: "Recovery Products",
  },
  {
    number: "3",
    label: "Years of Innovation",
  },
];
const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-hero overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${aboutStore})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <img
              src={logo}
              alt="Physiq"
              className="w-28 mx-auto object-contain"
            />
            <h2 className="text-2xl md:text-3xl">
              Where Your Athletic Performance Comes First
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              At Physiq, we understand that athletes are more than just
              competitors—they're dedicated individuals who deserve the best
              recovery and performance solutions. We specialize in premium sports
              health products that keep you moving, recovering, and performing at your best.
            </p>
          </div>
        </div>
      </section>

      {/* About Our Store Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  About our{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    mission
                  </span>
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    At Physiq, we understand that athletes are more than just
                    competitors—they're dedicated individuals who need proper
                    recovery and performance solutions to thrive. Our passion for
                    sports health drives us to provide the highest quality
                    recovery products that keep you moving, recovering, and performing at your best.
                  </p>

                  <p>
                    Whether you're a professional athlete, weekend warrior, or
                    fitness enthusiast, we're here to offer innovative
                    solutions that support your training, recovery, and performance goals.
                  </p>

                  <p>
                    From advanced recovery gels to compression wear and pain relief solutions,
                    every product in our collection is carefully selected and
                    tested to ensure the highest quality and safety standards
                    for athletes at every level.
                  </p>
                </div>
              </div>
              <div className="relative">
                <GlassCard className="overflow-hidden" animated>
                  <img
                    src={aboutStore}
                    alt="Modern sports health facility with recovery equipment"
                    className="w-full h-96 object-cover"
                  />
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Products Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">
              Our{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Product Categories
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive sports health solutions for every athlete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Recovery Products */}
            <GlassCard className="overflow-hidden" animated>
              <div className="relative">
                <img
                  src={aboutRecoveryProducts}
                  alt="Recovery products for athletes"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold mb-2">Recovery Products</h3>
                  <p className="text-sm opacity-90">Advanced recovery gels, balms, and cooling solutions</p>
                </div>
              </div>
            </GlassCard>

            {/* Compression Wear */}
            <GlassCard className="overflow-hidden" animated>
              <div className="relative">
                <img
                  src={aboutCompressionWear}
                  alt="Compression wear for athletes"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold mb-2">Compression Wear</h3>
                  <p className="text-sm opacity-90">Performance-enhancing compression sleeves and apparel</p>
                </div>
              </div>
            </GlassCard>

            {/* Warm-up & Cooldown */}
            <GlassCard className="overflow-hidden" animated>
              <div className="relative">
                <img
                  src={aboutWarmupCooldown}
                  alt="Warm-up and cooldown products"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold mb-2">Warm-up & Cooldown</h3>
                  <p className="text-sm opacity-90">Pre and post-workout preparation and recovery</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Athletes in Action Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">
              Athletes in{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See how our products help athletes perform at their best
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Training & Performance</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our products are designed to enhance your training sessions, 
                  improve performance, and help you reach your athletic goals. 
                  From warm-up preparations to recovery solutions, we've got you covered.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Injury Prevention & Recovery</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Stay injury-free with our comprehensive range of products 
                  designed to prevent common sports injuries and accelerate 
                  recovery when they do occur.
                </p>
              </div>
            </div>

            <div className="relative">
              <GlassCard className="overflow-hidden" animated>
                <img
                  src={aboutAthletesTraining}
                  alt="Athletes training with sports health products"
                  className="w-full h-96 object-cover"
                />
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Injury Prevention Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <GlassCard className="overflow-hidden" animated>
                  <img
                    src={aboutSportsInjury}
                    alt="Sports injury prevention and treatment"
                    className="w-full h-96 object-cover"
                  />
                </GlassCard>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">
                  Injury{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Prevention
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our comprehensive approach to sports health focuses on preventing 
                  injuries before they happen. Through proper warm-up, recovery, and 
                  targeted treatments, we help athletes stay in the game longer.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  From compression wear that improves circulation to recovery gels 
                  that reduce inflammation, every product is designed with your 
                  long-term athletic success in mind.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Evidence-based injury prevention
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Quick recovery solutions
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Long-term athlete health
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">
              Why Choose{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Us?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Sports Health Solutions for Athletes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <GlassCard className="overflow-hidden" animated>
                  <img
                    src={aboutTeam}
                    alt="Happy team of sports health professionals with athletes"
                    className="w-full h-96 object-cover"
                  />
                </GlassCard>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-4xl font-bold">
                  Our{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Mission
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To revolutionize sports health through innovative technology and
                  evidence-based solutions, creating products that not only enhance
                  performance but also contribute to the health and wellbeing of athletes
                  worldwide.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're committed to safety, efficacy, and the wellbeing
                  of all athletes. Every purchase supports our mission to make
                  the world a better place for athletes and their performance goals.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Passionate about athlete wellbeing
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Safety-first approach to sports health
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Award-winning customer service
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={() => window.open('/contact', '_blank')}
                  >
                    Join Our Community
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">
              Why Choose Our{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Services?
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="bg-accent/10 p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto">
                  <service.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 space-y-4">
            <h3 className="text-2xl font-bold">
              Start Shopping with Physiq Today!
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of sports health products and enjoy a shopping experience
              that's as convenient and satisfying as it is helpful for your athletic performance and recovery.
            </p>
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.open('/shop', '_blank')}
            >
              Explore Products
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default About;
