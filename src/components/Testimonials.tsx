import { GlassCard } from "@/components/ui/glass-card";
import { Star, Quote } from "lucide-react";
import testimonialImage from "@/assets/testimonial-priya.jpg";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Professional Athlete",
    content: "The Cryo Recovery Gel has been a game-changer for my post-workout recovery! After intense training sessions, I apply it to my sore muscles and feel instant relief. The cooling effect is incredible and helps reduce inflammation significantly. My recovery time has improved by 40% since I started using it. The gel absorbs quickly without leaving any sticky residue. Highly recommend for any serious athlete!",
    rating: 5,
  },
  {
    name: "Priya Singh",
    role: "Fitness Enthusiast",
    content: "The Thermo Warm-up Balm is perfect for my morning workouts! I apply it before my runs and it helps warm up my muscles so much faster. The warming sensation is gentle but effective, and I've noticed fewer muscle strains since using it. The compact size makes it easy to carry in my gym bag. It's become an essential part of my pre-workout routine!",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Gym Trainer",
    content: "I've been using the Compression Recovery Sleeves for my clients and the results are outstanding! They provide excellent support during workouts and the compression really helps with blood circulation. My clients report faster recovery and less muscle fatigue. The quality is top-notch and they last through multiple washes. These are now a staple in my training recommendations!",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Marathon Runner",
    content: "The Pain Relief Spray has been my savior during long training runs! I carry it in my hydration pack and use it whenever I feel muscle tightness or joint pain. The instant cooling effect helps me push through the toughest miles. It's lightweight, doesn't leave any residue, and the relief lasts for hours. This product has helped me complete my first marathon without any major pain issues!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "CrossFit Athlete",
    content: "The Recovery Balm is absolutely incredible for post-WOD recovery! After intense CrossFit sessions, I apply it to my shoulders and back, and the warming sensation helps relax my muscles immediately. The menthol and eucalyptus blend is refreshing and the balm absorbs quickly. I've been using it for 3 months and my recovery time between workouts has significantly improved. My coach even asked what I was using!",
    rating: 5,
  },
  {
    name: "Lisa Rodriguez",
    role: "Yoga Instructor",
    content: "The Muscle Relief Gel has transformed my teaching and personal practice! As a yoga instructor, I often have sore muscles from demonstrating poses all day. This gel provides instant relief and the cooling sensation is perfect for hot yoga sessions. My students have noticed how much more flexible and pain-free I am during classes. I recommend it to all my students now!",
    rating: 5,
  },
  {
    name: "David Thompson",
    role: "Physical Therapist",
    content: "I've been recommending Painssy products to my patients for months now, and the results speak for themselves! The Cryo Recovery Gel works wonders for post-surgery recovery, and the Thermo Balm is perfect for chronic pain management. My patients report 60% faster recovery times and reduced dependency on pain medications. The quality and effectiveness are unmatched in the market!",
    rating: 5,
  }
];

const Testimonials = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <GlassCard intensity="light" className="inline-block px-6 py-3 mb-8">
            <span className="text-sm font-medium text-primary">💝 Customer Love</span>
          </GlassCard>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            What our{" "}
            <span className="text-[#ef4e23] font-bold">
              Customers Say
            </span>
          </h2>
          <p className="text-2xl text-muted-foreground">Real stories from athletes and fitness enthusiasts</p>
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
                    className="h-8 w-8 fill-[#ef4e23] text-[#ef4e23] mx-1 animate-pulse-slow" 
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              
              {/* Testimonial Text */}
              <blockquote className="text-2xl md:text-3xl mb-12 text-foreground leading-relaxed text-center font-medium">
                "The Cryo Recovery Gel has been a{" "}
                <span className="text-[#ef4e23] font-bold">
                  game-changer
                </span>{" "}
                for my post-workout recovery! After intense training sessions, I apply it to my sore muscles and feel instant relief. The cooling effect is incredible and helps reduce inflammation significantly."
              </blockquote>
              
              {/* Customer Info */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={testimonialImage}
                      alt="Rajesh Kumar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-glow"
                    />
                    <div className="absolute -inset-2 bg-gradient-primary rounded-full opacity-20 blur-lg animate-pulse-slow" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">Rajesh Kumar</div>
                    <div className="text-lg text-primary font-medium">Professional Athlete</div>
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