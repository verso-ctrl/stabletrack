import React from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  Calendar,
  FileText,
  Heart,
  Users,
  Shield,
  Smartphone,
  BarChart3,
  Clock,
  Star,
  Zap,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const features = [
  {
    icon: Heart,
    title: 'Health Tracking',
    description: 'Complete medical records, vaccinations, coggins tests, and medication schedules all in one place.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Manage vet visits, farrier appointments, lessons, and competitions with automated reminders.',
  },
  {
    icon: FileText,
    title: 'Digital Records',
    description: 'Store documents, photos, and certificates securely. Access from anywhere, anytime.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Role-based access for owners, managers, caretakers, vets, and clients.',
  },
  {
    icon: BarChart3,
    title: 'Billing & Invoicing',
    description: 'Create invoices, track payments, and set up recurring charges effortlessly.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Works perfectly on phones and tablets. Manage your barn from the saddle.',
  },
];

const testimonials = [
  {
    quote: "StableTrack transformed how we manage our 40-horse facility. Everything is organized and accessible.",
    author: "Sarah Mitchell",
    role: "Barn Owner, Meadowbrook Stables",
    rating: 5,
  },
  {
    quote: "The health tracking alone has saved us countless hours. Our vet loves how organized our records are.",
    author: "Dr. James Peterson",
    role: "Equine Veterinarian",
    rating: 5,
  },
  {
    quote: "Finally, software built by horse people for horse people. The team permissions are exactly what we needed.",
    author: "Maria Garcia",
    role: "Training Barn Manager",
    rating: 5,
  },
];

const stats = [
  { value: '10,000+', label: 'Horses Managed' },
  { value: '500+', label: 'Active Barns' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <HorseIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-stone-900">StableTrack</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-stone-600 hover:text-stone-900 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-stone-600 hover:text-stone-900 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-stone-600 hover:text-stone-900 transition-colors">
                Testimonials
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="text-stone-600 hover:text-stone-900 font-medium">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Now with AI-powered health insights
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 leading-tight mb-6">
              Professional Horse Farm Management,{' '}
              <span className="text-amber-600">Simplified</span>
            </h1>
            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
              The all-in-one platform trusted by boarding facilities, training barns, and equestrian centers to manage horses, health records, scheduling, and billing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                Start Your Free Trial
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-white text-stone-700 rounded-xl hover:bg-stone-50 font-semibold text-lg border border-stone-300 transition-colors"
              >
                Watch Demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-800">
              <div className="flex items-center gap-2 px-4 py-3 bg-stone-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="p-4 bg-stone-50">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'Active Horses', value: '24', color: 'bg-amber-500' },
                    { label: 'Upcoming Events', value: '8', color: 'bg-blue-500' },
                    { label: 'Pending Tasks', value: '12', color: 'bg-green-500' },
                    { label: 'Health Alerts', value: '2', color: 'bg-red-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-sm text-stone-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm h-48" />
                  <div className="bg-white rounded-xl p-4 shadow-sm h-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-stone-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              Everything You Need to Run Your Barn
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              From daily care to complex billing, StableTrack handles it all so you can focus on what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-stone-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-stone-600">
              No complex setup. No training required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Barn',
                description: 'Sign up and set up your barn profile in under 2 minutes.',
              },
              {
                step: '2',
                title: 'Add Your Horses',
                description: 'Import or manually add horses with all their details and records.',
              },
              {
                step: '3',
                title: 'Invite Your Team',
                description: 'Add staff, vets, farriers, and clients with custom permissions.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              Loved by Horse Professionals
            </h2>
            <p className="text-xl text-stone-600">
              See what barn owners and managers are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-stone-900">{testimonial.author}</p>
                  <p className="text-sm text-stone-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Your Data is Safe With Us
              </h2>
              <p className="text-stone-300 text-lg mb-8">
                We take security seriously. Your horses' records and your business data are protected by enterprise-grade security.
              </p>
              <ul className="space-y-4">
                {[
                  '256-bit SSL encryption',
                  'Daily automated backups',
                  'SOC 2 Type II compliant',
                  'GDPR ready',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <Shield className="w-48 h-48 text-amber-500 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Barn Management?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Join hundreds of equestrian facilities already using StableTrack.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-xl hover:bg-amber-50 font-semibold text-lg transition-colors"
          >
            Start Your Free 14-Day Trial
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-amber-100 text-sm">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <HorseIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">StableTrack</span>
              </div>
              <p className="text-sm">
                Professional horse farm management software for the modern equestrian.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} StableTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
