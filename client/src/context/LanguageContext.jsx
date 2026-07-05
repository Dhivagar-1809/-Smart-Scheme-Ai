import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    brandName: "Smart Scheme Assistant",
    tagline: "Find Government Benefits You're Eligible For in Seconds.",
    navHome: "Home",
    navFeatures: "Features",
    navAbout: "About",
    navContact: "Contact",
    navLogin: "Login",
    navSignup: "Signup",
    navLogout: "Logout",
    
    heroTitle: "Discover Government Benefits Instantly",
    heroSubtitle: "Use AI to instantly find government welfare schemes based on your eligibility. Secure financial support and resources.",
    btnCheckEligibility: "Check Eligibility",
    btnExploreSchemes: "Explore Schemes",
    
    sectionFeatures: "Features Built For Citizens",
    sectionHowItWorks: "How It Works",
    sectionFAQ: "Frequently Asked Questions",
    
    sidebarDashboard: "Dashboard",
    sidebarEligibility: "Eligibility Checker",
    sidebarSaved: "Saved Schemes",
    sidebarBookmarks: "Bookmarks",
    sidebarDownloads: "Downloads & Reports",
    sidebarChat: "AI Chat Assistant",
    sidebarProfile: "Profile Page",
    sidebarSettings: "Settings & Options",
    sidebarAdmin: "Admin Panel",
    sidebarApplications: "My Applications",
    
    formName: "Full Name",
    formAge: "Age",
    formGender: "Gender",
    formState: "State",
    formDistrict: "District",
    formOccupation: "Occupation",
    formIncome: "Annual Income (Rs.)",
    formEducation: "Education Level",
    formCategory: "Social Category",
    formFarmer: "Are you a Farmer?",
    formStudent: "Are you a Student?",
    formSenior: "Are you a Senior Citizen?",
    formDisability: "Do you have a Disability?",
    formWidow: "Are you a Widow?",
    btnFindSchemes: "Find Eligible Schemes",
    
    btnSaveProfile: "Save Changes",
    recentSearches: "Recent Searches",
    recentReports: "Generated Reports",
    noRecords: "No records found.",
    welcomeUser: "Welcome back",
    
    chatPlaceholder: "Ask which scholarships you can apply for, or about PM-KISAN..."
  },
  hi: {
    brandName: "स्मार्ट योजना सहायक",
    tagline: "कुछ ही सेकंड में उन सरकारी लाभों को खोजें जिनके लिए आप पात्र हैं।",
    navHome: "होम",
    navFeatures: "विशेषताएं",
    navAbout: "हमारे बारे में",
    navContact: "संपर्क",
    navLogin: "लॉगिन",
    navSignup: "साइनअप",
    navLogout: "लॉगआउट",
    
    heroTitle: "सरकारी लाभों को तुरंत खोजें",
    heroSubtitle: "अपनी पात्रता के आधार पर तुरंत सरकारी कल्याण योजनाओं को खोजने के लिए एआई का उपयोग करें।",
    btnCheckEligibility: "पात्रता जांचें",
    btnExploreSchemes: "योजनाएं खोजें",
    
    sectionFeatures: "नागरिकों के लिए निर्मित विशेषताएं",
    sectionHowItWorks: "यह कैसे काम करता है",
    sectionFAQ: "अक्सर पूछे जाने वाले प्रश्न",
    
    sidebarDashboard: "डैशबोर्ड",
    sidebarEligibility: "पात्रता जांचकर्ता",
    sidebarSaved: "सहेजी गई योजनाएं",
    sidebarBookmarks: "बुकमार्क",
    sidebarDownloads: "डाउनलोड और रिपोर्ट",
    sidebarChat: "एआई चैट सहायक",
    sidebarProfile: "प्रोफ़ाइल पेज",
    sidebarSettings: "सेटिंग्स",
    sidebarAdmin: "एडमिन पैनल",
    sidebarApplications: "मेरे आवेदन",
    
    formName: "पूरा नाम",
    formAge: "आयु",
    formGender: "लिंग",
    formState: "राज्य",
    formDistrict: "ज़िला",
    formOccupation: "व्यवसाय",
    formIncome: "वार्षिक आय (रु.)",
    formEducation: "शिक्षा का स्तर",
    formCategory: "सामाजिक श्रेणी",
    formFarmer: "क्या आप किसान हैं?",
    formStudent: "क्या आप छात्र हैं?",
    formSenior: "क्या आप वरिष्ठ नागरिक हैं?",
    formDisability: "क्या आप दिव्यांग हैं?",
    formWidow: "क्या आप विधवा हैं?",
    btnFindSchemes: "पात्र योजनाएं खोजें",
    
    btnSaveProfile: "बदलाव सहेजें",
    recentSearches: "हाल ही की खोजें",
    recentReports: "जनरेट की गई रिपोर्ट",
    noRecords: "कोई रिकॉर्ड नहीं मिला।",
    welcomeUser: "स्वागत है",
    
    chatPlaceholder: "पूछें कि आप किन छात्रवृत्तियों के लिए आवेदन कर सकते हैं, या पीएम-किसान के बारे में..."
  },
  ta: {
    brandName: "ஸ்மார்ட் திட்ட உதவியாளர்",
    tagline: "நீங்கள் தகுதியுடைய அரசு நலத்திட்டங்களை நொடிகளில் கண்டறியுங்கள்.",
    navHome: "முகப்பு",
    navFeatures: "அம்சங்கள்",
    navAbout: "எங்களைப் பற்றி",
    navContact: "தொடர்பு",
    navLogin: "உள்நுழை",
    navSignup: "பதிவு செய்",
    navLogout: "வெளியேறு",
    
    heroTitle: "அரசு நலத்திட்டங்களை உடனே கண்டறியுங்கள்",
    heroSubtitle: "உங்கள் தகுதியின் அடிப்படையில் அரசு நலத்திட்டங்களை உடனே கண்டறிய செயற்கை நுண்ணறிவை (AI) பயன்படுத்துங்கள்.",
    btnCheckEligibility: "தகுதியைச் சரிபார்",
    btnExploreSchemes: "திட்டங்களை ஆராய்",
    
    sectionFeatures: "மக்களுக்கான சிறப்பம்சங்கள்",
    sectionHowItWorks: "செயல்படும் முறை",
    sectionFAQ: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    
    sidebarDashboard: "டாஷ்போர்டு",
    sidebarEligibility: "தகுதி சரிபார்ப்பு",
    sidebarSaved: "சேமித்த திட்டங்கள்",
    sidebarBookmarks: "புத்தகக்குறிகள்",
    sidebarDownloads: "பதிவிறக்கங்கள் & அறிக்கைகள்",
    sidebarChat: "AI அரட்டை உதவியாளர்",
    sidebarProfile: "சுயவிவரப் பக்கம்",
    sidebarSettings: "அமைப்புகள்",
    sidebarAdmin: "நிர்வாகக் குழு",
    sidebarApplications: "எனது விண்ணப்பங்கள்",
    
    formName: "முழு பெயர்",
    formAge: "வயது",
    formGender: "பாலினம்",
    formState: "மாநிலம்",
    formDistrict: "மாவட்டம்",
    formOccupation: "தொழில்",
    formIncome: "ஆண்டு வருமானம் (ரூ.)",
    formEducation: "கல்வித் தகுதி",
    formCategory: "சமூகப் பிரிவு",
    formFarmer: "நீங்கள் விவசாயியா?",
    formStudent: "நீங்கள் மாணவரா?",
    formSenior: "நீங்கள் மூத்த குடிமகனா?",
    formDisability: "உங்களுக்கு மாற்றுத்திறன் உள்ளதா?",
    formWidow: "நீங்கள் விதவையா?",
    btnFindSchemes: "தகுதியான திட்டங்களைக் காண்க",
    
    btnSaveProfile: "மாற்றங்களைச் சேமி",
    recentSearches: "சமீபத்திய தேடல்கள்",
    recentReports: "உருவாக்கப்பட்ட அறிக்கைகள்",
    noRecords: "பதிவுகள் எதுவும் இல்லை.",
    welcomeUser: "நல்வரவு",
    
    chatPlaceholder: "நீங்கள் எந்த உதவித்தொகைக்கு விண்ணப்பிக்கலாம் அல்லது பிஎம்-கிசான் பற்றி கேளுங்கள்..."
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('lang', newLang);
    }
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
