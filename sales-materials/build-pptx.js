const pptxgen = require("pptxgenjs");
const { html2pptx } = require("./html2pptx");

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = "StableTrack - Sales Presentation";
  pptx.author = "StableTrack";
  pptx.subject = "Horse Farm Management Software";

  // Add all slides
  const slides = [
    "slide01-title.html",
    "slide02-problem.html",
    "slide03-solution.html",
    "slide04-horses.html",
    "slide05-health.html",
    "slide06-team.html",
    "slide07-portal.html",
    "slide08-billing.html",
    "slide09-pricing.html",
    "slide10-cta.html",
  ];

  // Add speaker notes for each slide
  const speakerNotes = [
    // Slide 1 - Title
    "Welcome and thank you for your time. StableTrack is horse farm management software that finally makes running a barn simple.",
    
    // Slide 2 - Problem
    "Let me ask - does any of this sound familiar? Most barn managers I talk to are dealing with scattered records, scheduling chaos, and spending their weekends on invoicing. Sound familiar?",
    
    // Slide 3 - Solution
    "StableTrack solves all of this by putting everything in one place that works on any device - even from the barn aisle on your phone.",
    
    // Slide 4 - Horses
    "Every horse gets a complete profile - basic info, health records, feed programs, documents. Your team can pull up any horse's info instantly.",
    
    // Slide 5 - Health
    "This is where it gets powerful. The system automatically tracks when coggins and vaccinations expire and alerts you 30 days before. No more last-minute scrambles.",
    
    // Slide 6 - Team
    "You control exactly who sees what. Your vet doesn't need to see billing. Your clients don't see other people's horses. Everyone gets the right level of access.",
    
    // Slide 7 - Portal
    "Horse owners get their own portal where they can see their horses, health records, and invoices. This alone eliminates hours of phone calls and emails.",
    
    // Slide 8 - Billing
    "Creating invoices takes about 30 seconds. Set up recurring billing for monthly boarding and it goes out automatically. Most barn owners save 5-10 hours per month.",
    
    // Slide 9 - Pricing
    "Pricing is simple and transparent. For a barn your size, I'd recommend [adjust to audience]. That's less than the cost of one lesson, and it saves you hours every week.",
    
    // Slide 10 - CTA
    "So - ready to simplify your barn management? You can start a free trial today, no credit card required. What questions do you have?",
  ];

  for (let i = 0; i < slides.length; i++) {
    const { slide } = await html2pptx(slides[i], pptx);
    slide.addNotes(speakerNotes[i]);
  }

  // Save the presentation
  await pptx.writeFile("StableTrack-Sales-Presentation.pptx");
  console.log("Presentation created successfully!");
}

createPresentation().catch(console.error);
