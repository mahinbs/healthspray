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
import heroImage from "@/assets/hero-pets.jpg";
import aboutTeam from "@/assets/about-team.jpg";
import aboutStore from "@/assets/about-store.jpg";
import logo from "../assets/zippty-logo.png";

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We specialize in high-quality interactive toys that keep your pets engaged, active, and entertained.",
  },
  {
    icon: Shield,
    title: "Trusted Quality",
    description:
      "We believe your pets deserve only the best entertainment. That's why we offer interactive toys from brands you can rely on.",
  },
  {
    icon: Zap,
    title: "For Every Energy Level",
    description:
      "Whether your pet is highly energetic and playful or prefers more gentle stimulation, we have the perfect interactive toys.",
  },
  {
    icon: Users,
    title: "Seamless Shopping Experience",
    description:
      "Finding the perfect interactive toy for your pet has never been easier. Our website is user-friendly and fast.",
  },
];
const services = [
  {
    icon: Clock,
    title: "Quick & Reliable",
    description:
      "Fast, reliable shipping so you can get your pet's supplies right when you need them.",
  },
  {
    icon: Star,
    title: "Expert Advice",
    description:
      "We offer the guidance and resources you need to give your pets the best care.",
  },
  {
    icon: Heart,
    title: "Affordable Quality",
    description:
      "Premium products at competitive prices, ensuring your pets get the best without breaking the bank.",
  },
];
const stats = [
  {
    number: "500+",
    label: "Happy Pets",
  },
  {
    number: "15+",
    label: "Premium Brands",
  },
  {
    number: "50+",
    label: "Smart Products",
  },
  {
    number: "2",
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
              alt="Zippty"
              className="w-28 mx-auto object-contain"
            />
            <h2 className="text-2xl md:text-3xl">
              Where Your Pet's Entertainment Comes First
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              At Zippty, we understand that pets are more than just
              animals—they're family members who deserve the best interactive
              experiences. We specialize in premium interactive toys that keep
              your furry friends engaged, active, and happy.
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
                    store
                  </span>
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    At Zippty, we understand that pets are more than just
                    animals—they're cherished family members who need mental
                    stimulation and physical activity to thrive. Our passion for
                    pet enrichment drives us to provide the highest quality
                    interactive toys that keep your pets engaged, entertained,
                    and healthy.
                  </p>

                  <p>
                    Whether you have a playful young pet, an energetic adult, or
                    a wise senior companion, we're here to offer innovative
                    solutions that satisfy their natural instincts and
                    curiosity.
                  </p>

                  <p>
                    From interactive smart toys to innovative feeding solutions,
                    every product in our collection is carefully selected and
                    tested to ensure the highest quality and safety standards
                    for your beloved pets.
                  </p>
                </div>
              </div>
              <div className="relative">
                <GlassCard className="overflow-hidden" animated>
                  <img
                    src={aboutStore}
                    alt="Modern pet store interior with smart toys"
                    className="w-full h-96 object-cover"
                  />
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {/* <section className="py-20 bg-muted/30">
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
      </section> */}

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
              Interactive Toys for Your Pets
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
                    alt="Happy team of pet store employees with pets"
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
                  To revolutionize pet care through innovative technology and
                  thoughtful design, creating products that not only entertain
                  but also contribute to the health and happiness of pets
                  worldwide.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're committed to sustainability, safety, and the wellbeing
                  of all animals. Every purchase supports our mission to make
                  the world a better place for pets and their families.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Passionate about pet welfare
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Safety-first approach to design
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
              Start Shopping with Zippty Today!
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of products and enjoy a shopping experience
              that's as convenient and satisfying as it is helpful for you and
              your pet.
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
