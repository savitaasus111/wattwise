import { DemoBillPreset } from '../types/bill';

export const DEMO_BILLS: DemoBillPreset[] = [
  {
    id: 'delhi-summer',
    name: {
      en: 'Delhi Summer 3BHK · 342 kWh',
      hi: 'दिल्ली गर्मी 3BHK · 342 यूनिट',
    },
    subtitle: {
      en: 'BSES Rajdhani · ₹2,910',
      hi: 'BSES राजधानी · ₹2,910',
    },
    result: {
      bill: {
        unitsConsumed: 342,
        totalAmountInr: 2910,
        billingPeriod: '01 Oct – 31 Oct 2026',
        tariffRatePerUnit: 8.51,
        billingDays: 30,
        providerName: 'BSES Rajdhani Power Ltd',
        consumerLocation: 'New Delhi',
      },
      carbonFootprintKg: 280.4,
      monthlyUnitsNormalized: 342,
      indianAverageKwh: 95,
      efficiencyScore: 41,
      efficiencyExplanation: {
        en: 'At 342 kWh/month, your consumption is 3.6× the Indian household average (90–100 kWh), largely driven by slab jumps above 200 units and evening AC cooling.',
        hi: '342 यूनिट/माह पर आपकी खपत भारतीय घरेलू औसत (90–100 यूनिट) से 3.6 गुना है, जिसका मुख्य कारण 200 यूनिट से ऊपर का उच्च टैरिफ स्लैब और AC उपयोग है।',
      },
      tips: [
        {
          id: 'demo-1-1',
          category: 'cooling',
          title: {
            en: 'Set split AC to 24°C with ceiling fan on',
            hi: 'AC को 24°C पर रखें और पंखा साथ चलाएं',
          },
          action: {
            en: 'Raising AC temperature from 19°C to 24°C cuts compressor draw by ~24% every night.',
            hi: 'AC का तापमान 19°C से 24°C करने पर हर रात कंप्रेसर की बिजली लगभग 24% कम खर्च होती है।',
          },
          monthlyRupeesSaved: 390,
          monthlyCo2SavedKg: 37.7,
        },
        {
          id: 'demo-1-2',
          category: 'appliances',
          title: {
            en: 'Swap 3 old ceiling fans for BLDC fans',
            hi: '3 पुराने पंखों की जगह BLDC पंखे लगाएं',
          },
          action: {
            en: 'BLDC fans consume 28W instead of 75W, saving over 25 units a month across living rooms.',
            hi: 'BLDC पंखे 75W की जगह सिर्फ 28W लेते हैं, जिससे महीने में 25 से अधिक यूनिट बचती हैं।',
          },
          monthlyRupeesSaved: 220,
          monthlyCo2SavedKg: 21.3,
        },
        {
          id: 'demo-1-3',
          category: 'standby',
          title: {
            en: 'Switch off TV, Wi-Fi & microwave at the wall',
            hi: 'टीवी, सेट-टॉप बॉक्स और माइक्रोवेव मुख्य स्विच से बंद करें',
          },
          action: {
            en: 'Eliminate phantom standby loads overnight using a master surge strip.',
            hi: 'रात में मुख्य स्विच बंद रखकर बिना उपयोग होने वाली स्टैंडबाय बिजली बचाएं।',
          },
          monthlyRupeesSaved: 105,
          monthlyCo2SavedKg: 9.8,
        },
        {
          id: 'demo-1-4',
          category: 'appliances',
          title: {
            en: 'Clean AC mesh filters every 2 weeks',
            hi: 'हर 15 दिन में AC का फ़िल्टर साफ करें',
          },
          action: {
            en: 'Dust-free coils cool rooms 10% faster without forcing the compressor to run overtime.',
            hi: 'साफ फ़िल्टर से AC कमरा 10% तेजी से ठंडा करता है और कंप्रेसर पर अतिरिक्त लोड नहीं पड़ता।',
          },
          monthlyRupeesSaved: 145,
          monthlyCo2SavedKg: 13.9,
        },
        {
          id: 'demo-1-5',
          category: 'tariff',
          title: {
            en: 'Run washing machine on cold-wash & full loads',
            hi: 'वॉशिंग मशीन को ठंडे पानी और पूरे लोड पर चलाएं',
          },
          action: {
            en: 'Skip built-in hot water cycles and consolidate laundry to 3 full loads per week.',
            hi: 'मशीन के हीटर मोड को बंद रखें और सप्ताह में 3 बार पूरे लोड के साथ कपड़े धोएं।',
          },
          monthlyRupeesSaved: 85,
          monthlyCo2SavedKg: 8.2,
        },
      ],
      totalMonthlyRupeesSaved: 945,
      totalMonthlyCo2SavedKg: 90.9,
      isDemo: true,
      demoLabel: {
        en: 'Delhi Summer 3BHK (BSES Rajdhani)',
        hi: 'दिल्ली गर्मी 3BHK (BSES राजधानी)',
      },
    },
  },
  {
    id: 'bengaluru-2bhk',
    name: {
      en: 'Bengaluru 2BHK · 168 kWh',
      hi: 'बेंगलुरु 2BHK · 168 यूनिट',
    },
    subtitle: {
      en: 'BESCOM · ₹1,195',
      hi: 'BESCOM · ₹1,195',
    },
    result: {
      bill: {
        unitsConsumed: 168,
        totalAmountInr: 1195,
        billingPeriod: '05 Oct – 04 Nov 2026',
        tariffRatePerUnit: 7.11,
        billingDays: 30,
        providerName: 'BESCOM Bangalore',
        consumerLocation: 'Bengaluru, Karnataka',
      },
      carbonFootprintKg: 137.8,
      monthlyUnitsNormalized: 168,
      indianAverageKwh: 95,
      efficiencyScore: 67,
      efficiencyExplanation: {
        en: 'Your 168 kWh monthly usage is moderate for an urban 2BHK, sitting above the 95 kWh national benchmark mainly due to water heating and fridge efficiency.',
        hi: 'शहरी 2BHK के लिए आपकी 168 यूनिट खपत मध्यम है, जो मुख्यतः गीज़र और फ्रिज के कारण 95 यूनिट के राष्ट्रीय औसत से थोड़ी अधिक है।',
      },
      tips: [
        {
          id: 'demo-2-1',
          category: 'appliances',
          title: {
            en: 'Add a 15-minute timer to your bathroom geyser',
            hi: 'बाथरूम गीज़र के लिए 15-मिनट टाइमर अपनाएं',
          },
          action: {
            en: 'Turn off the 2000W water heater immediately after heating instead of leaving it on standby.',
            hi: 'पानी गर्म होते ही 2000W गीज़र बंद कर दें ताकि वह बार-बार री-हीट न करे।',
          },
          monthlyRupeesSaved: 170,
          monthlyCo2SavedKg: 19.7,
        },
        {
          id: 'demo-2-2',
          category: 'appliances',
          title: {
            en: 'Keep fridge at 4°C & leave 5 cm rear wall gap',
            hi: 'फ्रिज को 4°C पर रखें और दीवार से 5 सेमी दूर रखें',
          },
          action: {
            en: 'Proper coil ventilation prevents overheating and cuts refrigerator electricity use by ~12%.',
            hi: 'पीछे हवा गुजरने की जगह रखने से फ्रिज कम गर्म होता है और 12% कम बिजली लेता है।',
          },
          monthlyRupeesSaved: 65,
          monthlyCo2SavedKg: 7.4,
        },
        {
          id: 'demo-2-3',
          category: 'lighting',
          title: {
            en: 'Switch remaining CFLs/tubes to 9W LED bulbs',
            hi: 'बाकी ट्यूबलाइट या CFL को 9W LED से बदलें',
          },
          action: {
            en: 'Replacing 4 legacy bulbs with BEE 5-star LEDs trims lighting power by more than half.',
            hi: '4 पुरानी लाइटों को 5-स्टार LED से बदलने पर रोशनी का खर्च आधे से कम हो जाता है।',
          },
          monthlyRupeesSaved: 55,
          monthlyCo2SavedKg: 6.6,
        },
        {
          id: 'demo-2-4',
          category: 'standby',
          title: {
            en: 'Unplug laptop & router chargers overnight',
            hi: 'रात में लैपटॉप और अनचाहे चार्जर बंद रखें',
          },
          action: {
            en: 'Avoid leaving desktop monitors and inverter chargers idling 8 hours every night.',
            hi: 'रात भर मॉनिटर और चार्जर को स्विच ऑन न छोड़ें; स्लीप के बजाय पावर ऑफ करें।',
          },
          monthlyRupeesSaved: 45,
          monthlyCo2SavedKg: 4.9,
        },
        {
          id: 'demo-2-5',
          category: 'tariff',
          title: {
            en: 'Iron all weekly clothes in one single batch',
            hi: 'सप्ताह भर के कपड़े एक ही बार में इस्त्री करें',
          },
          action: {
            en: 'Heating a 1000W steam iron once instead of daily saves repeated warm-up surges.',
            hi: 'रोज़ 1000W आयरन गर्म करने के बजाय एक साथ प्रेस करने से शुरुआती बिजली बर्बादी रुकती है।',
          },
          monthlyRupeesSaved: 40,
          monthlyCo2SavedKg: 4.1,
        },
      ],
      totalMonthlyRupeesSaved: 375,
      totalMonthlyCo2SavedKg: 42.7,
      isDemo: true,
      demoLabel: {
        en: 'Bengaluru 2BHK (BESCOM)',
        hi: 'बेंगलुरु 2BHK (BESCOM)',
      },
    },
  },
  {
    id: 'pune-efficient',
    name: {
      en: 'Pune Efficient Home · 86 kWh',
      hi: 'पुणे किफायती घर · 86 यूनिट',
    },
    subtitle: {
      en: 'MSEDCL · ₹540',
      hi: 'MSEDCL · ₹540',
    },
    result: {
      bill: {
        unitsConsumed: 86,
        totalAmountInr: 540,
        billingPeriod: '01 Oct – 31 Oct 2026',
        tariffRatePerUnit: 6.28,
        billingDays: 30,
        providerName: 'MSEDCL Mahavitaran',
        consumerLocation: 'Pune, Maharashtra',
      },
      carbonFootprintKg: 70.5,
      monthlyUnitsNormalized: 86,
      indianAverageKwh: 95,
      efficiencyScore: 86,
      efficiencyExplanation: {
        en: 'Great work—at 86 kWh/month, your home stays under the 100-unit subsidized slab and uses 9% less power than the Indian household average.',
        hi: 'बहुत बढ़िया—86 यूनिट/माह के साथ आपका घर 100-यूनिट के किफायती स्लैब में है और भारतीय औसत से 9% कम बिजली खर्च करता है।',
      },
      tips: [
        {
          id: 'demo-3-1',
          category: 'cooling',
          title: {
            en: 'Use cross-ventilation before 10 AM & after 7 PM',
            hi: 'सुबह 10 से पहले और शाम 7 के बाद क्रॉस-वेंटिलेशन रखें',
          },
          action: {
            en: 'Keep curtains drawn during noon hours to cut afternoon fan speeds by one notch.',
            hi: 'दोपहर में पर्दे बंद रखें ताकि कमरा ठंडा रहे और पंखा धीमी गति पर चल सके।',
          },
          monthlyRupeesSaved: 35,
          monthlyCo2SavedKg: 4.9,
        },
        {
          id: 'demo-3-2',
          category: 'lighting',
          title: {
            en: 'Install a dusk sensor or timer on balcony lights',
            hi: 'बालकनी की लाइट में टाइमर या लो-वाट LED लगाएं',
          },
          action: {
            en: 'Prevent 10-hour overnight balcony lighting by switching to a 3W warm LED.',
            hi: 'पूरी रात जलने वाली बालकनी लाइट की जगह 3W LED या टाइमर का उपयोग करें।',
          },
          monthlyRupeesSaved: 25,
          monthlyCo2SavedKg: 3.3,
        },
        {
          id: 'demo-3-3',
          category: 'appliances',
          title: {
            en: 'Defrost refrigerator freezer compartment monthly',
            hi: 'महीने में एक बार फ्रिज का डीफ़्रॉस्ट करें',
          },
          action: {
            en: 'Thick ice buildup insulates cooling coils and makes the compressor run 15% longer.',
            hi: 'अधिक बर्फ जमने से कंप्रेसर को 15% अधिक काम करना पड़ता है; समय पर डीफ़्रॉस्ट करें।',
          },
          monthlyRupeesSaved: 30,
          monthlyCo2SavedKg: 4.1,
        },
        {
          id: 'demo-3-4',
          category: 'standby',
          title: {
            en: 'Power down smart speakers & TV box at night',
            hi: 'रात में टीवी सेट-टॉप बॉक्स और स्पीकर बंद करें',
          },
          action: {
            en: 'Idle DTH boxes draw 12–15W continuously even when the television screen is off.',
            hi: 'टीवी बंद होने पर भी सेट-टॉप बॉक्स लगातार 12–15W बिजली खींचता रहता है।',
          },
          monthlyRupeesSaved: 35,
          monthlyCo2SavedKg: 4.9,
        },
        {
          id: 'demo-3-5',
          category: 'tariff',
          title: {
            en: 'Keep usage strictly below 100 kWh slab cap',
            hi: 'मासिक खपत को हमेशा 100 यूनिट स्लैब के नीचे रखें',
          },
          action: {
            en: 'Check your meter mid-month so you never cross into MSEDCL’s higher 101–300 unit tariff.',
            hi: 'महीने के बीच में मीटर जांचें ताकि आप 101–300 यूनिट के महंगे स्लैब में न जाएं।',
          },
          monthlyRupeesSaved: 50,
          monthlyCo2SavedKg: 4.1,
        },
      ],
      totalMonthlyRupeesSaved: 175,
      totalMonthlyCo2SavedKg: 21.3,
      isDemo: true,
      demoLabel: {
        en: 'Pune Efficient Home (MSEDCL)',
        hi: 'पुणे किफायती घर (MSEDCL)',
      },
    },
  },
];
