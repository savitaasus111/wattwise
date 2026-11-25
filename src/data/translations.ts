import { Language } from '../types/bill';

export const UI_COPY: Record<
  Language,
  {
    brand: string;
    nav: {
      howItWorks: string;
      analyzer: string;
      simulator: string;
      demoBills: string;
      uploadBill: string;
    };
    hero: {
      kicker: string;
      headline: string;
      subcopy: string;
      primaryCta: string;
      secondaryCta: string;
      simulatorLink: string;
      trustLine: string;
      imageAlt: string;
      captionTitle: string;
      captionStat: string;
      highlightLabel: string;
      highlightValue: string;
    };
    howItWorks: {
      heading: string;
      subheading: string;
      steps: Array<{
        num: string;
        title: string;
        description: string;
      }>;
    };
    upload: {
      sectionTitle: string;
      sectionSubtitle: string;
      dropTitle: string;
      dropHint: string;
      chooseFile: string;
      orTryDemo: string;
      manualEntryLink: string;
      analyzingTitle: string;
      analyzingSteps: string[];
      errorTitle: string;
      errorRetry: string;
      errorDemo: string;
      errorManual: string;
      fileTooLarge: string;
      unsupportedType: string;
    };
    review: {
      title: string;
      partialAlert: string;
      allFoundAlert: string;
      unreadableAlert: string;
      unitsLabel: string;
      unitsHint: string;
      unitsPlaceholder: string;
      amountLabel: string;
      amountHint: string;
      amountPlaceholder: string;
      periodLabel: string;
      periodHint: string;
      periodPlaceholder: string;
      tariffLabel: string;
      tariffHint: string;
      tariffPlaceholder: string;
      daysLabel: string;
      dayOptions: {
        d30: string;
        d60: string;
        d31: string;
        d28: string;
      };
      providerLabel: string;
      providerPlaceholder: string;
      missingTag: string;
      submitBtn: string;
      submittingBtn: string;
      cancelBtn: string;
      validationError: string;
    };
    dashboard: {
      headerKicker: string;
      demoNotice: string;
      editValues: string;
      uploadAnother: string;
      shareResult: string;
      co2SpotlightLabel: string;
      co2SpotlightSub: string;
      co2PerMonthUnit: string;
      summary: {
        unitsUsed: string;
        unitsSub: string;
        amountPaid: string;
        amountSub: string;
        costPerUnit: string;
        costPerUnitSub: string;
        carbonFootprint: string;
        carbonSub: string;
        treesEquivalent: string;
      };
      comparison: {
        title: string;
        subtitle: string;
        yourHome: string;
        indianAvg: string;
        avgRangeNote: string;
        aboveAvg: string;
        belowAvg: string;
        atAvg: string;
        monthlyEquivalentNote: string;
        monthShort: string;
      };
      score: {
        title: string;
        outOf: string;
        lowLoadHint: string;
        highLoadHint: string;
        bands: {
          excellent: string;
          good: string;
          moderate: string;
          high: string;
        };
      };
      tipsSection: {
        heading: string;
        subheading: string;
        totalPotentialPrefix: string;
        perMonthLabel: string;
        co2PerMonth: string;
        annualProjection: string;
        yearShort: string;
        savePerMonth: string;
        co2SavedLabel: string;
        categories: {
          cooling: string;
          appliances: string;
          lighting: string;
          standby: string;
          tariff: string;
        };
      };
      impact: {
        heading: string;
        subheading: string;
        annualCo2Label: string;
        treesTitle: string;
        treesDesc: string;
        treesUnit: string;
        carTitle: string;
        carDesc: string;
        carUnit: string;
        coalTitle: string;
        coalDesc: string;
        coalUnit: string;
      };
      demoBar: {
        label: string;
      };
    };
    simulator: {
      kicker: string;
      heading: string;
      subheading: string;
      tariffLabel: string;
      resetBtn: string;
      qtyLabel: string;
      hoursLabel: string;
      hrsPerDayUnit: string;
      monthlyShareLabel: string;
      summaryTitle: string;
      estMonthlyUnits: string;
      estMonthlyBill: string;
      estCarbon: string;
      vsAvgLabel: string;
      aboveAvgShort: string;
      belowAvgShort: string;
      analyzeCta: string;
      analyzingCta: string;
      zeroWarning: string;
      breakdownHeading: string;
      ofTotal: string;
      monthUnit: string;
    };
    shareModal: {
      title: string;
      subtitle: string;
      downloadPng: string;
      close: string;
      cardTagline: string;
      cardScore: string;
      cardFootprint: string;
      cardPotentialSavings: string;
      cardUnits: string;
      cardBill: string;
      cardCostUnit: string;
      cardPerMonth: string;
      cardFooterNote: string;
    };
    footer: {
      note: string;
      factor: string;
    };
  }
> = {
  en: {
    brand: 'WattWise',
    nav: {
      howItWorks: 'How it works',
      analyzer: 'Analyzer',
      simulator: 'Simulator',
      demoBills: 'Demo bills',
      uploadBill: 'Upload bill',
    },
    hero: {
      kicker: 'AI Energy & Carbon Guide · Built for Indian Households',
      headline: 'Understand your bill. Cut your carbon.',
      subcopy:
        'Electricity bills hide slab tariffs and fixed charges behind dense codes. Upload a photo or PDF of your bill—or try a live demo bill in one click—to uncover your true cost per unit, carbon footprint, and 5 practical rupee-saving actions.',
      primaryCta: 'Try demo bill',
      secondaryCta: 'Upload your bill',
      simulatorLink: 'Estimate with Appliance Simulator',
      trustLine: 'Works with BSES, Tata Power, BESCOM, MSEDCL, TANGEDCO & all Indian DISCOMs · JPG, PNG, PDF',
      imageAlt: 'Sunlit modern Indian home veranda with plants, rooftop solar panels, and a smart meter',
      captionTitle: 'Indian residential benchmark',
      captionStat: '90–100 kWh / month · 0.82 kg CO₂/kWh',
      highlightLabel: 'Grid Carbon Factor',
      highlightValue: '0.82 kg CO₂ / kWh',
    },
    howItWorks: {
      heading: 'How WattWise works in three steps',
      subheading: 'From a paper bill or PDF to clear rupee and carbon savings in under 15 seconds.',
      steps: [
        {
          num: '01.',
          title: 'Upload your bill or pick a demo',
          description:
            'Drop any state DISCOM bill image or PDF—no signup needed. If a corner is blurry, review and adjust any field manually before continuing.',
        },
        {
          num: '02.',
          title: 'Audit units, tariff & CO₂ footprint',
          description:
            'AI extracts kWh consumed, total rupees, billing dates, and cost per unit, then compares your home against the 95 kWh Indian household average.',
        },
        {
          num: '03.',
          title: 'Simulate appliances & act on 5 tips',
          description:
            'See which appliances drive your bill, act on 5 personalized saving tips with rupee and CO₂ estimates, and download your shareable report card.',
        },
      ],
    },
    upload: {
      sectionTitle: 'Analyze your electricity bill',
      sectionSubtitle: 'Upload a bill image or PDF, test a sample Indian bill, or enter meter numbers manually.',
      dropTitle: 'Drop your electricity bill here',
      dropHint: 'JPG, PNG, WebP or PDF up to 10 MB · Files and API keys stay private on the server',
      chooseFile: 'Choose image or PDF',
      orTryDemo: 'Instant sample bills',
      manualEntryLink: 'Enter bill numbers manually',
      analyzingTitle: 'Reading your electricity bill...',
      analyzingSteps: [
        'Scanning units consumed (kWh) and meter period',
        'Checking total rupees & effective tariff rate',
        'Computing carbon footprint & personalized saving actions',
      ],
      errorTitle: 'Could not read this file cleanly',
      errorRetry: 'Try another file',
      errorDemo: 'Load demo bill',
      errorManual: 'Enter values manually',
      fileTooLarge: 'This file is larger than 10 MB. Please upload a compressed PDF or smaller photo.',
      unsupportedType: 'Please upload a JPG, PNG, WebP image, or a PDF electricity bill.',
    },
    review: {
      title: 'Verify extracted bill details',
      partialAlert:
        'Some fields could not be read clearly from the file. Please fill in or verify the highlighted fields before continuing.',
      allFoundAlert:
        'We read your bill details successfully. Confirm or adjust any figure below to generate your personalized report.',
      unreadableAlert:
        'We could not confirm this as a readable electricity bill. Enter your bill figures manually below or try another photo.',
      unitsLabel: 'Units Consumed (kWh)',
      unitsHint: 'Total billed units for this cycle',
      unitsPlaceholder: 'e.g. 240',
      amountLabel: 'Total Bill Amount (₹)',
      amountHint: 'Net payable amount in rupees',
      amountPlaceholder: 'e.g. 1850',
      periodLabel: 'Billing Period',
      periodHint: 'e.g. Oct 2026 or 01 Oct – 31 Oct',
      periodPlaceholder: '01 Oct 2026 – 31 Oct 2026',
      tariffLabel: 'Tariff / Cost per Unit (₹/kWh)',
      tariffHint: 'Average energy rate per unit',
      tariffPlaceholder: 'e.g. 7.70',
      daysLabel: 'Billing Cycle (Days)',
      dayOptions: {
        d30: '30 days (Monthly)',
        d60: '60 days (Bi-monthly)',
        d31: '31 days',
        d28: '28 days',
      },
      providerLabel: 'Electricity Provider / DISCOM',
      providerPlaceholder: 'e.g. BSES, BESCOM, MSEDCL, Tata Power',
      missingTag: 'Needs input',
      submitBtn: 'Analyze bill & generate tips',
      submittingBtn: 'Calculating savings...',
      cancelBtn: 'Upload different file',
      validationError: 'Please enter valid positive numbers for units consumed and total bill amount.',
    },
    dashboard: {
      headerKicker: 'Energy & Carbon Report',
      demoNotice: 'Sample Demo Bill',
      editValues: 'Edit values',
      uploadAnother: 'New bill',
      shareResult: 'Share my result',
      co2SpotlightLabel: 'Total Bill Carbon Footprint',
      co2SpotlightSub: 'Calculated at India CEA grid emission factor of 0.82 kg CO₂ per kWh',
      co2PerMonthUnit: 'kg CO₂',
      summary: {
        unitsUsed: 'Units Used',
        unitsSub: 'kWh billed',
        amountPaid: 'Amount Paid',
        amountSub: 'Total rupee bill',
        costPerUnit: 'Cost per Unit',
        costPerUnitSub: 'Effective ₹ / kWh',
        carbonFootprint: 'Carbon Footprint',
        carbonSub: '0.82 kg CO₂ per kWh',
        treesEquivalent: 'trees/mo to absorb',
      },
      comparison: {
        title: 'Usage vs. Average Indian Household',
        subtitle: 'Monthly electricity use compared with the national residential average (90–100 kWh/month)',
        yourHome: 'Your Household',
        indianAvg: 'Average Indian Household',
        avgRangeNote: 'National benchmark band: 90–100 kWh / month',
        aboveAvg: 'higher than the Indian average',
        belowAvg: 'lower than the Indian average',
        atAvg: 'in line with the Indian average',
        monthlyEquivalentNote: 'Normalized to a 30-day month',
        monthShort: 'mo',
      },
      score: {
        title: 'Household Efficiency Score',
        outOf: 'out of 100',
        lowLoadHint: '100 = Highly Efficient',
        highLoadHint: '0 = Heavy Load',
        bands: {
          excellent: 'Highly Efficient',
          good: 'Balanced Usage',
          moderate: 'Room to Optimize',
          high: 'High Consumption',
        },
      },
      tipsSection: {
        heading: '5 Personalized Saving Tips',
        subheading: 'Tailored to your actual unit consumption and effective rupee rate per unit.',
        totalPotentialPrefix: 'Total potential savings:',
        perMonthLabel: 'per month',
        co2PerMonth: 'kg CO₂ / month',
        annualProjection: 'Annual saving potential',
        yearShort: 'yr',
        savePerMonth: 'Est. monthly saving',
        co2SavedLabel: 'Carbon cut',
        categories: {
          cooling: 'Cooling & AC',
          appliances: 'Appliances',
          lighting: 'Lighting',
          standby: 'Standby Power',
          tariff: 'Smart Scheduling',
        },
      },
      impact: {
        heading: 'Your Potential Carbon Impact',
        subheading: 'If you adopt the 5 saving actions above, here is what your annual CO₂ reduction equals in real life.',
        annualCo2Label: 'Annual CO₂ avoided',
        treesTitle: 'Trees Planted Equivalent',
        treesDesc: 'Equal to planting and growing mature trees absorbing CO₂ every year',
        treesUnit: 'trees / year',
        carTitle: 'Car Travel Avoided',
        carDesc: 'Equivalent to taking a petrol passenger car off Indian city roads',
        carUnit: 'km / year',
        coalTitle: 'Thermal Coal Saved',
        coalDesc: 'Fossil coal not burned at thermal power stations for your home',
        coalUnit: 'kg coal / year',
      },
      demoBar: {
        label: 'Switch sample Indian bill:',
      },
    },
    simulator: {
      kicker: 'Interactive Appliance Simulator',
      heading: 'Estimate your bill by household appliance',
      subheading:
        'Select your home appliances and adjust daily usage hours to see exactly how each device drives your monthly rupees and carbon footprint.',
      tariffLabel: 'Electricity tariff (₹ / kWh)',
      resetBtn: 'Reset defaults',
      qtyLabel: 'Qty',
      hoursLabel: 'Daily usage',
      hrsPerDayUnit: 'hrs/day',
      monthlyShareLabel: 'Monthly share',
      summaryTitle: 'Simulated Monthly Total',
      estMonthlyUnits: 'Estimated Units',
      estMonthlyBill: 'Estimated Monthly Bill',
      estCarbon: 'Estimated Carbon Footprint',
      vsAvgLabel: 'vs. 95 kWh Indian avg',
      aboveAvgShort: 'above avg',
      belowAvgShort: 'below avg',
      analyzeCta: 'Get 5 AI saving tips for this setup',
      analyzingCta: 'Generating AI tips...',
      zeroWarning: 'Add at least one appliance with usage hours above 0 to run AI tips.',
      breakdownHeading: 'Cost & CO₂ breakdown by appliance',
      ofTotal: 'of bill',
      monthUnit: 'mo',
    },
    shareModal: {
      title: 'Your Shareable WattWise Summary',
      subtitle: 'Download this clean report card as a PNG image to share with your family or housing society.',
      downloadPng: 'Download PNG card',
      close: 'Close',
      cardTagline: 'Understand your bill. Cut your carbon.',
      cardScore: 'Efficiency Score',
      cardFootprint: 'Carbon Footprint',
      cardPotentialSavings: 'Total Potential Savings',
      cardUnits: 'Units Used',
      cardBill: 'Total Bill',
      cardCostUnit: 'Cost / Unit',
      cardPerMonth: 'per month',
      cardFooterNote: 'Indian household benchmark: 90–100 kWh/month · Emission factor: 0.82 kg CO₂/kWh',
    },
    footer: {
      note: 'WattWise · Built for Indian households to decode electricity bills and lower carbon emissions.',
      factor: 'Emissions calculated using India Central Electricity Authority (CEA) grid factor: 0.82 kg CO₂/kWh.',
    },
  },
  hi: {
    brand: 'WattWise',
    nav: {
      howItWorks: 'कैसे काम करता है',
      analyzer: 'विश्लेषक',
      simulator: 'सिम्युलेटर',
      demoBills: 'डेमो बिल',
      uploadBill: 'बिल अपलोड करें',
    },
    hero: {
      kicker: 'AI ऊर्जा और कार्बन गाइड · भारतीय घरों के लिए निर्मित',
      headline: 'अपना बिजली बिल समझें। कार्बन घटाएं।',
      subcopy:
        'बिजली बिलों में स्लैब दरें और फिक्स्ड चार्ज जटिल कोड में छिपे होते हैं। अपने बिल की फोटो या PDF अपलोड करें—या एक क्लिक में डेमो बिल देखें—और जानें प्रति यूनिट सही लागत, कार्बन फुटप्रिंट और हर महीने पैसे बचाने के 5 व्यावहारिक उपाय।',
      primaryCta: 'डेमो बिल देखें',
      secondaryCta: 'अपना बिल अपलोड करें',
      simulatorLink: 'उपकरण सिम्युलेटर से अनुमान लगाएं',
      trustLine: 'BSES, Tata Power, BESCOM, MSEDCL, TANGEDCO व सभी भारतीय DISCOM बिल मान्य · JPG, PNG, PDF',
      imageAlt: 'धूप से भरा आधुनिक भारतीय घर का बरामदा, पौधे, सोलर पैनल और स्मार्ट बिजली मीटर',
      captionTitle: 'भारतीय घरेलू बिजली मानक',
      captionStat: '90–100 यूनिट / माह · 0.82 किग्रा CO₂/यूनिट',
      highlightLabel: 'ग्रिड कार्बन मानक',
      highlightValue: '0.82 किग्रा CO₂ / यूनिट',
    },
    howItWorks: {
      heading: 'WattWise तीन आसान चरणों में काम करता है',
      subheading: 'कागज़ के बिल या PDF से 15 सेकंड में साफ रुपये और कार्बन बचत रिपोर्ट पाएं।',
      steps: [
        {
          num: '01.',
          title: 'बिल अपलोड करें या डेमो चुनें',
          description:
            'किसी भी राज्य DISCOM के बिल की फोटो या PDF डालें—कोई साइन-अप नहीं। यदि कोई हिस्सा धुंधला हो, तो आप नंबर खुद सुधार सकते हैं।',
        },
        {
          num: '02.',
          title: 'यूनिट, दर और कार्बन जांचें',
          description:
            'AI कुल यूनिट (kWh), बिल राशि, अवधि और प्रति यूनिट लागत निकालता है, और आपकी खपत की तुलना 95 यूनिट के भारतीय औसत से करता है।',
        },
        {
          num: '03.',
          title: 'उपकरण सिम्युलेट करें और 5 उपाय अपनाएं',
          description:
            'जानें कौन-सा उपकरण कितना बिल बढ़ाता है, 5 सटीक बचत उपायों पर अमल करें, और अपना शेयर करने योग्य रिपोर्ट कार्ड डाउनलोड करें।',
        },
      ],
    },
    upload: {
      sectionTitle: 'अपने बिजली बिल का विश्लेषण करें',
      sectionSubtitle: 'बिल की फोटो या PDF अपलोड करें, सैंपल भारतीय बिल आज़माएं, या मीटर के नंबर खुद भरें।',
      dropTitle: 'अपना बिजली बिल यहाँ ड्रॉप करें',
      dropHint: 'JPG, PNG, WebP या PDF (अधिकतम 10 MB) · आपकी फ़ाइलें और API कुंजी पूरी तरह सुरक्षित हैं',
      chooseFile: 'फोटो या PDF चुनें',
      orTryDemo: 'तुरंत सैंपल बिल देखें',
      manualEntryLink: 'बिल का विवरण खुद भरें',
      analyzingTitle: 'आपका बिजली बिल पढ़ा जा रहा है...',
      analyzingSteps: [
        'खर्च हुई यूनिट (kWh) और बिल अवधि पढ़ी जा रही है',
        'कुल रुपये और प्रति यूनिट प्रभावी दर की जांच हो रही है',
        'कार्बन फुटप्रिंट और आपके लिए 5 बचत उपाय तैयार हो रहे हैं',
      ],
      errorTitle: 'यह फ़ाइल स्पष्ट रूप से पढ़ी नहीं जा सकी',
      errorRetry: 'दूसरी फ़ाइल चुनें',
      errorDemo: 'डेमो बिल लोड करें',
      errorManual: 'मान खुद दर्ज करें',
      fileTooLarge: 'फ़ाइल 10 MB से बड़ी है। कृपया छोटी फोटो या कंप्रेस्ड PDF अपलोड करें।',
      unsupportedType: 'कृपया JPG, PNG, WebP फोटो या PDF बिजली बिल ही अपलोड करें।',
    },
    review: {
      title: 'बिल से पढ़े गए विवरण जांचें',
      partialAlert:
        'फ़ाइल से कुछ विवरण स्पष्ट नहीं पढ़े जा सके। आगे बढ़ने से पहले कृपया चिह्नित बॉक्स भरें या जांच लें।',
      allFoundAlert:
        'बिल के सभी मुख्य विवरण सफलतापूर्वक पढ़ लिए गए हैं। रिपोर्ट देखने के लिए नीचे मान की पुष्टि करें।',
      unreadableAlert:
        'यह स्पष्ट बिजली बिल नहीं लग रहा है। कृपया नीचे विवरण मैन्युअल रूप से भरें या दूसरी साफ फोटो अपलोड करें।',
      unitsLabel: 'खर्च हुई यूनिट (kWh)',
      unitsHint: 'इस बिल चक्र की कुल यूनिट',
      unitsPlaceholder: 'जैसे: 240',
      amountLabel: 'कुल बिल राशि (₹)',
      amountHint: 'भुगतान की जाने वाली कुल राशि',
      amountPlaceholder: 'जैसे: 1850',
      periodLabel: 'बिल की अवधि',
      periodHint: 'जैसे: अक्टूबर 2026 या 01 Oct – 31 Oct',
      periodPlaceholder: '01 अक्टूबर 2026 – 31 अक्टूबर 2026',
      tariffLabel: 'प्रति यूनिट दर (₹/kWh)',
      tariffHint: 'औसत बिजली शुल्क प्रति यूनिट',
      tariffPlaceholder: 'जैसे: 7.70',
      daysLabel: 'बिल चक्र (दिन)',
      dayOptions: {
        d30: '30 दिन (मासिक)',
        d60: '60 दिन (द्विमासिक)',
        d31: '31 दिन',
        d28: '28 दिन',
      },
      providerLabel: 'बिजली कंपनी / DISCOM',
      providerPlaceholder: 'जैसे: BSES, BESCOM, MSEDCL, Tata Power',
      missingTag: 'जानकारी भरें',
      submitBtn: 'विश्लेषण करें और उपाय पाएं',
      submittingBtn: 'गणना हो रही है...',
      cancelBtn: 'दूसरा बिल अपलोड करें',
      validationError: 'कृपया यूनिट (kWh) और कुल बिल राशि के लिए सही सकारात्मक संख्या दर्ज करें।',
    },
    dashboard: {
      headerKicker: 'ऊर्जा और कार्बन रिपोर्ट',
      demoNotice: 'सैंपल डेमो बिल',
      editValues: 'मान बदलें',
      uploadAnother: 'नया बिल',
      shareResult: 'परिणाम शेयर करें',
      co2SpotlightLabel: 'इस बिल का कुल कार्बन फुटप्रिंट',
      co2SpotlightSub: 'भारत के CEA मानक 0.82 किग्रा CO₂ प्रति यूनिट (kWh) के आधार पर गणना',
      co2PerMonthUnit: 'किग्रा CO₂',
      summary: {
        unitsUsed: 'खर्च हुई यूनिट',
        unitsSub: 'कुल बिल यूनिट (kWh)',
        amountPaid: 'कुल बिल राशि',
        amountSub: 'रुपयों में भुगतान',
        costPerUnit: 'प्रति यूनिट लागत',
        costPerUnitSub: 'प्रभावी ₹ / यूनिट',
        carbonFootprint: 'कार्बन फुटप्रिंट',
        carbonSub: '0.82 किग्रा CO₂ प्रति यूनिट',
        treesEquivalent: 'पेड़/माह सोखने हेतु',
      },
      comparison: {
        title: 'आपकी खपत बनाम औसत भारतीय घर',
        subtitle: 'राष्ट्रीय घरेलू मानक (90–100 यूनिट/माह) के साथ आपकी मासिक खपत की तुलना',
        yourHome: 'आपका घर',
        indianAvg: 'औसत भारतीय घर',
        avgRangeNote: 'राष्ट्रीय मानक सीमा: 90–100 यूनिट / माह',
        aboveAvg: 'भारतीय औसत से अधिक है',
        belowAvg: 'भारतीय औसत से कम है',
        atAvg: 'भारतीय औसत के बिल्कुल बराबर है',
        monthlyEquivalentNote: '30-दिन के मासिक आधार पर समायोजित',
        monthShort: 'माह',
      },
      score: {
        title: 'ऊर्जा दक्षता स्कोर',
        outOf: '100 में से',
        lowLoadHint: '100 = अत्यंत कुशल',
        highLoadHint: '0 = अधिक खपत',
        bands: {
          excellent: 'उत्कृष्ट बचत',
          good: 'संतुलित खपत',
          moderate: 'सुधार की गुंजाइश',
          high: 'अधिक खपत',
        },
      },
      tipsSection: {
        heading: 'आपके लिए 5 व्यक्तिगत बचत उपाय',
        subheading: 'आपकी वास्तविक यूनिट खपत और प्रति यूनिट दर के आधार पर तैयार।',
        totalPotentialPrefix: 'कुल संभावित बचत:',
        perMonthLabel: 'प्रति माह',
        co2PerMonth: 'किग्रा CO₂ / माह',
        annualProjection: 'वार्षिक बचत क्षमता',
        yearShort: 'वर्ष',
        savePerMonth: 'अनुमानित मासिक बचत',
        co2SavedLabel: 'कार्बन कमी',
        categories: {
          cooling: 'कूलिंग और AC',
          appliances: 'घरेलू उपकरण',
          lighting: 'लाइटिंग',
          standby: 'स्टैंडबाय बिजली',
          tariff: 'स्मार्ट उपयोग समय',
        },
      },
      impact: {
        heading: 'आपकी बचत का पर्यावरण प्रभाव',
        subheading: 'यदि आप ऊपर दिए 5 उपाय अपनाते हैं, तो साल भर में बचाई गई CO₂ का वास्तविक असर कुछ ऐसा होगा:',
        annualCo2Label: 'वार्षिक CO₂ कमी',
        treesTitle: 'पेड़ लगाने के बराबर',
        treesDesc: 'इतने परिपक्व पेड़ लगाने और उगाने के बराबर जो हर साल CO₂ सोखते हैं',
        treesUnit: 'पेड़ / वर्ष',
        carTitle: 'कार यात्रा में कमी',
        carDesc: 'इतने किलोमीटर पेट्रोल कार कम चलाने से होने वाले उत्सर्जन की बचत',
        carUnit: 'किमी / वर्ष',
        coalTitle: 'थर्मल कोयले की बचत',
        coalDesc: 'बिजली घरों में आपके घर के लिए इतना कोयला जलने से बचेगा',
        coalUnit: 'किग्रा कोयला / वर्ष',
      },
      demoBar: {
        label: 'सैंपल भारतीय बिल बदलें:',
      },
    },
    simulator: {
      kicker: 'इंटरैक्टिव उपकरण सिम्युलेटर',
      heading: 'घरेलू उपकरणों के अनुसार अपने बिल का अनुमान लगाएं',
      subheading:
        'अपने घर के उपकरण चुनें और रोज़ाना उपयोग के घंटे सेट करें—देखें हर उपकरण आपके मासिक बिल और कार्बन फुटप्रिंट में कितना हिस्सा जोड़ता है।',
      tariffLabel: 'बिजली की दर (₹ / यूनिट)',
      resetBtn: 'डिफ़ॉल्ट रीसेट करें',
      qtyLabel: 'संख्या',
      hoursLabel: 'दैनिक उपयोग',
      hrsPerDayUnit: 'घंटे/दिन',
      monthlyShareLabel: 'मासिक हिस्सा',
      summaryTitle: 'अनुमानित मासिक कुल',
      estMonthlyUnits: 'अनुमानित यूनिट',
      estMonthlyBill: 'अनुमानित मासिक बिल',
      estCarbon: 'अनुमानित कार्बन फुटप्रिंट',
      vsAvgLabel: '95 यूनिट भारतीय औसत से',
      aboveAvgShort: 'औसत से अधिक',
      belowAvgShort: 'औसत से कम',
      analyzeCta: 'इस सेटअप के लिए 5 AI बचत उपाय पाएं',
      analyzingCta: 'AI उपाय तैयार हो रहे हैं...',
      zeroWarning: 'कृपया कम से कम एक उपकरण और उसके उपयोग के घंटे चुनें।',
      breakdownHeading: 'उपकरण के अनुसार खर्च और CO₂ विवरण',
      ofTotal: 'हिस्सा',
      monthUnit: 'माह',
    },
    shareModal: {
      title: 'आपका WattWise समरी कार्ड',
      subtitle: 'अपने परिवार या सोसाइटी के साथ साझा करने के लिए इस रिपोर्ट कार्ड को PNG इमेज के रूप में डाउनलोड करें।',
      downloadPng: 'PNG कार्ड डाउनलोड करें',
      close: 'बंद करें',
      cardTagline: 'अपना बिजली बिल समझें। कार्बन घटाएं।',
      cardScore: 'दक्षता स्कोर',
      cardFootprint: 'कार्बन फुटप्रिंट',
      cardPotentialSavings: 'कुल संभावित बचत',
      cardUnits: 'कुल यूनिट',
      cardBill: 'कुल बिल',
      cardCostUnit: 'प्रति यूनिट दर',
      cardPerMonth: 'प्रति माह',
      cardFooterNote: 'भारतीय घरेलू मानक: 90–100 यूनिट/माह · उत्सर्जन मानक: 0.82 किग्रा CO₂/यूनिट',
    },
    footer: {
      note: 'WattWise · भारतीय घरों को बिजली बिल समझने और कार्बन कम करने में मदद करने के लिए निर्मित।',
      factor: 'कार्बन गणना भारत के केंद्रीय विद्युत प्राधिकरण (CEA) मानक 0.82 किग्रा CO₂/kWh पर आधारित है।',
    },
  },
};
