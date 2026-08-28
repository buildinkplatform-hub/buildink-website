import type {
  PublicContentSection,
  PublicFaqItem,
  StaticContentType,
} from "../types/public-content.types"

type PageCopy = {
  eyebrow: string
  title: string
  description: string
  sections: PublicContentSection[]
  faqItems?: PublicFaqItem[]
}

const operator =
  "Platforma operohet nga METWALLY AMR, sipërmarrje individuale e regjistruar në Via Galileo Galilei 1, 22078 Turate (CO), Itali, numër TVSH-je 03994850133, REA CO-413411, email i certifikuar (PEC) metwally.arm@pec.it."

const faq: PublicFaqItem[] = [
  [
    "what",
    "Çfarë është Buildink?",
    "Është një platformë që lidh pjesëmarrësit e sektorit të ndërtimit dhe e bën më të lehtë publikimin, gjetjen dhe vlerësimin e profileve dhe mundësive.",
  ],
  [
    "profile",
    "Cilin profil duhet të zgjedh?",
    "Zgjidh rolin që pasqyron aktivitetin tënd kryesor: individ, pronar projekti, punëtor, kontraktor/kompani, nënkontraktor, furnitor ose ofrues shërbimi. Mos zgjidh një rol për të marrë leje që nuk të përkasin.",
  ],
  [
    "fees",
    "A është regjistrimi falas?",
    "Çdo tarifë duhet të shfaqet qartë përpara blerjes. Nëse një funksion është me pagesë, do të shohësh çmimin, kohëzgjatjen, rinovimin dhe kushtet e zbatueshme përpara konfirmimit.",
  ],
  [
    "awards",
    "A i jep Buildink punët?",
    "Jo. Përdoruesit vlerësojnë mundësitë dhe vendosin në mënyrë të pavarur nëse do të kontaktojnë njëri-tjetrin, do të paraqesin ofertë ose do të lidhin kontratë.",
  ],
  [
    "verification",
    "A e garanton verifikimi një përdorues?",
    "Jo. Ai pasqyron vetëm kontrollet e kryera. Përpara bashkëpunimit, verifiko identitetin, përvojën, autorizimet, sigurimin, kushtet e kontratës dhe mënyrën e pagesës.",
  ],
  [
    "publish",
    "Si publikoj një projekt ose tender?",
    "Hyr në llogari, hap formularin përkatës që i përket rolit tënd, jep informacion të plotë dhe publiko. Mos përfshi të dhëna personale të panevojshme ose dokumente konfidenciale.",
  ],
  [
    "edit",
    "A mund ta ndryshoj ose fshij përmbajtjen?",
    "Kur funksioni është i disponueshëm, përdor Ndrysho ose Fshi në zonën përkatëse. Disa të dhëna mund të ruhen për detyrime ligjore, parandalim mashtrimi ose menaxhim mosmarrëveshjesh.",
  ],
  [
    "reviews",
    "Si funksionojnë vlerësimet?",
    "Vlerësimet duhet të lidhen me një përvojë reale dhe të jenë relevante e respektuese. Përmbajtja e rreme, shantazhuese, diskriminuese ose e paligjshme mund të hiqet.",
  ],
  [
    "report",
    "Si raportoj një problem?",
    "Përdor butonin e raportimit ose formularin e Kontaktit dhe përfshi URL-në, kategorinë, përshkrimin dhe provat e disponueshme. Mos dërgo dokumente sensitive nëse nuk kërkohen.",
  ],
  [
    "delete",
    "Si e fshij llogarinë time?",
    "Përdor funksionin te cilësimet e llogarisë kur është i disponueshëm ose kontakto mbështetjen. Fshirja nuk anulon detyrimet e krijuara më parë dhe disa të dhëna mund të ruhen kur e kërkon ligji.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

export const publicCopySq: Record<StaticContentType, PageCopy> = {
  about: {
    eyebrow: "Rreth nesh",
    title: "Rreth nesh",
    description:
      "Buildink është një platformë digjitale për sektorin e ndërtimit. Ajo ndihmon pronarët e projekteve, kontraktorët, nënkontraktorët, punëtorët, furnitorët dhe ofruesit e shërbimeve të paraqesin aftësitë e tyre, të gjejnë mundësi dhe të nisin bashkëpunime në mënyrë më të organizuar dhe transparente.",
    sections: [
      { id: "operator", title: "Operatori", body: operator },
      {
        id: "mission",
        title: "Misioni ynë",
        body: "Ta bëjmë më të lehtë gjetjen e njerëzve, kompanive, materialeve, pajisjeve dhe mundësive të përshtatshme në ndërtim, duke reduktuar hapat manualë dhe informacionin e fragmentuar.",
      },
      {
        id: "offers",
        title: "Çfarë ofron Buildink",
        body: "Buildink ofron mjete për zbulim profesional dhe bashkëpunim.",
        items: [
          "profile profesionale dhe kompanish;",
          "publikim dhe zbulim projektesh, tenderësh dhe ofertash;",
          "zbulim furnitorësh, shërbimesh dhe pajisjesh;",
          "mjete verifikimi dhe raportimi;",
          "vlerësime dhe informacion i dobishëm për të vlerësuar një bashkëpunim të mundshëm.",
        ],
      },
      {
        id: "limits",
        title: "Përpara bashkëpunimit",
        body: "Buildink ndihmon përdoruesit të lidhen, por nuk zëvendëson kontrollet profesionale, teknike, tatimore ose ligjore që duhen kryer përpara nënshkrimit të një kontrate ose fillimit të punës.",
      },
    ],
  },
  "how-it-works": {
    eyebrow: "Si funksionon",
    title: "Si funksionon",
    description:
      "Krijo llogarinë, plotëso profilin, shfleto ose publiko mundësi dhe dakordëso kushtet drejtpërdrejt me palën tjetër.",
    sections: [
      {
        id: "steps",
        title: "Hapat",
        body: "Përdor Buildink në mënyrë transparente dhe publiko vetëm informacion që je i autorizuar ta ndash.",
        items: [
          "1. Krijo llogarinë. Zgjidh llojin e profilit që përshkruan më mirë aktivitetin tënd dhe jep informacion të saktë.",
          "2. Plotëso profilin. Shto aftësi, shërbime, zonën e operimit, përvojën dhe dokumentet e kërkuara. Publiko vetëm informacion që je i autorizuar ta ndash.",
          "3. Shfleto ose publiko. Kërko profesionistë, kompani, furnitorë, pajisje, projekte dhe tenderë ose publiko një mundësi të re nëse roli yt e lejon.",
          "4. Krahaso dhe komuniko. Shiko profilet, informacionin e verifikimit, detajet e mundësisë dhe ofertat. Bëj pyetje përpara se të marrësh angazhime.",
          "5. Dakordëso në mënyrë të sigurt. Konfirmo me shkrim çmimin, afatet, përgjegjësitë, sigurimin, kërkesat e sigurisë dhe kushtet e pagesës me palën tjetër.",
          "6. Lër një vlerësim. Pas një përvoje reale, jep koment të drejtë, specifik dhe respektues.",
        ],
      },
      {
        id: "important",
        title: "E rëndësishme",
        body: "Verifikimi i Buildink mund të ulë një pjesë të pasigurisë, por nuk garanton cilësinë, aftësinë paguese, vazhdimësinë e identitetit, licencat ose suksesin e bashkëpunimit. Kryej gjithmonë kontrollet e tua.",
      },
    ],
  },
  verification: {
    eyebrow: "Verifikimi dhe siguria",
    title: "Verifikimi dhe siguria",
    description:
      "Buildink mund të kërkojë dokumente dhe informacion për të verifikuar një llogari, identitet, kompani ose kualifikim. Kontrollet mund të ndryshojnë sipas llojit të përdoruesit, vendit, rrezikut dhe funksioneve të përdorura.",
    sections: [
      {
        id: "checks",
        title: "Çfarë mund të kontrollohet",
        body: "Kontrollet varen nga konteksti dhe procesi i disponueshëm.",
        items: [
          "adresa e emailit dhe numri i telefonit;",
          "identiteti dhe mosha madhore;",
          "regjistrimi i kompanisë, të dhënat e TVSH-së dhe përfaqësuesi i autorizuar;",
          "licenca, certifikime, sigurime ose dokumente profesionale;",
          "përputhshmëria e informacionit të profilit dhe shenja abuzimi ose mashtrimi.",
        ],
      },
      {
        id: "badge",
        title: "Çfarë do të thotë një simbol verifikimi",
        body: "Një simbol tregon vetëm se disa elemente janë kontrolluar në një moment të caktuar duke përdorur procesin e disponueshëm atëherë. Ai nuk është miratim, garanci, certifikim profesional ose premtim për performancën e ardhshme.",
      },
      {
        id: "responsibilities",
        title: "Përgjegjësitë e tua",
        body: "Mbaji të dhënat të përditësuara, mos ndrysho dokumentet në mënyrë të papërshtatshme, mos përdor identitetin e një personi tjetër dhe njofto Buildink nëse një licencë, sigurim ose kualifikim skadon, pezullohet ose ndryshon.",
      },
      {
        id: "reporting",
        title: "Raportimi i shqetësimeve",
        body: "Raporto menjëherë profile të rreme, kërkesa të dyshimta pagese, përmbajtje të paligjshme, kërcënime, diskriminim, ngacmim ose keqpërdorim të të dhënave përmes mjeteve të platformës ose kanalit të treguar në faqen e Kontaktit. Nëse ka rrezik të menjëhershëm, kontakto autoritetet kompetente.",
      },
    ],
  },
  faq: {
    eyebrow: "Pyetje të shpeshta",
    title: "Pyetje të shpeshta",
    description:
      "Përgjigje për pyetje të zakonshme rreth llogarive, profileve, verifikimit, publikimit, vlerësimeve, raportimit dhe fshirjes së llogarisë.",
    sections: [],
    faqItems: faq,
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Kontakt",
    description:
      "Ke nevojë për ndihmë me llogarinë, verifikimin, një projekt, tender, ofertë, raportim ose të dhënat personale? Përdor formularin e kontaktit dhe zgjidh kategorinë e duhur.",
    sections: [
      {
        id: "channels",
        title: "Kanalet",
        body: "Emaili i zakonshëm i mbështetjes dhe emaili i privatësisë duhet të konfirmohen përpara publikimit. Deri atëherë, përdor formularin e kontaktit për mbështetje të përgjithshme dhe kërkesa për të drejtat e të dhënave.",
        items: [
          "Njoftime ligjore formale përmes emailit të certifikuar (PEC): metwally.arm@pec.it",
          "Selia e regjistruar: METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Itali",
        ],
      },
      {
        id: "respond",
        title: "Na ndihmo të përgjigjemi më shpejt",
        body: "Përfshi emailin e llogarisë, llojin e profilit, URL-në ose ID-në e elementit përkatës dhe një përshkrim të qartë. Mos dërgo fjalëkalime, kode hyrjeje ose dokumente të plota identiteti me email të zakonshëm.",
      },
      {
        id: "abuse",
        title: "Raportimi i përmbajtjes së paligjshme ose abuzimit",
        body: "Jep URL-në e saktë, arsyen e raportimit, ligjin ose të drejtën që mendon se është cenuar, të dhënat e kontaktit dhe një deklaratë me mirëbesim. Buildink mund të kërkojë informacion shtesë dhe do të komunikojë rezultatin kur kërkohet.",
      },
    ],
  },
  privacy: {
    eyebrow: "Politika e privatësisë",
    title: "Politika e privatësisë",
    description:
      "Draft përmbajtësor. Kontrolluesi duhet të konfirmojë ofruesit, vendndodhjet e të dhënave, periudhat e ruajtjes, cookie-t, shërbimet me pagesë dhe përpunimin e automatizuar përpara publikimit.",
    sections: [
      {
        id: "status",
        title: "Statusi i publikimit",
        body: "Draft për implementim dhe rishikim ligjor/privatësie, datë 28 gusht 2026. Nuk zëvendëson rishikimin përfundimtar nga një avokat italian dhe një profesionist i privatësisë.",
      },
      {
        id: "controller",
        title: "1. Kontrolluesi",
        body: `${operator} Kontakti i zakonshëm për privatësinë duhet të konfirmohet përpara publikimit.`,
      },
      {
        id: "data",
        title: "2. Të dhënat që përpunojmë",
        body: "Buildink mund të përpunojë kategoritë e të dhënave që nevojiten për të ofruar, mbrojtur dhe verifikuar shërbimin.",
        items: [
          "Të dhënat e regjistrimit dhe kontaktit: emri, emaili, telefoni, kredencialet e mbrojtura dhe preferencat gjuhësore.",
          "Të dhënat e profilit: roli, aftësitë, shërbimet, përvoja, zona e operimit, imazhet dhe informacioni profesional ose i kompanisë.",
          "Të dhënat e verifikimit: dokumente identiteti, regjistra kompanie, të dhëna TVSH-je, kualifikime, licenca, sigurime dhe rezultate kontrollesh.",
          "Përmbajtja dhe aktiviteti: projekte, tenderë, oferta, mesazhe, vlerësime, raportime, kërkesa për mbështetje dhe histori veprimesh.",
          "Të dhënat teknike dhe të sigurisë: adresa IP, pajisja, shfletuesi, log-et, identifikuesit, data dhe ora e hyrjes, ngjarjet e sigurisë dhe cookie-t.",
          "Të dhënat e pagesës dhe faturimit nëse aktivizohen shërbime me pagesë. Të dhënat e plota të kartës duhet të përpunohen nga ofruesi i pagesës dhe jo nga Buildink.",
        ],
      },
      {
        id: "purposes",
        title: "3. Qëllimet dhe bazat ligjore",
        body: "Qëllimet dhe bazat ligjore varen nga funksioni i përdorur.",
        items: [
          "Ofrimi i shërbimit: krijimi dhe menaxhimi i llogarive, shfaqja e profileve dhe mundësimi i projekteve, tenderëve, ofertave, mesazheve dhe mbështetjes; përmbushja e kontratës ose hapa parakontraktorë.",
          "Verifikimi dhe siguria: parandalimi i mashtrimit, abuzimit dhe aksesit të paautorizuar, verifikimi i informacionit dhe mbrojtja e përdoruesve dhe platformës; interesa legjitime dhe, kur kërkohet, detyrime ligjore.",
          "Përputhshmëria ligjore: përgjigje ndaj autoriteteve dhe përmbushje e detyrimeve tatimore, kontabël, të ruajtjes dhe pretendimeve ligjore; detyrim ligjor dhe interesa legjitime.",
          "Komunikimet e shërbimit: dërgimi i konfirmimeve, njoftimeve të sigurisë, përditësimeve thelbësore dhe mesazheve të llogarisë; përmbushja e kontratës dhe interesa legjitime.",
          "Marketingu: dërgimi i promovimeve dhe matja e fushatave vetëm mbi bazën ligjore të kërkuar, zakonisht pëlqimin; pëlqimi mund të tërhiqet në çdo kohë.",
          "Analitika dhe përmirësimi: matja e performancës dhe përdorimit, rregullimi i gabimeve dhe përmirësimi i funksioneve; pëlqim për mjete jo-thelbësore dhe, kur zbatohet, interesa legjitime për analiza rreptësisht teknike ose të agreguara.",
        ],
      },
      {
        id: "required",
        title: "4. Të dhënat e detyrueshme",
        body: "Fushat e shënuara si të detyrueshme nevojiten për të krijuar një llogari ose përdorur një funksion. Nëse nuk i jep, funksioni përkatës mund të mos jetë i disponueshëm. Informacioni opsional mund ta përmirësojë profilin, por nuk është i detyrueshëm nëse nuk thuhet ndryshe.",
      },
      {
        id: "sources",
        title: "5. Burimet e të dhënave",
        body: "I marrim të dhënat drejtpërdrejt nga përdoruesit, aktiviteti i tyre në platformë, personat që ndërveprojnë me ta dhe, për verifikim, nga regjistrat publikë, ofruesit e verifikimit ose dokumentet e dorëzuara me autorizimin e përdoruesit.",
      },
      {
        id: "recipients",
        title: "6. Marrësit",
        body: "Të dhënat mund të ndahen me përdorues të tjerë në masën e zgjedhur ose të nevojshme për një funksion; me ofrues të hostimit, bazës së të dhënave, autentikimit, emailit, sigurisë, mbështetjes, analitikës, verifikimit dhe pagesave; këshilltarë profesionistë; autoritete kompetente; dhe palë të përfshira në një transaksion biznesi. Ofruesit e shërbimit veprojnë sipas kontratave dhe udhëzimeve përkatëse kur janë përpunues.",
      },
      {
        id: "transfers",
        title: "7. Transferimet ndërkombëtare",
        body: "Nëse të dhënat transferohen jashtë Zonës Ekonomike Evropiane, Buildink përdor një mekanizëm të vlefshëm, si vendim përshtatshmërie ose Klauza Standarde Kontraktuale, dhe masa shtesë kur kërkohen. Vendet, ofruesit dhe mekanizmat realë duhet të konfirmohen përpara publikimit.",
      },
      {
        id: "retention",
        title: "8. Ruajtja",
        body: "I ruajmë të dhënat për aq kohë sa nevojitet për qëllimet e deklaruara dhe më pas për detyrime ligjore dhe trajtimin e pretendimeve ose mosmarrëveshjeve. Periudhat reale për llogaritë, verifikimin, log-et, kërkesat e mbështetjes, kontratat/faturat dhe kopjet rezervë duhet të konfirmohen përpara publikimit. Kur është e mundur, të dhënat fshihen ose anonimizohen.",
      },
      {
        id: "profiles",
        title: "9. Profilet publike",
        body: "Informacioni i shënuar si publik mund të jetë i dukshëm pa hyrje në llogari dhe të indeksohet nga motorët e kërkimit. Mos publiko numra dokumentesh identiteti, të dhëna bankare, adresa private ose informacion tjetër sensitiv. Cilësimet e disponueshme të dukshmërisë duhet të respektohen.",
      },
      {
        id: "automated",
        title: "10. Vendimet e automatizuara",
        body: "Buildink nuk synon të marrë vendime të bazuara vetëm në përpunim të automatizuar që prodhojnë efekte ligjore ose efekte të ngjashme të rëndësishme pa dhënë informacionin dhe masat mbrojtëse të kërkuara. Funksionimi real i vlerësimit të rrezikut, moderimit dhe verifikimit duhet të konfirmohet përpara publikimit.",
      },
      {
        id: "rights",
        title: "11. Të drejtat e tua",
        body: "Kur zbatohet, mund të kërkosh akses, korrigjim, fshirje, kufizim, transferueshmëri ose të kundërshtosh përpunimin; mund të tërheqësh pëlqimin pa ndikuar përpunimin e ligjshëm të mëparshëm. Mund të ankohesh gjithashtu te Autoriteti Italian i Mbrojtjes së të Dhënave. Kontakti i zakonshëm i privatësisë duhet të konfirmohet; PEC-u më sipër mbetet kanali ligjor formal. Mund të kërkojmë informacion të arsyeshëm për të verifikuar identitetin.",
      },
      {
        id: "children",
        title: "12. Të miturit",
        body: "Buildink është menduar për të rritur dhe operatorë profesionistë. Mos u regjistro nëse je nën 18 vjeç. Nëse mësojmë se të dhënat e një të mituri janë mbledhur në mënyrë të papërshtatshme, do të ndërmarrim hapa të përshtatshëm.",
      },
      {
        id: "security",
        title: "13. Siguria dhe ndryshimet",
        body: "Përdorim masa teknike dhe organizative në përpjesëtim me rrezikun, por asnjë sistem nuk është plotësisht i sigurt. Do ta përditësojmë këtë njoftim kur ndryshojnë aktivitetet e përpunimit dhe do të komunikojmë ndryshimet materiale përmes kanaleve të përshtatshme.",
      },
    ],
  },
  cookies: {
    eyebrow: "Politika e cookie-ve",
    title: "Politika e cookie-ve",
    description:
      "Emrat e saktë të cookie-ve dhe elementeve të ruajtjes duhet të vijnë nga një audit i domenit të prodhimit. Teksti i politikës nuk mund të zëvendësojë kontrollet teknike të pëlqimit.",
    sections: [
      {
        id: "status",
        title: "Statusi i publikimit",
        body: "Draft i datës 28 gusht 2026. Mos publiko një tabelë të shpikur cookie-sh: inventari duhet të plotësohet pas një auditi teknik në domenin real të prodhimit.",
      },
      {
        id: "technologies",
        title: "Çfarë janë cookie-t dhe teknologjitë e ngjashme",
        body: "Cookie-t, ruajtja lokale, pikselët dhe teknologjitë e ngjashme mund të ruajnë ose lexojnë informacion në një pajisje. Disa nevojiten që shërbimi të funksionojë; të tjera mbështesin preferencat, matjen ose marketingun.",
      },
      {
        id: "categories",
        title: "Kategoritë",
        body: "Kategoritë duhet të pasqyrojnë përdorimin teknik real.",
        items: [
          "Rreptësisht të nevojshme: autentikimi, siguria, balancimi i ngarkesës, ruajtja e pëlqimit dhe funksionet e kërkuara. Pëlqimi nuk kërkohet kur janë rreptësisht të nevojshme.",
          "Preferencat: mbajnë mend gjuhën, cilësimet dhe zgjedhjet jo-thelbësore. Aktivizohen vetëm mbi bazën ligjore të kërkuar.",
          "Analitika: mat përdorimin dhe performancën. Përveç rasteve kur plotëson përjashtimin e kufizuar për analiza teknikisht ekuivalente, aktivizohet vetëm pas pëlqimit.",
          "Marketingu: personalizimi i reklamave, atribuimi dhe gjurmimi ndërmjet shërbimeve. Aktivizohet vetëm pas pëlqimit.",
        ],
      },
      {
        id: "choices",
        title: "Zgjedhjet e tua",
        body: "Në vizitën e parë mund të pranosh të gjitha, të refuzosh teknologjitë jo-thelbësore ose të zgjedhësh sipas kategorisë. Mund ta ndryshosh mendjen në çdo kohë përmes lidhjes Cilësimet e cookie-ve. Refuzimi nuk pengon përdorimin e funksioneve thelbësore.",
      },
      {
        id: "inventory",
        title: "Tabela që plotësohet pas auditit",
        body: "Inventari publik me emrin, ofruesin, qëllimin, kategorinë dhe kohëzgjatjen do të shtohet vetëm pas auditit teknik të domenit të prodhimit.",
      },
      {
        id: "controller",
        title: "Kontrolluesi dhe kontakti",
        body: "METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Itali. TVSH 03994850133. PEC: metwally.arm@pec.it. Kontakti i zakonshëm për privatësinë duhet të konfirmohet përpara publikimit.",
      },
    ],
  },
  terms: {
    eyebrow: "Kushtet e shërbimit",
    title: "Kushtet e shërbimit",
    description:
      "Kushte përmbajtësore të platformës. Modeli tregtar, tarifat, pagesat, mosha e përdoruesit, qasja e konsumatorit, renditja, moderimi dhe procesi i ankesave duhet të konfirmohen përpara publikimit.",
    sections: [
      {
        id: "status",
        title: "Statusi i publikimit",
        body: "Draft për implementim dhe rishikim ligjor i datës 28 gusht 2026. Versioni italian synohet të mbizotërojë në rast mospërputhjeje, në masën e lejuar nga ligji.",
      },
      {
        id: "operator",
        title: "1. Operatori dhe pranimi",
        body: `${operator} Duke krijuar një llogari ose duke përdorur platformën, pranon këto Kushte dhe politikat që ato referojnë. Nëse vepron për një organizatë, konfirmon se ke autoritet ta lidhësh atë.`,
      },
      {
        id: "eligibility",
        title: "2. Përshtatshmëria dhe llogaritë",
        body: "Duhet të jesh të paktën 18 vjeç, të japësh informacion të vërtetë, të zgjedhësh rolin e saktë, të mbrosh kredencialet dhe të raportosh menjëherë aksesin e paautorizuar. Je përgjegjës për aktivitetin në llogarinë tënde, përveç përdorimit të paligjshëm që nuk të atribuohet.",
      },
      {
        id: "role",
        title: "3. Roli i platformës",
        body: "Buildink ofron mjete për profile, zbulim, projekte, tenderë, oferta, furnitorë, pajisje, vlerësime, verifikim dhe mbështetje. Përveç rasteve kur thuhet shprehimisht ndryshe, Buildink nuk është punëdhënës, agjenci punësimi, kontraktor, përfaqësues, sigurues ose palë në kontratat e lidhura ndërmjet përdoruesve.",
      },
      {
        id: "engagements",
        title: "4. Bashkëpunimet ndërmjet përdoruesve",
        body: "Përdoruesit vendosin në mënyrë të pavarur nëse do të bashkëpunojnë dhe duhet të bien dakord me shkrim për fushën, çmimin, taksat, afatet, pagesën, sigurinë, lejet, sigurimin, përgjegjësinë dhe mjetet juridike. Secila palë është përgjegjëse për kontrollet e veta dhe përputhshmërinë me ligjin e zbatueshëm.",
      },
      {
        id: "projects",
        title: "5. Projektet, tenderët dhe ofertat",
        body: "Publikuesit duhet t'i përshkruajnë mundësitë me saktësi, të përcaktojnë kriteret dhe afatet dhe të kenë autoritet për publikim. Ofertuesit duhet të përcaktojnë kushtet, vlefshmërinë dhe përjashtimet. Një publikim ose ofertë nuk krijon automatikisht kontratë, përveç nëse përdoruesit bien shprehimisht dakord ndryshe.",
      },
      {
        id: "verification",
        title: "6. Verifikimi",
        body: "Mund të kërkojmë dokumente, të kryejmë kontrolle, të refuzojmë ose të tërheqim një simbol verifikimi dhe ta përsërisim verifikimin. Simboli kufizohet te elementet e kontrolluara dhe momenti i kontrollit; nuk është garanci, miratim, certifikim i plotë ose zëvendësim i verifikimit tënd.",
      },
      {
        id: "content",
        title: "7. Përmbajtja e përdoruesit",
        body: "Ti ruan pronësinë e përmbajtjes tënde. I jep Buildink një licencë joekskluzive, mbarëbotërore dhe pa pagesë licence, të kufizuar në periudhën dhe qëllimet e nevojshme për hostim, riprodhim, përshtatje teknike dhe shfaqje të përmbajtjes në shërbim dhe promovim të funksioneve që i ke bërë publike. Konfirmon se ke të drejtat dhe lejet e nevojshme.",
      },
      {
        id: "prohibited",
        title: "8. Sjellja e ndaluar",
        body: "Mos përdor Buildink për aktivitet të paligjshëm, mashtrues ose që cenon të drejtat e të tjerëve.",
        items: [
          "informacion i rremë, paraqitje si person tjetër, dokumente të ndryshuara, vlerësime të fabrikuara ose oferta mashtruese;",
          "përmbajtje e paligjshme, shpifëse, diskriminuese, kërcënuese, ngacmuese ose që cenon të drejtat;",
          "mashtrim, pastrim parash, skema të dyshimta pagese, spam, mbledhje e paautorizuar e të dhënave ose anashkalim i kontrolleve të sigurisë;",
          "malware, akses i paautorizuar, testim shkatërrues ose ndërhyrje në platformë;",
          "mbledhje ose publikim i të dhënave personale pa bazë ligjore dhe autorizim.",
        ],
      },
      {
        id: "reviews",
        title: "9. Vlerësimet",
        body: "Vlerësimet duhet të vijnë nga përvoja reale, të mbeten relevante dhe të mos përdoren për shantazh ose përfitim të padrejtë. Mund të kërkojmë prova, të kufizojmë dukshmërinë ose të heqim vlerësime që shkelin këto Kushte ose ligjin.",
      },
      {
        id: "reports",
        title: "10. Raportimet, moderimi dhe ankesat",
        body: "Mund të raportosh përmbajtje të pretenduar si të paligjshme ose që shkel këto Kushte duke dhënë URL-në, arsyen, provat dhe të dhënat e kontaktit. Mund të kufizojmë, heqim ose çaktivizojmë përmbajtje dhe llogari, të ruajmë prova dhe të njoftojmë autoritetet kur lejohet ose kërkohet. Kur zbatohet, do të japim arsyet dhe një mënyrë për ta kundërshtuar vendimin. Raportimet me keqbesim mund të çojnë në kufizime.",
      },
      {
        id: "closure",
        title: "11. Pezullimi dhe mbyllja",
        body: "Mund ta mbyllësh llogarinë duke përdorur funksionet e disponueshme. Mund të pezullojmë ose mbyllim një llogari për shkelje, rreziqe sigurie, detyrime ligjore, mospagesë ose pasivitet, duke përdorur masa proporcionale dhe njoftim kur është e mundur. Klauzolat që për nga natyra duhet të vazhdojnë mbeten në fuqi.",
      },
      {
        id: "prices",
        title: "12. Çmimet dhe pagesat",
        body: "Modeli tregtar duhet të konfirmohet përpara publikimit. Çdo çmim, taksë, rinovim, komision, kusht anulimi dhe rimbursimi do të shfaqet përpara blerjes. Pagesat ndërmjet përdoruesve mbeten përgjegjësi e palëve, përveç nëse Buildink ofron shprehimisht një shërbim pagese.",
      },
      {
        id: "ip",
        title: "13. Pronësia intelektuale",
        body: "Platforma, marka Buildink, softueri, struktura dhe përmbajtja origjinale mbrohen nga ligji i zbatueshëm. Nuk mund t'i kopjosh, ndryshosh, rishesësh ose përdorësh përtej asaj që nevojitet për përdorimin e shërbimit, përveç nëse je i autorizuar ose lejohet nga ligji.",
      },
      {
        id: "availability",
        title: "14. Disponueshmëria dhe palët e treta",
        body: "Mund të ndryshojmë ose ndërpresim funksione për mirëmbajtje, siguri ose zhvillim. Nuk garantojmë disponueshmëri të pandërprerë ose pa gabime. Lidhjet dhe shërbimet e palëve të treta rregullohen nga kushtet e ofruesve të tyre.",
      },
      {
        id: "liability",
        title: "15. Garancitë dhe përgjegjësia",
        body: "Në masën e lejuar nga ligji, shërbimi ofrohet sipas disponueshmërisë dhe Buildink nuk garanton rezultate tregtare, cilësinë e përdoruesve ose suksesin e kontratave. Asgjë nuk kufizon përgjegjësinë që nuk mund të përjashtohet ligjërisht, përfshirë sjelljen e qëllimshme ose neglizhencën e rëndë, apo të drejtat detyruese të konsumatorit. Për përdoruesit profesionistë, çdo kufi financiar duhet të vendoset vetëm pas rishikimit ligjor të modelit tregtar.",
      },
      {
        id: "law",
        title: "16. Ligji i zbatueshëm dhe mosmarrëveshjet",
        body: "Zbatohet ligji italian, pa cenuar të drejtat detyruese që konsumatorëve u jepen nga ligji i vendit të tyre. Juridiksioni dhe procedura e ankesave duhet të konfirmohen përpara publikimit. Përpara nisjes së procedurave formale, palët duhet të përpiqen për një zgjidhje të arsyeshme me palën tjetër dhe Buildink kur është relevante.",
      },
      {
        id: "changes",
        title: "17. Ndryshimet dhe gjuha",
        body: "Mund t'i përditësojmë këto Kushte për arsye ligjore, teknike ose operative. Ndryshimet materiale do të njoftohen me paralajmërim të përshtatshëm. Versioni italian mbizotëron në rast mospërputhjeje në masën e lejuar nga ligji; përkthimet e tjera ofrohen për qasje dhe kuptueshmëri.",
      },
    ],
  },
}
