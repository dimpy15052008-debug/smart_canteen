export interface UniversitySchoolInfo {
  schoolName: string;
  faculty: string;
  banner: string;
  overview: string;
  specializations: string[];
}

export interface ProgrammeDetail {
  id: string;
  name: string;
  category: 'Under Graduate' | 'Post Graduate' | 'Certificate' | 'Diploma';
  punchline?: string;
  callToAction?: string;
  collaborator?: string;
  duration: string;
  levelOfStudy: string;
  eligibility: string;
  overview: {
    title: string;
    details: string;
  };
  keyHighlights: string[];
  benefits: string[];
  studyTopics: string[];
  outcomes: {
    programmeOutcomes: string[];
    specificOutcomes: string[];
    educationalOutcomes: string[];
  };
  curriculum: {
    semester: string;
    subjects: string[];
  }[];
  careers: string[];
  sourceDocument: string;
}

export interface FeeStructureRecord {
  id: string;
  sNo: number;
  faculty: string;
  schoolName: string;
  courseName: string;
  specialisation: string;
  duration: string;
  eligibility: string;
  registrationFees: number;
  uniformFees: number;
  busFees: number;
  annualFees: number;
  academicYear: string;
  sourceDocument: string;
}

// Authoritative Public University Knowledge - School of Future Skills & IT (FSIT)
export const FSIT_SCHOOL_INFO: UniversitySchoolInfo = {
  schoolName: "School of Future Skills and Information Technology (FSIT)",
  faculty: "Faculty of Future Skills and Information Technology",
  banner: "Empowering learners with cutting-edge knowledge, future-ready skills, and a growth mindset to thrive in rapidly evolving global industries.",
  overview: "Through innovative teaching, hands-on learning, and research-driven education, the school prepares students to become adaptive professionals and responsible contributors to society in the digital era. Courses align with the UGC Skill Framework for maximum practical application, innovation, and employability enhancement.",
  specializations: [
    "Artificial Intelligence & Machine Learning (AI-ML)",
    "Cyber Security",
    "Full Stack Development",
    "Information Technology"
  ]
};

// Full Catalogue of Programmes offered under School of FSIT
export const FSIT_PROGRAMMES_LIST = {
  undergraduate: [
    { name: "BCA (AI-ML) with Geeks of Gurukul", type: "Collaborative Programme", duration: "3 Years" },
    { name: "BCA (Cyber Security)", type: "Undergraduate", duration: "3 Years" },
    { name: "BCA (Information Technology)", type: "Undergraduate", duration: "3 Years" },
    { name: "BCA (Full Stack Development)", type: "Undergraduate", duration: "3 Years" }
  ],
  postgraduate: [
    { name: "M.Sc (Artificial Intelligence and Machine Learning)", duration: "2 Years" },
    { name: "M.Sc (Cyber Security)", duration: "2 Years" },
    { name: "M.Sc (Information Technology)", duration: "2 Years" }
  ],
  certificate: [
    { name: "Certificate in Artificial Intelligence", duration: "Short-term" },
    { name: "Certificate in Data Science", duration: "Short-term" },
    { name: "Certificate in Web Development", duration: "Short-term" },
    { name: "Certificate in Cyber Security", duration: "Short-term" },
    { name: "Certificate in Office Automation", duration: "Short-term" }
  ],
  diploma: [
    { name: "Diploma in AI-ML", duration: "1-2 Years" },
    { name: "Diploma in Data Science", duration: "1-2 Years" },
    { name: "Diploma in Web Development", duration: "1-2 Years" },
    { name: "Diploma in Cyber Security", duration: "1-2 Years" },
    { name: "Post Graduate Diploma in Computer Applications (PGDCA)", duration: "1 Year" }
  ]
};

// Authoritative Detailed Programme Knowledge (from Docx Source Files)
export const PROGRAMME_KNOWLEDGE: ProgrammeDetail[] = [
  {
    id: "bca-aiml",
    name: "BCA (Artificial Intelligence & Machine Learning)",
    category: "Under Graduate",
    punchline: "Empower the Future with Intelligence!",
    callToAction: "Apply Now and Shape Tomorrow with AI!",
    collaborator: "Geeks of Gurukul",
    duration: "3 Years",
    levelOfStudy: "UG",
    eligibility: "Students who have passed 10+2 from any recognized board with Mathematics, Computer Science, Commerce, Arts, or Biology as one of the subjects and obtained a minimum of 50% marks are eligible to apply.",
    overview: {
      title: "Building Future AI Innovators",
      details: "The BCA (AI & Machine Learning) program provides students with a strong computing foundation and specialized expertise in Artificial Intelligence and Machine Learning. This three-year undergraduate course blends programming, data science, and intelligent systems to prepare learners for the AI-driven digital era. With Geeks of Gurukul as an industry collaborator, students gain practical exposure through real-world projects, workshops, and mentorship from AI experts. Graduates emerge with skills to design intelligent solutions and drive innovation across industries."
    },
    keyHighlights: [
      "Hands-on Training in Artificial Intelligence and Machine Learning",
      "Industry Collaboration with Geeks of Gurukul",
      "Real-Time Projects in Data Science and Automation",
      "Workshops on Python, TensorFlow, and Neural Networks",
      "Career-Oriented Curriculum with Global Certification Pathways"
    ],
    benefits: [
      "Gain in-depth knowledge of AI algorithms, data processing, and predictive modeling.",
      "Learn programming with Python, R, and machine learning libraries.",
      "Develop intelligent systems for automation, image processing, and NLP.",
      "Build projects using real-world datasets under expert mentorship.",
      "Prepare for top certifications in AI, ML, and Data Science."
    ],
    studyTopics: [
      "Introduction to AI & Data Science: Foundations of AI, data handling, and automation.",
      "Programming for AI: Python and R for data manipulation, analysis, and visualization.",
      "Machine Learning Algorithms: Supervised, unsupervised, and reinforcement learning techniques.",
      "Deep Learning & Neural Networks: CNNs, RNNs, and advanced neural architectures.",
      "Natural Language Processing (NLP): Sentiment analysis, chatbots, and language models.",
      "Big Data & Cloud Computing: Managing large datasets and deploying AI models on cloud platforms.",
      "Capstone Project & Internship: Applying AI/ML techniques to solve real-world problems."
    ],
    outcomes: {
      programmeOutcomes: [
        "Demonstrate technical and analytical proficiency in AI and machine learning.",
        "Design and deploy data-driven, intelligent solutions across sectors.",
        "Apply ethical principles and responsible AI practices in professional settings.",
        "Communicate AI-driven insights effectively to stakeholders."
      ],
      specificOutcomes: [
        "Ability to develop, train, and evaluate machine learning models.",
        "Competence in data preprocessing, feature engineering, and model optimization.",
        "Hands-on experience with tools such as TensorFlow, Keras, Scikit-learn, and PyTorch.",
        "Strong foundation for pursuing careers or advanced studies in AI, ML, or Data Science."
      ],
      educationalOutcomes: [
        "Produce graduates skilled in AI-based problem-solving and innovation.",
        "Encourage lifelong learning and continuous skill development in emerging technologies.",
        "Foster teamwork, creativity, and leadership through collaborative projects.",
        "Equip students for global AI career opportunities and higher education."
      ]
    },
    curriculum: [
      {
        semester: "Semester 1",
        subjects: [
          "Fundamentals of IT and Programming C++",
          "Fundamental of Python",
          "Basics of Artificial Intelligence",
          "Web Development (Global Certification)",
          "Lab: Programming with Python and C++"
        ]
      },
      {
        semester: "Semester 2",
        subjects: [
          "Data Structures and Algorithms",
          "Database Management Systems",
          "Statistics and Probability for AI",
          "Web Development advance (Global certification)",
          "Lab: Data Handling with Python"
        ]
      },
      {
        semester: "Semester 3",
        subjects: [
          "Data Visualisation advance",
          "OOPs concepts",
          "Lab: Building ML Models",
          "Project 1: Predictive Analytics for Real Data"
        ]
      },
      {
        semester: "Semester 4",
        subjects: [
          "Deep Learning and Neural Networks",
          "Natural Language Processing",
          "Computer Vision and Image Processing",
          "Lab: TensorFlow & Keras",
          "Project 2: AI Application Development"
        ]
      },
      {
        semester: "Semester 5",
        subjects: [
          "Big Data Analytics",
          "Cloud Computing for AI",
          "AI Ethics and Responsible Innovation",
          "Minor Project: Intelligent System Design",
          "Soft Skills and Professional Development"
        ]
      },
      {
        semester: "Semester 6",
        subjects: [
          "Capstone Project",
          "Internship / Industrial Training (with Geeks of Gurukul)",
          "Seminar on Emerging AI Trends",
          "Research and Innovation in AI"
        ]
      }
    ],
    careers: [
      "AI Engineer / Machine Learning Engineer",
      "Data Scientist / Data Analyst",
      "Business Intelligence Developer",
      "Natural Language Processing Specialist",
      "Computer Vision Engineer",
      "AI Research Assistant / Model Developer"
    ],
    sourceDocument: "4. BCA(AI-ML) data.docx"
  },
  {
    id: "bca-cybersecurity",
    name: "BCA (Cyber Security)",
    category: "Under Graduate",
    punchline: "Secure the Digital World!",
    callToAction: "Apply Now and Become a Cyber Defender!",
    duration: "3 Years",
    levelOfStudy: "UG",
    eligibility: "Students who have passed 10+2 from any recognized board with Mathematics, Computer Science, Commerce, Arts, or Biology as one of the subjects and obtained a minimum of 50% marks are eligible to apply.",
    overview: {
      title: "Building Future Cybersecurity Professionals",
      details: "The BCA (Cyber Security) program provides students with a strong foundation in computing and a specialized focus on securing digital assets. Covering essential topics such as network security, ethical hacking, cryptography, digital forensics, and cyber laws, this three-year undergraduate course trains students to defend organizations against evolving cyber threats."
    },
    keyHighlights: [
      "Specialized Focus on Ethical Hacking and Digital Forensics",
      "State-of-the-Art Cybersecurity Labs with Real-World Simulation",
      "In-Depth Coverage of Network Security and Cryptography",
      "Training on Cyber Laws, Compliance, and Risk Management",
      "Preparation for Global Certifications (CEH, CISSP, CompTIA Security+)"
    ],
    benefits: [
      "Develop skills to identify, analyze, and mitigate cyber threats.",
      "Master tools used by ethical hackers and security professionals.",
      "Understand legal and compliance frameworks governing digital security.",
      "Work on projects simulating real-world cyber threats and defense mechanisms.",
      "Prepare for globally recognized certifications like CEH, CompTIA Security+, and more."
    ],
    studyTopics: [
      "Fundamentals of Cyber Security: Basic threats, vulnerabilities, risk management, and cyber hygiene.",
      "Network and Information Security: TCP/IP, firewalls, VPNs, intrusion detection/prevention systems.",
      "Ethical Hacking and Countermeasures: Penetration testing, system hacking, sniffing, and securing systems.",
      "Cryptography and Cyber Laws: Encryption techniques and legal framework surrounding cybercrime.",
      "Digital Forensics: Investigating cybercrimes using forensic tools and methodologies.",
      "Capstone Project and Internship: Applying skills in a real-time industry environment."
    ],
    outcomes: {
      programmeOutcomes: [
        "Demonstrate comprehensive knowledge of cyber threats, tools, and defense mechanisms.",
        "Analyze security risks and develop secure computing practices.",
        "Investigate and document digital evidence in compliance with cyber laws.",
        "Design and implement security solutions in IT infrastructures.",
        "Effectively communicate technical details to stakeholders and teams."
      ],
      specificOutcomes: [
        "Ability to identify and address vulnerabilities across systems and networks.",
        "Proficiency in security auditing, ethical hacking, and incident response.",
        "Hands-on knowledge of tools like Wireshark, Kali Linux, Metasploit, and Splunk.",
        "Strong grounding in cyber law, compliance, and ethical practices.",
        "Preparedness for advanced studies or cybersecurity roles in government and private sectors."
      ],
      educationalOutcomes: [
        "Produce cybersecurity professionals equipped for the evolving digital threat landscape.",
        "Promote continuous learning and adherence to ethical standards in cybersecurity.",
        "Instill skills for teamwork, leadership, and effective communication.",
        "Enable graduates to pursue global certifications and advanced degrees.",
        "Encourage innovation and problem-solving in digital security applications."
      ]
    },
    curriculum: [
      {
        semester: "Semester 1",
        subjects: [
          "Fundamentals of IT and Programming",
          "Basics of Cyber Security",
          "Mathematics for Computing",
          "Computer Networks",
          "Digital Logic and Circuits",
          "Lab: Programming in Python"
        ]
      },
      {
        semester: "Semester 2",
        subjects: [
          "Operating Systems and Security",
          "Linux and Shell Programming",
          "Database Management Systems",
          "Web Development Basics",
          "Lab: Network Configuration"
        ]
      },
      {
        semester: "Semester 3",
        subjects: [
          "Network Security and Administration",
          "Cyber Laws and Ethics",
          "Lab: Network Security Tools",
          "Project 1: Securing a Web Application"
        ]
      },
      {
        semester: "Semester 4",
        subjects: [
          "Ethical Hacking Techniques",
          "Cryptography and Secure Communications",
          "Mobile and Cloud Security",
          "Lab: Hacking and Penetration Testing",
          "Project 2: Vulnerability Assessment"
        ]
      },
      {
        semester: "Semester 5",
        subjects: [
          "Digital Forensics",
          "Cyber Threat Intelligence",
          "Malware Analysis and Reverse Engineering",
          "Minor Project: Cybersecurity Audit",
          "Soft Skills and Professional Development"
        ]
      },
      {
        semester: "Semester 6",
        subjects: [
          "Capstone Project",
          "Internship / Industrial Training",
          "Seminar on Emerging Trends",
          "Research and Innovation in Cybersecurity"
        ]
      }
    ],
    careers: [
      "Cyber Security Analyst / Network Security Engineer",
      "Ethical Hacker / Penetration Tester",
      "Information Security Officer",
      "Digital Forensics Expert / Incident Responder"
    ],
    sourceDocument: "5. BCA (Cyber Security) data.docx"
  },
  {
    id: "bca-it",
    name: "BCA (Information Technology)",
    category: "Under Graduate",
    punchline: "Empowering the Digital Innovators of Tomorrow!",
    callToAction: "Apply Now and Build the Future of Technology!",
    duration: "3 Years",
    levelOfStudy: "UG",
    eligibility: "Students who have passed 10+2 from any recognized board with Mathematics, Computer Science, Commerce, Arts, or Biology as one of the subjects and a minimum of 50% marks are eligible to apply.",
    overview: {
      title: "Building Future IT Professionals",
      details: "The BCA (Information Technology) programme equips students with a strong foundation in computer applications and information systems. This three-year undergraduate course blends computer science, software development, and IT management, offering students the skills required to thrive in today's technology-driven world. Covering areas such as programming, networking, databases, cybersecurity, and emerging technologies, the course emphasizes both theoretical knowledge and practical experience."
    },
    keyHighlights: [
      "Comprehensive Curriculum Covering Core IT Domains",
      "Practical Learning through Labs and Projects",
      "Focus on Software Development and Networking",
      "Exposure to Emerging Technologies like Cloud and AI",
      "Career-Oriented Approach with Professional Skill Development"
    ],
    benefits: [
      "Gain strong programming and analytical skills applicable across industries.",
      "Learn to design, manage, and maintain information systems.",
      "Develop expertise in databases, networking, and web technologies.",
      "Build real-world problem-solving capabilities through hands-on projects.",
      "Prepare for advanced studies and globally recognized IT certifications."
    ],
    studyTopics: [
      "Fundamentals of Information Technology: Core components of computer systems and IT infrastructure.",
      "Programming in C, Java, and Python: Coding proficiency for application development.",
      "Database Management Systems: Organizing, managing, and securing data.",
      "Software Engineering and Project Management: Planning, designing, and managing IT projects.",
      "Computer Networks and Operating Systems: Data communication, network architecture, and system management.",
      "Web and Mobile Application Development: Creating responsive and dynamic applications.",
      "Cybersecurity Basics: IT security principles and practices.",
      "Capstone Project and Internship: Applying knowledge to practical industry challenges."
    ],
    outcomes: {
      programmeOutcomes: [
        "Demonstrate a comprehensive understanding of information technology principles.",
        "Design, implement, and maintain efficient IT systems.",
        "Apply ethical and professional practices in computing environments.",
        "Communicate effectively and work collaboratively in multidisciplinary teams."
      ],
      specificOutcomes: [
        "Proficiency in programming languages and database systems.",
        "Competence in web technologies, cloud computing, and networking.",
        "Ability to analyze and design IT-based solutions for real-world problems.",
        "Readiness for IT-related roles or higher studies in computer applications."
      ],
      educationalOutcomes: [
        "Produce skilled IT professionals ready for global challenges.",
        "Encourage innovation, research, and lifelong learning.",
        "Foster teamwork, leadership, and effective communication.",
        "Prepare graduates for diverse roles in software development, networking, and system management."
      ]
    },
    curriculum: [
      {
        semester: "Semester 1",
        subjects: [
          "Fundamentals of IT",
          "Programming in C",
          "Office Automation",
          "Web Development (Global Certification)",
          "Lab: C Programming"
        ]
      },
      {
        semester: "Semester 2",
        subjects: [
          "Data Structures and Algorithms",
          "Web Technologies (JavaScript Global Certification)",
          "Database Management Systems",
          "Web Design and Development",
          "Lab: DBMS and Java Programming"
        ]
      },
      {
        semester: "Semester 3",
        subjects: [
          "Operating Systems",
          "Computer Networks",
          "Software Engineering",
          "Lab: Network Configuration",
          "Project 1: IT System Development"
        ]
      },
      {
        semester: "Semester 4",
        subjects: [
          "Cloud Computing Fundamentals",
          "Internet of Things (IoT) Basics",
          "Lab: Web App Development",
          "Project 2: Cloud-Based Application"
        ]
      },
      {
        semester: "Semester 5",
        subjects: [
          "Cybersecurity and Information Assurance",
          "Data Analytics Fundamentals",
          "Mobile App Development",
          "Minor Project: IT Solution for Real Problem",
          "Soft Skills and Professional Development"
        ]
      },
      {
        semester: "Semester 6",
        subjects: [
          "Capstone Project",
          "Internship / Industrial Training",
          "Seminar on Emerging IT Trends",
          "Research and Innovation in IT"
        ]
      }
    ],
    careers: [
      "Software Developer / Application Developer",
      "Database Administrator / Data Analyst",
      "IT Support Specialist / Network Engineer",
      "Web & Mobile App Developer",
      "Cloud Engineer / System Administrator",
      "IT Consultant / Project Coordinator"
    ],
    sourceDocument: "7. BCA(IT) data.docx"
  }
];

// Authoritative Official University Fees Structure 2026-27 (Parsed from Fees_Structure 26-27 data.docx)
export const OFFICIAL_FEE_STRUCTURE_2026_27: FeeStructureRecord[] = [
  // School of FSIT & Computer Science
  {
    id: "fee-1",
    sNo: 1,
    faculty: "Faculty of Engineering and Emerging Technology",
    schoolName: "School of Computer Science & Engineering",
    courseName: "B.Tech (CSE-IBM)",
    specialisation: "AI-ML",
    duration: "4 Years",
    eligibility: "12th (PCM) Pass",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 95000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-2",
    sNo: 1,
    faculty: "Faculty of Engineering and Emerging Technology",
    schoolName: "School of Computer Science & Engineering",
    courseName: "B.Tech (CSE-Geeks of Gurukul)",
    specialisation: "Artificial Intelligence & Data Science",
    duration: "4 Years",
    eligibility: "12th (PCM) Pass",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 95000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-3",
    sNo: 1,
    faculty: "Faculty of Engineering and Emerging Technology",
    schoolName: "School of Computer Science & Engineering",
    courseName: "B.Tech (CSE-Google)",
    specialisation: "Cloud Computing",
    duration: "4 Years",
    eligibility: "12th (PCM) Pass",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 60000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-4",
    sNo: 4,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Information Technology",
    courseName: "BCA (Google)",
    specialisation: "IT (Cloud Computing)",
    duration: "3 Years",
    eligibility: "12th Pass",
    registrationFees: 3500,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 32000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-5",
    sNo: 4,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Information Technology",
    courseName: "DCA",
    specialisation: "Diploma in Computer Applications",
    duration: "1 Year",
    eligibility: "12th Pass",
    registrationFees: 1500,
    uniformFees: 0,
    busFees: 18000,
    annualFees: 10000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-6",
    sNo: 4,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Information Technology",
    courseName: "PGDCA",
    specialisation: "Post Graduate Diploma in Computer Applications",
    duration: "1 Year",
    eligibility: "Graduate in Any Discipline",
    registrationFees: 1500,
    uniformFees: 0,
    busFees: 18000,
    annualFees: 12000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-7",
    sNo: 4,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Information Technology",
    courseName: "M.Sc (Google)",
    specialisation: "Cloud Computing",
    duration: "2 Years",
    eligibility: "BCA/B.Sc",
    registrationFees: 3500,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 40000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-8",
    sNo: 4,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Information Technology",
    courseName: "BCA (Geeks of Gurukul)",
    specialisation: "Artificial Intelligence & Machine Learning",
    duration: "3 Years",
    eligibility: "12th Pass (Min 50%)",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 50000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-9",
    sNo: 5,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Future Skills",
    courseName: "BCA (Geeks of Gurukul)",
    specialisation: "Cyber Security",
    duration: "3 Years",
    eligibility: "12th Pass (Min 50%)",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 50000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-10",
    sNo: 5,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Future Skills",
    courseName: "M.Sc",
    specialisation: "Data Science",
    duration: "2 Years",
    eligibility: "B.Sc (Eligible Branch)",
    registrationFees: 3500,
    uniformFees: 0,
    busFees: 18000,
    annualFees: 35000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-11",
    sNo: 5,
    faculty: "Faculty of Future Skills and Information Technology",
    schoolName: "School of Future Skills",
    courseName: "M.Sc",
    specialisation: "AIML",
    duration: "2 Years",
    eligibility: "B.Sc (Eligible Branch)",
    registrationFees: 3500,
    uniformFees: 0,
    busFees: 18000,
    annualFees: 35000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-12",
    sNo: 7,
    faculty: "Faculty of Management",
    schoolName: "School of Management Studies",
    courseName: "BBA (Geeks of Gurukul)",
    specialisation: "Business Analytics with AI",
    duration: "3 Years",
    eligibility: "12th Pass",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 50000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-13",
    sNo: 7,
    faculty: "Faculty of Management",
    schoolName: "School of Management Studies",
    courseName: "BBA",
    specialisation: "Marketing / HR / Computer Application / Digital Marketing",
    duration: "3 Years",
    eligibility: "12th Pass",
    registrationFees: 3500,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 32000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-14",
    sNo: 15,
    faculty: "School of Pharmaceutical Sciences",
    schoolName: "School of Pharmaceutical Sciences",
    courseName: "B.Pharma",
    specialisation: "Pharmacy",
    duration: "4 Years",
    eligibility: "12th PCM (50%)",
    registrationFees: 5000,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 65000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  },
  {
    id: "fee-15",
    sNo: 16,
    faculty: "School of Agriculture",
    schoolName: "School of Agriculture",
    courseName: "B.Sc (Hons)",
    specialisation: "Agriculture (Honors)",
    duration: "4 Years",
    eligibility: "12th Agriculture/PCB/PCM",
    registrationFees: 3500,
    uniformFees: 4500,
    busFees: 18000,
    annualFees: 60000,
    academicYear: "2026-27",
    sourceDocument: "Fees_Structure 26-27 data.docx"
  }
];

/**
 * Perform RAG / Knowledge retrieval on public university data.
 * If details are not found, returns null so the AI responds with:
 * "information not available in the current university data"
 */
export function queryUniversityKnowledge(query: string): {
  found: boolean;
  content: string;
  sourceDocument?: string;
  category?: string;
} {
  const q = query.toLowerCase().trim();

  // 1. FEE STRUCTURE INQUIRIES (Highest priority to avoid misrouting fee queries to general programme lists)
  const isFeeQuery = q.includes('fee') || q.includes('fees') || q.includes('tuition') || q.includes('cost') || q.includes('structure') || q.includes('2026-27') || q.includes('26-27') || q.includes('pricing') || q.includes('annual fee');

  if (isFeeQuery) {
    // Check for specific programme fee inquiries
    if (q.includes('ai-ml') || q.includes('aiml') || (q.includes('ai') && q.includes('machine learning'))) {
      const bcaFee = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('BCA') && f.specialisation.includes('Artificial Intelligence'));
      const btechFee = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('B.Tech') && f.specialisation.includes('AI-ML'));
      const mscFee = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('M.Sc') && f.specialisation.includes('AIML'));

      return {
        found: true,
        content: `💳 Official Fee Structure 2026-27 (AI & ML Programmes):\n` +
          `• BCA (AI-ML) with Geeks of Gurukul: Annual Fee ₹${bcaFee?.annualFees.toLocaleString() || '50,000'}/yr | Reg Fee: ₹${bcaFee?.registrationFees || 5000} | Uniform: ₹${bcaFee?.uniformFees || 4500} | Bus: ₹${bcaFee?.busFees || 18000}/yr\n` +
          `• B.Tech (CSE-IBM) AI-ML: Annual Fee ₹${btechFee?.annualFees.toLocaleString() || '95,000'}/yr | Reg Fee: ₹${btechFee?.registrationFees || 5000} | Uniform: ₹${btechFee?.uniformFees || 4500} | Bus: ₹${btechFee?.busFees || 18000}/yr\n` +
          `• M.Sc (AIML): Annual Fee ₹${mscFee?.annualFees.toLocaleString() || '35,000'}/yr | Reg Fee: ₹${mscFee?.registrationFees || 3500} | Uniform: ₹${mscFee?.uniformFees || 0} | Bus: ₹${mscFee?.busFees || 18000}/yr`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    if (q.includes('cyber security') || q.includes('cybersecurity') || q.includes('cyber')) {
      const bcaCyber = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('BCA') && f.specialisation.includes('Cyber Security'));
      return {
        found: true,
        content: `💳 Official Fee Structure 2026-27 for BCA (Cyber Security):\n` +
          `• Annual Tuition Fee: ₹${bcaCyber?.annualFees.toLocaleString() || '50,000'}/year\n` +
          `• One-Time Registration Fee: ₹${bcaCyber?.registrationFees || 5000}\n` +
          `• Uniform Fee: ₹${bcaCyber?.uniformFees || 4500}\n` +
          `• Optional Bus Transport Fee: ₹${bcaCyber?.busFees || 18000}/year`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    if (q.includes('bca it') || q.includes('information technology') || q.includes('cloud')) {
      const bcaIt = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('BCA') && f.specialisation.includes('Cloud'));
      const mscIt = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('M.Sc') && f.specialisation.includes('Cloud'));
      return {
        found: true,
        content: `💳 Official Fee Structure 2026-27 for IT & Cloud Computing Programmes:\n` +
          `• BCA (Google) IT (Cloud Computing): Annual Fee ₹${bcaIt?.annualFees.toLocaleString() || '32,000'}/yr | Reg: ₹${bcaIt?.registrationFees || 3500} | Uniform: ₹${bcaIt?.uniformFees || 4500} | Bus: ₹${bcaIt?.busFees || 18000}/yr\n` +
          `• M.Sc (Google) Cloud Computing: Annual Fee ₹${mscIt?.annualFees.toLocaleString() || '40,000'}/yr | Reg: ₹${mscIt?.registrationFees || 3500} | Uniform: ₹${mscIt?.uniformFees || 4500} | Bus: ₹${mscIt?.busFees || 18000}/yr`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    if (q.includes('b.tech') || q.includes('btech') || q.includes('engineering')) {
      const btechList = OFFICIAL_FEE_STRUCTURE_2026_27.filter(f => f.courseName.includes('B.Tech'));
      const summary = btechList.map(f => `• ${f.courseName} (${f.specialisation}): Annual Fee ₹${f.annualFees.toLocaleString()}/yr | Reg Fee: ₹${f.registrationFees} | Uniform: ₹${f.uniformFees} | Bus: ₹${f.busFees}`).join('\n');
      return {
        found: true,
        content: `💳 Official B.Tech Fee Structure 2026-27:\n${summary}`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    if (q.includes('bba') || q.includes('management')) {
      const bbaList = OFFICIAL_FEE_STRUCTURE_2026_27.filter(f => f.courseName.includes('BBA'));
      const summary = bbaList.map(f => `• ${f.courseName} (${f.specialisation}): Annual Fee ₹${f.annualFees.toLocaleString()}/yr | Reg Fee: ₹${f.registrationFees} | Uniform: ₹${f.uniformFees} | Bus: ₹${f.busFees}`).join('\n');
      return {
        found: true,
        content: `💳 Official BBA Fee Structure 2026-27:\n${summary}`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    if (q.includes('pharma') || q.includes('pharmacy')) {
      const pharma = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('Pharma'));
      return {
        found: true,
        content: `💳 Official B.Pharma Fee Structure 2026-27:\n• Annual Fee: ₹${pharma?.annualFees.toLocaleString() || '65,000'}/yr | Reg Fee: ₹${pharma?.registrationFees || 5000} | Uniform: ₹${pharma?.uniformFees || 4500} | Bus: ₹${pharma?.busFees || 18000}/yr`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    if (q.includes('agriculture') || q.includes('b.sc agriculture')) {
      const agri = OFFICIAL_FEE_STRUCTURE_2026_27.find(f => f.courseName.includes('Agriculture'));
      return {
        found: true,
        content: `💳 Official B.Sc (Hons) Agriculture Fee Structure 2026-27:\n• Annual Fee: ₹${agri?.annualFees.toLocaleString() || '60,000'}/yr | Reg Fee: ₹${agri?.registrationFees || 3500} | Uniform: ₹${agri?.uniformFees || 4500} | Bus: ₹${agri?.busFees || 18000}/yr`,
        sourceDocument: "Fees_Structure 26-27 data.docx",
        category: "fee_knowledge"
      };
    }

    // Default: Comprehensive General University Fee Structure 2026-27
    const groupedFees = [
      `🏫 School of Future Skills & Information Technology (FSIT):`,
      `• BCA (Geeks of Gurukul) - AI-ML: Annual Fee ₹50,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• BCA (Geeks of Gurukul) - Cyber Security: Annual Fee ₹50,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• BCA (Google) - IT (Cloud Computing): Annual Fee ₹32,000 | Reg: ₹3,500 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• DCA (Diploma in Computer Applications): Annual Fee ₹10,000 | Reg: ₹1,500 | Uniform: ₹0 | Bus: ₹18,000`,
      `• PGDCA (Post Graduate Diploma): Annual Fee ₹12,000 | Reg: ₹1,500 | Uniform: ₹0 | Bus: ₹18,000`,
      `• M.Sc (Google) - Cloud Computing: Annual Fee ₹40,000 | Reg: ₹3,500 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• M.Sc - Data Science: Annual Fee ₹35,000 | Reg: ₹3,500 | Uniform: ₹0 | Bus: ₹18,000`,
      `• M.Sc - AIML: Annual Fee ₹35,000 | Reg: ₹3,500 | Uniform: ₹0 | Bus: ₹18,000`,
      ``,
      `🏛️ Faculty of Engineering & Computer Science:`,
      `• B.Tech (CSE-IBM) - AI-ML: Annual Fee ₹95,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• B.Tech (CSE-Geeks of Gurukul) - AI & DS: Annual Fee ₹95,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• B.Tech (CSE-Google) - Cloud Computing: Annual Fee ₹60,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      ``,
      `💼 Faculty of Management & Other Professional Schools:`,
      `• BBA (Geeks of Gurukul) - Business Analytics: Annual Fee ₹50,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• BBA (Marketing / HR / Digital Mktg): Annual Fee ₹32,000 | Reg: ₹3,500 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• B.Pharma (Pharmacy): Annual Fee ₹65,000 | Reg: ₹5,000 | Uniform: ₹4,500 | Bus: ₹18,000`,
      `• B.Sc (Hons) Agriculture: Annual Fee ₹60,000 | Reg: ₹3,500 | Uniform: ₹4,500 | Bus: ₹18,000`
    ].join('\n');

    return {
      found: true,
      content: `💳 Official University Fees Structure 2026-27:\n${groupedFees}\n\n📌 Note: Registration and Uniform fees are one-time charges at admission. Bus transportation (₹18,000/yr) is optional.`,
      sourceDocument: "Fees_Structure 26-27 data.docx",
      category: "fee_knowledge"
    };
  }

  // 2. BCA AI-ML / AIML ACADEMIC & PROGRAMME DETAILS
  if (q.includes('ai-ml') || q.includes('aiml') || (q.includes('ai') && q.includes('machine learning')) || q.includes('bca ai')) {
    const p = PROGRAMME_KNOWLEDGE.find(item => item.id === 'bca-aiml');
    if (q.includes('eligib') || q.includes('who can apply') || q.includes('criteria')) {
      return {
        found: true,
        content: `Eligibility Criteria for ${p?.name || 'BCA (AI-ML)'}:\n${p?.eligibility}\n(Duration: ${p?.duration}, Level: ${p?.levelOfStudy})`,
        sourceDocument: p?.sourceDocument || "4. BCA(AI-ML) data.docx",
        category: 'programme_knowledge'
      };
    }
    if (q.includes('subject') || q.includes('curriculum') || q.includes('semester')) {
      const semMatch = q.match(/semester\s*([1-6])/i) || q.match(/sem\s*([1-6])/i);
      if (semMatch && p) {
        const semNum = semMatch[1];
        const semData = p.curriculum.find(c => c.semester.includes(semNum));
        if (semData) {
          return {
            found: true,
            content: `Curriculum for ${p.name} (${semData.semester}):\n- ${semData.subjects.join('\n- ')}`,
            sourceDocument: p.sourceDocument,
            category: 'programme_knowledge'
          };
        }
      }
      const fullCurr = p?.curriculum.map(c => `${c.semester}: ${c.subjects.join(', ')}`).join('\n');
      return {
        found: true,
        content: `Full 6-Semester Curriculum for ${p?.name}:\n${fullCurr}`,
        sourceDocument: p?.sourceDocument || "4. BCA(AI-ML) data.docx",
        category: 'programme_knowledge'
      };
    }
    if (q.includes('career') || q.includes('job') || q.includes('employ')) {
      return {
        found: true,
        content: `Career & Employability opportunities for ${p?.name}:\n- ${p?.careers.join('\n- ')}`,
        sourceDocument: p?.sourceDocument || "4. BCA(AI-ML) data.docx",
        category: 'programme_knowledge'
      };
    }
    return {
      found: true,
      content: `🤖 What is AI-ML (Artificial Intelligence & Machine Learning)?\n` +
        `Artificial Intelligence & Machine Learning focuses on creating intelligent algorithms and computational systems that learn from data, identify complex patterns, and automate decision-making without explicit programming (including Supervised/Unsupervised Learning, Deep Learning, Neural Networks, and NLP).\n\n` +
        `🎓 Official University Programmes Offered in AI-ML:\n` +
        `• BCA (AI-ML) with Geeks of Gurukul (3 Years) — Annual Fee: ₹50,000 | Eligibility: 12th Pass (50%)\n` +
        `• B.Tech (CSE-IBM) AI-ML (4 Years) — Annual Fee: ₹95,000 | Eligibility: 12th PCM Pass\n` +
        `• M.Sc (Artificial Intelligence and Machine Learning) (2 Years) — Annual Fee: ₹35,000\n` +
        `• Diploma in AI-ML (1-2 Years) | Certificate in Artificial Intelligence (Short-term)\n\n` +
        `Key Highlights of BCA (AI-ML): ${p?.keyHighlights.slice(0, 3).join('; ')}.`,
      sourceDocument: "4. BCA(AI-ML) data.docx",
      category: 'programme_knowledge'
    };
  }

  // 3. AI-DS / AIDS (Artificial Intelligence & Data Science)
  if (q.includes('ai-ds') || q.includes('aids') || q.includes('data science') || (q.includes('ai') && q.includes('data science'))) {
    return {
      found: true,
      content: `📊 What is AI-DS (Artificial Intelligence & Data Science)?\n` +
        `Artificial Intelligence & Data Science (AI-DS) combines artificial intelligence techniques with big data engineering, statistical modeling, data mining, and predictive analytics to extract actionable business insights and build data-driven intelligent systems.\n\n` +
        `🎓 Official University Programmes Offered in AI-DS & Data Science:\n` +
        `• B.Tech (CSE-Geeks of Gurukul) AI & DS (4 Years) — Annual Fee: ₹95,000 | Eligibility: 12th PCM Pass\n` +
        `• M.Sc Data Science (2 Years) — Annual Fee: ₹35,000 | Eligibility: B.Sc\n` +
        `• Certificate in Data Science (Short-term) | Diploma in Data Science (1-2 Years)`,
      sourceDocument: "Fees_Structure 26-27 data.docx",
      category: 'programme_knowledge'
    };
  }

  // 4. CYBER SECURITY ACADEMIC & PROGRAMME DETAILS
  if (q.includes('cyber security') || q.includes('cybersecurity') || q.includes('cyber')) {
    const p = PROGRAMME_KNOWLEDGE.find(item => item.id === 'bca-cybersecurity');
    if (q.includes('eligib') || q.includes('apply') || q.includes('criteria')) {
      return {
        found: true,
        content: `Eligibility Criteria for ${p?.name || 'BCA (Cyber Security)'}:\n${p?.eligibility}\n(Duration: ${p?.duration})`,
        sourceDocument: p?.sourceDocument || "5. BCA(Cyber Security) data.docx",
        category: 'programme_knowledge'
      };
    }
    if (q.includes('subject') || q.includes('curriculum') || q.includes('semester')) {
      const semMatch = q.match(/semester\s*([1-6])/i) || q.match(/sem\s*([1-6])/i);
      if (semMatch && p) {
        const semNum = semMatch[1];
        const semData = p.curriculum.find(c => c.semester.includes(semNum));
        if (semData) {
          return {
            found: true,
            content: `Curriculum for ${p.name} (${semData.semester}):\n- ${semData.subjects.join('\n- ')}`,
            sourceDocument: p.sourceDocument,
            category: 'programme_knowledge'
          };
        }
      }
      const fullCurr = p?.curriculum.map(c => `${c.semester}: ${c.subjects.join(', ')}`).join('\n');
      return {
        found: true,
        content: `Full Curriculum for ${p?.name}:\n${fullCurr}`,
        sourceDocument: p?.sourceDocument || "5. BCA(Cyber Security) data.docx",
        category: 'programme_knowledge'
      };
    }
    if (q.includes('career') || q.includes('job')) {
      return {
        found: true,
        content: `Careers in Cyber Security:\n- ${p?.careers.join('\n- ')}`,
        sourceDocument: p?.sourceDocument || "5. BCA(Cyber Security) data.docx",
        category: 'programme_knowledge'
      };
    }
    return {
      found: true,
      content: `🔐 What is Cyber Security?\n` +
        `Cyber Security involves defending computer networks, servers, cloud systems, and data from digital attacks, malware, unauthorized access, and security breaches using ethical hacking, cryptography, network firewalls, and digital forensics.\n\n` +
        `🎓 Official University Programmes Offered in Cyber Security:\n` +
        `• BCA (Cyber Security) (3 Years) — Annual Fee: ₹50,000 | Eligibility: 12th Pass (50%)\n` +
        `• M.Sc (Cyber Security) (2 Years)\n` +
        `• Certificate in Cyber Security (Short-term) | Diploma in Cyber Security (1-2 Years)\n\n` +
        `Key Highlights: ${p?.keyHighlights.slice(0, 3).join('; ')}.`,
      sourceDocument: "5. BCA(Cyber Security) data.docx",
      category: 'programme_knowledge'
    };
  }

  // 5. BCA IT / CLOUD COMPUTING
  if (q.includes('bca it') || q.includes('information technology') || q.includes('cloud') || q.includes('bca (it)')) {
    const p = PROGRAMME_KNOWLEDGE.find(item => item.id === 'bca-it');
    if (q.includes('eligib') || q.includes('apply')) {
      return {
        found: true,
        content: `Eligibility Criteria for ${p?.name || 'BCA (IT)'}:\n${p?.eligibility}\n(Duration: ${p?.duration})`,
        sourceDocument: p?.sourceDocument || "7. BCA(IT) data.docx",
        category: 'programme_knowledge'
      };
    }
    if (q.includes('subject') || q.includes('curriculum') || q.includes('semester')) {
      const semMatch = q.match(/semester\s*([1-6])/i) || q.match(/sem\s*([1-6])/i);
      if (semMatch && p) {
        const semNum = semMatch[1];
        const semData = p.curriculum.find(c => c.semester.includes(semNum));
        if (semData) {
          return {
            found: true,
            content: `Curriculum for ${p.name} (${semData.semester}):\n- ${semData.subjects.join('\n- ')}`,
            sourceDocument: p.sourceDocument,
            category: 'programme_knowledge'
          };
        }
      }
      const fullCurr = p?.curriculum.map(c => `${c.semester}: ${c.subjects.join(', ')}`).join('\n');
      return {
        found: true,
        content: `Curriculum for ${p?.name}:\n${fullCurr}`,
        sourceDocument: p?.sourceDocument || "7. BCA(IT) data.docx",
        category: 'programme_knowledge'
      };
    }
    return {
      found: true,
      content: `☁️ What is IT & Cloud Computing?\n` +
        `Information Technology & Cloud Computing focuses on delivering on-demand IT services, cloud platforms (Google Cloud, AWS), database administration, network engineering, and enterprise software solutions.\n\n` +
        `🎓 Official University Programmes Offered in IT & Cloud Computing:\n` +
        `• BCA (Google) IT (Cloud Computing) (3 Years) — Annual Fee: ₹32,000 | Eligibility: 12th Pass\n` +
        `• B.Tech (CSE-Google) Cloud Computing (4 Years) — Annual Fee: ₹60,000 | Eligibility: 12th PCM Pass\n` +
        `• M.Sc (Google) Cloud Computing (2 Years) — Annual Fee: ₹40,000\n` +
        `• M.Sc (Information Technology) (2 Years)`,
      sourceDocument: "7. BCA(IT) data.docx",
      category: 'programme_knowledge'
    };
  }

  // 6. FULL STACK DEVELOPMENT
  if (q.includes('full stack') || q.includes('fullstack') || q.includes('web development')) {
    return {
      found: true,
      content: `💻 What is Full Stack Development?\n` +
        `Full Stack Development covers complete web software application building — from designing interactive frontends (HTML, CSS, JavaScript, React) to building robust backends (Node.js, Databases, RESTful APIs, and Cloud Deployment).\n\n` +
        `🎓 Official University Programmes Offered in Full Stack & Web Dev:\n` +
        `• BCA (Full Stack Development) (3 Years) — Offered under School of FSIT\n` +
        `• Certificate in Web Development (Short-term) | Diploma in Web Development (1-2 Years)`,
      sourceDocument: "2. Programme Page Content Requirement - School of FSIT data.docx",
      category: 'programme_knowledge'
    };
  }

  // 5. CERTIFICATE & DIPLOMA SPECIFIC INQUIRIES
  if (q.includes('certificate') && (q.includes('course') || q.includes('program') || q.includes('available') || q.includes('fsit') || q.includes('list') || q.includes('offer'))) {
    const certs = FSIT_PROGRAMMES_LIST.certificate.map(c => `${c.name} (${c.duration})`).join('\n- ');
    return {
      found: true,
      content: `📜 Available Certificate Courses in School of FSIT:\n- ${certs}`,
      sourceDocument: "2. Programme Page Content Requirement - School of FSIT data.docx",
      category: "university_knowledge"
    };
  }

  if (q.includes('diploma') && (q.includes('course') || q.includes('program') || q.includes('available') || q.includes('fsit') || q.includes('list') || q.includes('offer'))) {
    const dips = FSIT_PROGRAMMES_LIST.diploma.map(d => `${d.name} (${d.duration})`).join('\n- ');
    return {
      found: true,
      content: `🎓 Available Diploma Courses in School of FSIT:\n- ${dips}`,
      sourceDocument: "2. Programme Page Content Requirement - School of FSIT data.docx",
      category: "university_knowledge"
    };
  }

  // 6. GENERAL SCHOOL / PROGRAMMES LIST INQUIRY
  if (q.includes('program') || q.includes('course') || q.includes('fsit') || q.includes('school of future skills') || q.includes('degree') || q.includes('catalogue')) {
    const ugList = FSIT_PROGRAMMES_LIST.undergraduate.map(u => `${u.name} (${u.duration})`).join('\n- ');
    const pgList = FSIT_PROGRAMMES_LIST.postgraduate.map(p => `${p.name} (${p.duration})`).join('\n- ');
    return {
      found: true,
      content: `${FSIT_SCHOOL_INFO.schoolName}\n\nUndergraduate Programmes:\n- ${ugList}\n\nPostgraduate Programmes:\n- ${pgList}\n\nSpecializations offered: ${FSIT_SCHOOL_INFO.specializations.join(', ')}`,
      sourceDocument: "2. Programme Page Content Requirement - School of FSIT data.docx",
      category: "university_knowledge"
    };
  }

  // If query does not match any official university records:
  return {
    found: false,
    content: "information not available in the current university data"
  };
}
