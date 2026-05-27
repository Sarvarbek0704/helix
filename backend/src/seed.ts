/**
 * Helix Healthcare — Full Database Seeder
 * Run: npx ts-node -r tsconfig-paths/register src/seed.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

// ─── Entity imports ───────────────────────────────────────────────────────────
import { User, UserRole, UserStatus } from './database/entities/user.entity';
import { PatientProfile, BloodType } from './database/entities/patient-profile.entity';
import { DoctorProfile } from './database/entities/doctor-profile.entity';
import { Department } from './database/entities/department.entity';
import { DoctorSchedule, DayOfWeek } from './database/entities/doctor-schedule.entity';
import { Appointment, AppointmentStatus, AppointmentType } from './database/entities/appointment.entity';
import { MedicalRecord, RecordType } from './database/entities/medical-record.entity';
import { Prescription, PrescriptionStatus } from './database/entities/prescription.entity';
import { PrescriptionItem } from './database/entities/prescription-item.entity';
import { LabOrder, LabOrderStatus, LabOrderPriority } from './database/entities/lab-order.entity';
import { LabResult, ResultStatus } from './database/entities/lab-result.entity';
import { VitalSigns } from './database/entities/vital-signs.entity';
import { Bill, BillStatus, PaymentMethod } from './database/entities/bill.entity';
import { BillItem } from './database/entities/bill-item.entity';
import { InsurancePlan } from './database/entities/insurance-plan.entity';
import { InsuranceClaim, ClaimStatus } from './database/entities/insurance-claim.entity';
import { Medication, MedicationCategory } from './database/entities/medication.entity';
import { Notification, NotificationType } from './database/entities/notification.entity';

// ─── DataSource ────────────────────────────────────────────────────────────────
const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  ssl: { rejectUnauthorized: false },
  logging: false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hash = (pw: string) => bcrypt.hash(pw, 12);
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const dateStr = (d: Date) => d.toISOString().slice(0, 10);
const pad = (n: number, len = 6) => String(n).padStart(len, '0');
let apptCounter = 1;
let billCounter = 1;
let rxCounter = 1;
let labCounter = 1;
let recordCounter = 1;

async function createUser(repo: any, data: Partial<User> & { password: string }): Promise<User> {
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) { console.log(`  ↳ User exists: ${data.email}`); return existing; }
  const hashed = await hash(data.password);
  const u = repo.create({ ...data, password: hashed, status: UserStatus.ACTIVE, isEmailVerified: true });
  return repo.save(u);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await ds.initialize();
  console.log('✓ Database connected');

  const userRepo = ds.getRepository(User);
  const patientRepo = ds.getRepository(PatientProfile);
  const doctorRepo = ds.getRepository(DoctorProfile);
  const deptRepo = ds.getRepository(Department);
  const scheduleRepo = ds.getRepository(DoctorSchedule);
  const apptRepo = ds.getRepository(Appointment);
  const recordRepo = ds.getRepository(MedicalRecord);
  const rxRepo = ds.getRepository(Prescription);
  const rxItemRepo = ds.getRepository(PrescriptionItem);
  const labRepo = ds.getRepository(LabOrder);
  const labResultRepo = ds.getRepository(LabResult);
  const vitalRepo = ds.getRepository(VitalSigns);
  const billRepo = ds.getRepository(Bill);
  const billItemRepo = ds.getRepository(BillItem);
  const planRepo = ds.getRepository(InsurancePlan);
  const claimRepo = ds.getRepository(InsuranceClaim);
  const medRepo = ds.getRepository(Medication);
  const notifRepo = ds.getRepository(Notification);

  // ── 1. DEPARTMENTS ──────────────────────────────────────────────────────────
  console.log('\n📂 Seeding departments...');
  const depts: Partial<Department>[] = [
    { name: 'Kardiologiya', description: 'Yurak va qon tomir kasalliklari', icon: 'heart', color: '#ef4444' },
    { name: 'Nevrologiya', description: 'Miya va asab tizimi kasalliklari', icon: 'brain', color: '#8b5cf6' },
    { name: 'Pediatriya', description: 'Bolalar salomatligi', icon: 'baby', color: '#f59e0b' },
    { name: 'Ortopediya', description: "Suyak va bo'g'im kasalliklari", icon: 'bone', color: '#06b6d4' },
    { name: 'Umumiy tibbiyot', description: 'Birlamchi tibbiy yordam', icon: 'stethoscope', color: '#0891b2' },
    { name: 'Endokrinologiya', description: 'Gormon va metabolizm kasalliklari', icon: 'activity', color: '#10b981' },
    { name: 'Ginekologiya', description: 'Ayollar salomatligi', icon: 'user', color: '#ec4899' },
    { name: 'Dermatologiya', description: 'Teri kasalliklari', icon: 'shield', color: '#f97316' },
  ];
  const deptMap: Record<string, Department> = {};
  for (const d of depts) {
    let dept = await deptRepo.findOne({ where: { name: d.name } });
    if (!dept) dept = await deptRepo.save(deptRepo.create(d));
    deptMap[d.name] = dept;
  }
  console.log('  ✓ 8 departments');

  // ── 2. INSURANCE PLANS ──────────────────────────────────────────────────────
  console.log('\n🛡 Seeding insurance plans...');
  const planDefs = [
    { name: 'Asosiy Sog\'liq', provider: 'UzMedInsure', description: 'Asosiy tibbiy sug\'urta', coveragePercent: 70, deductible: 500, outOfPocketMax: 3000, coveredServices: ['consultation', 'lab_test', 'medication'] },
    { name: 'Keng Qamrovli', provider: 'HelixCare', description: 'Keng qamrovli sug\'urta paketi', coveragePercent: 85, deductible: 250, outOfPocketMax: 1500, coveredServices: ['consultation', 'lab_test', 'medication', 'procedure', 'surgery'] },
    { name: 'Premium', provider: 'MedGold', description: 'Premium sog\'liq sug\'urtasi', coveragePercent: 95, deductible: 100, outOfPocketMax: 500, coveredServices: ['consultation', 'lab_test', 'medication', 'procedure', 'surgery', 'dental', 'vision'] },
    { name: 'Oila Paketi', provider: 'FamilyCare', description: 'Butun oila uchun paket', coveragePercent: 80, deductible: 300, outOfPocketMax: 2000, coveredServices: ['consultation', 'lab_test', 'medication', 'pediatrics'] },
  ];
  const plans: InsurancePlan[] = [];
  for (const p of planDefs) {
    let plan = await planRepo.findOne({ where: { name: p.name } });
    if (!plan) plan = await planRepo.save(planRepo.create(p));
    plans.push(plan);
  }
  console.log('  ✓ 4 insurance plans');

  // ── 3. MEDICATIONS ──────────────────────────────────────────────────────────
  console.log('\n💊 Seeding medications...');
  const meds = [
    { name: 'Amoksitsillin', genericName: 'Amoxicillin', category: MedicationCategory.ANTIBIOTIC, form: 'Kapsul', strength: '500mg', description: 'Keng spektrli antibiotik' },
    { name: 'Ibuprofen', genericName: 'Ibuprofen', category: MedicationCategory.ANALGESIC, form: 'Tablet/Sirop', strength: '400mg', description: 'Og\'riq qoldiruvchi va yallig\'lanishga qarshi' },
    { name: 'Lizinopril', genericName: 'Lisinopril', category: MedicationCategory.ANTIHYPERTENSIVE, form: 'Tablet', strength: '10mg', description: 'Qon bosimini pasaytirish uchun' },
    { name: 'Metformin', genericName: 'Metformin HCl', category: MedicationCategory.ANTIDIABETIC, form: 'Tablet', strength: '500mg/1000mg', description: 'Qandli diabet uchun' },
    { name: 'Setirizin', genericName: 'Cetirizine HCl', category: MedicationCategory.ANTIHISTAMINE, form: 'Tablet/Sirop', strength: '10mg', description: 'Allergiyaga qarshi' },
    { name: 'D3 vitamini', genericName: 'Cholecalciferol', category: MedicationCategory.VITAMIN, form: 'Kapsul', strength: '1000IU', description: 'D vitamini yetishmovchiligi uchun' },
    { name: 'Paratsetamol', genericName: 'Acetaminophen', category: MedicationCategory.ANALGESIC, form: 'Tablet/Sirop', strength: '500mg', description: 'Isitma va og\'riqqa qarshi' },
    { name: 'Atorvastatin', genericName: 'Atorvastatin', category: MedicationCategory.OTHER, form: 'Tablet', strength: '20mg', description: 'Xolesterol darajasini pasaytirish' },
    { name: 'Omeprazol', genericName: 'Omeprazole', category: MedicationCategory.OTHER, form: 'Kapsul', strength: '20mg', description: 'Oshqozon kislotasini kamaytirish' },
    { name: 'Amlodipin', genericName: 'Amlodipine', category: MedicationCategory.ANTIHYPERTENSIVE, form: 'Tablet', strength: '5mg', description: 'Kalsiy kanal blokatori' },
    { name: 'Metoprolol', genericName: 'Metoprolol', category: MedicationCategory.ANTIHYPERTENSIVE, form: 'Tablet', strength: '50mg', description: 'Beta-blokator, yurak kasalligida' },
    { name: 'Glyukoza', genericName: 'Dextrose', category: MedicationCategory.OTHER, form: 'Infuzion', strength: '5%', description: 'Energiya manbai' },
    { name: 'Askorbin kislota', genericName: 'Vitamin C', category: MedicationCategory.VITAMIN, form: 'Tablet/Kukun', strength: '500mg', description: 'Immunitetni kuchaytirish' },
    { name: 'Tseftriakson', genericName: 'Ceftriaxone', category: MedicationCategory.ANTIBIOTIC, form: 'Ukol', strength: '1g', description: 'III avlod antibiotik' },
    { name: 'Deksametazon', genericName: 'Dexamethasone', category: MedicationCategory.OTHER, form: 'Tablet/Ukol', strength: '4mg', description: 'Kortikosteroid, yallig\'lanishga qarshi' },
    { name: 'Digoksin', genericName: 'Digoxin', category: MedicationCategory.OTHER, form: 'Tablet', strength: '0.25mg', description: 'Yurak ritmi uchun' },
    { name: 'Klonazepam', genericName: 'Clonazepam', category: MedicationCategory.OTHER, form: 'Tablet', strength: '0.5mg', description: 'Tutqanoq va anxiyozlik' },
    { name: 'Pantoprazol', genericName: 'Pantoprazole', category: MedicationCategory.OTHER, form: 'Tablet/Ukol', strength: '40mg', description: 'Oshqozon-ichak kasalliklari' },
    { name: 'Zink sulfat', genericName: 'Zinc Sulfate', category: MedicationCategory.VITAMIN, form: 'Tablet/Sirop', strength: '20mg', description: 'Immunitet va o\'sish' },
    { name: 'Folic kislota', genericName: 'Folic Acid', category: MedicationCategory.VITAMIN, form: 'Tablet', strength: '400mcg', description: 'Homiladorlik va qon kasalligi' },
  ];
  for (const m of meds) {
    const exists = await medRepo.findOne({ where: { name: m.name } });
    if (!exists) await medRepo.save(medRepo.create(m));
  }
  console.log('  ✓ 20 medications');

  // ── 4. ADMIN USER ───────────────────────────────────────────────────────────
  console.log('\n👤 Seeding users...');
  const admin = await createUser(userRepo, {
    email: 'admin@helix.uz',
    password: 'Admin@12345',
    firstName: 'Jasur',
    lastName: 'Toshmatov',
    role: UserRole.ADMIN,
    phone: '+998901234567',
  });

  // ── 5. DOCTORS ──────────────────────────────────────────────────────────────
  const doctorData = [
    {
      email: 'dr.azimov@helix.uz', password: 'Doctor@12345',
      firstName: 'Bobur', lastName: 'Azimov', phone: '+998901112233',
      dept: 'Kardiologiya', spec: 'Kardiologiya', sub: 'Interventional Cardiology',
      exp: 12, fee: 150000, license: 'UZ-MED-2012-4521', bio: 'Yurak-qon tomir kasalliklari bo\'yicha mutaxassis. 12 yillik klinik tajribaga ega. Toshkent tibbiyot akademiyasini tamomlagan.', education: 'Toshkent Tibbiyot Akademiyasi, 2012\nKardiovaskulyar tibbiyot bo\'yicha magistr, 2015', langs: ['O\'zbek', 'Rus', 'Ingliz'],
    },
    {
      email: 'dr.yusupova@helix.uz', password: 'Doctor@12345',
      firstName: 'Nilufar', lastName: 'Yusupova', phone: '+998907654321',
      dept: 'Nevrologiya', spec: 'Nevrologiya', sub: 'Pediatric Neurology',
      exp: 8, fee: 130000, license: 'UZ-MED-2016-7832', bio: 'Nevrologiya va epilepsiya sohasida ixtisoslashgan. Ilmiy nashrlar muallifi.', education: 'Samarqand Davlat Tibbiyot Instituti, 2016\nNevrologiya bo\'yicha rezidentura, 2018', langs: ['O\'zbek', 'Rus'],
    },
    {
      email: 'dr.rahimov@helix.uz', password: 'Doctor@12345',
      firstName: 'Sardor', lastName: 'Rahimov', phone: '+998935551122',
      dept: 'Umumiy tibbiyot', spec: 'Umumiy amaliyot', sub: '',
      exp: 5, fee: 100000, license: 'UZ-MED-2019-3344', bio: 'Birlamchi tibbiy yordam va profilaktik tibbiyot bo\'yicha mutaxassis. Bemorlar bilan yaxshi aloqa o\'rnatadi.', education: 'Andijon Davlat Tibbiyot Instituti, 2019', langs: ['O\'zbek', 'Rus'],
    },
    {
      email: 'dr.komilov@helix.uz', password: 'Doctor@12345',
      firstName: 'Akbar', lastName: 'Komilov', phone: '+998909887766',
      dept: 'Endokrinologiya', spec: 'Endokrinologiya', sub: 'Diabetologiya',
      exp: 10, fee: 140000, license: 'UZ-MED-2014-9087', bio: 'Qandli diabet va tireoid kasalliklar sohasida keng tajribaga ega mutaxassis.', education: 'Toshkent Tibbiyot Akademiyasi, 2014\nEndokrinologiya rezidenturasi, 2016', langs: ['O\'zbek', 'Rus', 'Ingliz'],
    },
  ];

  const doctors: { user: User; profile: DoctorProfile }[] = [];
  let docNumCounter = 1;
  for (const d of doctorData) {
    const user = await createUser(userRepo, { email: d.email, password: d.password, firstName: d.firstName, lastName: d.lastName, role: UserRole.DOCTOR, phone: d.phone });
    let profile = await doctorRepo.findOne({ where: { userId: user.id } });
    if (!profile) {
      profile = await doctorRepo.save(doctorRepo.create({
        userId: user.id,
        departmentId: deptMap[d.dept]?.id,
        specialization: d.spec,
        subSpecialization: d.sub || undefined,
        yearsOfExperience: d.exp,
        consultationFee: d.fee,
        licenseNumber: d.license,
        bio: d.bio,
        education: d.education,
        languages: d.langs,
        isAcceptingPatients: true,
        doctorNumber: `DR${pad(docNumCounter++)}`,
        rating: 4.3 + Math.random() * 0.6,
        reviewCount: 20 + Math.floor(Math.random() * 80),
      }));
    }
    doctors.push({ user, profile });
    // Doctor schedule
    const days: DayOfWeek[] = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI];
    for (const day of days) {
      const exists = await scheduleRepo.findOne({ where: { doctorId: profile.id, dayOfWeek: day } });
      if (!exists) {
        await scheduleRepo.save(scheduleRepo.create({ doctorId: profile.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00', isActive: true, slotDurationMinutes: 30 } as any));
      }
    }
  }

  // ── 6. NURSES ───────────────────────────────────────────────────────────────
  const nurseData = [
    { email: 'nurse.karimova@helix.uz', password: 'Nurse@12345', firstName: 'Malika', lastName: 'Karimova', phone: '+998901231234' },
    { email: 'nurse.toshev@helix.uz', password: 'Nurse@12345', firstName: 'Otabek', lastName: 'Toshev', phone: '+998907890123' },
    { email: 'nurse.nazarova@helix.uz', password: 'Nurse@12345', firstName: 'Dilnoza', lastName: 'Nazarova', phone: '+998939876543' },
  ];
  const nurses: User[] = [];
  for (const n of nurseData) {
    nurses.push(await createUser(userRepo, { ...n, role: UserRole.NURSE }));
  }

  // ── 7. LAB TECHS ────────────────────────────────────────────────────────────
  const labTechData = [
    { email: 'lab.yusupov@helix.uz', password: 'LabTech@12345', firstName: 'Sanjar', lastName: 'Yusupov', phone: '+998907771234' },
    { email: 'lab.abdullayeva@helix.uz', password: 'LabTech@12345', firstName: 'Mohira', lastName: 'Abdullayeva', phone: '+998934441234' },
  ];
  const labTechs: User[] = [];
  for (const l of labTechData) {
    labTechs.push(await createUser(userRepo, { ...l, role: UserRole.LAB_TECH }));
  }

  // ── 8. PATIENTS ─────────────────────────────────────────────────────────────
  const patientData = [
    {
      email: 'alisher@gmail.com', password: 'Patient@12345', firstName: 'Alisher', lastName: 'Qodirov', phone: '+998901111111',
      dob: new Date('1985-03-15'), gender: 'male', blood: BloodType.A_POS, height: 178, weight: 82,
      allergies: ['Penitsillin', 'Aspirin'], chronic: ['Gipertenziya'], city: 'Toshkent', country: 'O\'zbekiston',
      emergencyName: 'Dilnoza Qodirova', emergencyPhone: '+998901111112', emergencyRelation: 'Xotin',
      plan: 0,
    },
    {
      email: 'zulfiya@gmail.com', password: 'Patient@12345', firstName: 'Zulfiya', lastName: 'Saidova', phone: '+998907777777',
      dob: new Date('1990-07-22'), gender: 'female', blood: BloodType.B_POS, height: 162, weight: 58,
      allergies: ['Sulfonamidlar'], chronic: [], city: 'Samarqand', country: 'O\'zbekiston',
      emergencyName: 'Bahodir Saidov', emergencyPhone: '+998907777778', emergencyRelation: 'Turmush o\'rtoq',
      plan: 1,
    },
    {
      email: 'mirzo@gmail.com', password: 'Patient@12345', firstName: 'Mirzo', lastName: 'Umarov', phone: '+998933333333',
      dob: new Date('1978-11-08'), gender: 'male', blood: BloodType.O_POS, height: 175, weight: 90,
      allergies: [], chronic: ['Qandli diabet II tur', 'Semirib ketish'], city: 'Buxoro', country: 'O\'zbekiston',
      emergencyName: 'Kamola Umarova', emergencyPhone: '+998933333334', emergencyRelation: 'Xotin',
      plan: 2,
    },
    {
      email: 'feruza@gmail.com', password: 'Patient@12345', firstName: 'Feruza', lastName: 'Xoliqova', phone: '+998905555555',
      dob: new Date('1995-02-28'), gender: 'female', blood: BloodType.AB_POS, height: 165, weight: 55,
      allergies: ['Lateks'], chronic: [], city: 'Namangan', country: 'O\'zbekiston',
      emergencyName: 'Aziz Xoliqov', emergencyPhone: '+998905555556', emergencyRelation: 'Ota',
      plan: 3,
    },
    {
      email: 'sherzod@gmail.com', password: 'Patient@12345', firstName: 'Sherzod', lastName: 'Razzaqov', phone: '+998902222222',
      dob: new Date('1988-09-14'), gender: 'male', blood: BloodType.A_NEG, height: 182, weight: 78,
      allergies: ['Ibuprofen'], chronic: ['Bronxial astma'], city: 'Farg\'ona', country: 'O\'zbekiston',
      emergencyName: 'Gulnora Razzaqova', emergencyPhone: '+998902222223', emergencyRelation: 'Xotin',
      plan: null,
    },
  ];

  const patients: { user: User; profile: PatientProfile }[] = [];
  let patNumCounter = 1;
  for (const p of patientData) {
    const user = await createUser(userRepo, { email: p.email, password: p.password, firstName: p.firstName, lastName: p.lastName, role: UserRole.PATIENT, phone: p.phone });
    let profile = await patientRepo.findOne({ where: { userId: user.id } });
    if (!profile) {
      profile = await patientRepo.save(patientRepo.create({
        userId: user.id,
        dateOfBirth: p.dob,
        gender: p.gender,
        bloodType: p.blood,
        height: p.height,
        weight: p.weight,
        allergies: p.allergies,
        chronicConditions: p.chronic,
        city: p.city,
        country: p.country,
        emergencyContactName: p.emergencyName,
        emergencyContactPhone: p.emergencyPhone,
        emergencyContactRelation: p.emergencyRelation,
        insurancePlanId: p.plan !== null ? plans[p.plan]?.id : undefined,
        patientNumber: `P${pad(patNumCounter++)}`,
      }));
    }
    patients.push({ user, profile });
  }

  // ── 9. DEMO USERS ───────────────────────────────────────────────────────────
  console.log('\n🎭 Seeding demo users...');
  const demoUsers: { role: UserRole; email: string; first: string; last: string }[] = [
    { role: UserRole.PATIENT, email: 'demo.patient@helix.uz', first: 'Demo', last: 'Bemor' },
    { role: UserRole.DOCTOR, email: 'demo.doctor@helix.uz', first: 'Demo', last: 'Shifokor' },
    { role: UserRole.NURSE, email: 'demo.nurse@helix.uz', first: 'Demo', last: 'Hamshira' },
    { role: UserRole.LAB_TECH, email: 'demo.labtech@helix.uz', first: 'Demo', last: 'Laborant' },
    { role: UserRole.ADMIN, email: 'demo.admin@helix.uz', first: 'Demo', last: 'Admin' },
  ];

  const demoMap: Record<string, User> = {};
  let demoDocProfile: DoctorProfile | null = null;
  let demoPatProfile: PatientProfile | null = null;

  for (const d of demoUsers) {
    const u = await createUser(userRepo, {
      email: d.email, password: 'Demo@12345',
      firstName: d.first, lastName: d.last,
      role: d.role, isDemo: true,
    });
    await userRepo.update(u.id, { isDemo: true });
    demoMap[d.role] = u;

    if (d.role === UserRole.PATIENT) {
      let dp = await patientRepo.findOne({ where: { userId: u.id } });
      if (!dp) dp = await patientRepo.save(patientRepo.create({
        userId: u.id, bloodType: BloodType.O_POS, gender: 'male', city: 'Toshkent', country: 'O\'zbekiston',
        patientNumber: `P${pad(patNumCounter++)}`, height: 175, weight: 72,
        allergies: [], chronicConditions: [],
      }));
      demoPatProfile = dp;
    }
    if (d.role === UserRole.DOCTOR) {
      let dp = await doctorRepo.findOne({ where: { userId: u.id } });
      if (!dp) dp = await doctorRepo.save(doctorRepo.create({
        userId: u.id, specialization: 'Umumiy amaliyot', departmentId: deptMap['Umumiy tibbiyot']?.id,
        doctorNumber: `DR${pad(docNumCounter++)}`, isAcceptingPatients: false,
        bio: 'Demo shifokor — faqat ko\'rish huquqi mavjud.', languages: ['O\'zbek'],
      }));
      demoDocProfile = dp;
    }
  }
  console.log('  ✓ 5 demo users');
  console.log('  ✓ 5 doctors, 3 nurses, 2 lab techs, 5 patients');

  // ── 10. APPOINTMENTS + CLINICAL DATA ───────────────────────────────────────
  console.log('\n📅 Seeding clinical data (appointments, records, prescriptions, labs, vitals)...');

  const mkApptNum = () => `APT${pad(apptCounter++, 6)}`;
  const mkBillNum = () => `BILL${pad(billCounter++, 6)}`;
  const mkRxNum = () => `RX${pad(rxCounter++, 6)}`;
  const mkLabNum = () => `LAB${pad(labCounter++, 6)}`;

  // Helper: create a completed appointment with full clinical trail
  async function createCompletedVisit(opts: {
    patient: { user: User; profile: PatientProfile };
    doctor: { user: User; profile: DoctorProfile };
    daysBack: number;
    reason: string;
    diagnosis: string;
    icdCode: string;
    doctorNotes: string;
    systolic: number; diastolic: number; hr: number; temp: number; o2: number; weight: number; rr: number;
    medications: { name: string; dosage: string; frequency: string; duration: string }[];
    tests?: { name: string; tests: string[]; results: { testName: string; value: string; unit: string; ref: string; status: ResultStatus }[] }[];
    billItems: { desc: string; cat: string; qty: number; price: number }[];
  }) {
    const apptDate = daysAgo(opts.daysBack);
    const appt = await apptRepo.save(apptRepo.create({
      patientId: opts.patient.user.id,
      doctorId: opts.doctor.profile.id,
      appointmentDate: dateStr(apptDate),
      appointmentTime: `${9 + (apptCounter % 8)}:00`,
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.IN_PERSON,
      reason: opts.reason,
      diagnosis: opts.diagnosis,
      doctorNotes: opts.doctorNotes,
      fee: opts.doctor.profile.consultationFee,
      appointmentNumber: mkApptNum(),
    }));

    // Vitals
    await vitalRepo.save(vitalRepo.create({
      patientId: opts.patient.user.id,
      recordedById: nurses[0].id,
      appointmentId: appt.id,
      systolicBP: opts.systolic,
      diastolicBP: opts.diastolic,
      heartRate: opts.hr,
      temperature: opts.temp,
      oxygenSaturation: opts.o2,
      weight: opts.weight,
      respiratoryRate: opts.rr,
      recordedAt: apptDate,
    }));

    // Medical record
    await recordRepo.save(recordRepo.create({
      patientId: opts.patient.user.id,
      doctorId: opts.doctor.profile.id,
      appointmentId: appt.id,
      type: RecordType.VISIT_NOTE,
      title: opts.reason,
      description: opts.doctorNotes,
      icdCode: opts.icdCode,
      recordDate: apptDate,
    }));

    // Prescription
    if (opts.medications.length) {
      const rx = await rxRepo.save(rxRepo.create({
        patientId: opts.patient.user.id,
        doctorId: opts.doctor.profile.id,
        appointmentId: appt.id,
        status: PrescriptionStatus.ACTIVE,
        diagnosis: opts.diagnosis,
        prescriptionNumber: mkRxNum(),
        validUntil: daysFromNow(30),
      }));
      for (const m of opts.medications) {
        await rxItemRepo.save(rxItemRepo.create({
          prescriptionId: rx.id, medicationName: m.name, dosage: m.dosage, frequency: m.frequency, duration: m.duration, quantity: 30,
        }));
      }
    }

    // Lab orders
    if (opts.tests?.length) {
      for (const t of opts.tests) {
        const lo = await labRepo.save(labRepo.create({
          patientId: opts.patient.user.id,
          doctorId: opts.doctor.profile.id,
          appointmentId: appt.id,
          tests: t.tests,
          status: LabOrderStatus.COMPLETED,
          priority: LabOrderPriority.ROUTINE,
          clinicalNotes: t.name,
          orderNumber: mkLabNum(),
          completedAt: apptDate,
        }));
        for (const r of t.results) {
          await labResultRepo.save(labResultRepo.create({ labOrderId: lo.id, testName: r.testName, value: r.value, unit: r.unit, referenceRange: r.ref, status: r.status }));
        }
      }
    }

    // Bill
    const billTotal = opts.billItems.reduce((s, i) => s + i.qty * i.price, 0);
    const bill = await billRepo.save(billRepo.create({
      patientId: opts.patient.user.id,
      appointmentId: appt.id,
      status: BillStatus.PAID,
      totalAmount: billTotal,
      subtotal: billTotal,
      paidAmount: billTotal,
      paymentMethod: PaymentMethod.CASH,
      paidAt: apptDate,
      billNumber: mkBillNum(),
    }));
    for (const i of opts.billItems) {
      await billItemRepo.save(billItemRepo.create({ billId: bill.id, description: i.desc, category: i.cat, quantity: i.qty, unitPrice: i.price, total: i.qty * i.price }));
    }

    return appt;
  }

  // ─── Alisher — Gipertenziya bemori ──────────────────────────────────────────
  await createCompletedVisit({
    patient: patients[0], doctor: doctors[0], daysBack: 120,
    reason: 'Bosh og\'rig\'i va qon bosimi ko\'tarilishi',
    diagnosis: 'Arterial gipertenziya I daraja',
    icdCode: 'I10', doctorNotes: 'Qon bosimi 155/95 mmHg. Lizinopril 10 mg tayinlandi. 30 kundan keyin nazorat.',
    systolic: 155, diastolic: 95, hr: 82, temp: 36.6, o2: 98, weight: 82, rr: 16,
    medications: [{ name: 'Lizinopril', dosage: '10 mg', frequency: 'Kuniga 1 marta', duration: '30 kun' }],
    tests: [{ name: 'Qon tahlili', tests: ['Umumiy qon tahlili', 'Biokimyoviy tahlil'], results: [
      { testName: 'Gemoglobin', value: '148', unit: 'g/L', ref: '120-160', status: ResultStatus.NORMAL },
      { testName: 'Xolesterol', value: '5.8', unit: 'mmol/L', ref: '< 5.0', status: ResultStatus.ABNORMAL },
      { testName: 'Kreatinin', value: '88', unit: 'μmol/L', ref: '62-106', status: ResultStatus.NORMAL },
    ]}],
    billItems: [{ desc: 'Kardiologiya konsultatsiyasi', cat: 'consultation', qty: 1, price: 150000 }, { desc: 'EKG', cat: 'procedure', qty: 1, price: 50000 }],
  });

  await createCompletedVisit({
    patient: patients[0], doctor: doctors[0], daysBack: 60,
    reason: 'Gipertenziya nazorat viziti',
    diagnosis: 'Arterial gipertenziya I daraja — nazorat',
    icdCode: 'I10', doctorNotes: 'Qon bosimi 138/88 mmHg. Dori samarali ishlayapti. Dozani saqlab qolish.',
    systolic: 138, diastolic: 88, hr: 76, temp: 36.5, o2: 99, weight: 81, rr: 15,
    medications: [{ name: 'Lizinopril', dosage: '10 mg', frequency: 'Kuniga 1 marta', duration: '60 kun' }, { name: 'Amlodipin', dosage: '5 mg', frequency: 'Kuniga 1 marta', duration: '60 kun' }],
    tests: [],
    billItems: [{ desc: 'Kardiologiya konsultatsiyasi', cat: 'consultation', qty: 1, price: 150000 }],
  });

  // ─── Mirzo — Qandli diabet bemori ───────────────────────────────────────────
  await createCompletedVisit({
    patient: patients[2], doctor: doctors[3], daysBack: 90,
    reason: 'Qand darajasi nazorati va zaiflik',
    diagnosis: 'Qandli diabet II tur, nazorat qilinmagan',
    icdCode: 'E11', doctorNotes: 'Qon shakar 11.4 mmol/L. Metformin dozasi oshirildi. Dieta maslahat berildi.',
    systolic: 145, diastolic: 92, hr: 88, temp: 36.8, o2: 97, weight: 91, rr: 18,
    medications: [{ name: 'Metformin', dosage: '1000 mg', frequency: 'Kuniga 2 marta', duration: '90 kun' }, { name: 'Atorvastatin', dosage: '20 mg', frequency: 'Kechasi 1 marta', duration: '90 kun' }],
    tests: [{ name: 'Diabet monitoring', tests: ['HbA1c', 'Qon shakar', 'Buyrak funksiyasi'], results: [
      { testName: 'HbA1c', value: '8.4', unit: '%', ref: '< 7.0', status: ResultStatus.ABNORMAL },
      { testName: 'Açlik qon shakari', value: '11.4', unit: 'mmol/L', ref: '3.9-6.1', status: ResultStatus.CRITICAL },
      { testName: 'GFR', value: '72', unit: 'mL/min', ref: '> 60', status: ResultStatus.NORMAL },
    ]}],
    billItems: [{ desc: 'Endokrinologiya konsultatsiyasi', cat: 'consultation', qty: 1, price: 140000 }, { desc: 'Laboratoriya tahlillari', cat: 'lab_test', qty: 1, price: 85000 }],
  });

  await createCompletedVisit({
    patient: patients[2], doctor: doctors[3], daysBack: 30,
    reason: 'Diabet nazorat viziti — 3 oylik',
    diagnosis: 'Qandli diabet II tur — qisman nazorat',
    icdCode: 'E11', doctorNotes: 'HbA1c 7.8% ga tushdi. Davom ettirilsin. Oyiga bir marta nazorat.',
    systolic: 138, diastolic: 88, hr: 82, temp: 36.7, o2: 98, weight: 89, rr: 16,
    medications: [{ name: 'Metformin', dosage: '1000 mg', frequency: 'Kuniga 2 marta', duration: '90 kun' }],
    tests: [{ name: 'HbA1c nazorat', tests: ['HbA1c'], results: [
      { testName: 'HbA1c', value: '7.8', unit: '%', ref: '< 7.0', status: ResultStatus.ABNORMAL },
    ]}],
    billItems: [{ desc: 'Endokrinologiya konsultatsiyasi', cat: 'consultation', qty: 1, price: 140000 }, { desc: 'HbA1c tahlili', cat: 'lab_test', qty: 1, price: 35000 }],
  });

  // ─── Zulfiya — Nevrologiya ───────────────────────────────────────────────────
  await createCompletedVisit({
    patient: patients[1], doctor: doctors[1], daysBack: 75,
    reason: 'Bosh og\'rig\'i va bosh aylanishi',
    diagnosis: 'Migren, aurali',
    icdCode: 'G43.1', doctorNotes: 'Klassik migren belgilari. Sumatriptan tayinlandi. Trigger omillardan qochish tavsiya etildi.',
    systolic: 118, diastolic: 76, hr: 72, temp: 36.4, o2: 99, weight: 57, rr: 14,
    medications: [{ name: 'Ibuprofen', dosage: '400 mg', frequency: 'Kerak bo\'lganda, kuniga 3 martadan ko\'p emas', duration: '—' }],
    tests: [],
    billItems: [{ desc: 'Nevrologiya konsultatsiyasi', cat: 'consultation', qty: 1, price: 130000 }, { desc: 'MRI yo\'llanmasi', cat: 'procedure', qty: 1, price: 20000 }],
  });

  // ─── Sherzod — Pulmonologiya ─────────────────────────────────────────────────
  await createCompletedVisit({
    patient: patients[4], doctor: doctors[2], daysBack: 45,
    reason: 'Nafas qisilishi va yo\'tal',
    diagnosis: 'Bronxial astma, o\'rta og\'irlikda',
    icdCode: 'J45.1', doctorNotes: 'Pik oqim 68%. Ingalyatsion kortikosteroid tayinlandi. Ekzacerbatsiya oldini olish bo\'yicha ko\'rsatma berildi.',
    systolic: 122, diastolic: 78, hr: 92, temp: 36.9, o2: 95, weight: 78, rr: 22,
    medications: [
      { name: 'Deksametazon', dosage: '4 mg', frequency: 'Kuniga 2 marta', duration: '5 kun' },
      { name: 'Paratsetamol', dosage: '500 mg', frequency: 'Kerak bo\'lganda', duration: '—' },
    ],
    tests: [{ name: 'Nafas tahlili', tests: ['Spirometriya', 'Kislorod saturatsiyasi'], results: [
      { testName: 'FEV1', value: '68', unit: '%', ref: '> 80', status: ResultStatus.ABNORMAL },
      { testName: 'SpO2', value: '95', unit: '%', ref: '95-100', status: ResultStatus.NORMAL },
    ]}],
    billItems: [{ desc: 'Umumiy tibbiyot konsultatsiyasi', cat: 'consultation', qty: 1, price: 100000 }, { desc: 'Spirometriya', cat: 'procedure', qty: 1, price: 45000 }],
  });

  // ─── Feruza — profilaktik tekshiruv ─────────────────────────────────────────
  await createCompletedVisit({
    patient: patients[3], doctor: doctors[2], daysBack: 50,
    reason: 'Yillik profilaktik tekshiruv',
    diagnosis: 'Sog\'lom bemor — patologiya aniqlanmadi',
    icdCode: 'Z00.0', doctorNotes: 'Barcha ko\'rsatkichlar normada. Keyingi yil tekshiruvga kelish tavsiya etiladi.',
    systolic: 112, diastolic: 72, hr: 68, temp: 36.5, o2: 99, weight: 55, rr: 14,
    medications: [{ name: 'D3 vitamini', dosage: '1000 IU', frequency: 'Kuniga 1 marta', duration: '30 kun' }, { name: 'Folic kislota', dosage: '400 mcg', frequency: 'Kuniga 1 marta', duration: '30 kun' }],
    tests: [{ name: 'To\'liq qon tahlili', tests: ['KLA', 'Biokimyoviy panel', 'Qalqonsimon bez hormoni'], results: [
      { testName: 'Gemoglobin', value: '125', unit: 'g/L', ref: '120-160', status: ResultStatus.NORMAL },
      { testName: 'TSH', value: '2.1', unit: 'mIU/L', ref: '0.4-4.0', status: ResultStatus.NORMAL },
      { testName: 'Glyukoza', value: '5.1', unit: 'mmol/L', ref: '3.9-6.1', status: ResultStatus.NORMAL },
    ]}],
    billItems: [{ desc: 'Profilaktik tekshiruv', cat: 'consultation', qty: 1, price: 100000 }, { desc: 'Kompleks qon tahlili', cat: 'lab_test', qty: 1, price: 120000 }],
  });

  // ── 11. UPCOMING APPOINTMENTS ──────────────────────────────────────────────
  console.log('\n📅 Creating upcoming appointments...');

  const upcomingAppts = [
    { patient: patients[0], doctor: doctors[0], daysForward: 7, reason: 'Kardiologiya nazorat viziti — qon bosimi', type: AppointmentType.IN_PERSON, status: AppointmentStatus.CONFIRMED },
    { patient: patients[2], doctor: doctors[3], daysForward: 3, reason: 'Diabet — insulinni sozlash', type: AppointmentType.IN_PERSON, status: AppointmentStatus.CONFIRMED },
    { patient: patients[1], doctor: doctors[1], daysForward: 14, reason: 'Nevrologiya — migren kuzatuvi', type: AppointmentType.FOLLOW_UP, status: AppointmentStatus.PENDING },
    { patient: patients[3], doctor: doctors[2], daysForward: 21, reason: 'Homiladorlikka tayyorlanish maslahat', type: AppointmentType.IN_PERSON, status: AppointmentStatus.PENDING },
    { patient: patients[4], doctor: doctors[2], daysForward: 5, reason: 'Astma — nazorat va spirometriya', type: AppointmentType.FOLLOW_UP, status: AppointmentStatus.CONFIRMED },
    { patient: patients[0], doctor: doctors[2], daysForward: 2, reason: 'Sovuq qotish va yo\'tal', type: AppointmentType.IN_PERSON, status: AppointmentStatus.CONFIRMED },
  ];

  for (const a of upcomingAppts) {
    const existing = await apptRepo.findOne({ where: { patientId: a.patient.user.id, doctorId: a.doctor.profile.id, status: a.status } });
    if (!existing) {
      const d = daysFromNow(a.daysForward);
      await apptRepo.save(apptRepo.create({
        patientId: a.patient.user.id, doctorId: a.doctor.profile.id,
        appointmentDate: dateStr(d), appointmentTime: `${9 + (apptCounter % 7)}:00`,
        status: a.status, type: a.type, reason: a.reason,
        fee: a.doctor.profile.consultationFee, appointmentNumber: mkApptNum(),
      }));
    }
  }

  // In-progress appointment
  const inProgressExists = await apptRepo.findOne({ where: { status: AppointmentStatus.IN_PROGRESS } });
  if (!inProgressExists) {
    await apptRepo.save(apptRepo.create({
      patientId: patients[1].user.id, doctorId: doctors[1].profile.id,
      appointmentDate: dateStr(new Date()), appointmentTime: '10:30',
      status: AppointmentStatus.IN_PROGRESS, type: AppointmentType.IN_PERSON,
      reason: 'EEG natijalarini ko\'rish', fee: doctors[1].profile.consultationFee,
      appointmentNumber: mkApptNum(),
    }));
  }

  // ── 12. PENDING LAB ORDERS ─────────────────────────────────────────────────
  const pendingLab = await labRepo.findOne({ where: { status: LabOrderStatus.ORDERED } });
  if (!pendingLab) {
    await labRepo.save(labRepo.create({
      patientId: patients[0].user.id, doctorId: doctors[0].profile.id,
      tests: ['Lipid profil', 'Umumiy qon tahlili', 'Kreatinin'],
      status: LabOrderStatus.ORDERED, priority: LabOrderPriority.ROUTINE,
      clinicalNotes: 'Gipertenziya monitoring — lipid profil',
      orderNumber: mkLabNum(),
    }));
    await labRepo.save(labRepo.create({
      patientId: patients[2].user.id, doctorId: doctors[3].profile.id,
      tests: ['HbA1c', 'Insulin darajasi', 'C-peptid'],
      status: LabOrderStatus.PROCESSING, priority: LabOrderPriority.URGENT,
      clinicalNotes: 'Insulin terapiyasini baholash',
      orderNumber: mkLabNum(), collectedAt: new Date(),
    }));
  }

  // ── 13. PENDING BILLS ──────────────────────────────────────────────────────
  const pendingBill = await billRepo.findOne({ where: { status: BillStatus.PENDING } });
  if (!pendingBill) {
    const b = await billRepo.save(billRepo.create({
      patientId: patients[1].user.id,
      status: BillStatus.PENDING,
      totalAmount: 175000, subtotal: 175000, paidAmount: 0,
      dueDate: daysFromNow(15), billNumber: mkBillNum(),
    }));
    await billItemRepo.save(billItemRepo.create({ billId: b.id, description: 'Nevrologiya konsultatsiyasi', category: 'consultation', quantity: 1, unitPrice: 130000, total: 130000 }));
    await billItemRepo.save(billItemRepo.create({ billId: b.id, description: 'EEG', category: 'procedure', quantity: 1, unitPrice: 45000, total: 45000 }));

    // Overdue bill
    const b2 = await billRepo.save(billRepo.create({
      patientId: patients[4].user.id,
      status: BillStatus.OVERDUE,
      totalAmount: 145000, subtotal: 145000, paidAmount: 0,
      dueDate: daysAgo(10), billNumber: mkBillNum(),
    }));
    await billItemRepo.save(billItemRepo.create({ billId: b2.id, description: 'Umumiy tibbiyot konsultatsiyasi', category: 'consultation', quantity: 1, unitPrice: 100000, total: 100000 }));
    await billItemRepo.save(billItemRepo.create({ billId: b2.id, description: 'Spirometriya', category: 'procedure', quantity: 1, unitPrice: 45000, total: 45000 }));
  }

  // ── 14. INSURANCE CLAIMS ───────────────────────────────────────────────────
  const claimExists = await claimRepo.findOne({ where: { patientId: patients[0].user.id } });
  if (!claimExists) {
    const bill = await billRepo.findOne({ where: { patientId: patients[0].user.id, status: BillStatus.PAID } });
    if (bill) {
      await claimRepo.save(claimRepo.create({
        patientId: patients[0].user.id, billId: bill.id,
        insurancePlanId: plans[0].id,
        status: ClaimStatus.APPROVED,
        claimedAmount: 200000, approvedAmount: 140000,
        claimNumber: 'CLM000001',
        submittedAt: daysAgo(30), resolvedAt: daysAgo(20),
      }));
    }
    const pendingBill2 = await billRepo.findOne({ where: { patientId: patients[1].user.id } });
    if (pendingBill2) {
      await claimRepo.save(claimRepo.create({
        patientId: patients[1].user.id, billId: pendingBill2.id,
        insurancePlanId: plans[1].id,
        status: ClaimStatus.SUBMITTED,
        claimedAmount: 175000, approvedAmount: 0,
        claimNumber: 'CLM000002',
        submittedAt: new Date(),
      }));
    }
  }

  // ── 15. NOTIFICATIONS ──────────────────────────────────────────────────────
  console.log('\n🔔 Seeding notifications...');
  const notifExists = await notifRepo.findOne({ where: { userId: patients[0].user.id } });
  if (!notifExists) {
    const notifData = [
      { userId: patients[0].user.id, type: NotificationType.APPOINTMENT_CONFIRMED, title: 'Uchrashuv tasdiqlandi', message: 'Dr. Azimov bilan uchrashuv tasdiqlandi. Sana: ' + dateStr(daysFromNow(7)), isRead: false },
      { userId: patients[0].user.id, type: NotificationType.LAB_RESULT_READY, title: 'Laboratoriya natijalari tayyor', message: 'Qon tahlili natijalari tayyor. Ko\'rish uchun lab bo\'limine kiring.', isRead: true },
      { userId: patients[1].user.id, type: NotificationType.BILL_GENERATED, title: 'Yangi hisob-faktura', message: '175,000 so\'mlik hisob-faktura yaratildi. To\'lov muddati: ' + dateStr(daysFromNow(15)), isRead: false },
      { userId: patients[2].user.id, type: NotificationType.APPOINTMENT_CONFIRMED, title: 'Uchrashuv tasdiqlandi', message: 'Dr. Komilov bilan uchrashuv tasdiqlandi.', isRead: false },
      { userId: patients[3].user.id, type: NotificationType.PRESCRIPTION_READY, title: 'Retsept tayyor', message: 'D3 vitamini va Folic kislota retsepti tayyor.', isRead: false },
      { userId: doctors[0].user.id, type: NotificationType.APPOINTMENT_CONFIRMED, title: 'Yangi uchrashuv', message: 'Alisher Qodirov bilan uchrashuv belgilandi.', isRead: false },
      { userId: doctors[1].user.id, type: NotificationType.SYSTEM, title: 'Tizim yangilandi', message: 'Helix platforma v2.1 chiqarildi. Yangi imkoniyatlarni ko\'ring.', isRead: true },
      { userId: admin.id, type: NotificationType.CLAIM_UPDATE, title: 'Yangi sug\'urta talabi', message: 'Zulfiya Saidova sug\'urta talabi yubordi. Ko\'rib chiqish kerak.', isRead: false },
    ];
    for (const n of notifData) {
      await notifRepo.save(notifRepo.create(n));
    }
  }
  console.log('  ✓ Notifications created');

  await ds.destroy();
  console.log('\n✅ SEEDER MUVAFFAQIYATLI BAJARILDI!\n');

  console.log('═'.repeat(60));
  console.log('  HAQIQIY FOYDALANUVCHILAR');
  console.log('═'.repeat(60));
  console.log('  Admin:');
  console.log('    📧 admin@helix.uz  |  🔑 Admin@12345');
  console.log('');
  console.log('  Shifokorlar:');
  console.log('    📧 dr.azimov@helix.uz     |  🔑 Doctor@12345  (Kardiologiya)');
  console.log('    📧 dr.yusupova@helix.uz   |  🔑 Doctor@12345  (Nevrologiya)');
  console.log('    📧 dr.rahimov@helix.uz    |  🔑 Doctor@12345  (Umumiy tibbiyot)');
  console.log('    📧 dr.komilov@helix.uz    |  🔑 Doctor@12345  (Endokrinologiya)');
  console.log('');
  console.log('  Hamshiralar:');
  console.log('    📧 nurse.karimova@helix.uz  |  🔑 Nurse@12345');
  console.log('    📧 nurse.toshev@helix.uz    |  🔑 Nurse@12345');
  console.log('    📧 nurse.nazarova@helix.uz  |  🔑 Nurse@12345');
  console.log('');
  console.log('  Laborantlar:');
  console.log('    📧 lab.yusupov@helix.uz    |  🔑 LabTech@12345');
  console.log('    📧 lab.abdullayeva@helix.uz |  🔑 LabTech@12345');
  console.log('');
  console.log('  Bemorlar:');
  console.log('    📧 alisher@gmail.com  |  🔑 Patient@12345  (Gipertenziya)');
  console.log('    📧 zulfiya@gmail.com  |  🔑 Patient@12345  (Migren)');
  console.log('    📧 mirzo@gmail.com    |  🔑 Patient@12345  (Diabet)');
  console.log('    📧 feruza@gmail.com   |  🔑 Patient@12345  (Sog\'lom)');
  console.log('    📧 sherzod@gmail.com  |  🔑 Patient@12345  (Bronxial astma)');
  console.log('═'.repeat(60));
  console.log('  DEMO HISOBLAR (faqat ko\'rish — o\'zgartirish mumkin emas)');
  console.log('═'.repeat(60));
  console.log('    📧 demo.patient@helix.uz  |  🔑 Demo@12345');
  console.log('    📧 demo.doctor@helix.uz   |  🔑 Demo@12345');
  console.log('    📧 demo.nurse@helix.uz    |  🔑 Demo@12345');
  console.log('    📧 demo.labtech@helix.uz  |  🔑 Demo@12345');
  console.log('    📧 demo.admin@helix.uz    |  🔑 Demo@12345');
  console.log('═'.repeat(60));
}

seed().catch((err) => {
  console.error('❌ Seeder xatosi:', err);
  process.exit(1);
});
