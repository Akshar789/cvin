'use client';

import { FiCheck } from 'react-icons/fi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function Pricing() {
  const { t } = useLanguage();

  const plans = [
    {
      name: t.pricing.freeTitle,
      price: t.pricing.freePrice,
      period: '',
      badge: '',
      features: [
        t.pricing.features.freeCVs,
        t.pricing.features.freeImprovements,
        t.pricing.features.freeInterview,
        t.pricing.features.basicATS,
        t.pricing.features.basicTemplates,
        t.pricing.features.pdfExport,
      ],
      cta: t.pricing.choosePlan,
      href: '/register',
      highlighted: false,
    },
    {
      name: t.pricing.regularTitle,
      price: t.pricing.regularPrice,
      priceSAR: t.pricing.regularSAR,
      period: t.pricing.perMonth,
      badge: '',
      features: [
        t.pricing.features.unlimited,
        t.pricing.features.allTemplates,
        t.pricing.features.standardAI,
        t.pricing.features.coverLetters,
        t.pricing.features.atsOptimization,
        t.pricing.features.interviewPrep,
        t.pricing.features.tailorCV,
        t.pricing.features.multiFormat,
      ],
      cta: t.pricing.choosePlan,
      href: '/checkout?plan=regular',
      highlighted: false,
    },
    {
      name: t.pricing.plusTitle,
      price: t.pricing.plusPrice,
      priceSAR: t.pricing.plusSAR,
      period: t.pricing.perMonth,
      badge: t.pricing.mostPopular,
      features: [
        t.pricing.features.unlimited,
        t.pricing.features.allTemplates,
        t.pricing.features.advancedAI,
        t.pricing.features.coverLetters,
        t.pricing.features.atsOptimization,
        t.pricing.features.idpGenerator,
        t.pricing.features.linkedinOptimizer,
        t.pricing.features.interviewPrep,
        t.pricing.features.careerCoach,
        t.pricing.features.tailorCV,
        t.pricing.features.multiFormat,
      ],
      cta: t.pricing.choosePlan,
      href: '/checkout?plan=plus',
      highlighted: true,
    },
    {
      name: t.pricing.annualTitle,
      price: t.pricing.annualPrice,
      priceSAR: t.pricing.annualSAR,
      period: t.pricing.perYear,
      pricePerMonth: t.pricing.annualPricePerMonth,
      badge: t.pricing.save58,
      features: [
        t.pricing.features.unlimited,
        t.pricing.features.allTemplates,
        t.pricing.features.advancedAI,
        t.pricing.features.coverLetters,
        t.pricing.features.atsOptimization,
        t.pricing.features.idpGenerator,
        t.pricing.features.linkedinOptimizer,
        t.pricing.features.interviewPrep,
        t.pricing.features.careerCoach,
        t.pricing.features.tailorCV,
        t.pricing.features.multiFormat,
        t.pricing.features.prioritySupport,
      ],
      cta: t.pricing.choosePlan,
      href: '/checkout?plan=annual',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-12 px-4 bg-gradient-to-br from-navy-50 to-turquoise-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-900 mb-3">
          {t.pricing.title}
        </h2>
        <p className="text-lg text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          {t.pricing.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={plan.highlighted ? 'border-4 border-turquoise-500 relative' : ''}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-turquoise-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-navy-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-navy-900">{plan.price}</div>
                {plan.priceSAR && (
                  <div className="text-sm text-gray-500">{plan.priceSAR}</div>
                )}
                <div className="text-sm text-gray-600 mt-1">{plan.period}</div>
                {plan.pricePerMonth && (
                  <div className="text-xs text-turquoise-600 font-semibold mt-1">
                    {plan.pricePerMonth}
                  </div>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <FiCheck className="w-4 h-4 text-turquoise-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  fullWidth
                  variant={plan.highlighted ? 'primary' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
