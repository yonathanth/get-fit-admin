import { PrismaClient, Role, ClientStatus, ProgramStatus, EventStatus, InquiryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash("Admin@GetFit2026", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    // Only creates the admin account if missing; never resets an existing password
    update: {},
    create: {
      username: "admin",
      name: "Admin Director",
      email: "admin@getfitgym.com",
      passwordHash,
      role: Role.SUPERADMIN
    }
  });
  console.log("Created admin user:", admin.username);

  // 2. Seed Programs (Classes)
  const programsData = [
    {
      name: "HIIT & Metabolic Training",
      category: "Cardio & Fat Loss",
      description: "High-intensity metabolic conditioning and interval circuits to accelerate fat oxidation, cardiovascular health, and stamina.",
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
      schedule: "Mon, Wed, Fri (6:00 AM & 9:30 AM)",
      capacity: 25,
      instructor: "Abeyet Naqachew",
      intensity: "Intermediate - High",
      price: null,
      displayOrder: 1,
      features: ["Metabolic heart rate intervals", "Sports science level-based grouping", "Full-body fat oxidation"]
    },
    {
      name: "Zumba Kick Boxing",
      category: "Dance & Martial Arts",
      description: "Dynamic fusion of high-energy dance rhythms and martial arts striking combinations for full-body calorie burning and agility.",
      imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
      schedule: "Tue, Wed, Fri (9:30 AM & 6:00 PM)",
      capacity: 25,
      instructor: "Teshome Abate",
      intensity: "Intermediate",
      price: null,
      displayOrder: 2,
      features: ["Martial arts striking combinations", "High-tempo choreography", "Core agility and rhythm"]
    },
    {
      name: "Aerobics & Body Toning",
      category: "Strength & Toning",
      description: "Rhythmic endurance exercises paired with resistance bands and light weights to tone muscles, improve posture, and boost stamina.",
      imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      schedule: "Thu, Fri (9:30 AM & 6:00 PM)",
      capacity: 20,
      instructor: "Tewodros Bogale",
      intensity: "All Levels",
      price: null,
      displayOrder: 3,
      features: ["Resistance band body sculpting", "Posture alignment", "Joint-friendly calorie burn"]
    },
    {
      name: "Circuit & Sweat Cardio",
      category: "Full Body Conditioning",
      description: "Fast-paced station-to-station circuit training utilizing Life Fitness equipment and bodyweight exercises for peak heart health.",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      schedule: "Mon, Tue, Wed (6:00 AM & 6:00 PM)",
      capacity: 25,
      instructor: "Gebreal Tessema Admas",
      intensity: "Intermediate",
      price: null,
      displayOrder: 4,
      features: ["1,050 m² Life Fitness arena circuit", "Station-based workouts", "Aerobic capacity boosting"]
    },
    {
      name: "Senior Circuit & Toning",
      category: "Health & Longevity",
      description: "Gentle, level-based functional exercises designed specifically for joint mobility, balance, bone density, and vital energy.",
      imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      schedule: "Mon, Fri (11:00 AM Morning)",
      capacity: 20,
      instructor: "Gebreal Tessema Admas",
      intensity: "Low - Moderate",
      price: null,
      displayOrder: 5,
      features: ["Joint mobility & flexibility", "Balance and posture restoration", "Supervised medical fitness guidance"]
    },
    {
      name: "World of Dance & Traditional",
      category: "Cultural & Fitness Dance",
      description: "Exhilarating dance workout celebrating international rhythms and traditional beats for an uplifting, spirit-renewing cardio experience.",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      schedule: "Wed, Fri (6:00 PM) & Sat (12:30 PM)",
      capacity: 30,
      instructor: "Tewodros Bogale",
      intensity: "All Levels",
      price: null,
      displayOrder: 6,
      features: ["Traditional and global rhythms", "High-energy community workout", "Saturday Get Fit Combo special"]
    }
  ];


  // Placeholder content is only inserted into an empty table, so re-running the
  // seed never overwrites or re-creates anything managed in the admin.
  if ((await prisma.program.count()) === 0) {
    for (const prog of programsData) {
      const existing = await prisma.program.findFirst({ where: { name: prog.name } });
      if (existing) {
        await prisma.program.update({
          where: { id: existing.id },
          data: prog
        });
      } else {
        await prisma.program.create({ data: prog });
      }
    }
  } else {
    console.log("Programs: table already has data, skipping placeholders.");
  }
  console.log("Seeded programs.");

  // 3. Seed Team Members (Management + Trainers)
  const teamData = [
    // MANAGEMENT TEAM
    {
      slug: "teshome-abate",
      name: "Teshome Abate",
      role: "Master Athletics Coach & Martial Arts Specialist",
      category: "MANAGEMENT",
      bio: "Dual Master's in Exercise Physiology & Athletics Coaching, 7th Dan Black Belt in Wushu, and 22+ years elite athletic instruction.",
      fullBio: "Teshome is a highly distinguished fitness expert with dual Master’s degrees in Exercise Physiology and Athletics Coaching, complemented by over 22 years of elite martial arts club management. His extensive career spans high-level corporate wellness programs at international institutions (ILRI, ECA) and specialized athletic performance coaching.",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&q=80",
      specializations: ["Advanced Athletics Coaching", "Martial Arts Mastery", "Corporate & Institutional Wellness", "Physiological Performance Tracking"],
      certifications: ["Master's in Exercise Physiology", "Master's in Athletics Coaching", "7th Dan Black Belt in Wushu", "10+ Years Fitness Instructor at ILRI", "2 Years Fitness Instructor at ECA"],
      experienceYears: 22,
      experienceText: "22+ Years",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      instagram: "https://www.tiktok.com/@getfit.gym",
      facebook: "https://www.facebook.com/share/18TRbLvNPQ/?mibextid=wwXIfr",
      linkedin: "https://www.linkedin.com/in/getfit-gym-6538333b7",
      displayOrder: 1,
      isActive: true
    },
    {
      slug: "gebreal-tessema-admas",
      name: "Gebreal Tessema Admas",
      role: "Operational Manager & Medical Fitness Coach",
      category: "MANAGEMENT",
      bio: "B.Ed. in Physical Education & M.A. in Leadership with 11 years coaching experience in medical fitness and exercise programming.",
      fullBio: "Gebreal bridges organizational leadership with targeted medical exercise programming. Holding a B.Ed. in Health & Physical Education and an M.A. in Educational Leadership and Management, he brings 11 years of experience in program development, process improvement, and holistic health instruction.",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop&q=80",
      specializations: ["Medical Fitness Coaching", "Training Program Development", "Operational Management", "Structured Exercise Design", "Nutrition Strategies"],
      certifications: ["B.Ed. in Health & Physical Education", "M.A. in Educational Leadership & Management", "Operational Manager at Get Fit Gym", "Medical Fitness Coach at Redat Medical Plaza"],
      experienceYears: 11,
      experienceText: "11+ Years",
      email: "getfitt26@gmail.com",
      phone: "0992 222 224",
      instagram: "https://www.tiktok.com/@getfit.gym",
      facebook: "https://www.facebook.com/share/18TRbLvNPQ/?mibextid=wwXIfr",
      linkedin: "https://www.linkedin.com/in/getfit-gym-6538333b7",
      displayOrder: 2,
      isActive: true
    },
    {
      slug: "abeyet-naqachew",
      name: "Abeyet Naqachew",
      role: "Senior Coach & Combat Sports Specialist",
      category: "MANAGEMENT",
      bio: "20+ years of hands-on coaching leadership, functional movement, weightlifting program design, and 6th Dan Black Belt in Wushu.",
      fullBio: "Abeyet brings over two decades of hands-on coaching leadership and athletic management to our training floor. Holding a Bachelor’s Degree in Public Management alongside advanced certifications in Cardiovascular, Functional Training, and Sports Rehabilitation, he bridges operational leadership with practical physical development. He has founded and led premier weightlifting clubs and holds a prestigious 6th Dan Black Belt in Wushu.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&q=80",
      specializations: ["Functional Movement", "Cardiovascular Conditioning", "Weightlifting Program Design", "Combat Sports", "Athlete Recovery"],
      certifications: ["Bachelor's in Public Management", "Cardiovascular Conditioning Certified", "Functional Training Specialist", "Sports Rehabilitation Certified", "6th Dan Black Belt in Wushu"],
      experienceYears: 20,
      experienceText: "20+ Years",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      instagram: "https://www.tiktok.com/@getfit.gym",
      facebook: "https://www.facebook.com/share/18TRbLvNPQ/?mibextid=wwXIfr",
      linkedin: "https://www.linkedin.com/in/getfit-gym-6538333b7",
      displayOrder: 3,
      isActive: true
    },
    {
      slug: "tewodros-bogale",
      name: "Tewodros Bogale",
      role: "Exercise Physiologist & Head Gym Instructor",
      category: "MANAGEMENT",
      bio: "M.Sc. in Exercise Physiology and B.Sc. in Sport Science with 13+ years coaching experience in top commercial fitness environments.",
      fullBio: "Tewodros combines rigorous academic science with more than 13 years of practical coaching experience in top-tier commercial fitness environments. Holding a B.Sc. in Sport Science and an M.Sc. in Exercise Physiology, he specializes in translating complex physiological principles into safe, scalable, and highly effective workout routines for diverse populations.",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&q=80",
      specializations: ["Exercise Physiology", "Structural Strength Conditioning", "Personalized Workout Programming", "Body Composition Transformation"],
      certifications: ["B.Sc. in Sport Science", "M.Sc. in Exercise Physiology", "10+ Years Activ8 Gym Head Coach", "3 Years Tesfa Gym Specialist"],
      experienceYears: 13,
      experienceText: "13+ Years",
      email: "getfitt26@gmail.com",
      phone: "0992 222 224",
      instagram: "https://www.tiktok.com/@getfit.gym",
      facebook: "https://www.facebook.com/share/18TRbLvNPQ/?mibextid=wwXIfr",
      linkedin: "https://www.linkedin.com/in/getfit-gym-6538333b7",
      displayOrder: 4,
      isActive: true
    },
    {
      slug: "dr-tobel-daniel-tessema",
      name: "Dr. Tobel Daniel Tessema",
      role: "Medical Doctor & Community Nutrition Specialist",
      category: "MANAGEMENT",
      bio: "Medical Doctor (M.D.) & M.Sc. candidate in Community Nutrition & Dietetics applying clinical medical insights to lifestyle wellness.",
      fullBio: "Dr. Tobel combines clinical medical knowledge with specialized nutritional science to drive health promotion and long-term wellness. Holding a Doctor of Medicine from the University of Gondar and pursuing an M.Sc. in Community Nutrition and Dietetics at Addis Ababa University, he applies medical insights to lifestyle and dietary optimization.",
      imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&h=800&fit=crop&q=80",
      specializations: ["Community Nutrition", "Health Promotion", "Clinical Dietary Strategies", "Youth Health Habits", "Preventive Wellness"],
      certifications: ["Doctor of Medicine (M.D.) - University of Gondar", "M.Sc. Candidate in Community Nutrition & Dietetics (AAU)", "Clinical Experience at Washington Medical Center", "Avante Specialty Clinic Practice"],
      experienceYears: 6,
      experienceText: "Medical Doctor",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      instagram: "https://www.tiktok.com/@getfit.gym",
      facebook: "https://www.facebook.com/share/18TRbLvNPQ/?mibextid=wwXIfr",
      linkedin: "https://www.linkedin.com/in/getfit-gym-6538333b7",
      displayOrder: 5,
      isActive: true
    },

    // TRAINERS
    {
      slug: "coach-abel-kebede",
      name: "Coach Abel Kebede",
      role: "Strength & Hypertrophy Coach",
      category: "TRAINER",
      bio: "Dedicated personal trainer focused on lifting mechanics, muscle development, and safe progressive overload.",
      fullBio: "Coach Abel provides focused one-on-one training to help you build functional strength, lean mass, and joint resilience.",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&q=80",
      specializations: ["Muscle Building", "Powerlifting", "Posture Alignment"],
      certifications: ["Certified Personal Trainer (CPT)", "Strength & Conditioning Specialist"],
      experienceYears: 6,
      experienceText: "6+ Years Experience",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      displayOrder: 1,
      isActive: true
    },
    {
      slug: "coach-sara-haile",
      name: "Coach Sara Haile",
      role: "Functional Fitness & Female Specialist",
      category: "TRAINER",
      bio: "Empowering members with balanced fitness, core strength, and sustainable training routines.",
      fullBio: "Coach Sara specializes in tailored female fitness, body recomposition, and high-energy functional workouts.",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&q=80",
      specializations: ["Body Recomposition", "Core Stability", "Cardio Conditioning"],
      certifications: ["Functional Training Coach", "Sports Nutrition Certified"],
      experienceYears: 5,
      experienceText: "5+ Years Experience",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      displayOrder: 2,
      isActive: true
    },
    {
      slug: "coach-daniel-bekele",
      name: "Coach Daniel Bekele",
      role: "HIIT & Fat Loss Conditioning",
      category: "TRAINER",
      bio: "High-energy coach driving fat loss, athletic stamina, and cardiovascular endurance.",
      fullBio: "Coach Daniel combines interval circuits, athletic agility drills, and metabolic conditioning for maximum calorie burn.",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop&q=80",
      specializations: ["Fat Loss", "Agility Drills", "Cardio Capacity"],
      certifications: ["NASM Certified Personal Trainer", "HIIT & Circuit Specialist"],
      experienceYears: 5,
      experienceText: "5+ Years Experience",
      email: "getfitt26@gmail.com",
      phone: "0992 222 224",
      displayOrder: 3,
      isActive: true
    },
    {
      slug: "coach-bethlehem-tadesse",
      name: "Coach Bethlehem Tadesse",
      role: "Mobility & Body Toning Coach",
      category: "TRAINER",
      bio: "Focused on posture alignment, mobility, and lean muscle definition.",
      fullBio: "Coach Bethlehem delivers structured toning workouts paired with active recovery, mobility routines, and joint health protection.",
      imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&q=80",
      specializations: ["Joint Mobility", "Pilates & Core", "Toning Routines"],
      certifications: ["Mobility & Movement Specialist", "Group Fitness Instructor"],
      experienceYears: 4,
      experienceText: "4+ Years Experience",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      displayOrder: 4,
      isActive: true
    },
    {
      slug: "coach-yared-alemu",
      name: "Coach Yared Alemu",
      role: "Combat Sports & Boxing Coach",
      category: "TRAINER",
      bio: "Specializing in athletic striking mechanics, speed work, core conditioning, and defensive martial arts.",
      fullBio: "Coach Yared coaches members in boxing pad work, cardiovascular kickboxing circuits, and athletic endurance.",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&q=80",
      specializations: ["Boxing Drills", "Striking Speed", "Reflex Training"],
      certifications: ["Combat Sports Certified Instructor", "Boxing Conditioning Coach"],
      experienceYears: 6,
      experienceText: "6+ Years Experience",
      email: "getfitt26@gmail.com",
      phone: "0992 222 224",
      displayOrder: 5,
      isActive: true
    },
    {
      slug: "coach-rahel-mekonnen",
      name: "Coach Rahel Mekonnen",
      role: "Senior & Health Rehabilitation Coach",
      category: "TRAINER",
      bio: "Dedicated to posture alignment, gentle joint mobility, functional restoration, and medical exercise supervision.",
      fullBio: "Coach Rahel specializes in low-impact functional movements tailored for longevity, bone density, and pain-free movement.",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&q=80",
      specializations: ["Medical Fitness", "Joint Restoration", "Postural Symmetry"],
      certifications: ["Corrective Exercise Specialist", "Senior Fitness Certified"],
      experienceYears: 7,
      experienceText: "7+ Years Experience",
      email: "getfitt26@gmail.com",
      phone: "0911-415-862",
      displayOrder: 6,
      isActive: true
    }
  ];


  // Placeholder content is only inserted into an empty table, so re-running the
  // seed never overwrites or re-creates anything managed in the admin.
  if ((await prisma.teamMember.count()) === 0) {
    for (const coach of teamData) {
      await prisma.teamMember.upsert({
        where: { slug: coach.slug },
        update: coach,
        create: coach
      });
    }
  } else {
    console.log("Team members: table already has data, skipping placeholders.");
  }
  console.log("Seeded team members (Management + Trainers).");

  // 4. Seed Membership Plans (Exact Official Price List)
  const membershipPlansData = [
    // REGULAR ANY TIME
    {
      slug: "gym-only-regular-single",
      name: "Gym Only (Single)",
      category: "REGULAR",
      tier: "SINGLE",
      subtitle: "Full 1,050 m² training floor & level-based group classes",
      price1Month: "19,500 ETB",
      price3Months: "32,800 ETB",
      price6Months: "49,140 ETB",
      price1Year: "70,200 ETB",
      isPopular: false,
      features: [
        "1,050 m² Life Fitness equipment access",
        "14 level-based group fitness classes",
        "Standard locker room & shower amenities",
        "Detailed initial fitness assessment",
        "Flexible 1, 3, 6 & 12 month pre-opening rates"
      ],
      displayOrder: 1,
      isActive: true
    },
    {
      slug: "gym-spa-regular-single",
      name: "Gym With Spa (Single)",
      category: "REGULAR",
      tier: "SINGLE",
      subtitle: "All-inclusive training floor, group classes & luxury recovery center",
      price1Month: "27,495 ETB",
      price3Months: "38,844 ETB",
      price6Months: "54,600 ETB",
      price1Year: "77,200 ETB",
      isPopular: true,
      features: [
        "Full 1,050 m² Life Fitness arena access",
        "Unlimited 750 m² Spa, steam & sauna",
        "Moroccan bath & massage therapy access",
        "14 level-based group fitness activities",
        "Detailed body composition scan & tracking",
        "Nutritionist & medical doctor consultation",
        "Priority executive locker & towel service"
      ],
      displayOrder: 2,
      isActive: true
    },
    {
      slug: "gym-spa-regular-couple",
      name: "Gym With Spa (Couple - 10% Off)",
      category: "REGULAR",
      tier: "COUPLE",
      subtitle: "Dual all-inclusive Gym & Spa membership with couples discount",
      price1Month: "49,530 ETB",
      price3Months: "69,920 ETB",
      price6Months: "98,280 ETB",
      price1Year: "138,996 ETB",
      isPopular: false,
      features: [
        "2-person all-inclusive Gym & Spa pass",
        "1,050 m² training area + 750 m² wellness center",
        "Unlimited steam, sauna & Moroccan bath",
        "14 level-based group classes for both",
        "Dual body composition & health evaluations",
        "Personalized nutrition strategies",
        "Restaurant & beauty salon discounts"
      ],
      displayOrder: 3,
      isActive: true
    },
    {
      slug: "gym-only-regular-couple",
      name: "Gym Only (Couple - 10% Off)",
      category: "REGULAR",
      tier: "COUPLE",
      subtitle: "Dual training floor membership with 10% couples discount",
      price1Month: "35,100 ETB",
      price3Months: "58,960 ETB",
      price6Months: "88,452 ETB",
      price1Year: "126,360 ETB",
      isPopular: false,
      features: [
        "2-person training floor access",
        "14 level-based group fitness classes",
        "Dual body composition assessments",
        "Standard locker room & shower amenities"
      ],
      displayOrder: 4,
      isActive: true
    },

    // HAPPY HOUR (20% OFF)
    {
      slug: "gym-only-happy-hour-single",
      name: "Gym Only (Happy Hour Single)",
      category: "HAPPY_HOUR",
      tier: "SINGLE",
      subtitle: "Off-peak training floor access with 20% discount",
      price1Month: "15,600 ETB",
      price3Months: "26,208 ETB",
      price6Months: "39,312 ETB",
      price1Year: "56,160 ETB",
      isPopular: false,
      features: [
        "Off-peak 1,050 m² Life Fitness area access",
        "14 level-based group fitness classes",
        "Standard locker room & shower amenities",
        "Baseline fitness level assessment",
        "Pre-opening discounts across all terms"
      ],
      displayOrder: 5,
      isActive: true
    },
    {
      slug: "gym-spa-happy-hour-single",
      name: "Gym With Spa (Happy Hour Single)",
      category: "HAPPY_HOUR",
      tier: "SINGLE",
      subtitle: "Off-peak Gym & Spa luxury recovery with 20% savings",
      price1Month: "22,000 ETB",
      price3Months: "30,992 ETB",
      price6Months: "43,680 ETB",
      price1Year: "61,776 ETB",
      isPopular: true,
      features: [
        "Off-peak 1,050 m² Life Fitness arena access",
        "750 m² Spa, steam, sauna & Moroccan bath",
        "Detailed body composition & health tracking",
        "14 level-based group classes",
        "Nutritionist consultation session",
        "Priority executive locker & shower access"
      ],
      displayOrder: 6,
      isActive: true
    },
    {
      slug: "gym-spa-happy-hour-couple",
      name: "Gym With Spa (Couple Happy Hour)",
      category: "HAPPY_HOUR",
      tier: "COUPLE",
      subtitle: "Off-peak dual Gym & Spa package with combined discounts",
      price1Month: "39,624 ETB",
      price3Months: "55,960 ETB",
      price6Months: "78,624 ETB",
      price1Year: "111,192 ETB",
      isPopular: false,
      features: [
        "2-person off-peak Gym & Spa all-inclusive",
        "Unlimited steam, sauna & Moroccan bath",
        "Dual body composition assessments",
        "14 level-based group classes for both",
        "Nutrition consultation & dietary review",
        "Restaurant & beauty salon discounts"
      ],
      displayOrder: 7,
      isActive: true
    },
    {
      slug: "gym-only-happy-hour-couple",
      name: "Gym Only (Couple Happy Hour)",
      category: "HAPPY_HOUR",
      tier: "COUPLE",
      subtitle: "Off-peak dual training floor pass with combined savings",
      price1Month: "28,000 ETB",
      price3Months: "47,174 ETB",
      price6Months: "70,700 ETB",
      price1Year: "101,000 ETB",
      isPopular: false,
      features: [
        "2-person off-peak training arena pass",
        "14 level-based group classes for both",
        "Standard locker room & shower amenities"
      ],
      displayOrder: 8,
      isActive: true
    }
  ];


  // Placeholder content is only inserted into an empty table, so re-running the
  // seed never overwrites or re-creates anything managed in the admin.
  if ((await prisma.membershipPlan.count()) === 0) {
    for (const plan of membershipPlansData) {
      await prisma.membershipPlan.upsert({
        where: { slug: plan.slug },
        update: plan,
        create: plan
      });
    }
  } else {
    console.log("Membership plans: table already has data, skipping placeholders.");
  }
  console.log("Seeded membership plans.");

  // 5. Seed Upcoming Events (and mark one for the 10-second popup)
  const eventsData = [
    {
      slug: "youth-sports-day",
      title: "Youth Sports Day",
      eventDate: new Date("2026-03-22T09:00:00Z"),
      dateString: "March 22, 2026",
      timeString: "9:00 AM - 3:00 PM",
      location: "Main Gymnasium Arena",
      description: "A quarterly celebration of young athletes featuring fun competitions, games, skill challenges, and awards for our next generation of champions.",
      paragraphs: [
        "Youth Sports Day is our quarterly celebration dedicated entirely to our young athletes. This special event transforms Get Fit Gym into a vibrant sports festival where kids and teens can showcase their skills, compete in age-appropriate challenges, and celebrate their athletic achievements.",
        "The day features multiple competition categories including gymnastics demonstrations, martial arts exhibitions, relay races, obstacle courses, and team sports. Every participant receives recognition, and outstanding performers earn medals and special awards.",
        "Beyond competition, Youth Sports Day emphasizes fun, friendship, and character development. Parents are invited to cheer on their young champions, and the atmosphere is filled with encouragement, positive energy, and community spirit."
      ],
      imageUrl: "https://images.unsplash.com/photo-1599447332490-d839c2a3f337?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1599447332490-d839c2a3f337?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80"
      ],
      totalSpots: 60,
      remainingSpots: 60,
      isPopupFeatured: true, // Marked as the active featured popup event!
      status: EventStatus.UPCOMING
    },
    {
      slug: "health-fitness-nutrition-seminar",
      title: "Health, Fitness & Nutrition Seminar",
      eventDate: new Date("2026-04-15T10:00:00Z"),
      dateString: "April 15, 2026",
      timeString: "10:00 AM - 1:00 PM",
      location: "Main Auditorium",
      description: "A comprehensive workshop exploring the critical connections between exercise science, nutritional biochemistry, and sustainable wellness.",
      paragraphs: [
        "Join us for an enlightening seminar that bridges the gap between exercise physiology and nutritional science. Led by our certified strength coaches and clinical nutritionists, this event provides actionable strategies to optimize your training and nutrition.",
        "Learn how macronutrient timing impacts recovery, how to construct balanced meal plans for body composition goals, and how to fuel peak performance in and outside the gym."
      ],
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80"
      ],
      totalSpots: 45,
      remainingSpots: 45,
      isPopupFeatured: false,
      status: EventStatus.UPCOMING
    },
    {
      slug: "monthly-fitness-challenge",
      title: "Monthly Fitness Challenge",
      eventDate: new Date("2026-05-28T08:00:00Z"),
      dateString: "May 28, 2026",
      timeString: "8:00 AM - 12:00 PM",
      location: "Main Training Floor",
      description: "Test your limits in our monthly community challenge featuring specialized workout stations, leaderboards, and prizes for top performers.",
      paragraphs: [
        "The Monthly Fitness Challenge is our signature community competition designed to push boundaries in a high-energy, supportive environment. Test your strength, stamina, and mental fortitude against yourself and fellow members.",
        "With structured workout stations and certified judges tracking form and reps, this challenge welcomes athletes of all fitness levels with scaled and competitive divisions."
      ],
      imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599447332490-d839c2a3f337?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80"
      ],
      totalSpots: 30,
      remainingSpots: 30,
      isPopupFeatured: false,
      status: EventStatus.UPCOMING
    },
    {
      slug: "wellness-workshops",
      title: "Wellness Workshops",
      eventDate: new Date("2026-06-10T11:00:00Z"),
      dateString: "June 10, 2026",
      timeString: "11:00 AM - 1:00 PM",
      location: "Studio B",
      description: "Monthly expert-led sessions on nutrition, mental health, recovery, and holistic wellness to support your complete fitness journey.",
      paragraphs: [
        "Our Wellness Workshops recognize that true fitness extends beyond physical training. Each month, we host expert-led sessions covering essential aspects of health and wellness, from nutrition and meal planning to mental health strategies and recovery techniques."
      ],
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80"
      ],
      totalSpots: 40,
      remainingSpots: 40,
      isPopupFeatured: false,
      status: EventStatus.UPCOMING
    }
  ];

  // Placeholder content is only inserted into an empty table, so re-running the
  // seed never overwrites or re-creates anything managed in the admin.
  if ((await prisma.upcomingEvent.count()) === 0) {
    for (const ev of eventsData) {
      await prisma.upcomingEvent.upsert({
        where: { slug: ev.slug },
        update: ev,
        create: ev
      });
    }
  } else {
    console.log("Events: table already has data, skipping placeholders.");
  }
  console.log("Seeded events.");

  // 6. Seed Past Showcases
  const showcaseData = [
    {
      slug: "youth-sports-day",
      title: "Youth Sports Day",
      eventDate: "January 2026",
      location: "Full Facility Arena",
      attendees: 60,
      category: "Youth Competition",
      description: "Young athletes showcased their skills in competitions, games, and team activities. An exciting day filled with energy, sportsmanship, and achievement.",
      paragraphs: [
        "Youth Sports Day was an action-packed event designed specifically for our young members, featuring a wide variety of sports activities, competitions, and team-building games. The day provided a perfect blend of friendly competition, skill development, and pure fun in a supportive environment.",
        "Young athletes participated in team sports competitions, individual skill challenges tailored to different age groups, and relay races that tested speed and coordination. Professional coaches provided mentorship sessions, offering valuable feedback and encouragement throughout the day.",
        "The event concluded with an awards ceremony where every participant received recognition for their efforts. Parents and families were thrilled to see their children develop confidence, sportsmanship, and a love for physical activity in such a positive and inclusive setting."
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1599447332490-d839c2a3f337?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1599447332490-d839c2a3f337?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&q=80"
      ],
      highlights: [
        "Team sports competitions and relay races",
        "Individual skill challenges for different age groups",
        "Medals and prizes for all participants",
        "Professional coaching and mentorship sessions"
      ]
    },
    {
      slug: "health-fitness-nutrition-seminar",
      title: "Health, Fitness & Nutrition Seminar",
      eventDate: "February 2026",
      location: "Main Auditorium",
      attendees: 45,
      category: "Wellness Workshop",
      description: "Our monthly seminar brought together health experts and members for comprehensive wellness guidance. This event focused on the essential pillars of health, fitness, and nutrition.",
      paragraphs: [
        "Our Health, Fitness & Nutrition Seminar brought together medical professionals, certified fitness trainers, and licensed nutritionists to provide expert guidance on optimizing health from every angle.",
        "The seminar featured three main segments: health fundamentals led by medical doctors covering injury prevention; fitness optimization with expert trainers; and nutrition guidance on meal planning and dietary strategies.",
        "Attendees participated in interactive Q&A sessions, practical meal-prep demonstrations, and received take-home wellness toolkits."
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80"
      ],
      highlights: [
        "Expert presentations on fitness fundamentals",
        "Nutrition science and meal planning workshop",
        "Interactive Q&A with certified trainers",
        "Networking with health-conscious community members"
      ]
    },
    {
      slug: "monthly-fitness-challenge",
      title: "Monthly Fitness Challenge",
      eventDate: "December 2025",
      location: "Main Training Floor",
      attendees: 30,
      category: "Competition",
      description: "Members competed in challenging workouts and celebrated personal achievements together. A test of strength, endurance, and determination.",
      paragraphs: [
        "Our Monthly Fitness Challenge brought together members for an intense circuit-style workout that tested strength, endurance, and mental fortitude in a high-energy atmosphere.",
        "Participants navigated timed challenge stations with certified judges tracking form and reps across scaled and competitive divisions.",
        "The post-competition celebration with smoothie bar and awards reinforced our strong gym community bond."
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599447332490-d839c2a3f337?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80"
      ],
      highlights: [
        "Circuit-style workout combining strength and cardio",
        "Professional timing and score tracking",
        "Prizes for top performers in each category",
        "Post-workout celebration and smoothie bar"
      ]
    }
  ];

  // Placeholder content is only inserted into an empty table, so re-running the
  // seed never overwrites or re-creates anything managed in the admin.
  if ((await prisma.communityShowcase.count()) === 0) {
    for (const sc of showcaseData) {
      await prisma.communityShowcase.upsert({
        where: { slug: sc.slug },
        update: sc,
        create: sc
      });
    }
  } else {
    console.log("Community showcases: table already has data, skipping placeholders.");
  }
  console.log("Seeded community showcases.");

  // 7. Seed Blog Posts
  const blogData = [
    {
      slug: "essential-strength-training-techniques",
      title: "Essential Strength Training Techniques for Maximum Growth",
      category: "Training",
      excerpt: "Master the fundamental principles of progressive overload, recovery timing, and biomechanics to accelerate your strength gains safely.",
      content: `Strength training is the cornerstone of lifelong physical vitality. Whether your goal is building lean muscle, improving athletic power, or protecting joint longevity, following sound biomechanical principles ensures consistent progress while minimizing injury risks.\n\n### The Principle of Progressive Overload\nTo stimulate continuous muscular adaptation, you must gradually increase the stress placed on your musculoskeletal system over time. This can be achieved through adding weight to the bar, increasing total set volume, improving movement tempo, or reducing rest intervals.\n\n### Prioritize Compound Multi-Joint Movements\nFoundational exercises such as the barbell squat, deadlift, overhead press, and pull-up recruit large kinetic chains and release higher anabolic signals. Master the mechanics of these core lifts before adding specialized isolation accessories.`,
      coverImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      authorName: "Teshome Bekele",
      authorRole: "Head Coach",
      readTime: "4 min read",
      isPublished: true,
      publishedAt: new Date("2026-02-10T08:00:00Z")
    },
    {
      slug: "nutrition-guide-fueling-performance",
      title: "Nutrition Guide: Fueling Your Body for Peak Performance",
      category: "Nutrition",
      excerpt: "Discover how macronutrient balance, hydration strategies, and pre/post-workout meal timing can transform your daily energy and recovery.",
      content: `Optimal physical performance is impossible without deliberate nutritional fueling. Food is not merely fuel—it is the biological information that instructs your body how to repair tissue, regulate hormones, and replenish depleted glycogen.\n\n### Macronutrient Harmony\nBalancing high-quality protein (1.6g to 2.2g per kg of lean mass), complex carbohydrates for sustained glycogen replenishment, and anti-inflammatory healthy fats establishes the metabolic baseline for peak training.\n\n### Pre- and Post-Workout Timing\nConsuming easily digestible carbohydrates with a moderate protein source 60–90 minutes before heavy exertion ensures sustained blood glucose, while post-workout amino acid delivery activates muscle protein synthesis.`,
      coverImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
      authorName: "Sara Bekele",
      authorRole: "Nutrition Specialist",
      readTime: "5 min read",
      isPublished: true,
      publishedAt: new Date("2026-02-18T10:00:00Z")
    },
    {
      slug: "recovery-strategies-faster-results",
      title: "Recovery Strategies: How Sleep & Active Rest Accelerate Results",
      category: "Wellness",
      excerpt: "Why what you do outside the gym determines 80% of your progress. Practical protocols for sleep optimization, sauna therapy, and mobility.",
      content: `Muscles do not grow during workouts; they are stimulated during workouts and reconstructed during rest. Without adequate parasympathetic recovery, continuous hard training leads to systemic central nervous system fatigue.\n\n### The Power of Slow-Wave Sleep\nDuring deep stage-3 non-REM sleep, your body releases the vast majority of daily human growth hormone. Aim for 7.5 to 9 hours of uninterrupted sleep in a pitch-black, cool room.\n\n### Sauna & Thermal Recovery\nInfrared and dry sauna sessions elevate heat-shock proteins, promote cardiovascular circulation, and accelerate the flushing of metabolic waste products from sore muscle tissue.`,
      coverImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      authorName: "Gabriel Haile",
      authorRole: "Strength & Conditioning",
      readTime: "6 min read",
      isPublished: true,
      publishedAt: new Date("2026-02-25T12:00:00Z")
    }
  ];

  // Placeholder content is only inserted into an empty table, so re-running the
  // seed never overwrites or re-creates anything managed in the admin.
  if ((await prisma.blogPost.count()) === 0) {
    for (const b of blogData) {
      await prisma.blogPost.upsert({
        where: { slug: b.slug },
        update: b,
        create: b
      });
    }
  } else {
    console.log("Blog posts: table already has data, skipping placeholders.");
  }
  console.log("Seeded blog posts.");

  // 8. Seed Gym Settings
  const settingsData = [
    { key: "gym_name", value: "Get Fit Gym", description: "Official gym brand name" },
    { key: "video_tour_url", value: "xEmaKZoDggTHIm3kNryHGS3yJ5aeI1A6yvPVMg901bJk", description: "Mux playback ID (or player.mux.com link) for the video tour" },
    { key: "popup_delay_seconds", value: "10", description: "Seconds before the featured-event popup appears" },
    { key: "phone_primary", value: "0911-415-862", description: "Main reception phone" },
    { key: "phone_secondary", value: "0992 222 224", description: "Secondary phone" },
    { key: "email_address", value: "getfitt26@gmail.com", description: "Contact email" },
    { key: "location_address", value: "CMC Michael, Addis Ababa, Ethiopia", description: "Gym facility street address" },
    { key: "operating_hours", value: "5:00 AM - 10:00 PM / Monday - Sunday", description: "Operating hours" },
    { key: "operating_hours_weekday", value: "5:00 AM - 10:00 PM / Monday - Sunday", description: "Weekday operating hours" },
    { key: "operating_hours_weekend", value: "5:00 AM - 10:00 PM / Monday - Sunday", description: "Weekend operating hours" },
    { key: "tiktok_url", value: "https://www.tiktok.com/@getfit.gym?_r=1&_d=emlg250de76mf3&sec_uid=MS4wLjABAAAAvBlVwdgWlgwuZAR7zeqbrktbvzDdN_AdTyf8dzhRc5YZhlAMUVvpQgMVS28ngCI2&share_author_id=7617383060232930322&sharer_language=en&source=h5_m&u_code=f2df05jabaidcj&item_author_type=1&utm_source=whatsapp&tt_from=whatsapp&enable_checksum=1&utm_medium=ios&share_link_id=862AD9C8-C905-4DF5-AC6A-089F06537298&user_id=7617383060232930322&sec_user_id=MS4wLjABAAAAvBlVwdgWlgwuZAR7zeqbrktbvzDdN_AdTyf8dzhRc5YZhlAMUVvpQgMVS28ngCI2&social_share_type=5&ug_btm=b8727,b0&utm_campaign=client_share&share_app_id=1233", description: "Official TikTok channel" },
    { key: "linkedin_url", value: "https://www.linkedin.com/in/getfit-gym-6538333b7?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", description: "Official LinkedIn profile" },
    { key: "facebook_url", value: "https://www.facebook.com/share/18TRbLvNPQ/?mibextid=wwXIfr", description: "Official Facebook page" },
    { key: "youtube_url", value: "https://youtube.com/@getfit-gym?si=Y5pWSp_Nz3bveXRo", description: "Official YouTube channel" }
  ];

  for (const s of settingsData) {
    await prisma.gymSetting.upsert({
      where: { key: s.key },
      update: {}, // never overwrite values edited in the admin
      create: s
    });
  }
  console.log("Seeded gym settings.");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
