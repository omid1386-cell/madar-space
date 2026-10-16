window.MADAR_ORBITAL_LABS = [
  {
    id:"circular-orbit-tool",
    status:"ready",
    phase:1,
    title:"سرعت، دوره و انرژی مدار دایروی",
    en:"Circular Orbit Speed, Period and Energy",
    description:"آزمایشگاه نمونه فاز اول از ابزار موجود مدار دایروی استفاده می‌کند و داده فصل را به ابزار مهندسی منتقل می‌کند.",
    tool:"orbit",
    preset:{altitude:400}
  },
  {
    id:"state-vector-elements",
    status:"ready",
    phase:2,
    title:"تبدیل بردار حالت و عناصر مداری",
    en:"State Vector ↔ Orbital Elements",
    description:"تبدیل دوطرفه، تشخیص تکینگی، محاسبه انرژی و تکانه زاویه‌ای و آزمون بازگشت عددی.",
    tool:"state-elements",
    preset:{mu:398600.4418,r:[7000,0,0],v:[0,7.546,1]}
  },
  {
    id:"kepler-solver",
    status:"ready",
    phase:2,
    title:"حل عددی معادله کپلر",
    en:"Kepler Equation Solver",
    description:"حل بیضوی و هذلولی با جدول تکرار، Residual، آنومالی حقیقی و شعاع نرمال‌شده.",
    tool:"kepler",
    preset:{eccentricity:0.1,meanAnomalyDeg:60,tolerance:1e-12}
  },
  {
    id:"ground-track-pass",
    status:"ready",
    phase:3,
    title:"رد زمینی و گذر ایستگاه",
    en:"Ground Track and Station Pass",
    description:"انتشار مدار، تبدیل ECI/ECEF، رسم Ground Track و استخراج پنجره‌های AOS/LOS.",
    tool:"ground-track",
    preset:{altitude:400,eccentricity:0,inclination:51.6,raan:0,argp:0,trueAnomaly:0,durationMinutes:190,stationLat:35.6892,stationLon:51.389,minElevation:10}
  },
  {
    id:"maneuver-designer",
    status:"ready",
    phase:3,
    title:"طراحی مانور ضربه‌ای",
    en:"Impulsive Maneuver Designer",
    description:"مدار اولیه و مولفه‌های RTN تغییر سرعت را به مدار جدید تبدیل می‌کند.",
    tool:"maneuver",
    preset:{perigeeAltitude:400,apogeeAltitude:400,burnPoint:"perigee",dvRadial:0,dvTangential:100,dvNormal:0}
  },
  {
    id:"transfer-trade",
    status:"ready",
    phase:3,
    title:"مقایسه انتقال هوهمن و دو-بیضوی",
    en:"Transfer Trade Study",
    description:"بودجه Δv، زمان، تعداد Burn و شعاع میانی دو راهبرد انتقال را مقایسه می‌کند.",
    tool:"transfer-trade",
    preset:{initialAltitude:400,finalAltitude:35786.036,intermediateRadius:90000}
  },
  {
    id:"relative-motion",
    status:"ready",
    phase:3,
    title:"حرکت نسبی و ملاقات مداری",
    en:"Relative Motion and Rendezvous",
    description:"مسیر نسبی HCW را در Frame هیل برای حالت اولیه و مدار مرجع محاسبه می‌کند.",
    tool:"relative-motion",
    preset:{referenceAltitude:400,durationMinutes:92.56,x:100,y:0,z:0,xdot:0,ydot:0,zdot:0}
  },
  {
    id:"perturbation-rates",
    status:"ready",
    phase:4,
    title:"نرخ‌های اغتشاش J2، Drag و SRP",
    en:"J2, Drag and Solar-Radiation Perturbation Rates",
    description:"نرخ‌های سکولار J2 و شتاب‌های لحظه‌ای Drag و SRP را با فرض‌های صریح محاسبه می‌کند.",
    tool:"perturbations",
    preset:{altitude:700,eccentricity:0.001,inclination:98,density:1e-12,cd:2.2,cr:1.3,areaMass:0.01}
  },
  {
    id:"special-orbit-designer",
    status:"ready",
    phase:4,
    title:"طراحی مدارهای ویژه",
    en:"Sun-Synchronous, Critical and Repeat-Orbit Designer",
    description:"میل SSO، Critical Inclination و ارتفاع اولیه Repeat Ground Track را محاسبه می‌کند.",
    tool:"special-orbits",
    preset:{altitude:700,eccentricity:0,repeatRevolutions:14,repeatDays:1}
  },
  {
    id:"drag-lifetime",
    status:"ready",
    phase:4,
    title:"حساسیت Drag، افت مدار و دفع",
    en:"Drag, Lifetime Sensitivity and Disposal Budget",
    description:"نرخ افت لحظه‌ای و بودجه تقریبی Reboost را برای سناریوهای چگالی مقایسه می‌کند.",
    tool:"drag-lifetime",
    preset:{altitude:400,density:1e-12,cd:2.2,area:1,mass:100,descentBand:100}
  },
  {
    id:"orbit-data-inspector",
    status:"ready",
    phase:4,
    title:"بازرس داده‌های مداری و عدم‌قطعیت",
    en:"TLE, Orbit-Data and Uncertainty Inspector",
    description:"TLE را Parse و Checksum را کنترل می‌کند؛ دوره تشخیصی و هشدار سازگاری SGP4 را نشان می‌دهد.",
    tool:"orbit-data",
    preset:{
      line1:"1 25544U 98067A   26001.50000000  .00016717  00000-0  30127-3 0  9992",
      line2:"2 25544  51.6416  45.1234 0005000  10.0000 120.0000 15.50000000123459",
      sigmaRadial:0.2,sigmaAlong:1,sigmaCross:0.3
    }
  },
  {
    id:"od-residuals",
    status:"ready",
    phase:5,
    title:"برآورد موقعیت و تحلیل باقیمانده",
    en:"Weighted Least-Squares Position and Residual Demonstrator",
    description:"از Rangeهای هم‌زمان نویزی، موقعیت را با Weighted Least Squares برآورد و Residual، Covariance و هندسه را گزارش می‌کند.",
    tool:"orbit-determination",
    preset:{initial:[6800,1000,1100],sigma:0.2}
  },
  {
    id:"lambert-solver",
    status:"ready",
    phase:5,
    title:"حل‌گر Lambert و کنترل شرایط مرزی",
    en:"Zero-Revolution Lambert Solver and Boundary Check",
    description:"برای دو موقعیت و زمان پرواز، سرعت‌های مرزی مسیر دو جسم را با روش متغیر عمومی محاسبه می‌کند.",
    tool:"lambert",
    preset:{mu:398600.4418,r1:[5000,10000,2100],r2:[-14600,2500,7000],time:3600,prograde:true}
  },
  {
    id:"patched-conics-energy",
    status:"ready",
    phase:5,
    title:"انرژی مأموریت با Patched Conics",
    en:"Patched-Conic Mission-Energy Calculator",
    description:"انتقال دایروی هم‌صفحه، v∞، C3، Burn خروج، Capture و Sphere of Influence را برای طراحی مقدماتی محاسبه می‌کند.",
    tool:"patched-conics",
    preset:{muCentral:132712440018,r1:149597870.7,r2:227939200,muDeparture:398600.4418,radiusDeparture:6378.137,parkingDeparture:200,muArrival:42828.375214,radiusArrival:3396.19,parkingArrival:250}
  },
  {
    id:"mission-capstone",
    status:"ready",
    phase:5,
    title:"کاربرگ پروژه جامع طراحی مأموریت",
    en:"Orbital Mission Capstone Worksheet",
    description:"مدار رصد زمین، نرخ J2، بودجه Delta-v، حاشیه و دفع را در یک کاربرگ قابل ذخیره جمع می‌کند.",
    tool:"mission-capstone",
    preset:{altitude:550,eccentricity:0.001,inclination:97.6,missionYears:5,dryMass:120,propellantMass:12,isp:220,annualDv:12,disposalDv:80,marginPercent:20}
  }
];
