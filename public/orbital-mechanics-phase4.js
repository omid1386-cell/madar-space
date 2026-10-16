(()=>{
const course=window.MADAR_ORBITAL_EXPERIMENTAL;
if(!course)return;
const ch14={
 id:"orbit-perturbations",planIndex:14,title:"مدل‌سازی اغتشاشات مداری",en:"Orbit Perturbation Modelling",level:"پیشرفته",minutes:88,
 lead:"مدل دو جسم ساختار اصلی مدار را می‌دهد، اما طراحی واقعی به نیروهای کوچک و انباشته‌شونده وابسته است. این فصل میان اثر سکولار، تناوبی و تصادفی تمایز می‌گذارد.",
 prerequisites:["مدل دو جسم","عناصر مداری","مشتق‌گیری","انتشار زمانی","چارچوب‌های مرجع"],
 learningObjectives:["طبقه‌بندی اغتشاشات","محاسبه نرخ‌های J2","برآورد شتاب Drag و SRP","تشخیص عناصر Mean و Osculating","انتخاب Force Model متناسب با کاربرد"],
 problemPrompt:"چگونه نیرویی چند مرتبه کوچک‌تر از گرانش مرکزی می‌تواند طی ماه‌ها صفحه مدار را ده‌ها درجه بچرخاند یا ارتفاع LEO را به‌طور محسوس کاهش دهد؟",
 assumptions:["روابط J2 میانگین‌گیری‌شده و مرتبه اول هستند.","مدل Drag از چگالی و ضریب ثابت لحظه‌ای استفاده می‌کند.","SRP در فاصله یک AU و بدون سایه محاسبه می‌شود.","این فصل جای انتشارگر دقیق چندنیرویی را نمی‌گیرد."],
 definitions:[
  {term:"Secular Perturbation",description:"تغییری که با زمان انباشته می‌شود و میانگین آن صفر نیست."},
  {term:"Periodic Perturbation",description:"تغییری کوتاه یا بلنددوره که پیرامون مقدار میانگین نوسان می‌کند."},
  {term:"J2 Perturbation",description:"اثر غالب برآمدگی استوایی زمین بر گره و حضیض بسیاری از مدارها."},
  {term:"Solar Radiation Pressure",description:"نیروی ناشی از انتقال تکانه فوتون‌های خورشید به سطح فضاپیما."},
  {term:"Third-Body Perturbation",description:"شتاب تفاضلی ناشی از ماه، خورشید یا جسم سوم."},
  {term:"Ballistic Coefficient",description:"پارامتری از جرم، سطح و ضریب Drag که حساسیت به جو را تعیین می‌کند."}
 ],
 paragraphs:[
  "میدان واقعی زمین کروی کامل نیست. جمله J2 در مدل میانگین‌گیری‌شده، RAAN و Argument of Periapsis را با نرخ‌های قابل پیش‌بینی تغییر می‌دهد. طراحی SSO از همین اثر استفاده می‌کند.",
  "Drag انرژی مکانیکی را می‌کاهد و نرخ آن به چگالی جو، سرعت نسبی، سطح مؤثر، جرم و ضریب Drag وابسته است. چگالی در ترموسفر با زمان، مکان و فعالیت خورشیدی چند مرتبه تغییر می‌کند.",
  "SRP برای فضاپیماهای با نسبت سطح به جرم بالا مهم‌تر است. ورود به سایه باعث قطع دوره‌ای آن می‌شود و مدل بازتاب سطح بر ضریب فشار تابشی اثر دارد.",
  "اجسام سوم به‌ویژه در مدارهای بالا و مأموریت‌های ماه و بین‌سیاره‌ای مهم‌اند. Force Model باید بر اساس افق پیش‌بینی، دقت، هزینه محاسباتی و نوع داده انتخاب شود."
 ],
 derivationSteps:[
  {title:"جداکردن شتاب مرکزی",text:"معادله حرکت به بخش کپلری و اغتشاش تقسیم می‌شود.",equation:"r̈=−μr/r³+a_pert"},
  {title:"میانگین‌گیری J2",text:"اثر تناوبی سریع حذف و نرخ سکولار عناصر استخراج می‌شود.",equation:"Ω̇=−(3/2)J₂n(Rₑ/p)²cosi"},
  {title:"مدل Drag",text:"فشار دینامیکی در ضریب، سطح بر جرم و جهت سرعت نسبی ضرب می‌شود.",equation:"a_D=−(1/2)ρC_D(A/m)|v_rel|v_rel"},
  {title:"مدل SRP",text:"فشار خورشیدی در ضریب بازتاب و سطح بر جرم ضرب می‌شود.",equation:"a_SRP=P₀C_R(A/m)(AU/r_sun)²"}
 ],
 equations:[
  {title:"گردش گره با J2",text:"Ω̇=−(3/2)J₂n(Rₑ/p)²cosi",explain:"نرخ میانگین تغییر RAAN.",validity:"مرتبه اول J2 و عناصر میانگین."},
  {title:"گردش حضیض با J2",text:"ω̇=(3/4)J₂n(Rₑ/p)²(5cos²i−1)",explain:"نرخ میانگین Argument of Periapsis.",validity:"مرتبه اول J2."},
  {title:"شتاب Drag",text:"a_D=−0.5ρC_D(A/m)|v_rel|v_rel",explain:"بردار خلاف سرعت نسبی جو.",validity:"مدل صفحه تخت با ضرایب مؤثر ثابت."},
  {title:"شتاب SRP",text:"a_SRP=P₀C_R(A/m)(AU/r_sun)²",explain:"مدل ساده Cannonball خارج از سایه.",validity:"تابش مستقیم و سطح مؤثر ثابت."}
 ],
 symbolTable:[
  {symbol:"J₂",name:"ضریب هارمونیک دوم زمین",unit:"—",note:"تقریباً 1.08262668×10⁻³"},{symbol:"p",name:"پارامتر مدار",unit:"km",note:"a(1−e²)"},{symbol:"ρ",name:"چگالی جو",unit:"kg/m³",note:"بسیار متغیر"},{symbol:"C_D",name:"ضریب Drag",unit:"—",note:"وابسته به شکل و محیط"},{symbol:"A/m",name:"نسبت سطح به جرم",unit:"m²/kg",note:"سطح مؤثر"},{symbol:"P₀",name:"فشار تابشی در یک AU",unit:"N/m²",note:"تقریباً 4.56×10⁻⁶"}
 ],
 key:["کوچک‌بودن نیرو به معنی کوچک‌بودن اثر بلندمدت نیست.","J2 می‌تواند به‌عنوان ابزار طراحی استفاده شود.","چگالی ثابت برای پیش‌بینی عمر دقیق کافی نیست.","Mean Elements و Osculating Elements یکسان نیستند."],
 equation:{text:"Ω̇=−(3/2)J₂n(Rₑ/p)²cosi",explain:"نرخ میانگین گردش گره."},
 example:{title:"مدار ۷۰۰ کیلومتری با میل ۹۸ درجه",problem:"نرخ‌های J2 را برای e=0.001 برآورد کنید.",solution:"Ω̇≈0.96317 deg/day و ω̇≈−3.12521 deg/day به دست می‌آید."},
 workedExamples:[
  {title:"مثال ۱ — نرخ گردش گره",problem:"h=700 km، e=0.001 و i=98°.",given:["J₂=1.08262668×10⁻³","Rₑ=6378.137 km"],steps:["a=7078.137 km","p=a(1−e²)","n=√(μ/a³)","رابطه Ω̇ اعمال می‌شود"],result:"Ω̇≈0.96317 deg/day.",sanityCheck:"علامت مثبت برای مدار پس‌رو با cosi منفی انتظار می‌رود."},
  {title:"مثال ۲ — شتاب Drag لحظه‌ای",problem:"ρ=10⁻¹² kg/m³، C_D=2.2، A/m=0.01 و v≈7.67 km/s.",given:["مدار نزدیک 400 km"],steps:["v به m/s تبدیل می‌شود","a_D=0.5ρC_D(A/m)v²"],result:"|a_D|≈6.47×10⁻⁷ m/s².",sanityCheck:"این مقدار بسیار کوچک‌تر از گرانش است ولی پیوسته انرژی می‌گیرد."}
 ],
 conceptChecks:[
  {q:"چرا J2 در SSO مفید است؟",options:["Drag را صفر می‌کند","RAAN را با نرخ طراحی‌شده می‌چرخاند","دوره را مستقل از ارتفاع می‌کند"],answer:1,why:"پیشروی گره برای حفظ زمان محلی عبور استفاده می‌شود.",review:"نرخ Ω را مرور کنید."},
  {q:"کدام فضاپیما به SRP حساس‌تر است؟",options:["A/m بزرگ‌تر","جرم زیاد و سطح کم","همه یکسان"],answer:0,why:"شتاب SRP با نسبت سطح به جرم متناسب است.",review:"مدل SRP را مرور کنید."}
 ],
 numericalExercises:[
  {id:"j2-raan-700",title:"تمرین عددی — گردش گره",statement:"برای h=700 km، e=0.001 و i=98° نرخ Ω را به deg/day بیابید.",answer:0.96317,tolerance:0.003,unit:"deg/day",hints:["p=a(1−e²).","نرخ rad/s را به deg/day تبدیل کنید."],solution:"Ω̇≈0.96317 deg/day."},
  {id:"j2-argp-700",title:"تمرین عددی — گردش حضیض",statement:"برای همان مدار نرخ ω را بیابید.",answer:-3.12521,tolerance:0.01,unit:"deg/day",hints:["از عامل 5cos²i−1 استفاده کنید."],solution:"ω̇≈−3.12521 deg/day."}
 ],
 commonMistakes:[
  {title:"استفاده عناصر Osculating در رابطه Mean",text:"نرخ‌های تحلیلی J2 برای عناصر میانگین‌گیری‌شده تفسیر می‌شوند."},
  {title:"چگالی ثابت به‌عنوان پیش‌بینی قطعی",text:"چگالی ترموسفر با فعالیت خورشیدی به‌شدت متغیر است."},
  {title:"حذف Frame سرعت نسبی",text:"Drag به سرعت نسبت به جو وابسته است، نه صرفاً ECI velocity."}
 ],
 lab:{id:"perturbation-rates",title:"آزمایشگاه نرخ اغتشاش",description:"نرخ‌های J2، شتاب Drag و SRP را برای مشخصات مدار و فضاپیما محاسبه کنید.",tool:"perturbations"},
 validationNotes:["علامت نرخ RAAN برای مدار پس‌رو کنترل می‌شود.","واحدهای SI و km-based در مرز محاسبه جدا نگه داشته می‌شوند.","خروجی Drag و SRP برآورد لحظه‌ای است."],
 sources:[{name:"NASA — Perturbed Orbits",type:"Agency technical training",url:"https://ntrs.nasa.gov/api/citations/20205004141/downloads/Introduction%20to%20Orbitalaft%20Engineers%20CHARTS%20REV%20A.pdf?attachment=true"},{name:"Satellite Orbits",type:"Academic textbook",url:"https://link.springer.com/book/10.1007/978-3-642-58351-3"}]
};
const ch15={
 id:"special-orbit-design",planIndex:15,title:"مدار خورشیدآهنگ، منجمد و تکرارشونده",en:"Sun-Synchronous, Frozen and Repeat-Ground-Track Orbits",level:"پیشرفته",minutes:82,
 lead:"مدارهای ویژه با استفاده هدفمند از اغتشاشات و نسبت‌های تناوبی طراحی می‌شوند. این فصل طراحی را از نام مدار به شرط کمی تبدیل می‌کند.",
 prerequisites:["نرخ‌های J2","رد زمینی","عناصر مداری","حل عددی"],
 learningObjectives:["حل میل SSO","تفسیر LTAN","محاسبه Critical Inclination","فهم Frozen Orbit","طراحی مقدماتی Repeat Ground Track","تشخیص محدودیت روابط مرتبه اول"],
 problemPrompt:"چگونه می‌توان از غیرکروی‌بودن زمین استفاده کرد تا صفحه مدار تقریباً همراه خورشید بچرخد، بدون مصرف مداوم پیشرانه؟",
 assumptions:["روابط J2 مرتبه اول‌اند.","هدف SSO نرخ متوسط سالانه خورشید است.","Repeat Ground Track با زمین کروی و دوره ساده آغاز می‌شود.","طراحی نهایی به اغتشاشات و چرخه دقیق نیاز دارد."],
 definitions:[
  {term:"Sun-Synchronous Orbit",description:"مداری با نرخ گردش گره نزدیک حرکت ظاهری سالانه خورشید."},
  {term:"Local Time of Ascending Node",description:"زمان خورشیدی محلی عبور صعودی از استوا."},
  {term:"Critical Inclination",description:"میلی که نرخ مرتبه اول چرخش حضیض J2 را صفر می‌کند."},
  {term:"Frozen Orbit",description:"ترکیبی از عناصر که تغییرات بلندمدت خروج از مرکز و حضیض را محدود می‌کند."},
  {term:"Repeat Ground Track",description:"مداری که رد زمینی آن پس از تعداد مشخص دور و روز تکرار می‌شود."}
 ],
 paragraphs:[
  "برای SSO، نرخ RAAN باید نزدیک 360 درجه در سال باشد. چون Ω̇ با cosi متناسب است، مدار معمولاً پس‌رو و میل آن کمی بیش از 90 درجه است.",
  "LTAN هندسه نور و شرایط حرارتی را تعیین می‌کند. دو SSO با ارتفاع و میل مشابه اما LTAN متفاوت، شرایط تصویربرداری و سایه متفاوت دارند.",
  "Critical Inclination از صفرشدن جمله 5cos²i−1 به دست می‌آید. Frozen Orbit معمولاً علاوه بر میل، خروج از مرکز و Argument of Periapsis مناسب می‌خواهد.",
  "Repeat Ground Track نسبت دوره گره‌ای به چرخش زمین را به کسر صحیح پیوند می‌دهد. مدل ساده با دوره کپلری آغاز می‌شود ولی طراحی دقیق J2 را نیز وارد می‌کند."
 ],
 derivationSteps:[
  {title:"هدف SSO",text:"صفحه مدار باید با نرخ متوسط حرکت خورشید پیشروی کند.",equation:"Ω̇_target≈2π/year"},
  {title:"حل cosi",text:"رابطه J2 برای i حل می‌شود.",equation:"cosi=−Ω̇_target/[1.5J₂n(Rₑ/p)²]"},
  {title:"Critical Inclination",text:"نرخ ω مرتبه اول صفر قرار داده می‌شود.",equation:"5cos²i−1=0"},
  {title:"Repeat ratio",text:"تعداد دور در چرخه با تعداد روزها مقایسه می‌شود.",equation:"T_nodal≈N_days T_sidereal/N_revs"}
 ],
 equations:[
  {title:"میل SSO",text:"i=acos(−Ω̇_sun/[1.5J₂n(Rₑ/p)²])",explain:"حل مرتبه اول میل پس‌رو.",validity:"مدل J2 میانگین و هدف نرخ ثابت."},
  {title:"Critical Inclination",text:"i_c=acos(√(1/5))≈63.4349°",explain:"صفرشدن نرخ ω مرتبه اول.",validity:"فقط جمله J2."},
  {title:"دوره تکرار ساده",text:"T≈N_days T_sidereal/N_revs",explain:"دوره هدف برای نسبت تکرار.",validity:"تقریب اولیه پیش از اصلاح Nodal Period."},
  {title:"نیم‌محور از دوره",text:"a=[μ(T/2π)²]^(1/3)",explain:"ارتفاع اولیه طراحی تکرار.",validity:"مدل دو جسم."}
 ],
 symbolTable:[
  {symbol:"Ω̇_sun",name:"نرخ هدف خورشیدی",unit:"rad/s",note:"تقریباً 360°/year"},{symbol:"LTAN",name:"زمان محلی گره صعودی",unit:"hour",note:"هندسه خورشید"},{symbol:"i_c",name:"میل بحرانی",unit:"deg",note:"63.4349 یا 116.5651"},{symbol:"N_revs",name:"تعداد دور چرخه",unit:"—",note:"عدد صحیح"},{symbol:"N_days",name:"تعداد روز چرخه",unit:"—",note:"عدد صحیح"}
 ],
 key:["SSO معمولاً مدار پس‌رو است.","LTAN بخشی از تعریف عملیاتی SSO است.","Critical Inclination به تنهایی Frozen Orbit کامل نمی‌سازد.","Repeat Ground Track دقیق به Nodal Period نیاز دارد."],
 equation:{text:"cosi=−Ω̇_sun/[1.5J₂n(Rₑ/p)²]",explain:"حل میل SSO مرتبه اول."},
 example:{title:"SSO در ارتفاع ۷۰۰ km",problem:"میل تقریبی مدار دایروی را بیابید.",solution:"i≈98.18798° به دست می‌آید."},
 workedExamples:[
  {title:"مثال ۱ — میل خورشیدآهنگ",problem:"h=700 km و e=0.",given:["Target=360°/365.2422 day","J₂=1.08262668×10⁻³"],steps:["a=7078.137 km","n و p محاسبه می‌شوند","cosi از نرخ هدف حل می‌شود"],result:"i≈98.18798°.",sanityCheck:"مدار باید پس‌رو و کمی بیش از 90 درجه باشد."},
  {title:"مثال ۲ — تکرار ۱۴ دور در روز نجومی",problem:"نیم‌محور تقریبی را بیابید.",given:["N_revs=14","N_days=1"],steps:["T=86164.09/14=6154.58 s","a=[μ(T/2π)²]^(1/3)"],result:"a≈7258.689 km و h≈880.552 km.",sanityCheck:"این فقط تخمین دو جسم است و J2 اصلاح می‌خواهد."}
 ],
 conceptChecks:[
  {q:"چرا SSO معمولاً میل بیش از ۹۰ درجه دارد؟",options:["برای ایجاد نرخ RAAN مثبت با J2","برای صفرکردن گرانش","برای GEO شدن"],answer:0,why:"cosi منفی نرخ گره را برای هدف خورشیدی مثبت می‌کند.",review:"علامت رابطه J2 را مرور کنید."},
  {q:"Critical Inclination چه چیزی را صفر می‌کند؟",options:["دوره","نرخ مرتبه اول ω","خروج از مرکز"],answer:1,why:"عامل 5cos²i−1 صفر می‌شود.",review:"رابطه ω̇ را مرور کنید."}
 ],
 numericalExercises:[
  {id:"sso-i-700",title:"تمرین عددی — میل SSO",statement:"برای مدار دایروی ۷۰۰ km میل خورشیدآهنگ مرتبه اول را بیابید.",answer:98.18798,tolerance:0.02,unit:"deg",hints:["نرخ هدف 2π/year است.","cosi را از Ω̇ حل کنید."],solution:"i≈98.18798°."},
  {id:"repeat-14-height",title:"تمرین عددی — ارتفاع تکرار ساده",statement:"برای ۱۴ دور در یک روز نجومی ارتفاع دو جسم را بیابید.",answer:880.552,tolerance:1,unit:"km",hints:["T=T_sidereal/14.","a از قانون سوم کپلر."],solution:"h≈880.552 km."}
 ],
 commonMistakes:[
  {title:"استفاده سال ۳۶۵ روز دقیق",text:"نرخ هدف و قرارداد سال باید صریح باشد."},
  {title:"برابرگرفتن Polar و SSO",text:"هر مدار قطبی نرخ گره خورشیدآهنگ ندارد."},
  {title:"استفاده دوره کپلری برای تکرار دقیق",text:"Nodal Period و اغتشاشات باید در طراحی نهایی وارد شوند."}
 ],
 lab:{id:"special-orbit-designer",title:"آزمایشگاه مدارهای ویژه",description:"میل SSO، Critical Inclination و ارتفاع اولیه Repeat Ground Track را محاسبه کنید.",tool:"special-orbits"},
 validationNotes:["حل SSO باید در ارتفاع‌های معمول میل 97 تا 99 درجه بدهد.","اگر |cosi|>1 باشد ترکیب ارتفاع و هدف شدنی نیست.","Repeat result برچسب preliminary دارد."],
 sources:[{name:"NASA — Sun-Synchronous and Molniya Orbits",type:"Agency technical training",url:"https://ntrs.nasa.gov/api/citations/20205004141/downloads/Introduction%20to%20Orbitalaft%20Engineers%20CHARTS%20REV%20A.pdf?attachment=true"},{name:"ESA — Types of Orbits",type:"Agency reference",url:"https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits"}]
};
const ch16={
 id:"lifetime-stationkeeping-disposal",planIndex:16,title:"عمر مداری، نگهداری و دفع",en:"Orbit Lifetime, Station Keeping and Disposal",level:"پیشرفته",minutes:84,
 lead:"طراحی مدار با تزریق پایان نمی‌یابد. افت ارتفاع، نگهداری، رزرو پیشرانه و دفع باید از آغاز مأموریت در بودجه دیده شوند.",
 prerequisites:["Drag","انرژی مداری","مانور ضربه‌ای","محیط جو بالا"],
 learningObjectives:["محاسبه Ballistic Coefficient","برآورد نرخ افت لحظه‌ای","تحلیل حساسیت چگالی","تخمین بودجه Reboost","تفکیک دفع LEO و GEO","بیان محدودیت برآورد عمر"],
 problemPrompt:"چرا نمی‌توان فقط با یک چگالی ثابت، تاریخ بازورود ماهواره را با دقت پیش‌بینی کرد و با این حال یک مدل ساده چه اطلاعات مفیدی می‌دهد؟",
 assumptions:["مدار نمونه دایروی است.","چگالی در بازه کوتاه ثابت فرض می‌شود.","سطح و ضرایب مؤثر ثابت‌اند.","برآورد زمان فقط حساسیت است، نه پیش‌بینی عملیاتی."],
 definitions:[
  {term:"Ballistic Coefficient",description:"نسبت جرم به C_DA که مقاومت جسم در برابر افت ناشی از Drag را توصیف می‌کند."},
  {term:"Orbit Lifetime",description:"زمان تا رسیدن مدار به معیار پایان یا بازورود تحت مدل محیط و عملیات."},
  {term:"Reboost",description:"مانور افزایش انرژی برای جبران افت ارتفاع."},
  {term:"Station Keeping",description:"مانورهای نگهداری عناصر در محدوده عملیاتی."},
  {term:"Passivation",description:"کاهش انرژی ذخیره‌شده پس از پایان مأموریت."},
  {term:"Graveyard Orbit",description:"ناحیه دفع بالاتر از GEO برای کاهش تداخل با مدار عملیاتی."}
 ],
 paragraphs:[
  "Ballistic Coefficient ترکیب جرم، سطح و ضریب Drag است. جسم سنگین با سطح کم معمولاً کندتر از جسم سبک و گسترده افت می‌کند.",
  "چگالی ترموسفر به شار خورشیدی، فعالیت ژئومغناطیسی، زمان محلی و ارتفاع وابسته است. تغییر چندمرتبه‌ای چگالی باعث عدم‌قطعیت شدید عمر می‌شود.",
  "Reboost انرژی از دست‌رفته را بازمی‌گرداند. بودجه باید عدم‌قطعیت محیط، خطای تزریق، نگهداری، اجتناب برخورد و دفع را جداگانه ببیند.",
  "در LEO معمولاً کاهش ارتفاع و بازورود هدف است؛ در GEO افزایش ارتفاع به Graveyard و Passivation انجام می‌شود. قواعد دقیق به مقررات و Epoch مأموریت وابسته‌اند."
 ],
 derivationSteps:[
  {title:"شتاب Drag",text:"مدل لحظه‌ای شتاب اتلافی ساخته می‌شود.",equation:"a_D=0.5ρC_D(A/m)v²"},
  {title:"نرخ انرژی",text:"توان ویژه Drag برابر v·a_D است.",equation:"ε̇≈−a_D v"},
  {title:"ارتباط انرژی و a",text:"برای مدار دایروی ε=−μ/(2a) مشتق گرفته می‌شود.",equation:"ȧ=(2a²/μ)ε̇"},
  {title:"بودجه Reboost",text:"تغییر سرعت تقریبی برای بازگرداندن a برآورد می‌شود.",equation:"Δv≈v|Δa|/(2a)"}
 ],
 equations:[
  {title:"Ballistic Coefficient",text:"B=m/(C_DA)",explain:"B بزرگ‌تر حساسیت کمتر به Drag را نشان می‌دهد.",validity:"ضرایب مؤثر ثابت."},
  {title:"شتاب Drag",text:"a_D=0.5ρC_D(A/m)v²",explain:"اندازه شتاب لحظه‌ای.",validity:"مدل ساده جو و جهت خلاف سرعت."},
  {title:"نرخ نیم‌محور",text:"ȧ=(2a²/μ)ε̇",explain:"اتلاف انرژی را به افت a تبدیل می‌کند.",validity:"مدار نزدیک دایروی و تغییر آهسته."},
  {title:"Reboost تقریبی",text:"Δv≈vΔa/(2a)",explain:"بودجه کوچک برای بازگرداندن شعاع.",validity:"Δa≪a و مدار دایروی."}
 ],
 symbolTable:[
  {symbol:"B",name:"ضریب بالستیک",unit:"kg/m²",note:"m/(C_DA)"},{symbol:"ρ",name:"چگالی جو",unit:"kg/m³",note:"متغیر شدید"},{symbol:"A",name:"سطح مؤثر",unit:"m²",note:"وابسته به نگرش"},{symbol:"ȧ",name:"نرخ نیم‌محور",unit:"m/s",note:"برآورد لحظه‌ای"},{symbol:"Δv_reboost",name:"بودجه افزایش مدار",unit:"m/s",note:"تقریبی"}
 ],
 key:["Lifetime یک خروجی مدل محیط است، نه عدد ثابت.","چگالی ثابت فقط تحلیل حساسیت می‌دهد.","رزرو دفع باید از ابتدا حفاظت شود.","Passivation بخشی از پایان مأموریت است."],
 equation:{text:"ȧ=(2a²/μ)(−a_Dv)",explain:"برآورد لحظه‌ای افت نیم‌محور."},
 example:{title:"حساسیت مدار ۴۰۰ km",problem:"ρ=10⁻¹² kg/m³، C_D=2.2 و A/m=0.01.",solution:"نرخ لحظه‌ای افت حدود 98.8 m/day می‌شود؛ این پیش‌بینی عمر قطعی نیست."},
 workedExamples:[
  {title:"مثال ۱ — Ballistic Coefficient",problem:"m=100 kg، A=1 m² و C_D=2.2.",given:["m=100 kg","A=1 m²","C_D=2.2"],steps:["B=m/(C_DA)","B=45.45 kg/m²"],result:"افزایش جرم یا کاهش سطح B را بالا می‌برد.",sanityCheck:"واحد kg/m² است."},
  {title:"مثال ۲ — افت لحظه‌ای",problem:"مدار ۴۰۰ km با ρ=10⁻¹² و A/m=0.01.",given:["v≈7668.6 m/s","C_D=2.2"],steps:["a_D≈6.47×10⁻⁷ m/s²","ε̇≈−0.00496 m²/s³","ȧ≈−0.001144 m/s"],result:"حدود 98.8 m/day در چگالی ثابت.",sanityCheck:"تغییر چگالی، نتیجه را به همان نسبت تغییر می‌دهد."}
 ],
 conceptChecks:[
  {q:"B بزرگ‌تر معمولاً چه اثری دارد؟",options:["افت سریع‌تر","حساسیت کمتر به Drag","حذف J2"],answer:1,why:"جرم بیشتر نسبت به سطح و Drag، افت را کند می‌کند.",review:"Ballistic Coefficient را مرور کنید."},
  {q:"چرا زمان بازورود قطعی نیست؟",options:["چگالی و نگرش متغیرند","گرانش وجود ندارد","دوره ثابت است"],answer:0,why:"محیط ترموسفر و سطح مؤثر در زمان تغییر می‌کنند.",review:"محدودیت مدل را مرور کنید."}
 ],
 numericalExercises:[
  {id:"ballistic-100-1",title:"تمرین عددی — ضریب بالستیک",statement:"برای m=100 kg، C_D=2.2 و A=1 m²، B را بیابید.",answer:45.4545,tolerance:0.05,unit:"kg/m²",hints:["B=m/(C_DA)."],solution:"B=45.4545 kg/m²."},
  {id:"decay-400-sensitivity",title:"تمرین عددی — نرخ افت",statement:"برای نمونه فصل، قدرمطلق افت روزانه را بیابید.",answer:98.8008,tolerance:0.5,unit:"m/day",hints:["از خروجی مدل Drag و انرژی استفاده کنید."],solution:"|ȧ|≈98.8008 m/day."}
 ],
 commonMistakes:[
  {title:"اعلام Lifetime قطعی",text:"خروجی چگالی ثابت فقط سناریوی حساسیت است."},
  {title:"حذف نگرش",text:"سطح مؤثر با جهت‌گیری فضاپیما تغییر می‌کند."},
  {title:"مصرف رزرو دفع",text:"پیشرانه دفع نباید بدون تحلیل رسمی در عملیات عادی مصرف شود."}
 ],
 lab:{id:"drag-lifetime",title:"آزمایشگاه حساسیت Drag و دفع",description:"چگالی، جرم، سطح و ارتفاع را تغییر دهید و نرخ افت و بودجه Reboost را مقایسه کنید.",tool:"drag-lifetime"},
 validationNotes:["خروجی زمان فقط Constant-density sensitivity است.","واحد SI در مدل Drag استفاده می‌شود.","نتیجه با تغییر خطی ρ و A/m کنترل می‌شود."],
 sources:[{name:"NASA Orbital Mechanics and Environments",type:"Agency technical training",url:"https://ntrs.nasa.gov/api/citations/20205004141/downloads/Introduction%20to%20Orbitalaft%20Engineers%20CHARTS%20REV%20A.pdf?attachment=true"},{name:"ESA Space Debris Mitigation",type:"Agency reference",url:"https://www.esa.int/Space_Safety/Space_Debris"}]
};
const ch17={
 id:"orbit-data-uncertainty",planIndex:17,title:"داده‌های مداری، SGP4 و عدم‌قطعیت",en:"Orbit Data, SGP4 and Uncertainty",level:"پیشرفته",minutes:96,
 lead:"عددهای مداری فقط وقتی معنا دارند که نوع داده، Frame، Epoch، مدل انتشار و عدم‌قطعیت آن‌ها معلوم باشد. این فصل از استفاده نادرست TLE به‌عنوان عناصر کپلری جلوگیری می‌کند.",
 prerequisites:["بردار حالت و عناصر","انتشار مدار","Frame و Epoch","آمار مقدماتی"],
 learningObjectives:["خواندن فیلدهای TLE","اعتبارسنجی Checksum","توضیح Mean و Osculating Elements","تشخیص نیاز SGP4","شناخت OPM/OMM/OEM/OCM","تفسیر Covariance و رشد خطا"],
 problemPrompt:"چرا واردکردن مستقیم عناصر TLE در انتشارگر دو جسم می‌تواند نتیجه ظاهراً معقول ولی از نظر مدل ناسازگار تولید کند؟",
 assumptions:["آزمایشگاه TLE را Parse می‌کند ولی SGP4 کامل اجرا نمی‌کند.","نیم‌محور مشتق‌شده از Mean Motion فقط مقدار تشخیصی است.","مدل عدم‌قطعیت نمونه، قطری و آموزشی است.","داده عملیاتی باید از منبع و مدل معتبر دریافت شود."],
 definitions:[
  {term:"Two-Line Element Set",description:"قالب فشرده عناصر میانگین سازگار با خانواده مدل SGP4."},
  {term:"Mean Elements",description:"عناصری که اثرهای دوره‌ای مشخص در مدل تولید آن‌ها میانگین‌گیری شده‌اند."},
  {term:"Osculating Elements",description:"عناصر مدار کپلری مماس با State لحظه‌ای."},
  {term:"SGP4",description:"مدل انتشار تحلیلی استاندارد برای داده‌های GP/TLE."},
  {term:"TEME",description:"Frame خروجی رایج SGP4 با قرارداد True Equator Mean Equinox."},
  {term:"Covariance",description:"ماتریس عدم‌قطعیت و هم‌بستگی خطای State."},
  {term:"Orbit Data Message",description:"خانواده استاندارد پیام‌های تبادل پارامتر، عناصر، Ephemeris و داده جامع مدار."}
 ],
 paragraphs:[
  "TLE شامل عناصر میانگین، Epoch، Mean Motion، B* و اطلاعات کاتالوگ است. دقت اعشار و مدل تولید بخشی از تعریف داده‌اند.",
  "SGP4 باید با داده GP/TLE استفاده شود. استفاده از یک انتشارگر کپلری ساده، اثرهای تعبیه‌شده و قرارداد Mean Elements را نادیده می‌گیرد.",
  "خروجی SGP4 معمولاً در TEME است و تبدیل به ECEF یا Frame دیگر به زمان و قرارداد دقیق نیاز دارد. نام ECI به تنهایی برای کار دقیق کافی نیست.",
  "Covariance اندازه و جهت ابر عدم‌قطعیت را توصیف می‌کند. انتشار Covariance به State Transition Matrix و مدل نویز وابسته است؛ سه سیگمای ساده فقط مقدمه است."
 ],
 derivationSteps:[
  {title:"اعتبار قالب",text:"طول خطوط، شماره ماهواره و Checksum بررسی می‌شوند.",equation:"checksum=Σdigits+Σminus mod 10"},
  {title:"Epoch",text:"سال دو رقمی و روز سال به زمان کامل تبدیل می‌شود.",equation:"YYDDD.dddddddd → UTC epoch"},
  {title:"Mean Motion",text:"دور بر روز به دوره و تخمین a تبدیل می‌شود.",equation:"n=rev/day, T=86400/n"},
  {title:"انتخاب Propagator",text:"نوع عناصر تعیین می‌کند کدام مدل معتبر است.",equation:"TLE/GP → SGP4"},
  {title:"عدم‌قطعیت",text:"Covariance همراه State و Frame منتشر می‌شود.",equation:"P(t)=ΦP₀Φᵀ+Q"}
 ],
 equations:[
  {title:"دوره از Mean Motion",text:"T=86400/n_rev_day",explain:"دوره تشخیصی از فیلد TLE.",validity:"Mean Motion مدل SGP4؛ جای انتشار کامل نیست."},
  {title:"نیم‌محور تشخیصی",text:"a≈[μ(T/2π)²]^(1/3)",explain:"مقدار تقریبی برای sanity check.",validity:"نباید به‌عنوان تبدیل دقیق TLE به Osculating State تلقی شود."},
  {title:"انتشار Covariance",text:"P=ΦP₀Φᵀ+Q",explain:"ساختار کلی انتشار عدم‌قطعیت.",validity:"مدل خطی‌شده و Q تعریف‌شده."},
  {title:"سه سیگما",text:"3σ_i=3√P_ii",explain:"حد تک‌محوره ساده.",validity:"تفسیر احتمالاتی وابسته به فرض توزیع."}
 ],
 symbolTable:[
  {symbol:"n_rev_day",name:"حرکت میانگین",unit:"rev/day",note:"فیلد TLE"},{symbol:"B*",name:"پارامتر Drag مدل",unit:"1/Earth radii",note:"ضریب فیزیکی مستقیم ساده نیست"},{symbol:"TEME",name:"Frame خروجی SGP4",unit:"—",note:"قرارداد خاص"},{symbol:"P",name:"ماتریس Covariance",unit:"mixed",note:"وابسته به State"},{symbol:"Φ",name:"ماتریس انتقال State",unit:"mixed",note:"مدل خطی‌شده"},{symbol:"Q",name:"نویز فرایند",unit:"mixed",note:"عدم قطعیت مدل"}
 ],
 key:["TLE عناصر کپلری ساده نیست.","Propagator باید با Element Set سازگار باشد.","Frame و Epoch بخشی از داده‌اند.","Covariance بدون ترتیب State و واحدها ناقص است."],
 equation:{text:"TLE/GP → SGP4 → TEME State",explain:"زنجیره سازگار داده و مدل."},
 example:{title:"TLE نمونه ISS",problem:"Epoch، Inclination، e و Mean Motion را استخراج کنید.",solution:"آزمایشگاه خطوط را Parse، Checksum را بررسی و دوره تشخیصی را محاسبه می‌کند؛ انتشار SGP4 خارج از این نمونه است."},
 workedExamples:[
  {title:"مثال ۱ — دوره از Mean Motion",problem:"Mean Motion برابر 15.5 rev/day است.",given:["n=15.5 rev/day"],steps:["T=1440/15.5 min"],result:"T≈92.9032 min.",sanityCheck:"مقدار در محدوده LEO است."},
  {title:"مثال ۲ — سه سیگما",problem:"σ_R=0.2 km، σ_T=1 km و σ_N=0.3 km.",given:["Diagonal covariance"],steps:["3σ_R=0.6 km","3σ_T=3 km","3σ_N=0.9 km"],result:"عدم‌قطعیت Along-track غالب است.",sanityCheck:"این مثال هم‌بستگی‌ها را حذف کرده است."}
 ],
 conceptChecks:[
  {q:"کدام Propagator برای TLE طراحی شده است؟",options:["Kepler ساده","SGP4","فقط Hohmann"],answer:1,why:"TLE Mean Elements برای مدل SGP4 تولید شده‌اند.",review:"سازگاری داده و مدل را مرور کنید."},
  {q:"آیا نیم‌محور مشتق‌شده از Mean Motion برابر Osculating a دقیق است؟",options:["همیشه","خیر؛ فقط sanity check تقریبی است","فقط نام ماهواره مهم است"],answer:1,why:"Mean Motion و عناصر با مدل SGP4 تعریف می‌شوند.",review:"Mean و Osculating را مرور کنید."}
 ],
 numericalExercises:[
  {id:"tle-period-155",title:"تمرین عددی — دوره TLE",statement:"برای Mean Motion=15.5 rev/day دوره را به دقیقه بیابید.",answer:92.9032,tolerance:0.01,unit:"min",hints:["1440 min/day را بر rev/day تقسیم کنید."],solution:"T=92.9032 min."},
  {id:"cov-three-sigma",title:"تمرین عددی — سه سیگما",statement:"اگر σ_Along=1 km باشد، سه سیگما را بیابید.",answer:3,tolerance:0.001,unit:"km",hints:["3σ."],solution:"3 km."}
 ],
 commonMistakes:[
  {title:"انتشار TLE با دو جسم",text:"مسیر کوتاه‌مدت ممکن است ظاهراً درست ولی از نظر مدل ناسازگار باشد."},
  {title:"نادیده‌گرفتن Frame",text:"TEME، GCRF و ECEF قابل جایگزینی مستقیم نیستند."},
  {title:"گزارش State بدون Covariance",text:"برای تصمیم ریسک، مقدار مرکزی به تنهایی کافی نیست."},
  {title:"تفسیر B* به‌عنوان چگالی",text:"B* یک پارامتر مدل است و چگالی مستقیم نیست."}
 ],
 lab:{id:"orbit-data-inspector",title:"آزمایشگاه داده و عدم‌قطعیت",description:"TLE را Parse و اعتبارسنجی کنید، دوره تشخیصی و پیام هشدار مدل را ببینید.",tool:"orbit-data"},
 validationNotes:["Checksum هر خط بررسی می‌شود.","خطوط باید 69 کاراکتر داشته باشند.","آزمایشگاه عمداً SGP4 ناقص یا Kepler ناسازگار اجرا نمی‌کند.","استانداردهای OPM/OMM/OEM/OCM معرفی می‌شوند."],
 sources:[{name:"CelesTrak — SGP4 and TLE Documentation",type:"Technical reference",url:"https://celestrak.org/columns/v04n05/"},{name:"CCSDS Orbit Data Messages",type:"Official standard",url:"https://ccsds.org/Pubs/502x0b3e1.pdf"},{name:"Revisiting Spacetrack Report #3",type:"Validated model reference",url:"https://celestrak.org/publications/AIAA/2006-6753/"}]
};
course.chapters.push(ch14,ch15,ch16,ch17);
course.version="0.17-experimental";
course.time="۲۴ ساعت مطالعه و آزمایشگاه";
course.summary="فاز چهارم مسیر تخصصی، هفده فصل را از مدل دو جسم تا اغتشاش، مدارهای ویژه، عمر مداری، داده‌های SGP4 و عدم‌قطعیت پوشش می‌دهد. نسخه پایدار مستقل باقی مانده است.";
course.objectives=[
 "تحلیل حرکت کپلری و مانورهای مداری",
 "مدل‌سازی نرخ‌های اصلی J2 و حساسیت Drag/SRP",
 "طراحی مقدماتی SSO، Frozen و Repeat Ground Track",
 "برآورد مسئولانه حساسیت عمر و بودجه Reboost",
 "خواندن و اعتبارسنجی TLE بدون استفاده از Propagator ناسازگار",
 "تفسیر Frame، Epoch، Mean Elements و Covariance",
 "ثبت فرض، واحد، مدل و عدم‌قطعیت هر نتیجه"
];
})();
