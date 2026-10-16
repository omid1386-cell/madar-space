(()=>{
const course=window.MADAR_ORBITAL_EXPERIMENTAL;
if(!course)return;
const ch8={
 id:"ground-track-passes",planIndex:8,title:"چرخش زمین، رد زمینی و گذر ایستگاه",en:"Earth Rotation, Ground Tracks and Station Passes",level:"دانشگاهی",minutes:78,
 lead:"رد زمینی حاصل ترکیب حرکت ماهواره و چرخش زمین است. این فصل حالت لخت را به مختصات سطحی، آزیموت، ارتفاع و پنجره تماس تبدیل می‌کند.",
 prerequisites:["ECI و ECEF","انتشار دو جسم","ماتریس دوران","مختصات کروی"],
 learningObjectives:["تبدیل ECI به ECEF در مدل آموزشی","محاسبه نقطه زیرماهواره","رسم Ground Track","محاسبه Azimuth و Elevation","تشخیص AOS و LOS","تفسیر جابه‌جایی طولی دورهای متوالی"],
 problemPrompt:"چرا ماهواره بعد از یک دور کامل روی همان طول جغرافیایی زمین ظاهر نمی‌شود، با اینکه در چارچوب لخت به همان نقطه مدار بازگشته است؟",
 assumptions:["زمین کروی با شعاع مرجع ثابت است.","چرخش زمین با نرخ ثابت مدل می‌شود.","حرکت قطب و مدل دقیق زمان نجومی حذف شده‌اند.","شکست نور، ماسک عارضه و ارتفاع ایستگاه در نمونه پایه حذف می‌شوند."],
 definitions:[
  {term:"Ground Track",description:"مسیر نقطه زیرماهواره روی سطح زمین در طول زمان."},
  {term:"Subsatellite Point",description:"تقاطع راستای مرکز زمین تا ماهواره با سطح مرجع زمین."},
  {term:"Azimuth",description:"جهت افقی خط دید از شمال محلی، معمولاً در جهت ساعتگرد."},
  {term:"Elevation",description:"زاویه خط دید بالاتر از افق محلی."},
  {term:"Acquisition of Signal",description:"آغاز پنجره‌ای که ارتفاع از ماسک ارتباطی عبور می‌کند."},
  {term:"Loss of Signal",description:"پایان پنجره تماس هنگام پایین‌رفتن ماهواره از ماسک."}
 ],
 paragraphs:[
  "حالت مداری معمولاً در ECI منتشر می‌شود، اما طول و عرض جغرافیایی و ایستگاه زمینی در ECEF معنا دارند. بنابراین هر نقطه زمانی به تبدیل Frame وابسته است.",
  "پس از تبدیل به ECEF، طول جغرافیایی از atan2(y,x) و عرض ژئوسنتریک از atan2(z,√(x²+y²)) به دست می‌آید. برای دقت نقشه‌برداری باید بیضوی‌بودن زمین و عرض ژئودتیک لحاظ شود.",
  "خط دید ایستگاه با تفریق بردار موقعیت ایستگاه از ماهواره در ECEF و سپس تبدیل به ENU ساخته می‌شود. Azimuth و Elevation از مؤلفه‌های شرقی، شمالی و بالا محاسبه می‌شوند.",
  "یک گذر فقط وجود هندسی ماهواره بالای افق نیست؛ عملیات واقعی ماسک ارتفاع، بودجه لینک، نور خورشید، مجوز فرکانسی و ظرفیت شبکه را نیز در نظر می‌گیرد."
 ],
 derivationSteps:[
  {title:"انتشار در ECI",text:"حالت ماهواره در زمان‌های نمونه با مدل انتخابی محاسبه می‌شود.",equation:"r_ECI(t), v_ECI(t)"},
  {title:"چرخش زمین",text:"بردار لخت با زاویه زمین به Frame چرخان منتقل می‌شود.",equation:"r_ECEF=R₃(−θ_G)r_ECI"},
  {title:"نقطه زیرماهواره",text:"طول و عرض ژئوسنتریک از مؤلفه‌های ECEF استخراج می‌شوند.",equation:"λ=atan2(y,x), φ=atan2(z,√(x²+y²))"},
  {title:"خط دید ایستگاه",text:"تفاضل موقعیت‌ها به Frame محلی East-North-Up تبدیل می‌شود.",equation:"ρ_ENU=C_ENU←ECEF(r_sat−r_station)"},
  {title:"آزیموت و ارتفاع",text:"زاویه‌ها از مؤلفه‌های محلی خط دید محاسبه می‌شوند.",equation:"Az=atan2(E,N), El=asin(U/|ρ|)"}
 ],
 equations:[
  {title:"تبدیل ساده لخت به زمین‌ثابت",text:"r_ECEF=R₃(−ω_E Δt)r_ECI",explain:"اثر چرخش زمین را در مدل آموزشی اعمال می‌کند.",validity:"مدل ساده بدون EOP و پیشایان–رقص محوری."},
  {title:"طول جغرافیایی",text:"λ=atan2(y_ECEF,x_ECEF)",explain:"طول زیرماهواره را در بازه مناسب می‌دهد.",validity:"مختصات زمین‌مرکز."},
  {title:"عرض ژئوسنتریک",text:"φ_c=atan2(z,√(x²+y²))",explain:"عرض نسبت به مرکز زمین.",validity:"برای زمین کروی؛ با عرض ژئودتیک متفاوت است."},
  {title:"ارتفاع دید",text:"El=asin(U/√(E²+N²+U²))",explain:"زاویه خط دید نسبت به افق محلی.",validity:"Frame محلی ENU و موقعیت هم‌زمان."}
 ],
 symbolTable:[
  {symbol:"θ_G",name:"زاویه چرخش زمین",unit:"rad",note:"تابع زمان"},{symbol:"λ",name:"طول جغرافیایی",unit:"rad",note:"شرق مثبت در قرارداد رابط"},{symbol:"φ_c",name:"عرض ژئوسنتریک",unit:"rad",note:"زمین کروی"},{symbol:"Az",name:"آزیموت",unit:"deg",note:"از شمال محلی"},{symbol:"El",name:"ارتفاع دید",unit:"deg",note:"بالای افق"},{symbol:"ρ",name:"بردار خط دید",unit:"km",note:"ایستگاه تا ماهواره"}
 ],
 key:["Ground Track به Frame و زمان وابسته است.","بعد از یک دور، زمین زیر مدار چرخیده است.","AOS و LOS به ماسک ارتفاع وابسته‌اند.","عرض ژئوسنتریک با عرض ژئودتیک یکسان نیست."],
 equation:{text:"r_ECEF=R₃(−ω_EΔt)r_ECI",explain:"تبدیل آموزشی برای ساخت رد زمینی."},
 example:{title:"جابجایی طولی مدار ۴۰۰ کیلومتری",problem:"زمین طی دوره 92.56 min چند درجه می‌چرخد؟",solution:"با روز نجومی 86164.09 s، جابه‌جایی تقریبی 23.20° است."},
 workedExamples:[
  {title:"مثال ۱ — جابه‌جایی دورهای متوالی",problem:"دوره مدار 92.5604 min است.",given:["T=5553.62 s","T_sidereal=86164.09 s"],steps:["Δλ=360°×T/T_sidereal","Δλ≈23.2035°"],result:"رد دور بعد تقریباً 23.2 درجه به سمت غرب جابه‌جا می‌شود.",sanityCheck:"زمین در حدود 24 ساعت 360 درجه می‌چرخد؛ در 1.54 ساعت حدود 23 درجه معقول است."},
  {title:"مثال ۲ — ایستگاه روی استوا",problem:"ماهواره دقیقاً بالای ایستگاه استوایی است.",given:["ρ_E=0","ρ_N=0","ρ_U>0"],steps:["|ρ|=ρ_U","El=asin(1)=90°"],result:"ماهواره در سمت‌الرأس دیده می‌شود و Azimuth در این حالت یکتا نیست.",sanityCheck:"ارتفاع بیشینه باید 90 درجه باشد."}
 ],
 conceptChecks:[
  {q:"چرا Ground Track پس از یک دور تکرار دقیق ندارد؟",options:["مدار نابود می‌شود","زمین زیر صفحه مدار می‌چرخد","سرعت نور تغییر می‌کند"],answer:1,why:"Frame زمین‌ثابت طی دوره مداری نسبت به Frame لخت دوران کرده است.",review:"تبدیل ECI و ECEF را مرور کنید."},
  {q:"AOS معمولاً با کدام شرط تعیین می‌شود؟",options:["عبور Elevation از ماسک","صفرشدن سرعت","رسیدن به اوج"],answer:0,why:"تماس با عبور صعودی ارتفاع دید از حد عملیاتی آغاز می‌شود.",review:"هندسه ایستگاه را مرور کنید."}
 ],
 numericalExercises:[
  {id:"ground-shift-400",title:"تمرین عددی — جابه‌جایی رد",statement:"برای دوره 92.5604 min و روز نجومی 86164.09 s، چرخش زمین را طی یک دور محاسبه کنید.",answer:23.2035,tolerance:0.03,unit:"deg",hints:["دوره را به ثانیه تبدیل کنید.","360T/T_sidereal."],solution:"Δλ≈23.2035°."},
  {id:"zenith-elevation",title:"تمرین عددی — سمت‌الرأس",statement:"اگر E=0، N=0 و U=1000 km باشد، Elevation را بیابید.",answer:90,tolerance:0.01,unit:"deg",hints:["El=asin(U/|ρ|)."],solution:"El=90°."}
 ],
 commonMistakes:[
  {title:"رسم ECI روی نقشه زمین",text:"نقشه سطحی به ECEF نیاز دارد؛ حذف چرخش زمین رد را اشتباه می‌کند."},
  {title:"ترکیب زمان‌های متفاوت",text:"حالت ماهواره و موقعیت ایستگاه باید در یک زمان باشند."},
  {title:"یکسان‌گرفتن عرض‌ها",text:"عرض ژئوسنتریک و ژئودتیک به‌ویژه در عرض‌های بالا تفاوت دارند."}
 ],
 lab:{id:"ground-track-pass",title:"آزمایشگاه رد زمینی و گذر ایستگاه",description:"مدار و ایستگاه را تعریف کنید، رد زمینی و پنجره‌های AOS/LOS را محاسبه کنید.",tool:"ground-track"},
 validationNotes:["طول‌ها هنگام عبور از ±180 درجه شکسته می‌شوند تا خط مصنوعی ایجاد نشود.","آزمایش سمت‌الرأس باید Elevation=90° بدهد.","مدل آموزشی زمین کروی است."],
 sources:[{name:"NASA — Introduction to Orbital Mechanics",type:"Agency technical training",url:"https://ntrs.nasa.gov/api/citations/20205004141/downloads/Introduction%20to%20Orbitalaft%20Engineers%20CHARTS%20REV%20A.pdf?attachment=true"},{name:"CelesTrak Tutorials",type:"Technical reference",url:"https://www.celestrak.org/software/tutorials/"}]
};
const ch9={
 id:"orbit-families-selection",planIndex:9,title:"خانواده‌های مداری و انتخاب مأموریت",en:"Operational Orbit Families and Mission Selection",level:"دانشگاهی",minutes:66,
 lead:"مدار خوب فقط از نظر دینامیکی ممکن نیست؛ باید پوشش، تأخیر، نور، تابش، پرتاب و دفع را هم‌زمان پاسخ دهد.",
 prerequisites:["عناصر مداری","رد زمینی","دوره و سرعت","اغتشاش در حد آشنایی"],
 learningObjectives:["مقایسه LEO، MEO، GEO و HEO","تشخیص نقش SSO و GTO","محاسبه شعاع GEO","پیوند نیاز مأموریت به مدار","ساخت Trade Study مقدماتی"],
 problemPrompt:"چرا بهترین مدار برای تصویربرداری با بهترین مدار برای ارتباط ثابت یا ناوبری جهانی یکسان نیست؟",
 assumptions:["مقایسه‌ها مقدماتی‌اند.","ظرفیت پرتابگر و جرم دقیق بعداً وارد می‌شوند.","کیفیت پوشش فقط با ارتفاع تعیین نمی‌شود.","هزینه چرخه عمر در تصمیم نهایی مهم است."],
 definitions:[
  {term:"Low Earth Orbit",description:"خانواده مدارهای نزدیک زمین با تأخیر کم و پوشش لحظه‌ای محدود."},
  {term:"Medium Earth Orbit",description:"ناحیه میانی، رایج در سامانه‌های ناوبری و برخی مخابرات."},
  {term:"Geostationary Orbit",description:"مدار دایروی استوایی هم‌دوره با چرخش زمین که در آسمان ثابت دیده می‌شود."},
  {term:"Sun-Synchronous Orbit",description:"مداری با پیشروی گره تنظیم‌شده برای عبور در زمان محلی تقریباً ثابت."},
  {term:"Highly Elliptical Orbit",description:"مدار کشیده با ماند طولانی نزدیک اوج برای پوشش عرض‌های بالا."}
 ],
 paragraphs:[
  "ارتفاع، شکل و جهت صفحه مدار روی پوشش، تأخیر، وضوح تصویربرداری، توان لینک، تابش و دسترسی پرتاب اثر می‌گذارند. انتخاب مدار باید از نیاز کاربر آغاز شود.",
  "GEO پوشش پیوسته منطقه بزرگی می‌دهد، اما تأخیر و توان لینک بالاتر دارد. LEO تأخیر و فاصله کم دارد، اما برای پوشش پیوسته به منظومه نیازمند است.",
  "SSO یک خانواده جهت‌گیری‌شده با استفاده از پیشروی J2 است، نه صرفاً هر مدار قطبی. HEO می‌تواند زمان ماند را روی عرض‌های بالا افزایش دهد.",
  "خروجی مناسب یک Trade Study است که معیارها، وزن‌ها، عدم‌قطعیت و فرض‌های هر گزینه را آشکار ثبت کند."
 ],
 derivationSteps:[
  {title:"نیاز مأموریت",text:"پوشش، تأخیر، تفکیک، نور و طول عمر به معیار کمی تبدیل می‌شوند.",equation:"Need → MOE → Orbit constraints"},
  {title:"دوره مطلوب",text:"دوره یا نرخ بازدید، مقیاس نیم‌محور را محدود می‌کند.",equation:"T=2π√(a³/μ)"},
  {title:"شرط زمین‌ایستا",text:"حرکت میانگین با نرخ چرخش زمین برابر می‌شود.",equation:"r_GEO=(μ/ω_E²)^(1/3)"},
  {title:"ارزیابی مبادله",text:"گزینه‌ها با معیارهای مشترک و حاشیه مقایسه می‌شوند.",equation:"Score=Σ w_i s_i"}
 ],
 equations:[
  {title:"شعاع GEO",text:"r_GEO=(μ/ω_E²)^(1/3)",explain:"شعاع هم‌دوره با روز نجومی.",validity:"مدار دایروی استوایی و نرخ نجومی."},
  {title:"دوره",text:"T=2π√(a³/μ)",explain:"مقیاس زمانی مدار بسته.",validity:"مدل دو جسم."},
  {title:"حد عرض رد",text:"|φ|max≈min(i,180°−i)",explain:"تقریب زمین کروی برای مدار مستقیم/پس‌رو.",validity:"رد زیرماهواره و نبود اغتشاش."},
  {title:"امتیاز وزنی",text:"S=Σw_i s_i",explain:"چارچوب تصمیم مقدماتی.",validity:"وزن و مقیاس امتیاز باید مستند باشد."}
 ],
 symbolTable:[
  {symbol:"r_GEO",name:"شعاع زمین‌ایستا",unit:"km",note:"از مرکز زمین"},{symbol:"ω_E",name:"نرخ چرخش زمین",unit:"rad/s",note:"روز نجومی"},{symbol:"φ",name:"عرض جغرافیایی",unit:"deg",note:"رد زمینی"},{symbol:"w_i",name:"وزن معیار",unit:"—",note:"جمع وزن‌ها معمولاً یک"},{symbol:"s_i",name:"امتیاز گزینه",unit:"—",note:"مقیاس نرمال‌شده"}
 ],
 key:["مدار از نیاز مأموریت انتخاب می‌شود.","GEO به دایروی‌بودن، استوایی‌بودن و هم‌دوره‌بودن هم‌زمان نیاز دارد.","SSO با مدار قطبی مترادف نیست.","Trade Study باید فرض و عدم‌قطعیت را ثبت کند."],
 equation:{text:"r_GEO=(μ/ω_E²)^(1/3)",explain:"شعاع مدار زمین‌ایستا."},
 example:{title:"شعاع زمین‌ایستا",problem:"با μ زمین و نرخ روز نجومی شعاع را بیابید.",solution:"r≈42164.173 km و ارتفاع≈35786.036 km است."},
 workedExamples:[
  {title:"مثال ۱ — مدار زمین‌ایستا",problem:"شعاع و ارتفاع GEO را محاسبه کنید.",given:["μ=398600.4418","ω_E=7.292115×10⁻⁵ rad/s","R_E=6378.137 km"],steps:["r=(μ/ω²)^(1/3)","r=42164.173 km","h=r−R_E=35786.036 km"],result:"این مقدار شعاع استوایی ایده‌آل است.",sanityCheck:"دوره باید 23h56m04s شود."},
  {title:"مثال ۲ — انتخاب تصویربرداری",problem:"تفکیک بالا و نور محلی ثابت لازم است.",given:["Low latency","Consistent illumination","Global coverage"],steps:["LEO فاصله را کم می‌کند","میل نزدیک قطبی پوشش جهانی می‌دهد","پیشروی J2 زمان محلی را ثابت نگه می‌دارد"],result:"SSO نزدیک قطبی گزینه مقدماتی مناسب است.",sanityCheck:"جرم، عرض نوار و زمان بازدید هنوز باید تحلیل شوند."}
 ],
 conceptChecks:[
  {q:"کدام شرط برای Geostationary ضروری است؟",options:["فقط ارتفاع","دایروی، استوایی و هم‌دوره","هر مدار ۲۴ ساعته"],answer:1,why:"حذف هرکدام باعث حرکت ظاهری در آسمان می‌شود.",review:"شرط GEO را مرور کنید."},
  {q:"مزیت اصلی HEO برای عرض‌های بالا چیست؟",options:["پسا بیشتر","زمان ماند طولانی نزدیک اوج","صفرشدن تأخیر"],answer:1,why:"هندسه اوج روی نیم‌کره هدف پوشش طولانی می‌دهد.",review:"خانواده HEO را مرور کنید."}
 ],
 numericalExercises:[
  {id:"geo-altitude",title:"تمرین عددی — ارتفاع GEO",statement:"با r_GEO=42164.173 km و R_E=6378.137 km ارتفاع را بیابید.",answer:35786.036,tolerance:0.05,unit:"km",hints:["h=r−R_E."],solution:"h=35786.036 km."},
  {id:"max-latitude-516",title:"تمرین عددی — حد عرض",statement:"حد تقریبی عرض رد زمینی برای i=51.6° را بیابید.",answer:51.6,tolerance:0.01,unit:"deg",hints:["برای مدار مستقیم |φ|max≈i."],solution:"تقریباً ±51.6°."}
 ],
 commonMistakes:[
  {title:"انتخاب مدار فقط با ارتفاع",text:"میل، خروج از مرکز، نور، پوشش و عملیات نیز تعیین‌کننده‌اند."},
  {title:"نامیدن هر مدار ۲۴ ساعته به GEO",text:"مدار زمین‌ایستا باید دایروی و استوایی نیز باشد."},
  {title:"برابرگرفتن SSO و Polar",text:"SSO نرخ پیشروی گره مشخص می‌خواهد."}
 ],
 lab:{id:"ground-track-pass",title:"آزمایشگاه مقایسه خانواده مدار",description:"پارامترهای مدار را تغییر دهید و رد زمینی، دوره و پنجره ایستگاه را مقایسه کنید.",tool:"ground-track"},
 validationNotes:["شعاع GEO با روز نجومی محاسبه می‌شود.","اطلس مدار به این فصل پیوند داده می‌شود.","امتیاز وزنی جای تحلیل مهندسی کامل نیست."],
 sources:[{name:"ESA — Types of Orbits",type:"Agency reference",url:"https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits"},{name:"NASA Orbital Mechanics",type:"Agency technical training",url:"https://ntrs.nasa.gov/api/citations/20205004141/downloads/Introduction%20to%20Orbitalaft%20Engineers%20CHARTS%20REV%20A.pdf?attachment=true"}]
};
const ch10={
 id:"impulsive-maneuvers",planIndex:10,title:"مانور ضربه‌ای و هندسه تغییر سرعت",en:"Impulsive Orbital Maneuvers",level:"دانشگاهی",minutes:74,
 lead:"مانور ضربه‌ای تغییر سریع بردار سرعت را مدل می‌کند. جهت Burn تعیین می‌کند انرژی، شکل یا صفحه مدار چگونه تغییر کند.",
 prerequisites:["بردار حالت","Vis-viva","انرژی و h","چارچوب RTN"],
 learningObjectives:["اعمال Δv برداری","تحلیل مؤلفه مماسی و شعاعی","تغییر اوج و حضیض","محاسبه مدار پس از Burn","تشخیص محدودیت تقریب Impulsive"],
 problemPrompt:"چرا یک Burn مماسی در حضیض عمدتاً اوج را تغییر می‌دهد، ولی همان اندازه Burn در جهت عمود بر صفحه، انرژی کمتری تغییر می‌دهد؟",
 assumptions:["مدت Burn نسبت به دوره ناچیز است.","موقعیت طی Burn ثابت فرض می‌شود.","جرم در محاسبه هندسه وارد نمی‌شود.","نیروهای دیگر طی ضربه حذف می‌شوند."],
 definitions:[
  {term:"Impulsive Maneuver",description:"تقریب تغییر آنی سرعت در موقعیت ثابت."},
  {term:"Delta-v",description:"بردار تغییر سرعت میان حالت پیش و پس از مانور."},
  {term:"Radial Component",description:"مولفه Δv در راستای بردار شعاعی."},
  {term:"Tangential Component",description:"مولفه Δv در راستای حرکت مداری محلی."},
  {term:"Cross-Track Component",description:"مولفه عمود بر صفحه لحظه‌ای مدار."}
 ],
 paragraphs:[
  "در مدل Impulsive، موقعیت پیوسته و سرعت جهش می‌کند. پس از افزودن Δv، عناصر جدید از State جدید استخراج می‌شوند.",
  "Burn مماسی مستقیم انرژی را تغییر می‌دهد و در Apsis مقابل اثر بزرگی می‌سازد. Burn شعاعی مکان Apsis را جابه‌جا و شکل مدار را تغییر می‌دهد.",
  "مولفه Cross-Track جهت h و صفحه مدار را می‌چرخاند. تحلیل کامل باید بردارها را مقایسه کند، نه فقط اندازه سرعت را.",
  "اگر مدت Burn قابل مقایسه با زمان دینامیکی باشد، مدل Finite Burn و Guidance لازم است."
 ],
 derivationSteps:[
  {title:"حالت پیش از Burn",text:"r و v⁻ در زمان مانور معلوم‌اند.",equation:"x⁻=[r,v⁻]"},
  {title:"افزودن ضربه",text:"Δv در Frame مشخص به سرعت افزوده می‌شود.",equation:"v⁺=v⁻+Δv"},
  {title:"محاسبه انرژی جدید",text:"انرژی و نیم‌محور از سرعت جدید به دست می‌آیند.",equation:"ε⁺=|v⁺|²/2−μ/r"},
  {title:"عناصر جدید",text:"State جدید به عناصر تبدیل می‌شود.",equation:"[r,v⁺]→COE⁺"}
 ],
 equations:[
  {title:"جهش سرعت",text:"v⁺=v⁻+Δv",explain:"هسته مانور ضربه‌ای.",validity:"موقعیت طی Burn ثابت."},
  {title:"اندازه بودجه",text:"|Δv|=√(Δv_R²+Δv_T²+Δv_N²)",explain:"جمع برداری مولفه‌ها.",validity:"مولفه‌ها در Frame متعامد یکسان."},
  {title:"انرژی پس از مانور",text:"ε⁺=|v⁺|²/2−μ/r",explain:"مدار جدید را طبقه‌بندی می‌کند.",validity:"مدل دو جسم بعد از ضربه."},
  {title:"نیم‌محور جدید",text:"a⁺=−μ/(2ε⁺)",explain:"برای مسیر غیرسهموی.",validity:"ε⁺≠0."}
 ],
 symbolTable:[
  {symbol:"Δv_R",name:"مولفه شعاعی",unit:"km/s",note:"در راستای r"},{symbol:"Δv_T",name:"مولفه مماسی",unit:"km/s",note:"در راستای حرکت"},{symbol:"Δv_N",name:"مولفه عمود بر صفحه",unit:"km/s",note:"در راستای h"},{symbol:"v⁻",name:"سرعت پیش از Burn",unit:"km/s",note:"همان Frame"},{symbol:"v⁺",name:"سرعت پس از Burn",unit:"km/s",note:"همان موقعیت"}
 ],
 key:["Δv یک بردار است، نه فقط یک عدد.","Burn مماسی در Apsis مقابل اثر بزرگ دارد.","مولفه عمود بر صفحه جهت h را تغییر می‌دهد.","Finite Burn ممکن است با تقریب Impulsive متفاوت باشد."],
 equation:{text:"v⁺=v⁻+Δv",explain:"جهش State در مانور ضربه‌ای."},
 example:{title:"Burn صد متر بر ثانیه در LEO",problem:"در مدار دایروی ۴۰۰ km، Δv مماسی +0.1 km/s اعمال شود.",solution:"اوج جدید حدود 765.45 km و e≈0.02625 می‌شود."},
 workedExamples:[
  {title:"مثال ۱ — افزایش اوج",problem:"Burn مستقیم 0.1 km/s در مدار 400 km.",given:["r=6778.137 km","v=7.66856 km/s","Δv_T=0.1 km/s"],steps:["v⁺=7.76856","ε⁺ محاسبه می‌شود","a⁺≈6960.864 km","r_a≈7143.590 km"],result:"ارتفاع اوج≈765.45 km.",sanityCheck:"محل Burn حضیض مدار جدید باقی می‌ماند."},
  {title:"مثال ۲ — Burn پس‌رونده",problem:"در همان مدار Δv_T منفی اعمال شود.",given:["Δv_T<0"],steps:["انرژی کمتر می‌شود","نقطه مقابل پایین می‌آید"],result:"اگر حضیض جدید وارد جو شود عمر مدار کاهش شدید دارد.",sanityCheck:"Burn پس‌رونده نباید اوج را بالا ببرد."}
 ],
 conceptChecks:[
  {q:"در مانور Impulsive کدام کمیت پیوسته می‌ماند؟",options:["موقعیت","سرعت","انرژی"],answer:0,why:"سرعت جهش می‌کند ولی موقعیت در لحظه ضربه ثابت است.",review:"تعریف مانور ضربه‌ای را مرور کنید."},
  {q:"Burn مماسی مستقیم در حضیض عمدتاً کدام نقطه را بالا می‌برد؟",options:["اوج","همان حضیض","گره صعودی"],answer:0,why:"انرژی در حضیض افزوده و نقطه مقابل مدار بالا می‌رود.",review:"اثر Apsis را مرور کنید."}
 ],
 numericalExercises:[
  {id:"maneuver-dv-norm",title:"تمرین عددی — اندازه Δv",statement:"برای مولفه‌های 0.03، 0.04 و 0 km/s اندازه Δv را بیابید.",answer:0.05,tolerance:0.0001,unit:"km/s",hints:["فیثاغورس سه‌بعدی."],solution:"√(0.03²+0.04²)=0.05 km/s."},
  {id:"maneuver-apogee-100",title:"تمرین عددی — اوج جدید",statement:"برای مثال مدار ۴۰۰ km و Burn مستقیم 0.1 km/s، ارتفاع اوج را بیابید.",answer:765.45,tolerance:0.5,unit:"km",hints:["انرژی و a جدید را محاسبه کنید.","Burn در حضیض است."],solution:"ارتفاع اوج≈765.45 km."}
 ],
 commonMistakes:[
  {title:"جمع اسکالر مولفه‌ها",text:"بودجه برداری با ریشه مجموع مربعات محاسبه می‌شود."},
  {title:"نامشخص‌بودن Frame Δv",text:"Radial، Tangential و Normal باید نسبت به Frame لحظه Burn تعریف شوند."},
  {title:"استفاده Impulsive برای Burn بلند",text:"در Burn طولانی، موقعیت و جهت حین احتراق تغییر می‌کند."}
 ],
 lab:{id:"maneuver-designer",title:"آزمایشگاه طراحی مانور ضربه‌ای",description:"مدار اولیه و مولفه‌های Δv را وارد کنید و مدار جدید را ببینید.",tool:"maneuver"},
 validationNotes:["Δv=0 باید State و عناصر را بدون تغییر نگه دارد.","جهت Burn در Frame RTN ثبت می‌شود.","نمونه 100 m/s با محاسبه مستقل کنترل شده است."],
 sources:[{name:"MIT Astrodynamics — Orbital Transfer",type:"University course",url:"https://ocw.mit.edu/courses/16-346-astrodynamics-fall-2008/pages/assignments/"},{name:"Orbital Mechanics for Engineering Students",type:"Academic textbook",url:"https://www.sciencedirect.com/book/9780128240250/orbital-mechanics-for-engineering-students"}]
};
const ch11={
 id:"transfer-trade",planIndex:11,title:"انتقال هوهمن و دو-بیضوی",en:"Hohmann and Bi-Elliptic Transfers",level:"دانشگاهی",minutes:82,
 lead:"کمترین Δv همیشه تنها معیار نیست. انتقال هوهمن و دو-بیضوی باید با زمان، تعداد Burn، محدودیت اوج و محیط تابشی مقایسه شوند.",
 prerequisites:["Vis-viva","مانور ضربه‌ای","مدار دایروی","دوره مدار"],
 learningObjectives:["استخراج Burnهای هوهمن","محاسبه زمان انتقال","تحلیل انتقال پایین‌رونده","محاسبه سه Burn دو-بیضوی","مقایسه هزینه و زمان"],
 problemPrompt:"چرا انتقالی با مسیر بسیار بلندتر گاهی Δv کمتری مصرف می‌کند و چه هزینه عملیاتی در برابر آن می‌پردازیم؟",
 assumptions:["مدارهای آغاز و پایان دایروی و هم‌صفحه‌اند.","Burnها Impulsive هستند.","اغتشاش و محدودیت زمانی Burn حذف شده‌اند.","شعاع‌ها از مرکز جسم اصلی‌اند."],
 definitions:[
  {term:"Hohmann Transfer",description:"انتقال دو-Burn میان دو مدار دایروی هم‌صفحه با بیضی مماس."},
  {term:"Bi-Elliptic Transfer",description:"انتقال سه-Burn با یک شعاع میانی بزرگ برای کاهش هزینه برخی نسبت‌های شعاع."},
  {term:"Transfer Time",description:"زمان بالستیک پیمایش کمان انتقال."},
  {term:"Transfer Orbit",description:"مقطع مخروطی واسط میان مدار آغاز و پایان."}
 ],
 paragraphs:[
  "در انتقال هوهمن، Burn نخست سرعت را به سرعت بیضی انتقال و Burn دوم آن را به سرعت مدار مقصد می‌رساند. انتقال نصف دوره بیضی است.",
  "انتقال دو-بیضوی ابتدا به شعاع میانی بزرگ می‌رود، در آنجا انرژی مسیر را تغییر می‌دهد و سپس در مدار مقصد دایروی می‌شود. سرعت کم در اوج می‌تواند Burn دوم را ارزان کند.",
  "برتری Δv دو-بیضوی فقط برای برخی نسبت‌های شعاع و انتخاب شعاع میانی رخ می‌دهد. زمان طولانی، عبور تابشی و پیچیدگی عملیات ممکن است مزیت سوخت را بی‌ارزش کند."
 ],
 derivationSteps:[
  {title:"سرعت مدارهای دایروی",text:"سرعت آغاز و مقصد محاسبه می‌شود.",equation:"v_c=√(μ/r)"},
  {title:"بیضی هوهمن",text:"نیم‌محور میانگین دو شعاع است.",equation:"a_t=(r₁+r₂)/2"},
  {title:"دو Burn",text:"سرعت بیضی در دو Apsis با Vis-viva مقایسه می‌شود.",equation:"Δv₁=v_t(r₁)−v_c1, Δv₂=v_c2−v_t(r₂)"},
  {title:"زمان",text:"نصف دوره بیضی انتقال است.",equation:"t_H=π√(a_t³/μ)"}
 ],
 equations:[
  {title:"Burn اول",text:"Δv₁=√(μ/r₁)[√(2r₂/(r₁+r₂))−1]",explain:"برای انتقال بالارونده مثبت است.",validity:"دایروی، هم‌صفحه، Impulsive."},
  {title:"Burn دوم",text:"Δv₂=√(μ/r₂)[1−√(2r₁/(r₁+r₂))]",explain:"دایروی‌سازی در مقصد.",validity:"همان فرض‌ها."},
  {title:"زمان هوهمن",text:"t_H=π√(((r₁+r₂)/2)³/μ)",explain:"نصف دوره بیضی انتقال.",validity:"حرکت دو جسم."},
  {title:"هزینه کل",text:"Δv_total=Σ|Δv_k|",explain:"جمع قدرمطلق Burnها.",validity:"بودجه اسکالر مأموریت."}
 ],
 symbolTable:[
  {symbol:"r₁",name:"شعاع مدار آغاز",unit:"km",note:"از مرکز"},{symbol:"r₂",name:"شعاع مدار مقصد",unit:"km",note:"از مرکز"},{symbol:"r_b",name:"شعاع میانی دو-بیضوی",unit:"km",note:"بزرگ‌تر از هر دو"},{symbol:"a_t",name:"نیم‌محور انتقال",unit:"km",note:"بیضی واسط"},{symbol:"t_H",name:"زمان هوهمن",unit:"s",note:"نصف دوره"}
 ],
 key:["هوهمن برای مدار دایروی هم‌صفحه تعریف می‌شود.","زمان و Δv باید هم‌زمان مقایسه شوند.","دو-بیضوی سه Burn و دو کمان انتقال دارد.","ارتفاع باید به شعاع مرکز تبدیل شود."],
 equation:{text:"t_H=π√(a_t³/μ)",explain:"زمان بالستیک انتقال هوهمن."},
 example:{title:"LEO 400 km تا GEO",problem:"Δv و زمان انتقال را بیابید.",solution:"Δv کل≈3.85396 km/s و زمان≈5.29127 h است."},
 workedExamples:[
  {title:"مثال ۱ — LEO به GEO",problem:"از ارتفاع 400 km به شعاع GEO منتقل شوید.",given:["r₁=6778.137 km","r₂=42164.173 km"],steps:["Δv₁≈2.39747 km/s","Δv₂≈1.45649 km/s","Δv_total≈3.85396 km/s","t≈5.29127 h"],result:"این بودجه تغییر میل، اتلاف و نگهداری را شامل نمی‌شود.",sanityCheck:"Burn اول بزرگ‌تر از Burn دوم است."},
  {title:"مثال ۲ — Trade زمان",problem:"دو-بیضوی با r_b بسیار بزرگ بررسی شود.",given:["r_b≫r₂"],steps:["Burn در اوج کم‌سرعت ارزان می‌شود","دو نیم‌دوره بلند به زمان اضافه می‌شود"],result:"ممکن است Δv کمتر ولی زمان چندین برابر شود.",sanityCheck:"هر r_b بزرگ الزاماً گزینه عملیاتی مناسب نیست."}
 ],
 conceptChecks:[
  {q:"زمان هوهمن چیست؟",options:["یک دوره کامل","نصف دوره بیضی انتقال","زمان Burn اول"],answer:1,why:"مسیر از یک Apsis بیضی به Apsis مقابل می‌رود.",review:"زمان انتقال را مرور کنید."},
  {q:"چرا دو-بیضوی ممکن است ارزان شود؟",options:["جرم صفر می‌شود","Burn میانی در سرعت کم انجام می‌شود","گرانش خاموش می‌شود"],answer:1,why:"چرخاندن یا تغییر انرژی در سرعت پایین می‌تواند هزینه را کم کند.",review:"هندسه دو-بیضوی را مرور کنید."}
 ],
 numericalExercises:[
  {id:"hohmann-leo-geo-dv",title:"تمرین عددی — Δv کل",statement:"Δv کل انتقال هوهمن 400 km به GEO را محاسبه کنید.",answer:3.85396,tolerance:0.01,unit:"km/s",hints:["ارتفاع را به شعاع تبدیل کنید.","دو Burn را جمع کنید."],solution:"Δv_total≈3.85396 km/s."},
  {id:"hohmann-leo-geo-time",title:"تمرین عددی — زمان",statement:"زمان همان انتقال را به ساعت بیابید.",answer:5.29127,tolerance:0.02,unit:"h",hints:["نصف دوره بیضی انتقال."],solution:"t≈5.29127 h."}
 ],
 commonMistakes:[
  {title:"استفاده از ارتفاع",text:"فرمول‌ها شعاع مرکز را می‌خواهند."},
  {title:"حذف قدرمطلق Burnها",text:"بودجه کل مجموع اندازه تغییرات سرعت است."},
  {title:"مقایسه فقط با Δv",text:"زمان، محیط و عملیات نیز معیارند."}
 ],
 lab:{id:"transfer-trade",title:"آزمایشگاه مقایسه انتقال",description:"هوهمن و دو-بیضوی را از نظر Δv، زمان و تعداد Burn مقایسه کنید.",tool:"transfer-trade"},
 validationNotes:["برای r₁=r₂ باید Δv و زمان انتقال عملی صفر گزارش شوند.","مقادیر نمونه LEO–GEO مستقل کنترل شده‌اند."],
 sources:[{name:"MIT Astrodynamics — Optimum Orbital Transfer",type:"University course",url:"https://ocw.mit.edu/courses/16-346-astrodynamics-fall-2008/pages/assignments/"},{name:"Orbital Mechanics for Engineering Students",type:"Academic textbook",url:"https://www.sciencedirect.com/book/9780128240250/orbital-mechanics-for-engineering-students"}]
};
const ch12={
 id:"plane-change-phasing",planIndex:12,title:"تغییر صفحه، فازبندی و مانور ترکیبی",en:"Plane Change, Phasing and Combined Maneuvers",level:"دانشگاهی",minutes:78,
 lead:"تغییر جهت بردار سرعت می‌تواند به‌اندازه تغییر اندازه آن پرهزینه باشد. ترکیب Burnها و انتخاب محل مناسب بخش مهم طراحی مأموریت است.",
 prerequisites:["بردار سرعت","مانور ضربه‌ای","Vis-viva","دوره مدار"],
 learningObjectives:["محاسبه تغییر صفحه خالص","تحلیل Burn ترکیبی","انتخاب محل کم‌سرعت","ساخت مدار فازبندی","محاسبه Drift زاویه‌ای"],
 problemPrompt:"چرا تغییر میل ده درجه در LEO می‌تواند بیش از یک کیلومتر بر ثانیه هزینه داشته باشد و چگونه می‌توان آن را کاهش داد؟",
 assumptions:["مانورها Impulsive هستند.","تغییر صفحه در یک نقطه مشترک انجام می‌شود.","فازبندی در مدل دو جسم است.","هدف و تعقیب‌کننده هم‌صفحه‌اند مگر خلاف آن ذکر شود."],
 definitions:[
  {term:"Plane Change",description:"چرخاندن صفحه مدار با تغییر جهت بردار سرعت."},
  {term:"Phasing Maneuver",description:"تغییر موقت دوره برای اصلاح جدایی زاویه‌ای."},
  {term:"Combined Maneuver",description:"انجام تغییر اندازه و جهت سرعت در یک Burn برداری."},
  {term:"Phase Angle",description:"جدایی زاویه‌ای هدف و تعقیب‌کننده روی مدار یا نسبت به مرجع."}
 ],
 paragraphs:[
  "تغییر صفحه خالص اندازه سرعت را ثابت و جهت آن را می‌چرخاند. هزینه با سرعت محل Burn و سینوس نصف زاویه تغییر می‌کند.",
  "در انتقال‌های بزرگ، بخشی از تغییر میل در اوج کم‌سرعت یا همراه دایروی‌سازی انجام می‌شود. جمع جداگانه دو Burn معمولاً از Burn برداری ترکیبی گران‌تر است.",
  "فازبندی با تغییر دوره، نرخ زاویه‌ای نسبی می‌سازد. پس از رسیدن به جدایی مطلوب، Burn دوم مدار اصلی را بازمی‌گرداند."
 ],
 derivationSteps:[
  {title:"مثلث سرعت",text:"دو بردار با اندازه برابر و زاویه Δi مقایسه می‌شوند.",equation:"|Δv|²=v²+v²−2v²cosΔi"},
  {title:"فرم نیم‌زاویه",text:"با هویت مثلثاتی رابطه ساده می‌شود.",equation:"Δv=2v sin(Δi/2)"},
  {title:"Burn ترکیبی",text:"اندازه و جهت سرعت هم‌زمان تغییر می‌کنند.",equation:"Δv=√(v₁²+v₂²−2v₁v₂cosΔi)"},
  {title:"Drift فاز",text:"اختلاف حرکت میانگین جدایی زاویه‌ای می‌سازد.",equation:"Δθ=(n_target−n_phase)t"}
 ],
 equations:[
  {title:"تغییر صفحه خالص",text:"Δv=2v sin(Δi/2)",explain:"هزینه چرخش بردار سرعت.",validity:"اندازه سرعت پیش و پس برابر."},
  {title:"Burn ترکیبی",text:"Δv=√(v₁²+v₂²−2v₁v₂cosΔi)",explain:"تغییر اندازه و جهت هم‌زمان.",validity:"دو بردار در نقطه مشترک."},
  {title:"Drift فاز",text:"Δθ=(n_t−n_p)t",explain:"تغییر جدایی زاویه‌ای.",validity:"حرکت میانگین ثابت در بازه."},
  {title:"دوره فاز",text:"T_p=2π/n_p",explain:"دوره مدار موقت فازبندی.",validity:"مدار کپلری بسته."}
 ],
 symbolTable:[
  {symbol:"Δi",name:"زاویه تغییر صفحه",unit:"rad",note:"زاویه بین سرعت‌ها"},{symbol:"v₁,v₂",name:"سرعت پیش و پس",unit:"km/s",note:"نقطه مشترک"},{symbol:"Δθ",name:"تغییر فاز",unit:"rad",note:"علامت طبق قرارداد"},{symbol:"n_t",name:"حرکت میانگین هدف",unit:"rad/s",note:"مدار هدف"},{symbol:"n_p",name:"حرکت میانگین فاز",unit:"rad/s",note:"مدار موقت"}
 ],
 key:["تغییر صفحه در سرعت کمتر ارزان‌تر است.","Burn ترکیبی از جمع اسکالر Burnهای جدا ارزان‌تر است.","فازبندی با اختلاف دوره کار می‌کند.","علامت Phase Drift باید با قرارداد روشن باشد."],
 equation:{text:"Δv=2v sin(Δi/2)",explain:"هزینه تغییر صفحه خالص."},
 example:{title:"تغییر میل ده درجه",problem:"در v=7.7 km/s هزینه را بیابید.",solution:"Δv≈1.3422 km/s؛ عددی بسیار بزرگ برای LEO."},
 workedExamples:[
  {title:"مثال ۱ — تغییر صفحه LEO",problem:"Δi=10° و v=7.7 km/s.",given:["v=7.7","Δi=10°"],steps:["Δv=2×7.7×sin5°","Δv≈1.3422 km/s"],result:"هزینه با یک انتقال بزرگ قابل مقایسه است.",sanityCheck:"برای زاویه کوچک Δv≈vΔi(rad)."},
  {title:"مثال ۲ — انتخاب محل",problem:"همان تغییر در سرعت 1.6 km/s انجام شود.",given:["v=1.6","Δi=10°"],steps:["Δv=2×1.6×sin5°","Δv≈0.2789 km/s"],result:"اوج کم‌سرعت هزینه را شدیداً کاهش می‌دهد.",sanityCheck:"نسبت هزینه‌ها تقریباً نسبت سرعت‌هاست."}
 ],
 conceptChecks:[
  {q:"بهترین محل تغییر صفحه بزرگ کجاست؟",options:["جایی با سرعت کمتر","جایی با سرعت بیشتر","محل مستقل از سرعت است"],answer:0,why:"هزینه تغییر صفحه با v متناسب است.",review:"رابطه نیم‌زاویه را مرور کنید."},
  {q:"هدف مدار فازبندی چیست؟",options:["تغییر رنگ ماهواره","ساخت نرخ زاویه‌ای نسبی","حذف گرانش"],answer:1,why:"اختلاف دوره جدایی زاویه‌ای را تغییر می‌دهد.",review:"Drift فاز را مرور کنید."}
 ],
 numericalExercises:[
  {id:"plane-change-10",title:"تمرین عددی — تغییر صفحه",statement:"برای v=7.7 km/s و Δi=10°، Δv را بیابید.",answer:1.3422,tolerance:0.005,unit:"km/s",hints:["زاویه نصف را به رادیان ببرید."],solution:"Δv≈1.3422 km/s."},
  {id:"plane-change-apogee",title:"تمرین عددی — اوج کم‌سرعت",statement:"برای v=1.6 km/s و Δi=10°، Δv را بیابید.",answer:0.2789,tolerance:0.002,unit:"km/s",hints:["همان رابطه با سرعت جدید."],solution:"Δv≈0.2789 km/s."}
 ],
 commonMistakes:[
  {title:"استفاده درجه در sin",text:"هسته عددی با رادیان کار می‌کند."},
  {title:"جمع ساده Burnها",text:"Burn ترکیبی باید با قانون کسینوس برداری محاسبه شود."},
  {title:"ابهام علامت فاز",text:"تعریف هدف جلو یا عقب باید پیش از محاسبه روشن باشد."}
 ],
 lab:{id:"maneuver-designer",title:"آزمایشگاه تغییر صفحه و فاز",description:"مولفه Normal و سرعت محل Burn را تغییر دهید و هزینه را مقایسه کنید.",tool:"maneuver"},
 validationNotes:["برای Δi=0 هزینه باید صفر شود.","تقریب زاویه کوچک با رابطه کامل مقایسه می‌شود."],
 sources:[{name:"MIT Astrodynamics — Optimum Transfer",type:"University course",url:"https://ocw.mit.edu/courses/16-346-astrodynamics-fall-2008/pages/assignments/"},{name:"Fundamentals of Astrodynamics",type:"Academic textbook",url:"https://store.doverpublications.com/products/9780486600611"}]
};
const ch13={
 id:"relative-rendezvous",planIndex:13,title:"حرکت نسبی و ملاقات مداری",en:"Relative Motion and Rendezvous",level:"پیشرفته",minutes:92,
 lead:"در نزدیکی یک هدف روی مدار دایروی، حرکت نسبی با شهود حرکت آزاد زمینی متفاوت است. Frame هیل و مدل خطی، هندسه ملاقات را آشکار می‌کنند.",
 prerequisites:["حرکت دو جسم","Frame مداری محلی","معادلات دیفرانسیل خطی","فازبندی"],
 learningObjectives:["تعریف Frame هیل","استفاده از HCW","پیش‌بینی مسیر نسبی","تفسیر Drift along-track","شناخت محدودیت خطی‌سازی","طراحی ایمن Hold Point"],
 problemPrompt:"چرا تعقیب‌کننده‌ای که کمی پایین‌تر از هدف قرار می‌گیرد، در Frame نسبی به جلو رانش می‌کند، حتی بدون رانش پیوسته؟",
 assumptions:["مدار مرجع دایروی است.","فاصله نسبی بسیار کوچک‌تر از شعاع مدار است.","مدل دو جسم و خطی‌سازی برقرارند.","Frame هیل با قرارداد Radial–Along-track–Cross-track استفاده می‌شود."],
 definitions:[
  {term:"Relative Motion",description:"حرکت یک جسم نسبت به هدف در Frame محلی متصل به مدار هدف."},
  {term:"Hill Frame",description:"Frame چرخان با محورهای Radial، Along-Track و Cross-Track."},
  {term:"Clohessy–Wiltshire Equations",description:"معادلات خطی حرکت نسبی نزدیک مدار مرجع دایروی."},
  {term:"Rendezvous",description:"فرایند هم‌مکان و هم‌سرعت‌شدن کنترل‌شده دو فضاپیما."},
  {term:"Hold Point",description:"نقطه توقف برنامه‌ریزی‌شده برای ارزیابی پیش از ادامه نزدیک‌شدن."}
 ],
 paragraphs:[
  "Frame هیل همراه هدف می‌چرخد. محور x شعاعی، y در راستای حرکت و z عمود بر صفحه است. نیروهای ظاهری چرخش Frame در معادلات نسبی ظاهر می‌شوند.",
  "مدل HCW با خطی‌سازی دینامیک دو جسم پیرامون مدار دایروی به دست می‌آید. حرکت شعاعی و Along-Track به هم کوپل‌اند، اما Cross-Track مستقل و نوسانی است.",
  "ملاقات واقعی علاوه بر دینامیک نسبی به ناوبری، محدودیت حسگر، مخروط نزدیک‌شدن، ایمنی برخورد، Hold Point و قابلیت Abort نیاز دارد.",
  "برای فاصله بزرگ، مدار مرجع غیرمدور یا مانورهای طولانی باید از مدل غیرخطی یا نسبی دقیق‌تر استفاده شود."
 ],
 derivationSteps:[
  {title:"Frame چرخان",text:"حالت نسبی در محورهای محلی هدف بیان می‌شود.",equation:"ρ=[x,y,z]ᵀ"},
  {title:"خطی‌سازی",text:"گرانش پیرامون شعاع مرجع تا مرتبه اول بسط داده می‌شود.",equation:"r=r₀+ρ, |ρ|≪r₀"},
  {title:"معادلات صفحه",text:"حرکت شعاعی و along-track کوپل می‌شوند.",equation:"ẍ−2nẏ−3n²x=0, ÿ+2nẋ=0"},
  {title:"حرکت عمودی",text:"Cross-track نوسان ساده با فرکانس n است.",equation:"z̈+n²z=0"}
 ],
 equations:[
  {title:"Radial",text:"ẍ−2nẏ−3n²x=0",explain:"کوپل Coriolis و گرادیان گرانش.",validity:"مدار مرجع دایروی و فاصله کوچک."},
  {title:"Along-track",text:"ÿ+2nẋ=0",explain:"سرعت شعاعی حرکت طولی نسبی می‌سازد.",validity:"همان فرض‌ها."},
  {title:"Cross-track",text:"z̈+n²z=0",explain:"حرکت نوسانی مستقل.",validity:"مدل خطی HCW."},
  {title:"حرکت میانگین مرجع",text:"n=√(μ/r₀³)",explain:"فرکانس Frame چرخان.",validity:"مدار مرجع دایروی."}
 ],
 symbolTable:[
  {symbol:"x",name:"جابجایی Radial",unit:"m",note:"بیرون از زمین مثبت"},{symbol:"y",name:"جابجایی Along-track",unit:"m",note:"جهت حرکت هدف"},{symbol:"z",name:"جابجایی Cross-track",unit:"m",note:"عمود بر صفحه"},{symbol:"n",name:"حرکت میانگین مرجع",unit:"rad/s",note:"مدار دایروی"},{symbol:"ρ",name:"بردار نسبی",unit:"m",note:"تعقیب‌کننده نسبت به هدف"}
 ],
 key:["حرکت نسبی در Frame چرخان شهود مستقیم زمینی ندارد.","x و y کوپل‌اند.","HCW برای فاصله کوچک و مدار مرجع دایروی است.","Rendezvous کامل به ناوبری و ایمنی نیاز دارد."],
 equation:{text:"ẍ−2nẏ−3n²x=0",explain:"معادله شعاعی HCW."},
 example:{title:"جابجایی شعاعی صد متر",problem:"x₀=100 m و سایر حالت‌ها صفر؛ پس از 10 min در مدار 400 km چه می‌شود؟",solution:"x≈166.51 m و y≈−30.57 m می‌شود."},
 workedExamples:[
  {title:"مثال ۱ — Drift ناشی از x₀",problem:"هدف در 400 km و تعقیب‌کننده 100 m شعاعی بیرون‌تر است.",given:["x₀=100 m","y₀=0","v_rel=0","t=600 s"],steps:["n≈0.00113137 rad/s","x=(4−3cosnt)x₀","y=6(sinnt−nt)x₀"],result:"x≈166.51 m و y≈−30.57 m.",sanityCheck:"x و y مستقل نیستند؛ Drift طولی ظاهر می‌شود."},
  {title:"مثال ۲ — حرکت Cross-track",problem:"z₀=50 m و ż₀=0.",given:["z=z₀ cosnt"],steps:["پس از نیم دوره cosπ=−1"],result:"z به −50 m می‌رسد.",sanityCheck:"دامنه ثابت و دوره برابر مدار مرجع است."}
 ],
 conceptChecks:[
  {q:"کدام محور Frame هیل معمولاً شعاعی است؟",options:["x","y","z"],answer:0,why:"x از جسم مرکزی به هدف است.",review:"تعریف Frame هیل را مرور کنید."},
  {q:"محدودیت اصلی HCW چیست؟",options:["فقط مدار مرجع دایروی و فاصله نسبی کوچک","فقط GEO","عدم نیاز به Frame"],answer:0,why:"مدل از خطی‌سازی پیرامون مدار دایروی به دست می‌آید.",review:"فرض‌های مدل را مرور کنید."}
 ],
 numericalExercises:[
  {id:"hcw-x-600",title:"تمرین عددی — x پس از ده دقیقه",statement:"برای مثال x₀=100 m در مدار 400 km، x را پس از 600 s بیابید.",answer:166.506,tolerance:0.2,unit:"m",hints:["n=√(μ/r³).","x=(4−3cosnt)x₀."],solution:"x≈166.506 m."},
  {id:"hcw-y-600",title:"تمرین عددی — y پس از ده دقیقه",statement:"برای همان مثال y را بیابید.",answer:-30.567,tolerance:0.2,unit:"m",hints:["y=6(sinnt−nt)x₀."],solution:"y≈−30.567 m."}
 ],
 commonMistakes:[
  {title:"استفاده HCW در فاصله بزرگ",text:"خطی‌سازی با بزرگ‌شدن ρ دقت خود را از دست می‌دهد."},
  {title:"ابهام محورهای Frame",text:"قرارداد RTN یا Hill باید صریح باشد."},
  {title:"برابرگرفتن ملاقات با نزدیک‌شدن",text:"Rendezvous به هم‌سرعت‌شدن و الزامات ایمنی نیز نیاز دارد."}
 ],
 lab:{id:"relative-motion",title:"آزمایشگاه حرکت نسبی",description:"حالت نسبی اولیه را وارد و مسیر HCW را در Frame هدف مشاهده کنید.",tool:"relative-motion"},
 validationNotes:["حالت صفر باید برای تمام زمان‌ها صفر بماند.","حرکت z باید دامنه ثابت و دوره مرجع داشته باشد.","نمونه 600 s مستقل کنترل شده است."],
 sources:[{name:"MIT Astrodynamics — Clohessy-Wiltshire",type:"University course",url:"https://ocw.mit.edu/courses/16-346-astrodynamics-fall-2008/pages/assignments/"},{name:"NASA Rendezvous Resources",type:"Agency context",url:"https://www.nasa.gov/mission/international-space-station/"}]
};
course.chapters.push(ch8,ch9,ch10,ch11,ch12,ch13);
course.version="0.16-experimental";
course.time="۱۷ ساعت مطالعه و آزمایشگاه";
course.summary="فاز سوم مسیر تخصصی، سیزده فصل را از Frame و مدل دو جسم تا رد زمینی، انتخاب مدار، مانور، انتقال، فازبندی و ملاقات مداری پوشش می‌دهد. نسخه پایدار مستقل باقی مانده است.";
course.objectives=[
 "ساخت و انتشار State مداری در Frame مشخص",
 "تحلیل Ground Track و پنجره ایستگاه زمینی",
 "انتخاب خانواده مدار بر اساس نیاز مأموریت",
 "طراحی و ارزیابی مانور Impulsive",
 "مقایسه Hohmann و Bi-Elliptic Transfer",
 "تحلیل Plane Change و Phasing",
 "پیش‌بینی Relative Motion و Rendezvous مقدماتی"
];
})();
