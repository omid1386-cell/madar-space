window.MADAR_LAUNCH_DETAILS = {
  0:{
    purpose:"تبدیل هدف مأموریت به یک پیکربندی پروازشدنی و اثبات اینکه ماهواره، پرتابگر، پایگاه، مسیر و بخش زمینی با یکدیگر سازگارند.",
    narrative:["کارزار پرتاب ماه‌ها پیش از T0 آغاز می‌شود. تیم مأموریت مدار تزریق، جرم و مرکز جرم، Envelope، فرکانس‌های طبیعی، محیط آکوستیک و شوک، رابط الکتریکی، توالی جدایش و محدودیت‌های حرارتی ماهواره را با User Guide پرتابگر تطبیق می‌دهد.","ماهواره آزمون‌های ارتعاش، آکوستیک، شوک، خلأ حرارتی و سازگاری الکترومغناطیسی را پشت سر می‌گذارد. پس از سوخت‌گیری، روی Adapter نصب و داخل فیرینگ محصور می‌شود. از این لحظه دسترسی فیزیکی محدود است و سلامت آن با Umbilical و تله‌متری کنترل می‌شود.","تحلیل مأموریت تعیین می‌کند پرتاب در چه روز و آزیموتی انجام شود. برای SSO، زمان محلی گره و صفحه مداری مهم است؛ برای ملاقات با ISS، صفحه مدار مقصد باید از پایگاه بگذرد؛ و برای مأموریت بین‌سیاره‌ای انرژی C3 و جهت خروج، پنجره را محدود می‌کند."],
    sequence:["تثبیت نیازهای مدار و معیار موفقیت","تحلیل بارهای کوپل‌شده پرتابگر–ماهواره","Qualification و Acceptance سخت‌افزار پروازی","سوخت‌گیری، اتصال، Encapsulation و آزمون رابط","بازبینی‌های MRR/FRR و صدور مجوز پرتاب"],
    systems:["مهندسی مأموریت و Flight dynamics","سازه و مکانیزم جدایش","برق، Umbilical و Flight software","سامانه زمینی، Range safety و هواشناسی","شبکه ایستگاه‌های نخستین تماس"],
    telemetry:["فشار و دمای مخازن","ولتاژ باس و باتری ماهواره","Continuity مدارهای Pyro","وضعیت شیرها و خطوط Purge","همگامی ساعت و شبکه فرمان"],
    success:["تمام Interfaceها بسته و نسخه پیکربندی Freeze شده باشد","هیچ Waiver یا ریسک بحرانی بدون پذیرش باقی نماند","مدار هدف، محدوده ایمنی و برنامه نخستین تماس قابل اجرا باشد"],
    failures:["ناسازگاری مکانیکی یا نرم‌افزاری دیرهنگام","آلودگی اپتیک یا خطای سوخت‌گیری","پیش‌بینی نادرست جرم/مرکز جرم","خطای تنظیم شبکه زمینی یا زمان جدایش"],
    example:"برای Sentinel-2، مدار SSO و زمان محلی عبور بخشی از تعریف مأموریت تصویربرداری است؛ بنابراین زمان پرتاب صرفاً با آب‌وهوا تعیین نمی‌شود.",
    engineering:"بیشترین قدرت جلوگیری از شکست در این فاز است؛ زیرا اصلاح Interface روی زمین بسیار ارزان‌تر از تحمل پیامد آن پس از جدایش است."
  },
  1:{
    purpose:"انتقال کنترل از سامانه زمینی به رایانه پرواز، ایجاد احتراق پایدار و آزادکردن وسیله فقط پس از تأیید رانش و سلامت سامانه‌ها.",
    narrative:["در Terminal count بسیاری از فعالیت‌ها خودکار می‌شوند: پرتابگر به برق داخلی می‌رود، مخازن Pressurize می‌شوند، واحدهای ناوبری وارد Flight mode و سامانه ایمنی پرواز Arm می‌شود. هر پارامتر دارای Launch commit criterion است.","در موتور مایع ابتدا شیرها، Igniter و توربوپمپ وارد توالی زمانی دقیق می‌شوند. فشار محفظه و رانش باید به مقدار آستانه برسد؛ سپس Hold-down آزاد می‌شود. در موتور جامد، روشن‌شدن تقریباً غیرقابل برگشت است و Release logic اهمیت بیشتری دارد.","T0 در منابع مختلف ممکن است زمان Ignition، Release یا First motion باشد. برای تحلیل دقیق Timeline باید تعریف مرجع همان مأموریت خوانده شود."],
    sequence:["انتقال ماهواره و پرتابگر به برق داخلی","Pressurization و تنظیم سطح پیشرانه","فعال‌شدن Guidance، Range safety و Flight mode","فرمان Ignition و افزایش فشار محفظه","تأیید Thrust OK و رهاسازی Hold-down"],
    systems:["Ground launch sequencer","Main propulsion و Ignition","Flight computer و Inertial navigation","Hold-down/release mechanism","Flight termination system"],
    telemetry:["Chamber pressure و Injector transient","دور توربوپمپ و فشار ورودی","وضعیت Thrust OK هر موتور","نرخ زاویه‌ای ژیروسکوپ","زمان بازشدن Hold-downها"],
    success:["تمام موتورها در محدوده رانش متقارن باشند","وسیله بدون تماس با سازه زمینی برج را پاک کند","هیچ Leak، Fire یا فرمان Abort ثبت نشود"],
    failures:["Hard start یا ناپایداری احتراق","خاموشی یک موتور پیش از Release","رهاسازی نامتقارن یا دیرهنگام","اشکال Umbilical یا برخورد با برج"],
    example:"Falcon 9 پیش از Release سلامت هر ۹ موتور Merlin را بررسی می‌کند. SLS ابتدا RS-25های مایع و سپس بوسترهای جامد را روشن می‌کند؛ پس از Ignition بوستر جامد، مأموریت باید ادامه یابد.",
    engineering:"چند صد میلی‌ثانیه اختلاف در Build-up رانش یا Release می‌تواند بار جانبی بزرگی بسازد؛ به همین دلیل این فاز با مدل گذرا و آزمون سخت‌افزار واقعی بررسی می‌شود."
  },
  2:{
    purpose:"پاک‌کردن ایمن برج، تنظیم صفحه پرواز و آغاز تبدیل مسیر عمودی به حرکت افقی با زاویه حمله کوچک.",
    narrative:["موشک در ثانیه‌های اول تقریباً عمودی بالا می‌رود تا از برج و جریان‌های پیچیده نزدیک زمین فاصله بگیرد. سپس Roll و Pitch program صفحه پرواز و آزیموت را تنظیم می‌کند.","یک اغتشاش کوچک Pitch باعث می‌شود گرانش به‌تدریج بردار سرعت را خم کند؛ این همان Gravity turn است. هدایت تلاش می‌کند بدنه نزدیک بردار سرعت بماند تا زاویه حمله و بار خمشی کم شود.","رانش‌به‌وزن پایین زمان مقابله با گرانش را زیاد می‌کند؛ رانش‌به‌وزن بسیار بالا شتاب و بار را افزایش می‌دهد. مسیر حاصل یک Trade میان Gravity loss، Drag، Heating، Range safety و قابلیت موتور است."],
    sequence:["First motion و Tower clear","Roll برای هم‌راستاکردن صفحه Guidance","Pitch-over کوچک و آغاز Gravity turn","عبور از لایه‌های باد و Shear","هدایت بسته بر پایه Navigation"],
    systems:["TVC و Gimbal actuator","IMU/GNSS و Navigation filter","Aerodynamic model و Guidance","سازه، مخزن و Slosh","سامانه ایمنی مسیر"],
    telemetry:["زاویه حمله و Sideslip","فرمان و پاسخ Gimbal","شتاب محوری/جانبی","نرخ Pitch/Yaw/Roll","اختلاف مسیر واقعی و مرجع"],
    success:["Tower clearance با حاشیه کافی","قرارگیری در Corridor ایمنی","زاویه حمله و بار خمشی زیر حد","رشد پایدار سرعت افقی"],
    failures:["برخورد با برج یا Umbilical","TVC runaway یا پاسخ کند","باد برشی و بار جانبی","ناپایداری کنترل–سازه یا Slosh"],
    example:"در مأموریت‌های شرق‌سو از Cape Canaveral، Roll program وسیله را با صفحه هدف هم‌راستا می‌کند و هم‌زمان از نواحی پرجمعیت دور نگه می‌دارد.",
    engineering:"مدار با بالا رفتن ساخته نمی‌شود؛ هدف اصلی این فاز آغاز ساخت سرعت مماسی است، بدون آنکه جو غلیظ و سازه بلند اجازه Pitch سریع بدهند."
  },
  3:{
    purpose:"عبور کنترل‌شده از بیشینه بار آیرودینامیکی ترکیبی، در حالی که موتور، سازه و Guidance از حدود مجاز تجاوز نکنند.",
    narrative:["فشار دینامیکی q حاصل نصف چگالی ضربدر مربع سرعت است. نزدیک زمین چگالی زیاد ولی سرعت کم است؛ در ارتفاع بالا سرعت زیاد ولی چگالی کم. بین این دو، q به قله می‌رسد.","Max-Q به‌تنهایی تمام بار نیست. نیروی جانبی تقریباً با q، سطح مرجع، ضریب آیرودینامیکی و زاویه حمله مرتبط است. Gust و Wind shear می‌توانند حالت بار بحرانی را در زمانی متفاوت از قله q ایجاد کنند.","برخی موتورها پیش از Max-Q Throttle down و پس از آن Throttle up می‌کنند. پرتابگرهای جامد امکان Throttle معمول ندارند و مسیر، هندسه Grain و حاشیه سازه نقش بیشتری دارند."],
    equation:"q = ½ ρ v²   |   F_aero ≈ q S C",
    sequence:["افزایش سرعت در Troposphere","عبور از Transonic و تغییر ضرایب آیرودینامیکی","Throttle bucket یا محدودسازی فرمان","ثبت قله q و بار خمشی","Throttle up پس از کاهش چگالی"],
    systems:["Aerodynamics و Air-data estimate","Throttle control و Propulsion","Load-relief guidance","سازه و Aeroelasticity","سنسورهای شتاب و فشار"],
    telemetry:["q تخمینی و Mach","Bending moment پایه","زاویه حمله/باد نسبی","شتاب‌های جانبی","Throttle و فشار محفظه"],
    success:["عبور از قله بدون نقض Load envelope","حفظ Control margin و عدم Flutter","بازگشت موتور به پروفایل رانش برنامه‌ریزی‌شده"],
    failures:["کمانش پوسته یا شکست اتصال","Flutter و کوپل آئروالاستیک","بار جانبی ناشی از Guidance/Wind","آسیب فیرینگ یا Payload"],
    example:"در پخش زنده بسیاری از پرتاب‌ها عبارت Max-Q اعلام می‌شود؛ این یک نقطه محاسباتی در تله‌متری است، نه حسگری که مستقیماً دکمه Max-Q را روشن کند.",
    engineering:"دو برابرشدن سرعت در چگالی ثابت q را چهار برابر می‌کند؛ به همین دلیل خطای کوچک در مدل جو یا زمان‌بندی Throttle می‌تواند حاشیه بار را تغییر دهد."
  },
  4:{
    purpose:"خاموش‌کردن مرحله مصرف‌شده، ایجاد فاصله کنترل‌شده و روشن‌کردن مرحله بعد بدون برخورد مجدد یا ورود گاز نامطلوب به موتور.",
    narrative:["پس از رسیدن به شرط مصرف یا Guidance، MECO/BECO صادر می‌شود. رانش Tail-off بلافاصله صفر نیست و باید در دینامیک جدایش لحاظ شود.","مکانیزم‌های Pyro، Pneumatic pusher یا Collet اتصال را آزاد می‌کنند. فنر یا Thruster جدایش سرعت نسبی می‌سازد. نرخ Tip-off و پراکندگی مرکز جرم نباید باعث Recontact شود.","مرحله بالا پس از تأیید فاصله و شرایط ورودی موتور روشن می‌شود. در بعضی معماری‌ها Hot staging پیش از خاموشی کامل مرحله پایین انجام می‌شود و طراحی حرارتی/سازه‌ای متفاوتی دارد."],
    sequence:["فرمان Cutoff و Tail-off","آزادشدن Interstage/اتصال","ایجاد Separation impulse","تأیید فاصله و نرخ زاویه‌ای","Ignition مرحله بالا و بازیابی Guidance"],
    systems:["Stage separation mechanism","Pyrotechnics یا Pneumatics","Upper-stage ignition","Attitude control","Navigation و event logic"],
    telemetry:["شتاب محوری و Shock","Separation switchها","نرخ زاویه‌ای هر مرحله","فشار ورودی و Chamber مرحله بالا","تصاویر دوربین Onboard"],
    success:["فاصله بدون Recontact","Ignition پایدار در پنجره زمانی","نرخ و نگرش داخل Guidance capture envelope"],
    failures:["جدایش ناقص یا اتصال باقی‌مانده","برخورد مرحله‌ها","روشن‌نشدن مرحله بالا","آسیب نازل از Plume یا Debris"],
    example:"آسیب نازل مرحله دوم Firefly Alpha در FLTA006 نشان داد که رخداد میان جدایش و Ignition می‌تواند حتی با روشن‌ماندن موتور، رانش مؤثر را از بین ببرد.",
    engineering:"مرحله‌بندی عملکرد را افزایش می‌دهد، اما یک نقطه Failure چندفیزیکی شامل Shock، سازه، Plume، نرخ نسبی و منطق نرم‌افزار اضافه می‌کند."
  },
  5:{
    purpose:"حذف پوشش آیرودینامیکی Payload پس از کاهش Heating و فشار، برای کم‌کردن جرم مرده و آماده‌سازی جدایش ماهواره.",
    narrative:["فیرینگ در جو از Payload در برابر فشار، گرمایش، رطوبت، آلودگی و آکوستیک محافظت می‌کند. پس از خروج از جو، نگه‌داشتن آن فقط جرم و محدودیت حرارتی ایجاد می‌کند.","خط جدایش طولی و حلقه پایه آزاد می‌شوند؛ Hinge و Spring نیم‌پوسته‌ها را دور می‌کنند. انعطاف پوسته و Pinching mode باید طوری تحلیل شود که هیچ بخش با Payload تماس نگیرد.","شرط جدایش می‌تواند بر مبنای زمان، ارتفاع، Heat flux یا ترکیبی از Navigation باشد. Payload حساس ممکن است شرط Flux سخت‌گیرانه‌تری داشته باشد."],
    sequence:["تأیید شرط Heating/Pressure","Arm و فرمان جدایش","آزادشدن خط طولی و Base ring","چرخش نیم‌پوسته‌ها و ایجاد Clearance","تأیید Fairing gone"],
    systems:["Fairing structure و acoustic treatment","Separation joint","Hinge/spring actuation","Payload environmental monitoring","Event sequencer"],
    telemetry:["میکروسوئیچ‌های جدایش","Shock accelerometer","دمای Payload","دوربین و تغییر جرم/اینرسی","تأیید مدارهای Pyro"],
    success:["هر دو نیم‌پوسته کاملاً دور شوند","Shock و Tip-off زیر حد Payload","هیچ Contact یا Debris خطرناک رخ ندهد"],
    failures:["عدم بازشدن یک خط جدایش","تماس پوسته با ماهواره","جدایش زودهنگام و Heating","شوک بیش از Qualification"],
    example:"دوربین YPSat در نخستین Ariane 6 جدایش واقعی فیرینگ را ثبت کرد و نشان داد نیم‌پوسته‌ها چگونه با نرخ کنترل‌شده از Upper stage دور می‌شوند.",
    engineering:"جدایش دیرتر ایمن‌تر به نظر می‌رسد، اما هر ثانیه حمل فیرینگ ظرفیت Payload را کم می‌کند؛ زمان مناسب از Trade جرم و محیط به دست می‌آید."
  },
  6:{
    purpose:"رسیدن به بردار حالت مداری پایدار—نه فقط ارتفاع—و ایجاد مدار پارکینگ مناسب برای Coast، Restart یا جدایش.",
    narrative:["برای مدار دایروی LEO، سرعت تقریباً مماسی نزدیک ۷٫۸ km/s لازم است. اگر وسیله در ارتفاع ۲۰۰ km سرعت کافی نداشته باشد، حضیض مسیر داخل زمین یا جو قرار می‌گیرد.","Guidance خاموشی را با Position و Velocity هدف می‌بندد. Cutoff چند ثانیه زود یا دیر، اوج، حضیض و زمان رسیدن به نقاط بعدی را تغییر می‌دهد.","پس از SECO، سامانه Navigation با IMU و GNSS بردار حالت را تخمین می‌زند. مدار اولیه ممکن است عمدی Elliptical باشد تا مرحله یا فیرینگ بازوارد شود، سپس Burn بعدی Circularize کند."],
    equation:"v_circular = √(μ/r)   |   ε = v²/2 − μ/r",
    sequence:["هدایت Powered ascent به Target state","SECO در شرط انرژی/بردار حالت","Coast و Orbit determination","ارزیابی خطای تزریق","آماده‌سازی Burn یا جدایش بعدی"],
    systems:["Powered explicit guidance","Upper-stage propulsion","IMU/GNSS Navigation","Flight dynamics ground system","Attitude control در Coast"],
    telemetry:["بردار موقعیت/سرعت","Apogee/Perigee تخمینی","باقیمانده Propellant","Cutoff residuals","Attitude و نرخ Coast"],
    success:["حضیض بالای حد پایداری مأموریت","خطای تزریق داخل Dispersion مجاز","توانایی انجام رویداد بعدی با Reserve"],
    failures:["Underspeed و بازورود زودهنگام","Overspeed و مدار خارج از دسترس","خطای جهت بردار سرعت","Navigation bias یا Cutoff دیرهنگام"],
    example:"عبارت «Reached space» موفقیت مداری نیست. یک پرواز Suborbital می‌تواند از خط کارمان عبور کند اما سرعت افقی لازم برای یک دور کامل را نداشته باشد.",
    engineering:"مدار یک وضعیت شش‌بعدی است. گزارش تنها یک ارتفاع بدون سرعت، جهت، حضیض و اوج برای قضاوت موفقیت تزریق کافی نیست."
  },
  7:{
    purpose:"تغییر انرژی، شکل یا صفحه مدار با Restart زمان‌بندی‌شده و تحویل Payload به Transfer یا مدار نهایی.",
    narrative:["در Coast، مرحله ممکن است برای رسیدن به Ascending node، Apogee یا نقطه مناسب جدایش صبر کند. مدیریت حرارتی، توان، تبخیر پیشرانه و Attitude در این مدت فعال است.","در بی‌وزنی، مایع کنار خروجی مخزن باقی نمی‌ماند. Ullage thruster یا Settling burn شتاب کوچکی ایجاد می‌کند تا پیشرانه ورودی موتور را بپوشاند؛ سپس Ignition انجام می‌شود.","Burn مماسی در حضیض عمدتاً اوج را بالا می‌برد. Burn در اوج حضیض را تغییر می‌دهد. تغییر صفحه در سرعت کمتر ارزان‌تر است و می‌تواند با Circularization ترکیب شود."],
    equation:"Δv_plane = 2 v sin(Δi/2)   |   v² = μ(2/r − 1/a)",
    sequence:["Coast تا نقطه هدف","Slew به نگرش Burn","Settling/Ullage و آماده‌سازی مخزن","Restart و Guidance بسته","SECO-2 و Orbit determination"],
    systems:["Restartable engine و Igniter","Propellant management device","RCS/Ullage","Thermal و power during coast","Mission sequencing"],
    telemetry:["Settling acceleration","Tank pressure/temperature","Ignition transient","Accumulated Δv","مدار پس از Burn"],
    success:["Restart در نخستین تلاش","Magnitude و direction دلتاوی در خطا","Reserve کافی برای Disposal"],
    failures:["Gas ingestion و Ignition ناموفق","Burn کوتاه/بلند","خطای زمان یا Attitude","Boil-off یا فشار نامناسب"],
    example:"در GTO، Burn مرحله بالا اوج را نزدیک ارتفاع GEO قرار می‌دهد؛ سپس ماهواره یا مرحله دیگر در اوج، مدار را Circularize می‌کند.",
    engineering:"دقت زمان Burn به اندازه مقدار دلتاوی مهم است. همان Δv در نقطه دیگری از مدار، نتیجه هندسی متفاوتی می‌سازد."
  },
  8:{
    purpose:"آزادکردن Payload با سرعت نسبی، نگرش و نرخ کنترل‌شده، بدون برخورد با مرحله یا Payloadهای دیگر.",
    narrative:["پیش از جدایش، مرحله به Attitude هدف می‌رود و نرخ‌ها را کم می‌کند. مکانیزم Clamp band، Bolt یا Spring آزاد و سرعت نسبی معمولاً در حد دهم تا چند متر بر ثانیه ایجاد می‌کند.","برای چند Payload، ترتیب، زاویه و تأخیرها از پیش طراحی می‌شوند. پس از هر جدایش ممکن است مرحله Slew یا Collision avoidance burn انجام دهد.","تأیید جدایش از Microswitch، دوربین، تغییر اینرسی و سپس دریافت Beacon ماهواره می‌آید. بازشدن Solar array معمولاً پس از فاصله ایمن آغاز می‌شود."],
    sequence:["Attitude settle و Arm","فرمان Release","Separation impulse","تأیید switch/camera","Collision avoidance و نخستین Acquisition"],
    systems:["Payload adapter/dispenser","Clamp band و separation spring","Upper-stage RCS","Payload autonomous sequencer","Ground tracking network"],
    telemetry:["Separation switch","Tip-off rate","سرعت نسبی تخمینی","تصویر دوربین","Beacon و سلامت اولیه Payload"],
    success:["فاصله رو به رشد و بدون Recontact","نرخ زاویه‌ای داخل توان Detumble","شروع به‌موقع Sequence ماهواره"],
    failures:["گیرکردن Clamp یا Connector","Tip-off زیاد","برخورد Payloadها","No AOS پس از جدایش"],
    example:"Sentinel-1 حدود ۲۳ دقیقه پس از Liftoff از Fregat جدا شد؛ دوربین مرحله بالا دورشدن ماهواره را ثبت کرد و ایستگاه زمینی بعداً سیگنال را گرفت.",
    engineering:"جدایش فقط بازشدن یک قفل نیست؛ یک شرط اولیه کامل برای فاز مستقل ماهواره است و مستقیماً مصرف سوخت Detumble و ریسک تماس را تعیین می‌کند."
  },
  9:{
    purpose:"تثبیت ماهواره، برقراری توان و ارتباط پایدار، بررسی سلامت و انتقال کنترل‌شده از Launch configuration به عملیات.",
    narrative:["پس از Separation، ماهواره ممکن است با نرخ زاویه‌ای وارد مدار شود. Detumble با Magnetorquer، Thruster یا Reaction wheel انجام و سپس Sun acquisition برای توان مثبت برقرار می‌شود.","Deployment آرایه و آنتن‌ها طبق شرط‌های ایمنی انجام می‌شود. هر Deployment با جریان موتور، Switch، تصویر یا تغییر توان تأیید می‌گردد. اگر تأیید مبهم باشد، Procedure از فرمان تکراری خطرناک جلوگیری می‌کند.","LEOP شامل Orbit determination دقیق، اصلاح تزریق، Checkout زیرسامانه‌ها و انتقال به Commissioning است. Payload تنها پس از تثبیت توان، حرارت، Pointing و Downlink فعال می‌شود."],
    sequence:["First Acquisition of Signal","Detumble و Safe/Sun pointing","بازشدن آرایه و توان مثبت","Orbit determination و correction","Checkout، Commissioning و ورود به عملیات"],
    systems:["ADCS و Safe-mode sensors","EPS/solar array/battery","TT&C و شبکه زمینی","Onboard computer و FDIR","Flight dynamics و operations team"],
    telemetry:["نرخ زاویه‌ای و Attitude mode","ولتاژ، جریان و State of charge","دمای باتری/رایانه/Payload","Deployment status","Link margin و مدار تخمینی"],
    success:["توان در تمام Eclipseها مثبت","ارتباط تکرارپذیر با Ground","تمام Deploymentهای بحرانی تأیید","Payload به‌تدریج بدون Anomaly راه‌اندازی"],
    failures:["No AOS یا فرکانس/Doppler اشتباه","بازنشدن آرایه یا آنتن","توان منفی و Safe-mode loop","نرخ Detumble بیش از توان عملگر"],
    example:"برای بسیاری از CubeSatها نخستین گذر کوتاه است؛ Beacon ساده و آنتن کم‌بهره شانس تشخیص زنده‌بودن را پیش از برقراری Pointing دقیق بالا می‌برد.",
    engineering:"LEOP پرریسک‌ترین بخش عملیات ماهواره است، زیرا پیکربندی تازه تغییر کرده، مدل مدار هنوز دقیق نیست و فرصت Ground contact محدود است."
  }
};
