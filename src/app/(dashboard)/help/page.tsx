'use client';

import React, { useState } from 'react';
import { toast } from '@/lib/toast';
import {
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Play,
  FileText,
  Users,
  Calendar,
  Settings,
  CreditCard,
  Utensils,
} from 'lucide-react';

const faqCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Play,
    faqs: [
      {
        question: 'How do I add my first horse?',
        answer: 'Navigate to the Horses page and click "Add Horse". Fill in the basic information like barn name, breed, and date of birth. You can add more details later from the horse\'s profile page.',
      },
      {
        question: 'How do I invite team members?',
        answer: 'Go to the Team page and share your barn\'s invite code with team members. They can use this code to join your barn when they sign up or from their settings.',
      },
      {
        question: 'What plan is right for me?',
        answer: 'The Starter plan ($25/mo) is great for small farms with up to 10 horses. The Farm plan ($60/mo) supports unlimited horses, team members, and photos — perfect for growing operations. You can also add optional features like breeding tracking for $10/mo each.',
      },
    ],
  },
  {
    id: 'horses',
    name: 'Managing Horses',
    icon: FileText,
    faqs: [
      {
        question: 'How do I track vaccinations?',
        answer: 'On each horse\'s profile, go to the Health tab. Click "Add Vaccination" to record the type, date given, veterinarian, and next due date. You\'ll receive alerts when vaccinations are coming due.',
      },
      {
        question: 'Can I upload health records?',
        answer: 'Yes! Go to the horse\'s Documents tab and upload PDFs, images, or other files. You can categorize them as medical records, registration papers, contracts, and more.',
      },
      {
        question: 'How do I set up a feed program?',
        answer: 'From the horse\'s profile, go to the Feed tab. Create a feed program with specific amounts and feeding times (AM, PM, Midday, etc.) for each type of feed and supplement. Once set, the feed plan will appear on the Daily Care page\'s Feed Plan Chart.',
      },
    ],
  },
  {
    id: 'feeding',
    name: 'Daily Care & Feeding',
    icon: Utensils,
    faqs: [
      {
        question: 'Where can I see what every horse should be fed?',
        answer: 'Go to Daily Care and click the Feeding tab. Scroll down to the Feed Plan Chart — it shows a grid of every horse versus every feed item, with the amount for each. AM and PM feedings are shown as separate tables so you can quickly see what needs to go in each bucket.',
      },
      {
        question: 'How does the AM / PM split work in the Feed Plan Chart?',
        answer: 'Feed items are automatically grouped by their feeding time. AM items (including Early AM) appear in the AM table. PM items (including Midday) appear in the PM table. If a feed item is set to "Both" when creating the feed program, it will show up in both the AM and PM tables so nothing gets missed.',
      },
      {
        question: 'Can I print the feeding chart?',
        answer: 'Yes — click the Print button in the top-right corner of the Feed Plan Chart card. It will open your browser\'s print dialog with a clean, print-ready layout showing both the AM and PM feeding tables, the barn name, and today\'s date.',
      },
      {
        question: 'How do I log that a horse has been fed?',
        answer: 'From the Feeding tab on Daily Care, click "Log Feeding" to record an AM or PM feeding for a horse. You can also go to Log > Feed from the sidebar. The Feeding Status section at the top of the tab updates in real time to show which horses have been fed.',
      },
      {
        question: 'A horse doesn\'t show up in the Feed Plan Chart — why?',
        answer: 'The chart only shows horses that have a feed program set up. Go to the horse\'s profile, open the Feed tab, and create a feed program with at least one item. The horse will then appear in the chart.',
      },
    ],
  },
  {
    id: 'calendar',
    name: 'Calendar & Events',
    icon: Calendar,
    faqs: [
      {
        question: 'How do I schedule a vet appointment?',
        answer: 'Click "Add Event" from the Calendar page. Select the event type (Vet), choose the horse, set the date and time, and add the veterinarian\'s contact information.',
      },
      {
        question: 'Can I set up recurring events?',
        answer: 'Yes! When creating an event, toggle "Recurring" and select the frequency (weekly, monthly, etc.). This is great for regular farrier visits or deworming schedules.',
      },
      {
        question: 'How do event reminders work?',
        answer: 'You\'ll receive reminders via email before scheduled events. You can configure reminder timing when creating or editing an event.',
      },
    ],
  },
  {
    id: 'team',
    name: 'Team & Permissions',
    icon: Users,
    faqs: [
      {
        question: 'What are the different team roles?',
        answer: 'Owner has full access to everything. Manager can manage horses, events, and team members. Caretaker can view and update horse information and daily care logs.',
      },
      {
        question: 'Can I restrict access to specific horses?',
        answer: 'Access is controlled through team roles. Owners and managers can see all horses. Caretakers can view and update the horses they work with. Clients only see horses linked to their account.',
      },
      {
        question: 'How do I remove a team member?',
        answer: 'Go to the Team page, click the menu icon next to the member, and select "Remove from barn". They will lose access immediately.',
      },
    ],
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: CreditCard,
    faqs: [
      {
        question: 'How do I upgrade my plan?',
        answer: 'Go to Settings > Billing and click "Upgrade" on the plan you want. Your new features will be available immediately, and billing will be prorated.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.',
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Yes! You can cancel your plan at any time from Settings > Billing. You\'ll continue to have access until the end of your billing period.',
      },
    ],
  },
];

const helpResources = [
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides for common tasks',
    icon: Play,
    link: '#',
  },
  {
    title: 'Documentation',
    description: 'Detailed guides and reference materials',
    icon: Book,
    link: '#',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other BarnKeep users',
    icon: Users,
    link: '#',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0 || !searchQuery);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 w-full text-lg py-4"
          />
        </div>
      </div>

      {/* Quick Resources */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {helpResources.map((resource) => {
          const Icon = resource.icon;
          return (
            <a
              key={resource.title}
              href={resource.link}
              className="card p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-all">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-amber-600 transition-all">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;
            
            return (
              <div key={category.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{category.name}</span>
                    <span className="text-sm text-muted-foreground">({category.faqs.length})</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {isExpanded && (
                  <div className="border-t border-border">
                    {category.faqs.map((faq, index) => {
                      const faqId = `${category.id}-${index}`;
                      const isFaqExpanded = expandedFaq === faqId;
                      
                      return (
                        <div key={index} className="border-b border-border last:border-b-0">
                          <button
                            onClick={() => setExpandedFaq(isFaqExpanded ? null : faqId)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-all"
                          >
                            <span className="font-medium text-muted-foreground pr-4">{faq.question}</span>
                            <ChevronRight
                              className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                                isFaqExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                          {isFaqExpanded && (
                            <div className="px-4 pb-4">
                              <p className="text-muted-foreground bg-background rounded-xl p-4">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Support */}
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 bg-gradient-to-r from-stone-900 to-stone-800 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-card/10">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Still need help?</h3>
                <p className="text-muted-foreground mt-1">
                  Our support team is here to help you succeed
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => toast.info('Demo Mode', 'Email support is disabled in demo mode')}
                className="flex items-center gap-2 px-6 py-3 bg-card text-foreground rounded-xl font-medium hover:bg-accent transition-all"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </button>
              <button
                onClick={() => toast.info('Demo Mode', 'Live chat is disabled in demo mode')}
                className="flex items-center gap-2 px-6 py-3 bg-card/10 text-white rounded-xl font-medium hover:bg-card/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>This is a demo version. Some support features are disabled.</p>
      </div>
    </div>
  );
}
