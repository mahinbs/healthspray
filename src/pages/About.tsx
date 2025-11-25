import Layout from "@/components/Layout";
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
  Star,
} from "lucide-react";
import aboutStore from "@/assets/about-sports-facility.jpg";

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "Crafted with precision and backed by science, our formulations deliver performance-driven results for faster recovery and consistent progress.",
  },
  {
    icon: Zap,
    title: "For Every Active Individual",
    description:
      "Whether you’re training daily, balancing work and workouts, or chasing weekend goals, Physiq supports your body’s recovery, performance, and consistency.",
  },
  {
    icon: Cpu,
    title: "Science-Driven Innovation",
    description:
      "Our R² philosophy — Recover & Recharge — combines proven research and smart formulation to help your body repair faster and perform stronger.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description:
      "Recovery isn’t one-size-fits-all. Our team brings years of formulation and fitness experience to help you choose the right solutions for your active lifestyle — simple, effective, and backed by science.",
  },
];
const About = () => {
  return (
    <Layout>
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
              src='/logo-white.png'
              alt="Physiq"
              className="w-28 mx-auto object-contain"
            />
            <h2 className="text-2xl md:text-3xl">
              Built for the Everyday Performer
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              At Physiq, we understand what it takes to stay consistent — the early mornings, the late workouts,
              and the drive to show up no matter what. For those who make time for fitness amid a busy life, our
              recovery and performance solutions are built to help you recharge faster, move better, and keep
              performing every day.
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
                  <span className="text-[#ef4e23] font-bold">
                    mission
                  </span>
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Physiq was born out of a shared obsession of a HUSBAND-and-WIFE DUO for movement
                    and the constant pursuit of balance. As a husband and wife who live active, demanding lives,
                    we knew the struggle of showing up for workouts after long days, pushing through fatigue,
                    and finding the energy to stay consistent. Fitness was our escape, our reset but we realized
                    recovery was the missing piece. <br /><br />
                    Between training sessions and busy schedules, we searched for products that could truly
                    support an active lifestyle something clean, effective, and rooted in science. When we
                    couldn’t find what we were looking for, we decided to create it ourselves.<br /><br />
                    That’s how Physiq came to life built on the philosophy of R²: Recover & Recharge.
                    It’s not just about faster recovery; it’s about empowering people like us those who hustle
                    hard, train with purpose, and aim for consistency every day to take care of their bodies the
                    smarter way.<br /><br />
                    Today, Physiq stands as a reminder that recovery is strength, consistency is performance, and
                    taking care of yourself is the ultimate discipline.
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

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">
              Why Choose{" "}
              <span className="text-[#ef4e23] font-bold">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <GlassCard className="overflow-hidden" animated>
                  <img
                    src='/our-mission.png'
                    alt="Happy team of sports health professionals with athletes"
                    className="w-full h-96 object-contain"
                  />
                </GlassCard>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-4xl font-bold">
                  Our{" "}
                  <span className="text-[#ef4e23] font-bold">
                    Mission
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At Physiq, we’re on a mission to make recovery smarter and performance sustainable.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe that true strength lies in consistency — and through our R² philosophy (Recover
                  & Recharge), we help active individuals balance effort with recovery, so they can keep
                  performing at their best every day.
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
                    className="px-10 py-6"
                  >
                    Join Our Community
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
};
export default About;
