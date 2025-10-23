import { GlassCard } from "@/components/ui/glass-card";
import AnimatedCounter from "./AnimatedCounter";
import { Heart, Award, Package, Calendar } from "lucide-react";

const Statistics = () => {
  const stats = [
    { 
      label: "Happy Clients", 
      value: 2000, 
      suffix: "+",
      icon: Heart,
      color: "text-[#ef4e23]",
      bgColor: "bg-[#ef4e23]/10"
    },
    { 
      label: "Brands", 
      value: 72, 
      suffix: "",
      icon: Award,
      color: "text-black",
      bgColor: "bg-black/10"
    },
    { 
      label: "Products", 
      value: 1800, 
      suffix: "+",
      icon: Package,
      color: "text-[#ef4e23]",
      bgColor: "bg-[#ef4e23]/10"
    },
    { 
      label: "Years in Business", 
      value: 28, 
      suffix: "",
      icon: Calendar,
      color: "text-black",
      bgColor: "bg-black/10"
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Our{" "}
            <span className="text-[#ef4e23] font-bold">
              Impact
            </span>
          </h2>
          <p className="text-2xl text-muted-foreground">Numbers that tell our story</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <GlassCard 
                key={index} 
                intensity="medium" 
                animated
                className="text-center p-8 group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-4 rounded-full ${stat.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
                
                <div className="text-5xl md:text-6xl font-bold mb-4 text-[#ef4e23]">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                
                <div className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {stat.label}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;