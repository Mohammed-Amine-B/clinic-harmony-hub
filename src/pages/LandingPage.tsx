import { Heart, Phone, Mail, MapPin, Clock, Shield, Users, Award, Stethoscope, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Stethoscope,
    title: 'Expert Doctors',
    description: 'Our team of certified specialists provides top-quality medical care.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock medical assistance whenever you need it.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your health data is protected with enterprise-grade security.',
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Schedule appointments online in just a few clicks.',
  },
];

const specialties = [
  { name: 'Cardiology', icon: Heart, color: 'bg-destructive/10 text-destructive' },
  { name: 'Pediatrics', icon: Users, color: 'bg-info/10 text-info' },
  { name: 'Orthopedics', icon: Award, color: 'bg-warning/10 text-warning' },
  { name: 'Dermatology', icon: Stethoscope, color: 'bg-success/10 text-success' },
];

const stats = [
  { value: '50+', label: 'Expert Doctors' },
  { value: '10K+', label: 'Happy Patients' },
  { value: '15+', label: 'Years Experience' },
  { value: '24/7', label: 'Emergency Care' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-info flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">MediCare</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#specialties" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Specialties</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth?mode=register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-info/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="teal" className="mb-6 animate-fade-in">
              ✨ Trusted by 10,000+ patients
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 animate-slide-up">
              Your Health, Our{' '}
              <span className="text-gradient-primary">Priority</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Experience world-class healthcare with our team of expert doctors. 
              Book appointments, manage your health records, and get personalized care—all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=register">
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button variant="outline-primary" size="xl">
                <Phone className="w-5 h-5" />
                Call Us Now
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <Card key={index} variant="elevated" className="text-center py-6 animate-scale-in" style={{ animationDelay: `${0.1 * index}s` }}>
                <CardContent className="p-0">
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="info" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide end-to-end healthcare services designed to make your medical journey smooth and stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} variant="elevated" className="group hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="coral" className="mb-4">Our Expertise</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Medical Specialties
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our clinic offers a wide range of medical specialties to cater to all your healthcare needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {specialties.map((specialty, index) => (
              <Card key={index} variant="elevated" className="group cursor-pointer hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${specialty.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <specialty.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">
                    {specialty.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-info">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust MediCare for their healthcare needs. 
            Book your first appointment today and experience the difference.
          </p>
          <Button size="xl" className="bg-background text-primary hover:bg-background/90" asChild>
            <Link to="/auth?mode=register">
              Get Started for Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card variant="elevated" className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </CardContent>
            </Card>
            
            <Card variant="elevated" className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">contact@medicare.com</p>
              </CardContent>
            </Card>
            
            <Card variant="elevated" className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">Address</h3>
                <p className="text-muted-foreground">123 Health Street, NY</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-info flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">MediCare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MediCare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
