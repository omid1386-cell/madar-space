(()=>{
const course=window.MADAR_ORBITAL_EXPERIMENTAL;
if(!course)return;
const ch18={
 id:"od-lambert-mission-synthesis",planIndex:18,title:"تعیین مدار، Lambert Problem و طراحی مقدماتی مأموریت",en:"Orbit Determination, Lambert Problem and Preliminary Mission Synthesis",level:"پیشرفته",minutes:118,
 lead:"فصل پایانی سه مسئله متفاوت اما پیوسته را به هم متصل می‌کند: استخراج حالت از داده، ساخت مسیر میان دو نقطه در زمان معین، و تبدیل مسیر به بودجه انرژی و تصمیم مأموریت.",
 prerequisites:["بردار حالت و Frame","انتشار مدار","Covariance و عدم‌قطعیت","مانورهای ضربه‌ای","مقاطع مخروطی","روش‌های عددی و جبر خطی"],
 learningObjectives:["ساخت Measurement Model و Residual","توضیح جریان Weighted Least Squares","تفسیر State Transition Matrix و Covariance","صورت‌بندی Boundary-Value Problem","حل و اعتبارسنجی Lambert Problem صفر‌دور","محاسبه Hyperbolic Excess Velocity و Characteristic Energy","استفاده مسئولانه از Patched Conics","ترکیب نیاز، مدار، عملیات و دفع در طرح مأموریت"],
 problemPrompt:"چگونه از اندازه‌گیری‌های نویزی به State قابل‌اعتماد برسیم، سپس مسیری پیدا کنیم که در زمان مشخص به مقصد برسد، و در پایان نشان دهیم پرتابگر و فضاپیما انرژی کافی برای اجرای آن دارند؟",
 assumptions:["نمونه تعیین مدار، تخمین موقعیت هم‌زمان از Range است و تعیین مدار عملیاتی کامل نیست.","حل Lambert آزمایشگاه صفر‌دور، دو جسم و شاخه انتخاب‌شده است.","Patched Conics اثر هر جسم را در ناحیه جداگانه مدل می‌کند و برهم‌کنش هم‌زمان را حذف می‌کند.","مدارهای سیاره‌ای در محاسبه انرژی نمونه دایروی و هم‌صفحه‌اند.","طرح نهایی باید Frame، Epoch، مدل نیرو، منبع Ephemeris، Covariance و حاشیه را ثبت کند."],
 definitions:[
  {term:"Measurement Model",description:"نگاشتی که State پیش‌بینی‌شده را به Observable مورد انتظار تبدیل می‌کند."},
  {term:"Observable",description:"کمیت ثبت‌شده مانند Range، Azimuth، Elevation یا Doppler که به State وابسته است."},
  {term:"Residual",description:"اختلاف اندازه‌گیری واقعی و مقدار پیش‌بینی‌شده توسط مدل."},
  {term:"Weighted Least Squares",description:"روشی برای یافتن اصلاح State با کمینه‌کردن مجموع مربعات Residualهای وزن‌دار."},
  {term:"State Transition Matrix",description:"ماتریسی که تغییر کوچک State اولیه را به تغییر State در زمان دیگر نگاشت می‌کند."},
  {term:"Boundary-Value Problem",description:"مسئله‌ای که شرط‌ها در دو انتهای بازه، نه فقط در زمان آغاز، داده می‌شوند."},
  {term:"Lambert Problem",description:"یافتن سرعت‌های ابتدا و انتهای مسیر دو جسم میان دو بردار موقعیت با زمان پرواز معلوم."},
  {term:"Patched Conics",description:"تقریب مأموریت چندجسمی با وصله‌کردن مسیرهای دو جسمی در ناحیه نفوذ هر جسم."},
  {term:"Hyperbolic Excess Velocity",description:"سرعت نسبی باقی‌مانده نسبت به جسم وقتی فاصله در مدل هذلولی بسیار بزرگ می‌شود."},
  {term:"Characteristic Energy",description:"مربع Hyperbolic Excess Velocity در خروج از جسم و شاخص انرژی پرتاب."},
  {term:"Sphere of Influence",description:"مرز تقریبی برای تغییر جسم مرکزی غالب در مدل Patched Conics."},
  {term:"Gravity Assist",description:"تغییر جهت و گاهی اندازه سرعت خورشیدمرکز فضاپیما با گذر هذلولی از کنار سیاره."}
 ],
 paragraphs:[
  "Orbit Determination یک مسئله تخمین است. State آزمایشی با مدل دینامیکی به زمان اندازه‌گیری منتشر می‌شود، Measurement Model مقدار پیش‌بینی‌شده را می‌سازد و Residual نشان می‌دهد مدل و داده چقدر با هم اختلاف دارند.",
  "Range به فاصله هندسی حساس است؛ Azimuth و Elevation جهت خط دید را در Frame محلی ایستگاه می‌دهند؛ Doppler یا Range Rate اطلاعات سرعتی فراهم می‌کند. هر Observable به زمان، Frame، مکان ایستگاه، تصحیحات رسانه و Bias ابزار وابسته است.",
  "در Weighted Least Squares، ژاکوبین اندازه‌گیری حساسیت Observable به State را می‌دهد. حل Normal Equation یک اصلاح State تولید می‌کند و این فرایند برای مدل غیرخطی تکرار می‌شود. Residual کوچک به تنهایی کافی نیست؛ هندسه ضعیف یا وزن اشتباه می‌تواند Covariance خوش‌بینانه بسازد.",
  "برای اندازه‌گیری‌هایی در زمان‌های متفاوت، State Transition Matrix حساسیت State هر Epoch به State مرجع را منتقل می‌کند. Covariance باید با همان مدل، واحد و Frame منتشر شود و نویز فرایند سهم عدم‌قطعیت مدل را بیان کند.",
  "Lambert Problem برخلاف Initial Value Problem، دو موقعیت و زمان پرواز را می‌گیرد و سرعت‌های مرزی را می‌سازد. برای یک ورودی ممکن است شاخه کوتاه، بلند، پیش‌رونده، پس‌رونده یا چنددور وجود داشته باشد؛ بنابراین نام شاخه بخشی از جواب است.",
  "در طراحی بین‌سیاره‌ای، سرعت خروجی Lambert با سرعت سیاره مقایسه می‌شود تا Hyperbolic Excess Velocity به دست آید. مربع آن Characteristic Energy است. سپس سرعت حضیض هذلولی، Burn خروج از مدار پارک و ظرفیت پرتابگر محاسبه می‌شوند.",
  "Patched Conics برای طراحی مقدماتی شفاف و سریع است، اما Ephemeris واقعی، اغتشاش جسم سوم، تصحیح میانی، صفحه مدار، پنجره پرتاب و ناوبری را کامل مدل نمی‌کند. پروژه جامع باید نتیجه را همراه محدودیت و مسیر اعتبارسنجی ارائه کند."
 ],
 derivationSteps:[
  {title:"پیش‌بینی اندازه‌گیری",text:"State آزمایشی به زمان داده منتقل و از Measurement Model عبور داده می‌شود.",equation:"ŷᵢ=hᵢ(x̄)"},
  {title:"ساخت Residual",text:"اختلاف مشاهده و پیش‌بینی برای هر داده محاسبه می‌شود.",equation:"r=y−h(x̄)"},
  {title:"خطی‌سازی",text:"تغییر اندازه‌گیری با ژاکوبین نسبت به اصلاح State تقریب زده می‌شود.",equation:"r≈Hδx+ε"},
  {title:"اصلاح وزن‌دار",text:"با وزن معکوس Covariance اندازه‌گیری، اصلاح کمترین مربعات ساخته می‌شود.",equation:"δx=(HᵀWH)⁻¹HᵀWr"},
  {title:"انتشار حساسیت",text:"برای داده زمان‌دار، مشتق نسبت به State مرجع با State Transition Matrix زنجیر می‌شود.",equation:"H₀=HₜΦ(t,t₀)"},
  {title:"صورت‌بندی Lambert",text:"دو بردار موقعیت، زمان پرواز، μ و شاخه مسیر مشخص می‌شوند.",equation:"{r₁,r₂,Δt,μ,branch}→{v₁,v₂}"},
  {title:"وصله انرژی خروج",text:"سرعت انتقال و سیاره تفریق برداری می‌شوند و سرعت حضیض هذلولی به دست می‌آید.",equation:"v∞=|v_sc−v_planet|, v_p=√(v∞²+2μ_p/r_p)"},
  {title:"بستن طرح مأموریت",text:"نیازها، مدل، بودجه، عدم‌قطعیت، عملیات و دفع در یک زنجیره قابل ردگیری جمع می‌شوند.",equation:"Requirement→Orbit→Trajectory→Budget→Operations→Disposal"}
 ],
 equations:[
  {title:"Range هندسی",text:"ρ=|r_sc−r_station|",explain:"فاصله خط دید میان ایستگاه و فضاپیما.",validity:"پس از همسان‌سازی Frame و Epoch و پیش از تصحیحات دقیق رسانه‌ای."},
  {title:"Residual اندازه‌گیری",text:"r=y−h(x̄)",explain:"قرارداد علامت باید در کل حل ثابت بماند.",validity:"مدل مشاهده و واحد مشخص."},
  {title:"حل Weighted Least Squares",text:"δx=(HᵀWH)⁻¹HᵀWr",explain:"اصلاح خطی State در یک تکرار.",validity:"رتبه کافی، وزن معتبر و خطی‌سازی محلی."},
  {title:"Covariance رسمی",text:"P≈(HᵀWH)⁻¹",explain:"تقریب Covariance پس از خطی‌سازی.",validity:"مدل آماری سازگار؛ ممکن است به ضریب واریانس نیاز داشته باشد."},
  {title:"شرط Lambert",text:"r(t₁)=r₁, r(t₂)=r₂, t₂−t₁=Δt",explain:"شرایط مرزی مسیر دو جسم.",validity:"μ مرکزی ثابت در هر قطعه."},
  {title:"Hyperbolic Excess Velocity",text:"v⃗∞=v⃗_sc−v⃗_planet",explain:"سرعت نسبی ورود یا خروج در مرز تقریب جسم.",validity:"بردارها در Frame و Epoch یکسان."},
  {title:"Characteristic Energy",text:"C3=v∞²",explain:"شاخص انرژی خروج نسبت به جسم مبدأ.",validity:"واحد معمول km²/s²."},
  {title:"Sphere of Influence",text:"r_SOI≈a_p(m_p/m_s)^(2/5)",explain:"مرز تقریبی وصله مسیر دو جسمی.",validity:"تقریب لاپلاس و طراحی مقدماتی."}
 ],
 symbolTable:[
  {symbol:"y, ŷ",name:"اندازه‌گیری و پیش‌بینی",unit:"وابسته به Observable",note:"برای Range بر حسب km"},
  {symbol:"r",name:"بردار Residual",unit:"mixed",note:"مشاهده منهای پیش‌بینی"},
  {symbol:"H",name:"ژاکوبین Measurement Model",unit:"mixed",note:"حساسیت به State"},
  {symbol:"W",name:"ماتریس وزن",unit:"inverse variance",note:"اغلب R⁻¹"},
  {symbol:"Φ",name:"State Transition Matrix",unit:"mixed",note:"از Epoch مرجع تا زمان داده"},
  {symbol:"P",name:"Covariance حالت",unit:"mixed",note:"Frame و ترتیب State الزامی"},
  {symbol:"Δt",name:"زمان پرواز",unit:"s",note:"ورودی Lambert"},
  {symbol:"v∞",name:"Hyperbolic Excess Velocity",unit:"km/s",note:"برداری است"},
  {symbol:"C3",name:"Characteristic Energy",unit:"km²/s²",note:"v∞²"},
  {symbol:"r_SOI",name:"شعاع Sphere of Influence",unit:"km",note:"مرز تقریبی"}
 ],
 key:["Residual باید با واحد، وزن و قرارداد علامت گزارش شود.","کوچک‌شدن Residual جای آزمون مشاهده‌پذیری و Covariance را نمی‌گیرد.","جواب Lambert بدون شاخه مسیر و Frame کامل نیست.","C3 مربع یک سرعت نسبی است، نه کل Delta-v پرتاب.","Patched Conics ابزار طراحی مقدماتی است، نه جایگزین انتشار چندجسمی دقیق.","طرح مأموریت باید پایان عمر و عدم‌قطعیت را از ابتدا وارد کند."],
 equation:{text:"{Measurements, Dynamics}→State±Covariance→Lambert→v∞,C3→Mission Budget",explain:"زنجیره نهایی از داده تا تصمیم مأموریت."},
 example:{title:"مرجع Lambert کلاسیک",problem:"r₁=[5000,10000,2100] km، r₂=[−14600,2500,7000] km و Δt=3600 s است.",solution:"حل صفر‌دور پیش‌رونده سرعت آغاز نزدیک [−5.9925,1.9254,3.2456] km/s و سرعت پایان نزدیک [−3.3125,−4.1966,−0.3853] km/s می‌دهد."},
 workedExamples:[
  {title:"مثال ۱ — Residual و وزن",problem:"دو Range به‌ترتیب Residual برابر 0.2 و 0.2 km دارند، اما Sigma آن‌ها 0.1 و 1 km است.",given:["r₁=r₂=0.2 km","σ₁=0.1 km","σ₂=1 km"],steps:["Residual نرمال‌شده اول 2 است","Residual نرمال‌شده دوم 0.2 است","وزن با 1/σ² تغییر می‌کند"],result:"داده اول صد برابر وزن اسکالر داده دوم دارد، هرچند Residual خام برابر است.",sanityCheck:"مقایسه Residual خام بدون Sigma گمراه‌کننده است."},
  {title:"مثال ۲ — حل مرجع Lambert",problem:"مسیر مرجع سه‌بعدی را در 3600 s حل کنید.",given:["μ=398600.4418 km³/s²","r₁=[5000,10000,2100] km","r₂=[−14600,2500,7000] km"],steps:["زاویه انتقال و شاخه پیش‌رونده تعیین می‌شود","معادله زمان پرواز متغیر عمومی حل می‌شود","ضرایب f و g سرعت‌های مرزی را می‌سازند"],result:"v₁≈[−5.99250,1.92537,3.24564] km/s و v₂≈[−3.31246,−4.19662,−0.38529] km/s.",sanityCheck:"بازسازی r₂ با f r₁+g v₁ باید Residual مرزی نزدیک دقت ماشین بدهد."},
  {title:"مثال ۳ — انرژی مقدماتی زمین تا مریخ",problem:"مدارهای دایروی هم‌صفحه و انتقال هوهمن خورشیدمرکز فرض شوند.",given:["r_E=149597870.7 km","r_M=227939200 km","پارک زمین 200 km"],steps:["سرعت انتقال و سیاره در زمین مقایسه می‌شوند","v∞ خروج محاسبه می‌شود","C3=v∞²","سرعت حضیض هذلولی با سرعت دایروی پارک مقایسه می‌شود"],result:"زمان انتقال ≈258.866 day، v∞≈2.94469 km/s، C3≈8.67121 km²/s² و Burn خروج ≈3.61138 km/s.",sanityCheck:"C3 با Delta-v خروج یکی نیست و واحد آن مربع سرعت است."}
 ],
 conceptChecks:[
  {q:"Residual کوچک چه چیزی را به‌تنهایی تضمین نمی‌کند؟",options:["رتبه و مشاهده‌پذیری مناسب","اجرای تفریق","وجود عدد خروجی"],answer:0,why:"هندسه ضعیف می‌تواند با Residual کوچک همچنان State نامطمئن بسازد.",review:"Weighted Least Squares و Covariance را مرور کنید."},
  {q:"Lambert Problem کدام داده‌ها را مستقیماً می‌گیرد؟",options:["دو موقعیت و زمان پرواز","فقط یک State اولیه","فقط C3"],answer:0,why:"این مسئله یک Boundary-Value Problem با دو موقعیت مرزی است.",review:"صورت‌بندی Lambert را مرور کنید."},
  {q:"Characteristic Energy چگونه تعریف می‌شود؟",options:["C3=v∞²","C3=Delta-v","C3=μ/r"],answer:0,why:"C3 مربع Hyperbolic Excess Velocity نسبت به جسم خروج است.",review:"وصله انرژی خروج را مرور کنید."},
  {q:"محدودیت اصلی Patched Conics چیست؟",options:["هر قطعه را دو جسمی و جدا مدل می‌کند","هیچ Frame لازم ندارد","Covariance را دقیق منتشر می‌کند"],answer:0,why:"اثرهای هم‌زمان چند جسم و جزئیات Ephemeris در تقریب ساده حذف می‌شوند.",review:"محدوده اعتبار وصله مخروطی را مرور کنید."}
 ],
 numericalExercises:[
  {id:"lambert-v1-magnitude",title:"تمرین عددی — اندازه سرعت Lambert",statement:"برای مثال مرجع، اندازه v₁ را از مولفه‌های [−5.99250,1.92537,3.24564] بیابید.",answer:7.08175,tolerance:0.01,unit:"km/s",hints:["از ریشه مجموع مربعات سه مولفه استفاده کنید."],solution:"|v₁|≈7.08175 km/s."},
  {id:"earth-mars-c3",title:"تمرین عددی — C3",statement:"اگر v∞ خروج زمین 2.94469 km/s باشد، C3 را بیابید.",answer:8.6712,tolerance:0.02,unit:"km²/s²",hints:["سرعت را به توان دو برسانید."],solution:"C3≈8.6712 km²/s²."},
  {id:"range-normalized-residual",title:"تمرین عددی — Residual نرمال‌شده",statement:"برای Residual برابر 0.2 km و Sigma برابر 0.1 km، مقدار r/σ را بیابید.",answer:2,tolerance:0.001,unit:"—",hints:["Residual را بر Sigma تقسیم کنید."],solution:"r/σ=2."}
 ],
 commonMistakes:[
  {title:"ترکیب Frame و Epoch",text:"تفریق بردارهای موقعیت یا سرعت فقط پس از همسان‌سازی Frame و زمان معتبر است."},
  {title:"اعتماد به Residual خام",text:"Residual باید نسبت به Sigma، هندسه، Bias و Degrees of Freedom تفسیر شود."},
  {title:"گزارش یک جواب Lambert بدون شاخه",text:"جهت، مسیر کوتاه یا بلند و تعداد دور می‌توانند جواب را تغییر دهند."},
  {title:"برابرگرفتن C3 با Delta-v",text:"C3 انرژی مشخصه و مربع v∞ است؛ Burn از مدار پارک به گرانش جسم نیز وابسته است."},
  {title:"استفاده عملیاتی از Patched Conics",text:"طرح پرواز نهایی به Ephemeris، مدل چندجسمی، تصحیح مسیر و تحلیل عدم‌قطعیت نیاز دارد."}
 ],
 lab:{id:"lambert-solver",title:"آزمایشگاه Lambert و کنترل شرایط مرزی",description:"دو بردار موقعیت و زمان پرواز را وارد کنید؛ سرعت‌های مرزی، شاخه مسیر و Residual را ببینید.",tool:"lambert"},
 validationNotes:["حل مرجع با پاسخ منتشرشده مستقل مقایسه می‌شود.","Residual زمان و بازسازی موقعیت انتهایی هر دو گزارش می‌شوند.","آزمایشگاه Lambert صفر‌دور است و حالت هم‌خط را رد می‌کند.","آزمایشگاه OD عمداً تعیین مدار دینامیکی کامل نامیده نمی‌شود.","خروجی Patched Conics با واحد km و s و مدل دایروی هم‌صفحه برچسب می‌خورد."],
 sources:[
  {name:"NASA/JPL — Basics of Space Flight: Navigation",type:"Agency educational reference",url:"https://science.nasa.gov/learn/basics-of-space-flight/chapter13-1/"},
  {name:"CCSDS — Navigation Data Messages",type:"Official standard family",url:"https://ccsds.org/publications/"},
  {name:"Revisiting Lambert’s Problem",type:"Peer-reviewed astrodynamics reference",url:"https://doi.org/10.1007/s10569-014-9587-y"},
  {name:"Fundamentals of Astrodynamics",type:"Academic textbook",url:"https://store.doverpublications.com/products/9780486600611"}
 ]
};
course.chapters.push(ch18);
course.version="0.18-experimental";
course.time="۲۸ ساعت مطالعه، آزمایشگاه و پروژه جامع";
course.summary="نسخه نهایی مسیر تخصصی آزمایشی شامل هجده فصل، پانزده آزمایشگاه، تعیین مدار مقدماتی، حل Lambert، طراحی انرژی Patched Conics، پروژه جامع مأموریت و آزمون پایانی است. نسخه پایدار همچنان مستقل و دست‌نخورده باقی مانده است.";
course.objectives=[
 "ساخت State و انتشار آن در Frame و Epoch مشخص",
 "تحلیل مدار، Ground Track، مانور، انتقال و Rendezvous",
 "مدل‌سازی مسئولانه J2، Drag، SRP، عمر و دفع",
 "کار با TLE/SGP4، Covariance، Measurement و Residual بدون ناسازگاری مدل",
 "حل Lambert صفر‌دور و کنترل شرایط مرزی",
 "محاسبه v∞، C3، Sphere of Influence و بودجه مقدماتی Patched Conics",
 "تدوین طرح مأموریت با نیاز، حاشیه، عملیات، عدم‌قطعیت و پایان عمر"
];
course.capstone={
 title:"پروژه جامع — طراحی مقدماتی مأموریت رصد زمین",
 en:"Capstone — Preliminary Earth-Observation Mission Design",
 brief:"یک مأموریت رصد زمین را از نیاز تا پایان عمر ببندید. خروجی باید نشان دهد چرا مدار انتخاب شده، چگونه با داده و اغتشاش نگهداری می‌شود، بودجه Delta-v چگونه بسته می‌شود و چه محدودیت‌هایی هنوز به ابزار دقیق‌تر سپرده می‌شوند.",
 deliverables:[
  "سه نیاز قابل سنجش برای پوشش، زمان بازدید یا هندسه نور",
  "انتخاب خانواده مدار، ارتفاع، میل، Epoch و Frame",
  "دوره، سرعت، رد زمینی و دسترسی مقدماتی ایستگاه",
  "تحلیل J2 و توضیح رابطه مدار با زمان محلی عبور",
  "بودجه Delta-v شامل تزریق، تصحیح، نگهداری، حاشیه و دفع",
  "سناریوی Drag و عمر با حداقل سه چگالی",
  "قالب داده خروجی، مدل Propagator و بیانیه Covariance",
  "طرح پایان عمر و فهرست اعتبارسنجی بعدی"
 ],
 rubric:[
  {criterion:"ردگیری نیاز تا انتخاب مدار",weight:20},
  {criterion:"صحت مدل، واحد، Frame و Epoch",weight:20},
  {criterion:"محاسبات مدار، مانور و بودجه",weight:25},
  {criterion:"اغتشاش، عدم‌قطعیت و محدودیت",weight:20},
  {criterion:"عملیات، دفع و کیفیت گزارش",weight:15}
 ],
 pass:70
};
course.finalAssessment={title:"ارزیابی جامع هجده‌فصلی",questionCount:18,passPercent:70,passScore:13,note:"برای ثبت تکمیل، حداقل ۱۳ پاسخ درست از ۱۸ پرسش لازم است. پاسخ‌ها در پیشرفت مستقل این مسیر ذخیره می‌شوند."};
course.quiz=[
 {q:"برای روابط گرانشی، فاصله r از کجا سنجیده می‌شود؟",options:["از سطح جسم","از مرکز جسم اصلی","از ایستگاه زمینی"],answer:1,why:"مدل مرکزی از فاصله مرکز تا مرکز استفاده می‌کند."},
 {q:"کدام کمیت صفحه مدار دو جسم را ثابت نگه می‌دارد؟",options:["Specific Angular Momentum","ارتفاع","Mean Anomaly"],answer:0,why:"نیروی مرکزی گشتاور ندارد و بردار h پایسته است."},
 {q:"انرژی مکانیکی ویژه مثبت چه مسیری می‌دهد؟",options:["بیضوی","هذلولی","دایروی"],answer:1,why:"انرژی مثبت به مسیر باز با سرعت نهایی غیرصفر مربوط است."},
 {q:"برای مدار دایروی، کدام زاویه کلاسیک تکین می‌شود؟",options:["Argument of Periapsis","Inclination همیشه","Epoch"],answer:0,why:"در مدار دایروی جهت حضیض یکتا نیست."},
 {q:"در حل بیضوی Kepler’s Equation چه رابطه‌ای برقرار است؟",options:["M=E−e sinE","M=e sinhH−H","C3=v∞²"],answer:0,why:"این رابطه حالت بیضوی را تعریف می‌کند."},
 {q:"Ground Track از ترکیب چه دو حرکتی ساخته می‌شود؟",options:["حرکت مداری و چرخش زمین","فقط Drag","فقط Plane Change"],answer:0,why:"تصویر زیرماهواره‌ای هم به مدار و هم به دوران زمین وابسته است."},
 {q:"Plane Change در کدام محل معمولاً ارزان‌تر است؟",options:["محل سرعت کمتر","محل سرعت بیشتر","هردو یکسان"],answer:0,why:"هزینه چرخاندن بردار سرعت با اندازه سرعت رشد می‌کند."},
 {q:"Hohmann Transfer ایده‌آل چند Burn دارد؟",options:["یک","دو","سه"],answer:1,why:"یک Burn برای ورود و یک Burn برای دایروی‌سازی دارد."},
 {q:"HCW برای چه وضعیتی معتبرتر است؟",options:["فاصله نسبی کوچک و مدار مرجع دایروی","هر مسیر بین‌سیاره‌ای","فقط بازورود"],answer:0,why:"مدل از خطی‌سازی پیرامون مدار دایروی به دست می‌آید."},
 {q:"نرخ RAAN ناشی از J2 در SSO چه نقشی دارد؟",options:["همراهی صفحه با حرکت ظاهری خورشید","صفرکردن Drag","ثابت‌کردن جرم"],answer:0,why:"پیشروی گره زمان محلی عبور را تقریباً حفظ می‌کند."},
 {q:"چرا چگالی ثابت برای Orbit Lifetime کافی نیست؟",options:["چگالی ترموسفر با زمان و خورشید تغییر می‌کند","سرعت صفر است","J2 حذف می‌شود"],answer:0,why:"چگالی می‌تواند چند مرتبه تغییر کند و عمر را شدیداً عوض کند."},
 {q:"TLE باید با کدام مدل منتشر شود؟",options:["SGP4","Kepler ساده","HCW"],answer:0,why:"Mean Elements داده GP/TLE با خانواده SGP4 سازگارند."},
 {q:"Covariance بدون چه اطلاعاتی ناقص است؟",options:["ترتیب State، واحد، Frame و Epoch","رنگ نمودار","نام فایل"],answer:0,why:"تفسیر عددها به تعریف State و مرجع وابسته است."},
 {q:"Residual در Orbit Determination چیست؟",options:["مشاهده منهای پیش‌بینی مدل","خود State","فقط Sigma"],answer:0,why:"Residual اختلاف داده و Measurement Model است."},
 {q:"Weighted Least Squares چرا وزن می‌خواهد؟",options:["برای بازتاب دقت متفاوت اندازه‌گیری‌ها","برای حذف Frame","برای ساخت مدار دایروی"],answer:0,why:"اندازه‌گیری‌های با Sigma متفاوت نباید اثر یکسان داشته باشند."},
 {q:"Lambert Problem چه نوع مسئله‌ای است؟",options:["Boundary-Value Problem","فقط Initial Value Problem","مسئله حرارتی"],answer:0,why:"دو موقعیت در دو انتهای زمان داده می‌شوند."},
 {q:"Characteristic Energy برابر چیست؟",options:["v∞²","Delta-v کل","μ/r²"],answer:0,why:"C3 مربع سرعت اضافی هذلولی است."},
 {q:"در طرح مأموریت چه چیزی باید از آغاز دیده شود؟",options:["عملیات، عدم‌قطعیت و دفع","فقط تصویر نهایی","فقط نام مدار"],answer:0,why:"طرح قابل دفاع نیاز به چرخه کامل مأموریت و محدودیت‌ها دارد."}
];
})();
