import type { Locale } from "@/shared/types/platform"
import type { PublicFaqItem } from "../types/public-content.types"

const en: PublicFaqItem[] = [
  [
    "accounts",
    "Which account should I create?",
    "Choose the role that matches the work you publish or respond to. You can represent an organization only with the appropriate membership and permissions.",
  ],
  [
    "verification",
    "What does verification mean?",
    "Verification shows which information Buildink reviewed. It supports trust but does not replace your own commercial, legal, or safety checks.",
  ],
  [
    "privacy",
    "What information is public?",
    "Only published fields and assets allowed by the owner’s visibility settings are returned on public pages.",
  ],
  [
    "media",
    "Can I hide my logo or photos?",
    "Yes. Company logo, gallery, and profile image visibility can be controlled independently. Private or rejected files are never public.",
  ],
  [
    "companies",
    "How do I publish a company?",
    "Complete the company profile, provide the required verification details, and submit it for publication from your workspace.",
  ],
  [
    "projects",
    "What project details can visitors see?",
    "Visitors see only the published summary, permitted dates and budgets, approved media, and public document metadata.",
  ],
  [
    "tenders",
    "How are tenders discovered?",
    "Use category, location, status, source, submission channel, and deadline filters to find published tenders.",
  ],
  [
    "opportunities",
    "Who can publish opportunities?",
    "Eligible verified accounts can publish opportunities that match their role and organization permissions.",
  ],
  [
    "suppliers",
    "Where are suppliers listed?",
    "Supplier companies appear in the company directory and can show approved catalogue information.",
  ],
  [
    "equipment",
    "Can equipment be offered for rent and sale?",
    "Yes. A published listing can state its availability, condition, location, and public rate or price.",
  ],
  [
    "search",
    "How does public search work?",
    "Search covers published marketplace records only and respects every visibility and moderation rule.",
  ],
  [
    "filters",
    "Why do filter counts change?",
    "Each count reflects all matching published records while applying the other active filters.",
  ],
  [
    "locations",
    "Why does the city list change?",
    "Region and city options depend on the selected country and the locations available in published records.",
  ],
  [
    "contact",
    "How do I contact Buildink?",
    "Use the contact page and include the affected page, your language, and enough detail for the support team to investigate.",
  ],
  [
    "languages",
    "Which languages are supported?",
    "The public experience supports English, Italian, Arabic, Romanian, and Albanian, including right-to-left Arabic layouts.",
  ],
  [
    "documents",
    "Can visitors download every document?",
    "No. Public pages expose only eligible public documents. Hidden documents and private download links are never included.",
  ],
  [
    "reports",
    "How do I report unsafe or incorrect content?",
    "Use the report action on the relevant public entity and describe the issue without sharing unnecessary sensitive information.",
  ],
  [
    "newsletter",
    "How do newsletter subscriptions work?",
    "After signup, confirm the email link. Only confirmed, active, non-suppressed addresses can receive campaigns.",
  ],
  [
    "unsubscribe",
    "Can I unsubscribe at any time?",
    "Yes. The unsubscribe link works without signing in and repeated requests remain safe and idempotent.",
  ],
  [
    "support",
    "Where can I get account help?",
    "Visit the help center or contact support for access, onboarding, verification, privacy, or marketplace questions.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

const it: PublicFaqItem[] = [
  [
    "accounts",
    "Quale account devo creare?",
    "Scegli il ruolo che corrisponde al lavoro che pubblichi o a cui rispondi. Puoi rappresentare un’organizzazione solo con appartenenza e permessi adeguati.",
  ],
  [
    "verification",
    "Cosa significa verifica?",
    "La verifica indica quali informazioni sono state controllate da Buildink. Non sostituisce le verifiche commerciali, legali o di sicurezza.",
  ],
  [
    "privacy",
    "Quali informazioni sono pubbliche?",
    "Le pagine pubbliche ricevono solo campi pubblicati e risorse consentite dalle impostazioni di visibilità del proprietario.",
  ],
  [
    "media",
    "Posso nascondere logo o foto?",
    "Sì. Logo aziendale, galleria e immagine profilo hanno controlli separati. I file privati o rifiutati non sono mai pubblici.",
  ],
  [
    "companies",
    "Come pubblico un’impresa?",
    "Completa il profilo aziendale, fornisci i dati di verifica richiesti e invialo per la pubblicazione dal workspace.",
  ],
  [
    "projects",
    "Quali dati di progetto vedono i visitatori?",
    "Solo riepilogo pubblicato, date e budget consentiti, media approvati e metadati dei documenti pubblici.",
  ],
  [
    "tenders",
    "Come si trovano le gare?",
    "Usa categoria, località, stato, fonte, canale di invio e scadenza per filtrare le gare pubblicate.",
  ],
  [
    "opportunities",
    "Chi può pubblicare opportunità?",
    "Gli account verificati idonei possono pubblicare opportunità coerenti con ruolo e permessi aziendali.",
  ],
  [
    "suppliers",
    "Dove sono elencati i fornitori?",
    "Le imprese fornitrici compaiono nella directory aziende e possono mostrare un catalogo approvato.",
  ],
  [
    "equipment",
    "Le attrezzature possono essere noleggiate e vendute?",
    "Sì. Un annuncio pubblicato può indicare disponibilità, condizione, località e tariffa o prezzo pubblico.",
  ],
  [
    "search",
    "Come funziona la ricerca pubblica?",
    "La ricerca include solo record pubblicati e rispetta tutte le regole di visibilità e moderazione.",
  ],
  [
    "filters",
    "Perché i conteggi dei filtri cambiano?",
    "Ogni conteggio considera tutti i record pubblicati corrispondenti applicando gli altri filtri attivi.",
  ],
  [
    "locations",
    "Perché cambia l’elenco delle città?",
    "Regioni e città dipendono dal paese scelto e dalle località presenti nei record pubblicati.",
  ],
  [
    "contact",
    "Come contatto Buildink?",
    "Usa la pagina contatti e indica pagina interessata, lingua e dettagli sufficienti per l’assistenza.",
  ],
  [
    "languages",
    "Quali lingue sono supportate?",
    "L’esperienza pubblica supporta inglese, italiano, arabo, rumeno e albanese, incluso il layout arabo da destra a sinistra.",
  ],
  [
    "documents",
    "I visitatori possono scaricare ogni documento?",
    "No. Sono esposti solo documenti pubblici idonei; file nascosti e link privati non vengono mai inclusi.",
  ],
  [
    "reports",
    "Come segnalo contenuti errati o non sicuri?",
    "Usa l’azione di segnalazione sull’entità e descrivi il problema senza dati sensibili non necessari.",
  ],
  [
    "newsletter",
    "Come funziona l’iscrizione alla newsletter?",
    "Dopo l’iscrizione conferma il link email. Solo indirizzi confermati, attivi e non soppressi ricevono campagne.",
  ],
  [
    "unsubscribe",
    "Posso annullare l’iscrizione in ogni momento?",
    "Sì. Il link funziona senza accesso e richieste ripetute restano sicure e idempotenti.",
  ],
  [
    "support",
    "Dove trovo aiuto per l’account?",
    "Visita il centro assistenza o contatta il supporto per accesso, onboarding, verifica, privacy o marketplace.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

const ar: PublicFaqItem[] = [
  [
    "accounts",
    "ما الحساب الذي ينبغي إنشاؤه؟",
    "اختر الدور الذي يطابق العمل الذي تنشره أو تستجيب له. لا يمكنك تمثيل مؤسسة إلا بعضوية وصلاحيات مناسبة.",
  ],
  [
    "verification",
    "ماذا يعني التحقق؟",
    "يوضح التحقق المعلومات التي راجعتها Buildink، لكنه لا يغني عن الفحوص التجارية والقانونية وفحوص السلامة.",
  ],
  [
    "privacy",
    "ما المعلومات التي تظهر للعامة؟",
    "تعرض الصفحات العامة الحقول المنشورة والملفات التي تسمح بها إعدادات رؤية المالك فقط.",
  ],
  [
    "media",
    "هل يمكنني إخفاء الشعار أو الصور؟",
    "نعم. يمكن التحكم في الشعار والمعرض وصورة الملف بشكل منفصل، ولا تظهر الملفات الخاصة أو المرفوضة أبداً.",
  ],
  [
    "companies",
    "كيف أنشر شركة؟",
    "أكمل ملف الشركة وبيانات التحقق المطلوبة ثم أرسله للنشر من مساحة العمل.",
  ],
  [
    "projects",
    "ما تفاصيل المشروع التي يراها الزوار؟",
    "يرى الزوار الملخص المنشور والتواريخ والميزانيات المسموحة والوسائط المعتمدة وبيانات الوثائق العامة فقط.",
  ],
  [
    "tenders",
    "كيف أعثر على المناقصات؟",
    "استخدم فلاتر الفئة والموقع والحالة والمصدر وقناة التقديم والموعد النهائي للمناقصات المنشورة.",
  ],
  [
    "opportunities",
    "من يمكنه نشر الفرص؟",
    "يمكن للحسابات المؤهلة والمتحققة نشر فرص تتوافق مع دورها وصلاحيات المؤسسة.",
  ],
  [
    "suppliers",
    "أين يظهر الموردون؟",
    "تظهر شركات التوريد في دليل الشركات ويمكنها عرض معلومات الكتالوج المعتمدة.",
  ],
  [
    "equipment",
    "هل يمكن عرض المعدات للإيجار والبيع؟",
    "نعم. يمكن للإعلان المنشور توضيح التوفر والحالة والموقع والسعر أو التعرفة العامة.",
  ],
  [
    "search",
    "كيف يعمل البحث العام؟",
    "يشمل البحث السجلات المنشورة فقط ويلتزم بجميع قواعد الرؤية والإشراف.",
  ],
  [
    "filters",
    "لماذا تتغير أعداد الفلاتر؟",
    "يمثل كل عدد جميع السجلات المنشورة المطابقة مع تطبيق الفلاتر النشطة الأخرى.",
  ],
  [
    "locations",
    "لماذا تتغير قائمة المدن؟",
    "تعتمد المناطق والمدن على البلد المختار والمواقع الموجودة في السجلات المنشورة.",
  ],
  [
    "contact",
    "كيف أتواصل مع Buildink؟",
    "استخدم صفحة الاتصال واذكر الصفحة المتأثرة واللغة وتفاصيل كافية ليتمكن فريق الدعم من التحقق.",
  ],
  [
    "languages",
    "ما اللغات المدعومة؟",
    "تدعم التجربة العامة الإنجليزية والإيطالية والعربية والرومانية والألبانية، مع تخطيط عربي من اليمين إلى اليسار.",
  ],
  [
    "documents",
    "هل يمكن للزوار تنزيل كل الوثائق؟",
    "لا. تظهر الوثائق العامة المؤهلة فقط، ولا تُرسل الملفات المخفية أو روابط التنزيل الخاصة.",
  ],
  [
    "reports",
    "كيف أبلغ عن محتوى خاطئ أو غير آمن؟",
    "استخدم إجراء الإبلاغ في الصفحة المعنية واشرح المشكلة دون مشاركة بيانات حساسة غير ضرورية.",
  ],
  [
    "newsletter",
    "كيف يعمل الاشتراك في النشرة؟",
    "بعد التسجيل أكد الرابط المرسل بالبريد. لا تستقبل الحملات إلا العناوين المؤكدة والنشطة وغير المحظورة.",
  ],
  [
    "unsubscribe",
    "هل يمكنني إلغاء الاشتراك في أي وقت؟",
    "نعم. يعمل رابط الإلغاء دون تسجيل دخول، وتظل الطلبات المتكررة آمنة ومتطابقة النتيجة.",
  ],
  [
    "support",
    "أين أحصل على مساعدة للحساب؟",
    "زر مركز المساعدة أو تواصل مع الدعم بشأن الدخول أو الإعداد أو التحقق أو الخصوصية أو السوق.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

const ro: PublicFaqItem[] = [
  [
    "accounts",
    "Ce cont ar trebui să creez?",
    "Alege rolul potrivit activității pe care o publici sau la care răspunzi. Poți reprezenta o organizație doar cu apartenența și permisiunile corecte.",
  ],
  [
    "verification",
    "Ce înseamnă verificarea?",
    "Verificarea arată ce informații a analizat Buildink, dar nu înlocuiește verificările comerciale, juridice sau de siguranță.",
  ],
  [
    "privacy",
    "Ce informații sunt publice?",
    "Paginile publice primesc numai câmpuri publicate și resurse permise de setările de vizibilitate ale proprietarului.",
  ],
  [
    "media",
    "Pot ascunde sigla sau fotografiile?",
    "Da. Sigla, galeria și imaginea profilului au controale separate. Fișierele private sau respinse nu sunt niciodată publice.",
  ],
  [
    "companies",
    "Cum public o companie?",
    "Completează profilul companiei, datele de verificare necesare și trimite-l spre publicare din spațiul de lucru.",
  ],
  [
    "projects",
    "Ce detalii de proiect văd vizitatorii?",
    "Doar rezumatul publicat, datele și bugetele permise, media aprobate și metadatele documentelor publice.",
  ],
  [
    "tenders",
    "Cum găsesc licitații?",
    "Folosește categoria, locația, starea, sursa, canalul de depunere și termenul limită pentru licitațiile publicate.",
  ],
  [
    "opportunities",
    "Cine poate publica oportunități?",
    "Conturile eligibile și verificate pot publica oportunități conforme rolului și permisiunilor organizației.",
  ],
  [
    "suppliers",
    "Unde sunt listați furnizorii?",
    "Companiile furnizoare apar în directorul companiilor și pot afișa informații aprobate din catalog.",
  ],
  [
    "equipment",
    "Echipamentele pot fi închiriate și vândute?",
    "Da. Un anunț publicat poate indica disponibilitatea, starea, locația și tariful sau prețul public.",
  ],
  [
    "search",
    "Cum funcționează căutarea publică?",
    "Căutarea include doar înregistrări publicate și respectă toate regulile de vizibilitate și moderare.",
  ],
  [
    "filters",
    "De ce se schimbă numerele filtrelor?",
    "Fiecare număr reflectă toate înregistrările publicate potrivite, aplicând celelalte filtre active.",
  ],
  [
    "locations",
    "De ce se schimbă lista orașelor?",
    "Regiunile și orașele depind de țara selectată și de locațiile din înregistrările publicate.",
  ],
  [
    "contact",
    "Cum contactez Buildink?",
    "Folosește pagina de contact și include pagina afectată, limba și suficiente detalii pentru investigație.",
  ],
  [
    "languages",
    "Ce limbi sunt disponibile?",
    "Experiența publică acceptă engleză, italiană, arabă, română și albaneză, inclusiv afișarea arabă de la dreapta la stânga.",
  ],
  [
    "documents",
    "Vizitatorii pot descărca orice document?",
    "Nu. Sunt expuse numai documentele publice eligibile; fișierele ascunse și linkurile private nu sunt incluse.",
  ],
  [
    "reports",
    "Cum raportez conținut incorect sau nesigur?",
    "Folosește acțiunea de raportare a entității și descrie problema fără date sensibile inutile.",
  ],
  [
    "newsletter",
    "Cum funcționează abonarea la newsletter?",
    "După înscriere confirmă linkul din e-mail. Doar adresele confirmate, active și nesuprimate primesc campanii.",
  ],
  [
    "unsubscribe",
    "Mă pot dezabona oricând?",
    "Da. Linkul funcționează fără autentificare, iar cererile repetate rămân sigure și idempotente.",
  ],
  [
    "support",
    "Unde primesc ajutor pentru cont?",
    "Vizitează centrul de ajutor sau contactează asistența pentru acces, configurare, verificare, confidențialitate ori marketplace.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

const sq: PublicFaqItem[] = [
  [
    "accounts",
    "Cilën llogari duhet të krijoj?",
    "Zgjidh rolin që përputhet me punën që publikon ose së cilës i përgjigjesh. Një organizatë përfaqësohet vetëm me anëtarësi dhe leje të përshtatshme.",
  ],
  [
    "verification",
    "Çfarë do të thotë verifikimi?",
    "Verifikimi tregon cilat të dhëna ka shqyrtuar Buildink, por nuk zëvendëson kontrollet tregtare, ligjore ose të sigurisë.",
  ],
  [
    "privacy",
    "Cilat të dhëna janë publike?",
    "Faqet publike marrin vetëm fushat e publikuara dhe materialet e lejuara nga cilësimet e dukshmërisë së pronarit.",
  ],
  [
    "media",
    "A mund ta fsheh logon ose fotografitë?",
    "Po. Logoja, galeria dhe imazhi i profilit kontrollohen veçmas. Skedarët privatë ose të refuzuar nuk bëhen publikë.",
  ],
  [
    "companies",
    "Si publikohet një kompani?",
    "Plotëso profilin, të dhënat e kërkuara të verifikimit dhe dërgoje për publikim nga hapësira e punës.",
  ],
  [
    "projects",
    "Cilat të dhëna projekti shohin vizitorët?",
    "Vetëm përmbledhjen e publikuar, datat e buxhetet e lejuara, mediat e miratuara dhe metadatat e dokumenteve publike.",
  ],
  [
    "tenders",
    "Si gjenden tenderët?",
    "Përdor kategorinë, vendndodhjen, statusin, burimin, kanalin e dorëzimit dhe afatin për tenderët e publikuar.",
  ],
  [
    "opportunities",
    "Kush mund të publikojë mundësi?",
    "Llogaritë e verifikuara dhe të përshtatshme mund të publikojnë mundësi sipas rolit dhe lejeve të organizatës.",
  ],
  [
    "suppliers",
    "Ku renditen furnizuesit?",
    "Kompanitë furnizuese shfaqen te drejtoria e kompanive dhe mund të tregojnë katalogun e miratuar.",
  ],
  [
    "equipment",
    "A mund të jepen pajisjet me qira dhe në shitje?",
    "Po. Listimi mund të tregojë disponueshmërinë, gjendjen, vendndodhjen dhe tarifën ose çmimin publik.",
  ],
  [
    "search",
    "Si funksionon kërkimi publik?",
    "Kërkimi përfshin vetëm të dhëna të publikuara dhe respekton rregullat e dukshmërisë dhe moderimit.",
  ],
  [
    "filters",
    "Pse ndryshojnë numrat e filtrave?",
    "Çdo numër përfshin të gjitha të dhënat publike që përputhen, duke zbatuar filtrat e tjerë aktivë.",
  ],
  [
    "locations",
    "Pse ndryshon lista e qyteteve?",
    "Rajonet dhe qytetet varen nga shteti i zgjedhur dhe vendndodhjet në të dhënat e publikuara.",
  ],
  [
    "contact",
    "Si ta kontaktoj Buildink?",
    "Përdor faqen e kontaktit dhe përfshi faqen e prekur, gjuhën dhe hollësi të mjaftueshme për hetim.",
  ],
  [
    "languages",
    "Cilat gjuhë mbështeten?",
    "Përvoja publike mbështet anglisht, italisht, arabisht, rumanisht dhe shqip, përfshirë paraqitjen arabe nga e djathta.",
  ],
  [
    "documents",
    "A mund të shkarkojë vizitori çdo dokument?",
    "Jo. Shfaqen vetëm dokumentet publike të pranueshme; skedarët e fshehur dhe lidhjet private nuk përfshihen.",
  ],
  [
    "reports",
    "Si raportohet përmbajtja e pasaktë ose e pasigurt?",
    "Përdor veprimin e raportimit te njësia përkatëse dhe përshkruaj problemin pa të dhëna sensitive të panevojshme.",
  ],
  [
    "newsletter",
    "Si funksionon abonimi në buletin?",
    "Pas regjistrimit konfirmo lidhjen në email. Vetëm adresat e konfirmuara, aktive dhe të pashtypura marrin fushata.",
  ],
  [
    "unsubscribe",
    "A mund të çabonohem kur të dua?",
    "Po. Lidhja punon pa hyrje dhe kërkesat e përsëritura mbeten të sigurta dhe idempotente.",
  ],
  [
    "support",
    "Ku marr ndihmë për llogarinë?",
    "Vizito qendrën e ndihmës ose kontakto mbështetjen për hyrjen, konfigurimin, verifikimin, privatësinë ose marketplace-in.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

export const faqFallback: Record<Locale, PublicFaqItem[]> = {
  en,
  it,
  ar,
  ro,
  sq,
}
