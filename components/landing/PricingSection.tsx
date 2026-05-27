"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthlyPrice: "₹0",
    annualPrice: "₹0",
    description: "For casual writers who need a private space.",
    features: [
      "Unlimited plain text entries",
      "Basic mood tracking",
      "Up to 3 journals",
      "Web access only"
    ],
    buttonText: "Start writing free",
    highlighted: false
  },
  {
    name: "Pro",
    monthlyPrice: "₹299",
    annualPrice: "₹199",
    description: "For active journalers seeking deeper insights.",
    features: [
      "Everything in Free",
      "Rich text formatting & images",
      "Unlimited journals",
      "Weekly & Monthly reflections",
      "Memory resurfacing"
    ],
    buttonText: "Get Pro",
    highlighted: true
  },
  {
    name: "Pro+",
    monthlyPrice: "₹599",
    annualPrice: "₹499",
    description: "For power users who want the ultimate archive.",
    features: [
      "Everything in Pro",
      "Unlimited audio & video attachments",
      "Priority email support",
      "Advanced export options (PDF, JSON)",
      "Early access to new features"
    ],
    buttonText: "Get Pro+",
    highlighted: false
  }
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-32 px-6 md:px-12 max-w-6xl mx-auto border-t border-border">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-4xl font-display mb-6">Simple, transparent pricing.</h2>
        <p className="text-lg text-muted">Start for free. Upgrade when you need more power and insights.</p>
        
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-text' : 'text-muted'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-surface border border-border rounded-full p-1 transition-colors relative"
          >
            <div className={`w-6 h-6 bg-primary rounded-full transition-transform absolute top-1 left-1 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-text' : 'text-muted'}`}>
            Annually <span className="ml-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Save 33%</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`
              rounded-2xl p-8 flex flex-col
              ${plan.highlighted 
                ? 'bg-surface border-2 border-primary shadow-sm relative' 
                : 'bg-background border border-border'
              }
            `}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            
            <h3 className="text-xl font-display mb-2">{plan.name}</h3>
            <p className="text-sm text-muted mb-6 h-10">{plan.description}</p>
            
            <div className="mb-8">
              <span className="text-4xl font-display">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
              <span className="text-muted text-sm">{plan.name !== "Free" ? "/mo" : ""}</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-muted">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/signup" 
              className={`
                w-full py-3 rounded-lg text-center font-medium transition-colors
                ${plan.highlighted 
                  ? 'bg-primary text-background hover:opacity-90' 
                  : 'bg-surface border border-border hover:border-primary text-text'
                }
              `}
            >
              {plan.buttonText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
