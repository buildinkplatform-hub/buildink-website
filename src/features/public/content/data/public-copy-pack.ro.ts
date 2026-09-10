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
  "Platforma este operată de METWALLY AMR, întreprindere individuală înregistrată la Via Galileo Galilei 1, 22078 Turate (CO), Italia, cod TVA 03994850133, REA CO-413411, e-mail certificat (PEC) metwally.arm@pec.it."

const faq: PublicFaqItem[] = [
  [
    "what",
    "Ce este Buildink?",
    "Este o platformă care conectează participanții din sectorul construcțiilor și facilitează publicarea, găsirea și evaluarea profilurilor și oportunităților.",
  ],
  [
    "profile",
    "Ce profil ar trebui să aleg?",
    "Alege rolul care reflectă activitatea ta principală: persoană fizică, proprietar de proiect, lucrător, contractant/companie, subcontractant, furnizor sau prestator de servicii. Nu selecta un rol pentru a obține permisiuni care nu ți se aplică.",
  ],
  [
    "fees",
    "Înregistrarea este gratuită?",
    "Orice cost trebuie afișat clar înainte de achiziție. Dacă o funcție este cu plată, vei vedea prețul, durata, reînnoirea și condițiile aplicabile înainte de confirmare.",
  ],
  [
    "awards",
    "Buildink atribuie lucrări?",
    "Nu. Utilizatorii evaluează oportunitățile și decid independent dacă se contactează, depun o ofertă sau încheie un contract.",
  ],
  [
    "verification",
    "Verificarea garantează un utilizator?",
    "Nu. Ea reflectă doar verificările efectuate. Înainte de colaborare, verifică identitatea, experiența, autorizațiile, asigurarea, condițiile contractuale și modalitățile de plată.",
  ],
  [
    "publish",
    "Cum public un proiect sau o licitație?",
    "Autentifică-te, deschide formularul disponibil rolului tău, introdu informații complete și publică. Nu include date personale inutile sau documente confidențiale.",
  ],
  [
    "edit",
    "Pot modifica sau șterge conținut?",
    "Acolo unde funcția este disponibilă, folosește Editare sau Ștergere în zona relevantă. Unele date pot fi păstrate pentru obligații legale, prevenirea fraudei sau gestionarea litigiilor.",
  ],
  [
    "reviews",
    "Cum funcționează recenziile?",
    "Recenziile trebuie să provină dintr-o experiență reală și să fie relevante și respectuoase. Conținutul fals, extorcant, discriminatoriu sau ilegal poate fi eliminat.",
  ],
  [
    "report",
    "Cum raportez o problemă?",
    "Folosește butonul de raportare sau formularul de Contact și include URL-ul, categoria, descrierea și dovezile disponibile. Nu trimite documente sensibile decât dacă sunt solicitate.",
  ],
  [
    "delete",
    "Cum îmi șterg contul?",
    "Folosește funcția din setările contului, dacă este disponibilă, sau contactează asistența. Ștergerea nu anulează obligațiile deja acumulate, iar unele date pot fi păstrate dacă legea o cere.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

export const publicCopyRo: Record<StaticContentType, PageCopy> = {
  about: {
    eyebrow: "Despre noi",
    title: "Despre noi",
    description:
      "Buildink este o platformă digitală pentru sectorul construcțiilor. Ajută proprietarii de proiecte, contractanții, subcontractanții, lucrătorii, furnizorii și prestatorii de servicii să își prezinte capacitățile, să găsească oportunități și să înceapă colaborări într-un mod mai organizat și transparent.",
    sections: [
      { id: "operator", title: "Operator", body: operator },
      {
        id: "mission",
        title: "Misiunea noastră",
        body: "Să facilităm găsirea persoanelor, companiilor, materialelor, echipamentelor și oportunităților potrivite în construcții, reducând pașii manuali și informațiile fragmentate.",
      },
      {
        id: "offers",
        title: "Ce oferă Buildink",
        body: "Buildink oferă instrumente pentru descoperire profesională și colaborare.",
        items: [
          "profiluri profesionale și de companie;",
          "publicarea și descoperirea proiectelor, licitațiilor și ofertelor;",
          "descoperirea furnizorilor, serviciilor și echipamentelor;",
          "instrumente de verificare și raportare;",
          "recenzii și informații utile pentru evaluarea unei posibile colaborări.",
        ],
      },
      {
        id: "limits",
        title: "Înainte de colaborare",
        body: "Buildink ajută utilizatorii să intre în contact, dar nu înlocuiește verificările profesionale, tehnice, fiscale sau juridice care trebuie efectuate înainte de semnarea unui contract sau începerea lucrului.",
      },
    ],
  },
  "how-it-works": {
    eyebrow: "Cum funcționează",
    title: "Cum funcționează",
    description:
      "Creează contul, completează profilul, explorează sau publică oportunități și stabilește condițiile direct cu cealaltă parte.",
    sections: [
      {
        id: "steps",
        title: "Pașii",
        body: "Folosește Buildink transparent și publică numai informații pe care ești autorizat să le distribui.",
        items: [
          "1. Creează contul. Alege tipul de profil care descrie cel mai bine activitatea ta și furnizează informații corecte.",
          "2. Completează profilul. Adaugă competențe, servicii, zona de operare, experiența și documentele solicitate. Publică numai informații pe care ești autorizat să le distribui.",
          "3. Explorează sau publică. Caută profesioniști, companii, furnizori, echipamente, proiecte și licitații sau publică o oportunitate nouă dacă rolul tău permite acest lucru.",
          "4. Compară și comunică. Analizează profilurile, informațiile de verificare, detaliile oportunității și ofertele. Cere clarificări înainte de a-ți asuma angajamente.",
          "5. Încheie acordul în siguranță. Confirmă în scris prețul, termenele, responsabilitățile, asigurările, cerințele de securitate și condițiile de plată cu cealaltă parte.",
          "6. Lasă o recenzie. După o experiență reală, oferă feedback corect, specific și respectuos.",
        ],
      },
      {
        id: "important",
        title: "Important",
        body: "Verificarea Buildink poate reduce o parte din incertitudine, dar nu garantează calitatea, solvabilitatea, continuitatea identității, licențele sau succesul colaborării. Efectuează întotdeauna propriile verificări.",
      },
    ],
  },
  verification: {
    eyebrow: "Verificare și siguranță",
    title: "Verificare și siguranță",
    description:
      "Buildink poate solicita documente și informații pentru a verifica un cont, o identitate, o companie sau o calificare. Verificările pot varia în funcție de tipul de utilizator, țară, risc și funcțiile utilizate.",
    sections: [
      {
        id: "checks",
        title: "Ce poate fi verificat",
        body: "Verificările depind de context și de procesul disponibil.",
        items: [
          "adresa de e-mail și numărul de telefon;",
          "identitatea și statutul de adult;",
          "înregistrarea companiei, datele TVA și reprezentantul autorizat;",
          "licențe, certificări, asigurări sau documente profesionale;",
          "coerența informațiilor din profil și semnale de abuz sau fraudă.",
        ],
      },
      {
        id: "badge",
        title: "Ce înseamnă o insignă",
        body: "O insignă indică doar faptul că anumite elemente au fost verificate la un anumit moment prin procesul disponibil atunci. Nu reprezintă aprobare, garanție, certificare profesională sau promisiune privind performanța viitoare.",
      },
      {
        id: "responsibilities",
        title: "Responsabilitățile tale",
        body: "Menține informațiile actualizate, nu modifica documentele în mod necorespunzător, nu folosi identitatea altei persoane și informează Buildink dacă o licență, poliță de asigurare sau calificare expiră, este suspendată sau se modifică.",
      },
      {
        id: "reporting",
        title: "Raportarea problemelor",
        body: "Raportează prompt profilurile false, cererile de plată suspecte, conținutul ilegal, amenințările, discriminarea, hărțuirea sau utilizarea abuzivă a datelor prin instrumentele platformei sau canalul indicat pe pagina Contact. Dacă există un pericol imediat, contactează autoritățile competente.",
      },
    ],
  },
  faq: {
    eyebrow: "Întrebări frecvente",
    title: "Întrebări frecvente",
    description:
      "Răspunsuri la întrebări comune despre conturi, profiluri, verificare, publicare, recenzii, raportare și ștergerea contului.",
    sections: [],
    faqItems: faq,
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact",
    description:
      "Ai nevoie de ajutor cu contul, verificarea, un proiect, o licitație, o ofertă, o sesizare sau datele tale personale? Folosește formularul de contact și selectează categoria corectă.",
    sections: [
      {
        id: "channels",
        title: "Canale",
        body: "Pentru asistență generală și solicitări privind confidențialitatea sau drepturile asupra datelor, folosește formularul de contact de mai jos. Notificările juridice oficiale pot fi trimise prin adresa PEC indicată aici.",
        items: [
          "Notificări juridice formale prin e-mail certificat (PEC): metwally.arm@pec.it",
          "Sediu social: METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Italia",
        ],
      },
      {
        id: "respond",
        title: "Ajută-ne să răspundem mai repede",
        body: "Include e-mailul contului, tipul profilului, URL-ul sau ID-ul elementului relevant și o descriere clară. Nu trimite parole, coduri de acces sau documente complete de identitate prin e-mail obișnuit.",
      },
      {
        id: "abuse",
        title: "Raportarea conținutului ilegal sau a abuzurilor",
        body: "Furnizează URL-ul exact, motivul raportării, legea sau dreptul despre care consideri că a fost încălcat, datele tale de contact și o declarație de bună-credință. Buildink poate solicita informații suplimentare și va comunica rezultatul atunci când este necesar.",
      },
    ],
  },
  privacy: {
    eyebrow: "Politica de confidențialitate",
    title: "Politica de confidențialitate",
    description:
      "Proiect substanțial. Operatorul trebuie să confirme furnizorii, locațiile datelor, perioadele de păstrare, cookie-urile, serviciile cu plată și prelucrarea automată înainte de publicare.",
    sections: [
      {
        id: "status",
        title: "Starea publicării",
        body: "Proiect pentru implementare și revizuire juridică/de confidențialitate, datat 28 august 2026. Nu înlocuiește revizuirea finală de către un avocat italian și un specialist în protecția datelor.",
      },
      {
        id: "controller",
        title: "1. Operatorul de date",
        body: `${operator} Contactul obișnuit pentru confidențialitate trebuie confirmat înainte de publicare.`,
      },
      {
        id: "data",
        title: "2. Datele pe care le prelucrăm",
        body: "Buildink poate prelucra categoriile de date necesare pentru furnizarea, protejarea și verificarea serviciului.",
        items: [
          "Date de înregistrare și contact: nume, e-mail, telefon, credențiale protejate și preferințe lingvistice.",
          "Date de profil: rol, competențe, servicii, experiență, zona de operare, imagini și informații profesionale sau despre companie.",
          "Date de verificare: documente de identitate, registre ale companiei, date TVA, calificări, licențe, asigurări și rezultatele verificărilor.",
          "Conținut și activitate: proiecte, licitații, oferte, mesaje, recenzii, raportări, solicitări de asistență și istoricul acțiunilor.",
          "Date tehnice și de securitate: adresă IP, dispozitiv, browser, jurnale, identificatori, data și ora accesului, evenimente de securitate și cookie-uri.",
          "Date de plată și facturare dacă sunt activate servicii cu plată. Datele complete ale cardului ar trebui prelucrate de furnizorul de plăți, nu de Buildink.",
        ],
      },
      {
        id: "purposes",
        title: "3. Scopuri și temeiuri juridice",
        body: "Scopurile și temeiurile juridice depind de funcția utilizată.",
        items: [
          "Furnizarea serviciului: crearea și administrarea conturilor, afișarea profilurilor și activarea proiectelor, licitațiilor, ofertelor, mesajelor și asistenței; executarea unui contract sau măsuri precontractuale.",
          "Verificare și securitate: prevenirea fraudei, abuzului și accesului neautorizat, verificarea informațiilor și protejarea utilizatorilor și platformei; interese legitime și, dacă este necesar, obligații legale.",
          "Conformitate juridică: răspunsul către autorități și îndeplinirea obligațiilor fiscale, contabile, de păstrare și privind pretențiile juridice; obligație legală și interese legitime.",
          "Comunicări de serviciu: trimiterea confirmărilor, notificărilor de securitate, actualizărilor esențiale și mesajelor de cont; executarea contractului și interese legitime.",
          "Marketing: trimiterea promoțiilor și măsurarea campaniilor numai în baza legală necesară, de regulă consimțământ; consimțământul poate fi retras oricând.",
          "Analiză și îmbunătățire: măsurarea performanței și utilizării, remedierea erorilor și îmbunătățirea funcțiilor; consimțământ pentru instrumente neesențiale și, dacă este cazul, interese legitime pentru analiză strict tehnică sau agregată.",
        ],
      },
      {
        id: "required",
        title: "4. Date obligatorii",
        body: "Câmpurile marcate ca obligatorii sunt necesare pentru crearea unui cont sau utilizarea unei funcții. Dacă nu le furnizezi, funcția relevantă poate să nu fie disponibilă. Informațiile opționale pot îmbunătăți profilul, dar nu sunt obligatorii dacă nu se precizează altfel.",
      },
      {
        id: "sources",
        title: "5. Sursele datelor",
        body: "Obținem date direct de la utilizatori, din activitatea lor pe platformă, de la persoanele care interacționează cu ei și, pentru verificare, din registre publice, de la furnizori de verificare sau din documente furnizate cu autorizarea utilizatorului.",
      },
      {
        id: "recipients",
        title: "6. Destinatarii",
        body: "Datele pot fi partajate cu alți utilizatori în măsura aleasă sau necesară unei funcții; cu furnizori de găzduire, baze de date, autentificare, e-mail, securitate, asistență, analiză, verificare și plăți; consilieri profesioniști; autorități competente și părți implicate într-o tranzacție comercială. Furnizorii de servicii acționează conform contractelor și instrucțiunilor adecvate atunci când sunt persoane împuternicite.",
      },
      {
        id: "transfers",
        title: "7. Transferuri internaționale",
        body: "Dacă datele sunt transferate în afara Spațiului Economic European, Buildink folosește un mecanism valid, precum o decizie de adecvare sau Clauze Contractuale Standard, și măsuri suplimentare când sunt necesare. Țările, furnizorii și mecanismele efective trebuie confirmate înainte de publicare.",
      },
      {
        id: "retention",
        title: "8. Păstrarea datelor",
        body: "Păstrăm datele atât timp cât este necesar pentru scopurile declarate și ulterior pentru obligații legale și gestionarea pretențiilor sau litigiilor. Perioadele efective pentru conturi, verificare, jurnale, tichete de asistență, contracte/facturi și copii de siguranță trebuie confirmate înainte de publicare. Acolo unde este posibil, datele sunt șterse sau anonimizate.",
      },
      {
        id: "profiles",
        title: "9. Profiluri publice",
        body: "Informațiile marcate ca publice pot fi vizibile fără autentificare și indexate de motoarele de căutare. Nu publica numere ale documentelor de identitate, date bancare, adrese private sau alte informații sensibile. Setările de vizibilitate disponibile trebuie respectate.",
      },
      {
        id: "automated",
        title: "10. Decizii automate",
        body: "Buildink nu intenționează să ia decizii bazate exclusiv pe prelucrare automată care produc efecte juridice sau efecte similare semnificative fără a furniza informațiile și garanțiile necesare. Funcționarea reală a evaluării riscului, moderării și verificării trebuie confirmată înainte de publicare.",
      },
      {
        id: "rights",
        title: "11. Drepturile tale",
        body: "Acolo unde se aplică, poți solicita accesul, rectificarea, ștergerea, restricționarea, portabilitatea sau te poți opune prelucrării; poți retrage consimțământul fără a afecta prelucrarea legală anterioară. De asemenea, poți depune o plângere la Autoritatea italiană pentru protecția datelor. Contactul obișnuit pentru confidențialitate trebuie confirmat; PEC-ul de mai sus rămâne canalul juridic formal. Putem solicita informații rezonabile pentru verificarea identității.",
      },
      {
        id: "children",
        title: "12. Minori",
        body: "Buildink este destinat adulților și operatorilor profesioniști. Nu te înregistra dacă ai sub 18 ani. Dacă aflăm că datele unui minor au fost colectate necorespunzător, vom lua măsurile adecvate.",
      },
      {
        id: "security",
        title: "13. Securitate și modificări",
        body: "Folosim măsuri tehnice și organizatorice proporționale cu riscul, dar niciun sistem nu este complet sigur. Vom actualiza această informare când activitățile de prelucrare se modifică și vom comunica schimbările semnificative prin canale adecvate.",
      },
    ],
  },
  cookies: {
    eyebrow: "Politica privind cookie-urile",
    title: "Politica privind cookie-urile",
    description:
      "Denumirile exacte ale cookie-urilor și elementelor de stocare trebuie să provină dintr-un audit al domeniului de producție. Textul politicii nu poate înlocui controalele tehnice de consimțământ.",
    sections: [
      {
        id: "status",
        title: "Starea publicării",
        body: "Proiect datat 28 august 2026. Nu publica un tabel inventat de cookie-uri: inventarul trebuie completat după un audit tehnic pe domeniul de producție live.",
      },
      {
        id: "technologies",
        title: "Ce sunt cookie-urile și tehnologiile similare",
        body: "Cookie-urile, stocarea locală, pixelii și tehnologiile similare pot stoca sau citi informații pe un dispozitiv. Unele sunt necesare pentru funcționarea serviciului; altele susțin preferințele, măsurarea sau marketingul.",
      },
      {
        id: "categories",
        title: "Categorii",
        body: "Categoriile trebuie să reflecte utilizarea tehnică reală.",
        items: [
          "Strict necesare: autentificare, securitate, echilibrarea încărcării, stocarea consimțământului și funcțiile solicitate. Consimțământul nu este necesar atunci când sunt strict necesare.",
          "Preferințe: memorarea limbii, setărilor și opțiunilor neesențiale. Sunt activate numai pe baza juridică necesară.",
          "Analiză: măsurarea utilizării și performanței. Cu excepția cazului în care se califică pentru excepția limitată aplicabilă analizelor echivalente tehnic, sunt activate numai după consimțământ.",
          "Marketing: personalizarea publicității, atribuirea și urmărirea între servicii. Sunt activate numai după consimțământ.",
        ],
      },
      {
        id: "choices",
        title: "Opțiunile tale",
        body: "La prima vizită poți accepta totul, respinge tehnologiile neesențiale sau alege pe categorii. Îți poți schimba alegerea oricând prin linkul Setări cookie. Refuzul nu va împiedica utilizarea funcțiilor esențiale.",
      },
      {
        id: "inventory",
        title: "Tabel de completat după audit",
        body: "Inventarul public cu denumirea, furnizorul, scopul, categoria și durata va fi adăugat numai după auditul tehnic al domeniului de producție.",
      },
      {
        id: "controller",
        title: "Operator și contact",
        body: "METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Italia. TVA 03994850133. PEC: metwally.arm@pec.it. Contactul obișnuit pentru confidențialitate trebuie confirmat înainte de publicare.",
      },
    ],
  },
  terms: {
    eyebrow: "Termeni și condiții",
    title: "Termeni și condiții",
    description:
      "Termeni substanțiali ai platformei. Modelul comercial, taxele, plățile, vârsta utilizatorului, accesul consumatorilor, clasarea, moderarea și procesul de reclamații trebuie confirmate înainte de publicare.",
    sections: [
      {
        id: "status",
        title: "Starea publicării",
        body: "Proiect pentru implementare și revizuire juridică datat 28 august 2026. Versiunea italiană este destinată să prevaleze în caz de neconcordanță, în măsura permisă de lege.",
      },
      {
        id: "operator",
        title: "1. Operator și acceptare",
        body: `${operator} Prin crearea unui cont sau utilizarea platformei, ești de acord cu acești Termeni și politicile la care fac trimitere. Dacă acționezi pentru o organizație, confirmi că ai autoritatea de a o angaja.`,
      },
      {
        id: "eligibility",
        title: "2. Eligibilitate și conturi",
        body: "Trebuie să ai cel puțin 18 ani, să furnizezi informații adevărate, să selectezi rolul corect, să îți protejezi credențialele și să raportezi prompt accesul neautorizat. Ești responsabil pentru activitatea contului tău, cu excepția utilizării ilegale care nu îți poate fi atribuită.",
      },
      {
        id: "role",
        title: "3. Rolul platformei",
        body: "Buildink oferă instrumente pentru profiluri, descoperire, proiecte, licitații, oferte, furnizori, echipamente, recenzii, verificare și asistență. Dacă nu se precizează expres altfel, Buildink nu este angajator, agenție de ocupare, contractant, reprezentant, asigurător sau parte la contractele încheiate între utilizatori.",
      },
      {
        id: "engagements",
        title: "4. Colaborări între utilizatori",
        body: "Utilizatorii decid independent dacă colaborează și ar trebui să convină în scris asupra domeniului, prețului, taxelor, termenelor, plății, siguranței, autorizațiilor, asigurării, responsabilității și remediilor. Fiecare parte este responsabilă pentru verificările proprii și conformitatea cu legea aplicabilă.",
      },
      {
        id: "projects",
        title: "5. Proiecte, licitații și oferte",
        body: "Publicatorii trebuie să descrie oportunitățile cu exactitate, să precizeze criteriile și termenele limită și să aibă autoritatea de a publica. Ofertanții trebuie să precizeze condițiile, valabilitatea și excluderile. O listare sau ofertă nu creează automat un contract dacă utilizatorii nu convin expres altfel.",
      },
      {
        id: "verification",
        title: "6. Verificare",
        body: "Putem solicita documente, efectua verificări, refuza sau retrage o insignă și repeta verificarea. O insignă este limitată la elementele verificate și momentul verificării; nu este o garanție, aprobare, certificare completă sau înlocuitor pentru diligența proprie.",
      },
      {
        id: "content",
        title: "7. Conținutul utilizatorului",
        body: "Păstrezi dreptul de proprietate asupra conținutului tău. Acordi Buildink o licență neexclusivă, mondială și fără redevențe, limitată la perioada și scopurile necesare pentru găzduirea, reproducerea, adaptarea tehnică și afișarea conținutului în serviciu și promovarea funcțiilor pe care le-ai făcut publice. Confirmi că deții drepturile și permisiunile necesare.",
      },
      {
        id: "prohibited",
        title: "8. Conduită interzisă",
        body: "Nu utiliza Buildink pentru activități ilegale, înșelătoare sau care încalcă drepturile altora.",
        items: [
          "informații false, uzurparea identității, documente modificate, recenzii fabricate sau oferte înșelătoare;",
          "conținut ilegal, defăimător, discriminatoriu, amenințător, hărțuitor sau care încalcă drepturi;",
          "fraudă, spălare de bani, scheme de plată suspecte, spam, extragere neautorizată de date sau ocolirea controalelor de securitate;",
          "malware, acces neautorizat, testare distructivă sau interferență cu platforma;",
          "colectarea sau publicarea datelor personale fără temei juridic și autoritate.",
        ],
      },
      {
        id: "reviews",
        title: "9. Recenzii",
        body: "Recenziile trebuie să provină din experiențe reale, să rămână relevante și să nu fie utilizate pentru șantaj sau avantaje necuvenite. Putem solicita dovezi, limita vizibilitatea sau elimina recenziile care încalcă acești Termeni sau legea.",
      },
      {
        id: "reports",
        title: "10. Raportări, moderare și reclamații",
        body: "Poți raporta conținut presupus ilegal sau care încalcă acești Termeni furnizând URL-ul, motivul, dovezile și datele de contact. Putem restricționa, elimina sau dezactiva conținut și conturi, păstra dovezi și informa autoritățile când este permis sau necesar. Acolo unde se aplică, vom furniza motive și o cale de contestare a deciziei. Raportările cu rea-credință pot conduce la restricții.",
      },
      {
        id: "closure",
        title: "11. Suspendare și închidere",
        body: "Îți poți închide contul folosind funcțiile disponibile. Putem suspenda sau închide un cont pentru încălcări, riscuri de securitate, obligații legale, neplată sau inactivitate, folosind măsuri proporționale și notificare atunci când este posibil. Clauzele care prin natura lor trebuie să supraviețuiască rămân în vigoare.",
      },
      {
        id: "prices",
        title: "12. Prețuri și plăți",
        body: "Modelul comercial trebuie confirmat înainte de publicare. Orice prețuri, taxe, reînnoiri, comisioane, condiții de anulare și rambursare vor fi afișate înainte de achiziție. Plățile între utilizatori rămân responsabilitatea părților, dacă Buildink nu oferă expres un serviciu de plată.",
      },
      {
        id: "ip",
        title: "13. Proprietate intelectuală",
        body: "Platforma, marca Buildink, software-ul, structura și conținutul original sunt protejate de legea aplicabilă. Nu le poți copia, modifica, revinde sau utiliza dincolo de ceea ce este necesar pentru folosirea serviciului, cu excepția cazului în care ești autorizat sau legea permite acest lucru.",
      },
      {
        id: "availability",
        title: "14. Disponibilitate și terți",
        body: "Putem modifica sau întrerupe funcții pentru întreținere, securitate sau dezvoltare. Nu garantăm disponibilitate neîntreruptă sau lipsită de erori. Linkurile și serviciile terților sunt guvernate de condițiile furnizorilor lor.",
      },
      {
        id: "liability",
        title: "15. Garanții și răspundere",
        body: "În măsura permisă de lege, serviciul este furnizat în funcție de disponibilitate, iar Buildink nu garantează rezultate comerciale, calitatea utilizatorilor sau succesul contractelor. Nimic nu limitează răspunderea care nu poate fi exclusă legal, inclusiv pentru conduită intenționată sau neglijență gravă, ori drepturile obligatorii ale consumatorilor. Pentru utilizatorii profesioniști, orice plafon financiar ar trebui stabilit numai după revizuirea juridică a modelului comercial.",
      },
      {
        id: "law",
        title: "16. Legea aplicabilă și litigii",
        body: "Se aplică legea italiană, fără a aduce atingere drepturilor obligatorii acordate consumatorilor de legea țării lor. Jurisdicția și procedura de reclamații trebuie confirmate înainte de publicare. Înainte de inițierea procedurilor formale, părțile ar trebui să încerce o soluție rezonabilă cu cealaltă parte și cu Buildink, după caz.",
      },
      {
        id: "changes",
        title: "17. Modificări și limbă",
        body: "Putem actualiza acești Termeni din motive juridice, tehnice sau operaționale. Modificările semnificative vor fi comunicate cu o notificare adecvată. Versiunea italiană prevalează în caz de neconcordanță în măsura permisă de lege; celelalte traduceri sunt furnizate pentru accesibilitate și înțelegere.",
      },
    ],
  },
}
