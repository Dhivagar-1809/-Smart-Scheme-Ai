import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Scheme } from '../models/schemas.js';
import connectDB from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const schemesData = [
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "An initiative by the Government of India that provides up to Rs. 6,000 per year in three equal installments to all landholding farmer families across the country to support their financial needs.",
    category: "Agriculture",
    state: "Central",
    eligibility: {
      isFarmer: true,
      incomeMax: 9999999, // No strict income limit, but based on landholding exclusion criteria
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Rs. 6,000 per year paid in three equal installments of Rs. 2,000 directly into the bank accounts of farmers every four months.",
    documents: ["Aadhar Card", "Land Ownership Documents (Khatauni)", "Bank Account Details", "Mobile Number linked with Aadhaar"],
    officialWebsite: "https://pmkisan.gov.in/",
    deadline: "Ongoing",
    department: "Department of Agriculture and Farmers Welfare"
  },
  {
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    description: "The largest health assurance scheme in the world, aiming to provide free health cover of Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.",
    category: "Health",
    state: "Central",
    eligibility: {
      incomeMax: 120000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Cashless health cover of up to Rs. 5,00,000 per family per year for secondary and tertiary care hospitalization expenses.",
    documents: ["Aadhaar Card", "Ration Card (under NFSA)", "Poverty Line Card / Income Certificate", "Family ID Card"],
    officialWebsite: "https://pmjay.gov.in/",
    deadline: "Ongoing",
    department: "National Health Authority (NHA)"
  },
  {
    name: "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
    description: "A flagship mission of the Government of India implemented by the Ministry of Housing and Urban Affairs, which addresses urban housing shortage among the EWS/LIG and MIG categories.",
    category: "Housing",
    state: "Central",
    eligibility: {
      incomeMax: 1800000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Interest subsidy of up to 6.5% on home loans for EWS/LIG, and direct financial assistance of Rs. 1.5 Lakhs for construction.",
    documents: ["Aadhaar Card", "Voter ID Card", "Income Certificate / Salary Slips", "Property Documents", "Affidavit stating no other brick house is owned in India"],
    officialWebsite: "https://pmay-urban.gov.in/",
    deadline: "Ongoing",
    department: "Ministry of Housing and Urban Affairs"
  },
  {
    name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    description: "A social welfare program created by the Indian Government to provide a pucca house with basic amenities to all homeless householders and those households living in dilapidated houses in rural areas.",
    category: "Housing",
    state: "Central",
    eligibility: {
      incomeMax: 120000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Financial assistance of Rs. 1.2 Lakhs in plain areas and Rs. 1.3 Lakhs in hilly/difficult areas for house construction.",
    documents: ["Aadhaar Card", "Job Card (MGNREGA)", "Bank Account Details", "Swachh Bharat Mission (SBM) Number", "Income Certificate"],
    officialWebsite: "https://pmayg.nic.in/",
    deadline: "Ongoing",
    department: "Ministry of Rural Development"
  },
  {
    name: "Atal Pension Yojana (APY)",
    description: "A pension scheme focused on the unorganized sector workers, providing a guaranteed minimum pension of Rs. 1,000 to Rs. 5,000 per month after the age of 60 years based on their contributions.",
    category: "Pension",
    state: "Central",
    eligibility: {
      ageMin: 18,
      ageMax: 40,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Guaranteed minimum pension ranging from Rs. 1,000 to Rs. 5,000 per month from the age of 60 years, with spouse benefit and return of corpus to nominee.",
    documents: ["Aadhaar Card", "Savings Bank Account", "Mobile Number"],
    officialWebsite: "https://www.npscra.nsdl.co.in/",
    deadline: "Ongoing",
    department: "Pension Fund Regulatory and Development Authority (PFRDA)"
  },
  {
    name: "Sukanya Samriddhi Yojana (SSY)",
    description: "A small deposit scheme for a girl child launched as a part of the 'Beti Bachao Beti Padhao' campaign. It offers high interest rates and tax savings for building a corpus for a girl child's education and marriage.",
    category: "Women Welfare",
    state: "Central",
    eligibility: {
      gender: "Female",
      ageMax: 10,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "High government-backed compound interest rate (currently around 8.2%) with full tax exemption under Section 80C. Account matures in 21 years or upon marriage after age 18.",
    documents: ["Birth Certificate of Girl Child", "Aadhaar Card of Parent/Guardian", "Address Proof", "Identity Proof of Parent/Guardian"],
    officialWebsite: "https://www.indiapost.gov.in/",
    deadline: "Ongoing",
    department: "Department of Posts / Ministry of Finance"
  },
  {
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    description: "A maternity benefit program run by the government of India. It is a conditional cash transfer scheme for pregnant and lactating women of 19 years of age or above for the first two live births.",
    category: "Women Welfare",
    state: "Central",
    eligibility: {
      gender: "Female",
      ageMin: 19,
      isWidow: false,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Cash incentive of Rs. 5,000 in two installments for the first child, and Rs. 6,000 for the second child (if girl) to compensate for wage loss and promote nutrition.",
    documents: ["Aadhaar Card of Self and Husband", "Mother-Child Protection Card (MCP)", "Bank Passbook", "Birth Registration Certificate"],
    officialWebsite: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
    deadline: "Ongoing",
    department: "Ministry of Women and Child Development"
  },
  {
    name: "Post-Matric Scholarship Scheme for SC Students",
    description: "A centrally sponsored scheme that provides financial assistance to Scheduled Caste students studying at post-matriculation or post-secondary stages to enable them to complete their education.",
    category: "Education",
    state: "Central",
    eligibility: {
      isStudent: true,
      incomeMax: 250000,
      categories: ["SC"],
      states: []
    },
    benefits: "100% compulsory non-refundable fees reimbursement and maintenance allowance ranging from Rs. 2,500 to Rs. 13,500 per year depending on the course.",
    documents: ["Aadhaar Card", "Caste Certificate", "Income Certificate (issued by competent authority)", "Previous Year Marksheet", "Fee Receipt / College Admission Letter"],
    officialWebsite: "https://scholarships.gov.in/",
    deadline: "November 30 (Varies Yearly)",
    department: "Ministry of Social Justice and Empowerment"
  },
  {
    name: "Post-Matric Scholarship for OBC Students",
    description: "Financial assistance to students belonging to Other Backward Classes (OBC) to pursue post-matriculation courses, helping reduce drop-outs and supporting higher education.",
    category: "Education",
    state: "Central",
    eligibility: {
      isStudent: true,
      incomeMax: 250000,
      categories: ["OBC"],
      states: []
    },
    benefits: "Reimbursement of tuition fees and academic allowances starting from Rs. 2,000 to Rs. 10,000 per year based on courses and hostel status.",
    documents: ["Aadhaar Card", "OBC Caste Certificate", "Income Certificate", "Academic Records (10th/12th/Degree)", "Bank Passbook"],
    officialWebsite: "https://scholarships.gov.in/",
    deadline: "November 30 (Varies)",
    department: "Ministry of Social Justice and Empowerment"
  },
  {
    name: "PM Mudra Yojana (PMMY)",
    description: "A scheme to provide loans up to Rs. 10 Lakhs to non-corporate, non-farm small/micro enterprises. The loans are categorized as Shishu (up to 50k), Kishor (50k-5L), and Tarun (5L-10L).",
    category: "Business",
    state: "Central",
    eligibility: {
      ageMin: 18,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Collateral-free business loans up to Rs. 10,000,000 from banks, microfinance institutions, and NBFCs with flexible repayment terms.",
    documents: ["Aadhaar/PAN/Voter ID", "Business Address Proof", "Business Plan / Project Report", "Quotation of Machinery / Items to be purchased", "Passport size photos"],
    officialWebsite: "https://www.mudra.org.in/",
    deadline: "Ongoing",
    department: "Department of Financial Services / Ministry of Finance"
  },
  {
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    description: "A credit-linked subsidy program for setting up new micro-enterprises in rural and urban areas, aiming to generate employment opportunities.",
    category: "Business",
    state: "Central",
    eligibility: {
      ageMin: 18,
      educationMin: "8th Pass",
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Government subsidy of 15% to 35% on projects costing up to Rs. 50 Lakhs (manufacturing) and Rs. 20 Lakhs (services), with low owner contribution.",
    documents: ["Aadhaar Card", "Project Report", "Educational Qualification Certificate (8th pass or above)", "Caste Certificate (for subsidies)", "Population Certificate (for rural areas)"],
    officialWebsite: "https://www.kviconline.gov.in/pmegpeportal/",
    deadline: "Ongoing",
    department: "Ministry of Micro, Small and Medium Enterprises (MSME)"
  },
  {
    name: "Stand-Up India Scheme",
    description: "Promotes entrepreneurship at the grassroots level focusing on economic empowerment and job creation, specifically targeting women and SC/ST communities.",
    category: "Business",
    state: "Central",
    eligibility: {
      ageMin: 18,
      gender: "Female", // Either Female OR SC/ST
      categories: ["SC", "ST", "OBC", "General"], // If SC/ST, gender can be Male; if General/OBC, must be Female
      states: []
    },
    benefits: "Bank loans between Rs. 10 Lakhs and Rs. 1 Crore for setting up a greenfield enterprise in manufacturing, services, agri-allied, or trading.",
    documents: ["Aadhaar Card", "PAN Card", "Caste Certificate (if applicable)", "Proof of Business Address", "Income Tax Returns (last 3 years if applicable)", "Partnership Deed/Incorporation Certificate"],
    officialWebsite: "https://www.standupmitra.in/",
    deadline: "Ongoing",
    department: "Department of Financial Services / Ministry of Finance"
  },
  {
    name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    description: "A highly affordable government-backed accident insurance scheme for citizens, offering coverage for accidental death and disability.",
    category: "Health",
    state: "Central",
    eligibility: {
      ageMin: 18,
      ageMax: 70,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Accidental death and full disability coverage of Rs. 2 Lakhs, and partial disability coverage of Rs. 1 Lakh for a premium of just Rs. 20 per year.",
    documents: ["Aadhaar Card", "Savings Bank Account Details", "Consent Form for Auto-debit"],
    officialWebsite: "https://www.jansuraksha.gov.in/",
    deadline: "May 31 (Annual Renewal)",
    department: "Department of Financial Services / Ministry of Finance"
  },
  {
    name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    description: "A government-backed life insurance scheme in India, offering one-year life insurance coverage, renewable from year to year.",
    category: "Social Security",
    state: "Central",
    eligibility: {
      ageMin: 18,
      ageMax: 50,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Life coverage of Rs. 2,00,000 in case of death of the insured due to any reason, for a premium of Rs. 436 per year.",
    documents: ["Aadhaar Card", "Savings Bank Account Details", "Auto-debit authorization form"],
    officialWebsite: "https://www.jansuraksha.gov.in/",
    deadline: "May 31 (Annual Renewal)",
    department: "Department of Financial Services / Ministry of Finance"
  },
  {
    name: "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
    description: "A voluntary and contributory pension scheme for unorganized sector workers like street vendors, rickshaw pullers, construction workers, etc.",
    category: "Pension",
    state: "Central",
    eligibility: {
      ageMin: 18,
      ageMax: 40,
      incomeMax: 15000, // Monthly income should be 15k or less
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Assured monthly pension of Rs. 3,000 after attaining the age of 60 years. In case of death, 50% pension goes to the spouse.",
    documents: ["Aadhaar Card", "Savings Bank Account / Jan Dhan Account with IFSC", "Mobile Number"],
    officialWebsite: "https://maandhan.in/",
    deadline: "Ongoing",
    department: "Ministry of Labour and Employment"
  },
  {
    name: "PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi)",
    description: "A special micro-credit facility scheme to provide affordable working capital loans to street vendors to resume their livelihoods post-COVID-19 lockdowns.",
    category: "Business",
    state: "Central",
    eligibility: {
      incomeMax: 999999,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Collateral-free working capital loan of up to Rs. 10,000 (first tranche), Rs. 20,000 (second tranche), and Rs. 50,000 (third tranche) with interest subsidy of 7%.",
    documents: ["Aadhaar Card / Voter ID", "Proof of Vending (Certificate of Vending or ID Card)", "Bank Account Details", "Mobile Number"],
    officialWebsite: "https://pmsvanidhi.mohua.gov.in/",
    deadline: "Ongoing",
    department: "Ministry of Housing and Urban Affairs"
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "A government-sponsored crop insurance scheme that integrates multiple stakeholders to support sustainable agriculture through financial protection against crop failures.",
    category: "Agriculture",
    state: "Central",
    eligibility: {
      isFarmer: true,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Low premium rates for farmers (2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops) with complete financial coverage against natural perils.",
    documents: ["Land records (Khasra/Khatauni)", "Sowing Certificate / Self-Declaration", "Bank Account Passbook", "Aadhaar Card"],
    officialWebsite: "https://pmfby.gov.in/",
    deadline: "July 31 (Kharif) / December 31 (Rabi)",
    department: "Ministry of Agriculture and Farmers Welfare"
  },
  {
    name: "Rashtriya Vayoshri Yojana (RVY)",
    description: "A scheme for providing physical aids and assisted-living devices for Senior Citizens belonging to BPL category or earning less than Rs. 15,000 per month.",
    category: "Social Security",
    state: "Central",
    eligibility: {
      isSeniorCitizen: true,
      incomeMax: 180000, // Monthly Rs. 15,000 max
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Free-of-cost distribution of assisted-living devices like walking sticks, elbow crutches, wheelchairs, hearing aids, and spectacles.",
    documents: ["Aadhaar Card", "Senior Citizen Age Proof (60+ years)", "BPL Card / Income Certificate (less than 15,000/month)", "Proof of Disability/Infirmity"],
    officialWebsite: "https://socialjustice.gov.in/",
    deadline: "Ongoing",
    department: "Ministry of Social Justice and Empowerment"
  },
  {
    name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    description: "A non-contributory old-age pension scheme for Indian citizens belonging to Below Poverty Line (BPL) households.",
    category: "Pension",
    state: "Central",
    eligibility: {
      isSeniorCitizen: true,
      incomeMax: 120000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Monthly pension of Rs. 200 for ages 60-79 years, and Rs. 500 per month for senior citizens aged 80 years and above.",
    documents: ["Aadhaar Card", "Age Certificate", "BPL Ration Card", "Bank Passbook"],
    officialWebsite: "https://nsap.nic.in/",
    deadline: "Ongoing",
    department: "Ministry of Rural Development"
  },
  {
    name: "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    description: "Provides financial aid to meritorious students of economically weaker sections to arrest their dropouts at class VIII and encourage them to continue studies.",
    category: "Education",
    state: "Central",
    eligibility: {
      isStudent: true,
      incomeMax: 350000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Scholarship of Rs. 12,000 per year (Rs. 1,000 per month) for students studying in classes IX to XII in government/government-aided schools.",
    documents: ["Aadhaar Card", "Income Certificate of Parents", "Class VIII Marksheet (minimum 55% marks)", "Caste Certificate", "School ID Card"],
    officialWebsite: "https://scholarships.gov.in/",
    deadline: "December 31 (Varies)",
    department: "Department of School Education and Literacy / Ministry of Education"
  },
  {
    name: "Pragati Scholarship Scheme for Girl Students",
    description: "An AICTE initiative to assist advancement of girls pursuing technical education. It aims to provide encouragement and support to meritorious girls to pursue technical degrees/diplomas.",
    category: "Education",
    state: "Central",
    eligibility: {
      gender: "Female",
      isStudent: true,
      incomeMax: 800000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Scholarship of Rs. 50,000 per year for every year of study as lump sum amount for tuition fees, books, equipment, and other expenses.",
    documents: ["Aadhaar Card", "10th and 12th Marksheet", "Family Income Certificate (less than 8 Lakhs)", "Admission Letter to Technical Degree/Diploma", "Tuition Fee Receipt"],
    officialWebsite: "https://www.aicte-pragati-saksham-gov.in/",
    deadline: "December 31 (Varies)",
    department: "All India Council for Technical Education (AICTE)"
  },
  {
    name: "Saksham Scholarship Scheme for Specially Abled Students",
    description: "An AICTE scheme designed to support specially-abled students who are pursuing technical education by offering financial assistance for their tuition and living.",
    category: "Education",
    state: "Central",
    eligibility: {
      isStudent: true,
      isDisabled: true,
      incomeMax: 800000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Rs. 50,000 per year for tuition fees and other academic expenses to support specially abled students studying degree/diploma technical courses.",
    documents: ["Aadhaar Card", "Disability Certificate (minimum 40% disability)", "Family Income Certificate", "Marksheets of Qualifying Exam", "College Admission Details"],
    officialWebsite: "https://www.aicte-india.org/",
    deadline: "December 31 (Varies)",
    department: "All India Council for Technical Education (AICTE)"
  },
  {
    name: "PM Vishwakarma Scheme",
    description: "A scheme launched to support traditional artisans and craftspeople (carpenters, blacksmiths, potters, weavers, etc.) with skill upgradation, toolkits, and low-interest credit.",
    category: "Business",
    state: "Central",
    eligibility: {
      ageMin: 18,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Skill training, toolkit incentive of Rs. 15,000, collateral-free enterprise development loans up to Rs. 3 Lakhs (interest capped at 5%), and marketing support.",
    documents: ["Aadhaar Card", "Voter ID / Ration Card", "Bank Passbook", "Proof of Artisan Trade/Occupation", "Active Mobile Number"],
    officialWebsite: "https://pmvishwakarma.gov.in/",
    deadline: "Ongoing",
    department: "Ministry of Micro, Small and Medium Enterprises"
  },
  {
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    description: "Launched to achieve convergence of investments in irrigation, expanding cultivable area under assured irrigation, and improving on-farm water use efficiency.",
    category: "Agriculture",
    state: "Central",
    eligibility: {
      isFarmer: true,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Financial subsidy ranging from 45% to 55% for installing micro-irrigation systems (drip and sprinkler) and constructing water harvesting structures.",
    documents: ["Land Registry Copy (Jamabandi)", "Soil and Water testing report (if applicable)", "Bank Details", "Aadhaar Card"],
    officialWebsite: "https://pmksy.gov.in/",
    deadline: "Ongoing",
    department: "Ministry of Agriculture and Farmers Welfare"
  },
  {
    name: "Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM)",
    description: "Aims to eliminate rural poverty by promoting self-employment and organization of rural poor women into Self Help Groups (SHGs) to improve access to finance and livelihoods.",
    category: "Social Security",
    state: "Central",
    eligibility: {
      gender: "Female",
      incomeMax: 120000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Revolving fund of Rs. 10,000 - 15,000, community investment fund, and subsidized bank loans (interest subvention) for SHG groups of women.",
    documents: ["SHG Registration Certificate", "Aadhaar Cards of members", "Group Bank Account Passbook", "Income Certificate of members"],
    officialWebsite: "https://aajeevika.gov.in/",
    deadline: "Ongoing",
    department: "Ministry of Rural Development"
  },
  {
    name: "Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY)",
    description: "Food security welfare scheme under which the government provides free food grains (rice, wheat, coarse grains) to eligible families registered under the National Food Security Act (NFSA).",
    category: "Social Security",
    state: "Central",
    eligibility: {
      incomeMax: 100000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Free 5 kg food grains per person per month to all beneficiaries covered under the National Food Security Act, in addition to regular highly subsidized ration.",
    documents: ["Ration Card (PHH or AAY card)", "Aadhaar Card of all family members", "Income Certificate"],
    officialWebsite: "https://nfsa.gov.in/",
    deadline: "Ongoing",
    department: "Department of Food and Public Distribution / Ministry of Consumer Affairs"
  },
  {
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    description: "A national mission for financial inclusion to ensure access to financial services namely savings and deposit accounts, remittance, credit, insurance, and pension in an affordable manner.",
    category: "Social Security",
    state: "Central",
    eligibility: {
      ageMin: 10,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Zero-balance basic savings account with Rupay Debit Card, free Rs. 2 Lakh accidental insurance cover, and overdraft facility of up to Rs. 10,000.",
    documents: ["Aadhaar Card / Passport / Voter ID", "PAN Card", "Passport size photograph"],
    officialWebsite: "https://pmjdy.gov.in/",
    deadline: "Ongoing",
    department: "Department of Financial Services / Ministry of Finance"
  },
  {
    name: "Central Sector Scheme of Scholarship for College and University Students",
    description: "Provides financial assistance to meritorious students from family incomes less than 4.5 Lakhs per annum, to meet a part of their day-to-day expenses while pursuing higher studies.",
    category: "Education",
    state: "Central",
    eligibility: {
      isStudent: true,
      incomeMax: 450000,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Scholarship of Rs. 12,000 per annum for graduation (first three years) and Rs. 20,000 per annum for post-graduation courses.",
    documents: ["Aadhaar Card", "Class 12 Marksheet (requiring top 20th percentile scoring)", "Parental Income Certificate", "College Admission Proof", "Bank Details"],
    officialWebsite: "https://scholarships.gov.in/",
    deadline: "December 31 (Varies)",
    department: "Department of Higher Education / Ministry of Education"
  },
  {
    name: "Pradhan Mantri Vaya Vandana Yojana (PMVVY)",
    description: "A pension scheme exclusively for senior citizens aged 60 years and above, offering an assured rate of return for pension payouts, operated through LIC.",
    category: "Pension",
    state: "Central",
    eligibility: {
      isSeniorCitizen: true,
      categories: ["General", "OBC", "SC", "ST"],
      states: []
    },
    benefits: "Guaranteed interest return of 7.4% per annum for 10 years, offering a monthly, quarterly, half-yearly, or yearly pension payout to senior citizens.",
    documents: ["Aadhaar Card", "Proof of Age (60+ years)", "PAN Card", "Bank Account Details for auto-credit"],
    officialWebsite: "https://www.licindia.in/",
    deadline: "Completed (Extended or equivalent schemes available through LIC/SCSS)",
    department: "Ministry of Finance"
  },
  {
    name: "Post-Matric Scholarship Scheme for ST Students",
    description: "Centrally sponsored scheme that provides financial aid to Scheduled Tribe students pursuing higher education at the post-matriculation stage.",
    category: "Education",
    state: "Central",
    eligibility: {
      isStudent: true,
      incomeMax: 250000,
      categories: ["ST"],
      states: []
    },
    benefits: "Full reimbursement of compulsory non-refundable fees and study allowance ranging from Rs. 2,500 to Rs. 13,500 per annum.",
    documents: ["Aadhaar Card", "ST Caste Certificate", "Income Certificate (showing household earnings below 2.5 Lakhs)", "College Fee Receipt", "Bank Passbook"],
    officialWebsite: "https://scholarships.gov.in/",
    deadline: "November 30 (Varies)",
    department: "Ministry of Tribal Affairs"
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing schemes
    await Scheme.deleteMany({});
    console.log('Cleared existing schemes from database.');

    const apiKey = process.env.GEMINI_API_KEY;
    let genAI = null;
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey);
      console.log('Gemini API key found. Pre-generating scheme vector embeddings during seed...');
    } else {
      console.warn('WARNING: GEMINI_API_KEY not found in environment. Schemes will be seeded with placeholder embeddings.');
    }

    const seededSchemes = [];
    
    for (const scheme of schemesData) {
      let embedding = Array(768).fill(0); // default placeholder vector
      
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
          const textToEmbed = `${scheme.name}. ${scheme.description} Category: ${scheme.category}. State: ${scheme.state}. Benefits: ${scheme.benefits}`;
          const result = await model.embedContent(textToEmbed);
          if (result.embedding && result.embedding.values) {
            embedding = result.embedding.values;
            console.log(`Generated embedding for: ${scheme.name}`);
          }
        } catch (embError) {
          console.error(`Error generating embedding for ${scheme.name}:`, embError.message);
        }
      }
      
      seededSchemes.push({
        ...scheme,
        vectorEmbeddings: embedding
      });
    }

    await Scheme.insertMany(seededSchemes);
    console.log(`Successfully seeded ${seededSchemes.length} schemes into the database!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
