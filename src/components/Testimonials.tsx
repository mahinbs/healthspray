import { GlassCard } from "@/components/ui/glass-card";
import { Star, Quote } from "lucide-react";
import testimonialImage from "@/assets/testimonial-priya.jpg";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Cat Parent",
    content: "The Interactive Cat Toy with 2-speed adjustment has been a game-changer for my energetic Bengal cat, Leo! The 2-speed adjustment feature is perfect - I use the slower speed when he's just waking up and the faster speed for his evening play sessions. The remote control works flawlessly, and Leo absolutely loves chasing the laser dot. It's kept him entertained for hours and helped reduce his destructive behavior. The orange color is vibrant and easy to spot. Highly recommend for any cat parent!",
    rating: 5,
  }
];

const Testimonials = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <GlassCard intensity="light" className="inline-block px-6 py-3 mb-8">
            <span className="text-sm font-medium text-primary">💝 Customer Love</span>
          </GlassCard>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            What our{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="text-2xl text-muted-foreground">Real stories from happy pet families</p>
        </div>
        
        <div className="max-w-5xl mx-auto animate-scale-in">
          <GlassCard intensity="medium" className="relative p-12 overflow-hidden">
            {/* Decorative Quote */}
            <Quote className="absolute top-8 left-8 h-16 w-16 text-primary/20" />
            
            <div className="relative z-10">
              {/* Rating Stars */}
              <div className="flex justify-center items-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-8 w-8 fill-yellow-400 text-yellow-400 mx-1 animate-pulse-slow" 
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              
              {/* Testimonial Text */}
              <blockquote className="text-2xl md:text-3xl mb-12 text-foreground leading-relaxed text-center font-medium">
                "The Interactive Cat Toy with 2-speed adjustment has been a{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent font-bold">
                  game-changer
                </span>{" "}
                for my energetic Bengal cat, Leo! The remote control works flawlessly, and Leo absolutely loves chasing the laser dot. It's kept him entertained for hours and helped reduce his destructive behavior."
              </blockquote>
              
              {/* Customer Info */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={testimonialImage}
                      alt="Priya Sharma"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-glow"
                    />
                    <div className="absolute -inset-2 bg-gradient-primary rounded-full opacity-20 blur-lg animate-pulse-slow" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">Priya Sharma</div>
                    <div className="text-lg text-primary font-medium">Cat Parent & Bengal Enthusiast</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-accent rounded-full opacity-10 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;