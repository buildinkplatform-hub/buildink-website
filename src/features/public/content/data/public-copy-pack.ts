import type { Locale } from "@/shared/types/platform"

import type {
  PublicContentPageView,
  PublicContentSection,
  PublicFaqItem,
  StaticContentType,
} from "../types/public-content.types"

export const PUBLIC_COPY_VERSION = 1
export const PUBLIC_COPY_DRAFT_DATE = "2026-08-28T00:00:00.000Z"

type PageCopy = {
  eyebrow: string
  title: string
  description: string
  sections: PublicContentSection[]
  faqItems?: PublicFaqItem[]
}

type CopyLocale = "it" | "en"

const operatorIt =
  "La piattaforma è gestita da METWALLY AMR, impresa individuale con sede in Via Galileo Galilei 1, 22078 Turate (CO), Italia, Partita IVA 03994850133, REA CO-413411, PEC metwally.arm@pec.it."
const operatorEn =
  "The platform is operated by METWALLY AMR, a sole proprietorship registered at Via Galileo Galilei 1, 22078 Turate (CO), Italy, VAT number 03994850133, REA CO-413411, certified email (PEC) metwally.arm@pec.it."

const faqIt: PublicFaqItem[] = [
  [
    "what",
    "Che cos'è Buildink?",
    "È una piattaforma che facilita l'incontro tra soggetti del settore costruzioni e rende più semplice pubblicare, trovare e valutare profili e opportunità.",
  ],
  [
    "profile",
    "Quale profilo devo scegliere?",
    "Scegli il ruolo che descrive la tua attività principale: individuo, proprietario di progetto, lavoratore, impresa/appaltatore, subappaltatore, fornitore o prestatore di servizi. Non scegliere un ruolo per ottenere permessi non pertinenti.",
  ],
  [
    "fees",
    "L'iscrizione è gratuita?",
    "Le eventuali tariffe devono essere mostrate chiaramente prima dell'acquisto. Se una funzione è a pagamento, vedrai prezzo, durata, rinnovo e condizioni applicabili prima di confermare.",
  ],
  [
    "awards",
    "Buildink assegna i lavori?",
    "No. Gli utenti valutano le opportunità e decidono autonomamente se contattarsi, presentare un'offerta o concludere un contratto.",
  ],
  [
    "verification",
    "La verifica garantisce un utente?",
    "No. Indica solo i controlli effettuati. Prima di collaborare verifica identità, esperienza, autorizzazioni, assicurazione, condizioni contrattuali e pagamento.",
  ],
  [
    "publish",
    "Come pubblico un progetto o una gara?",
    "Accedi al portale, apri il modulo previsto dal tuo ruolo, inserisci informazioni complete e pubblica. Non inserire dati personali o documenti riservati non necessari.",
  ],
  [
    "edit",
    "Posso modificare o eliminare un contenuto?",
    "Quando la funzione è disponibile, usa Modifica o Elimina nella relativa area. Alcuni dati possono essere conservati per obblighi legali, prevenzione frodi o gestione di contestazioni.",
  ],
  [
    "reviews",
    "Come funzionano le recensioni?",
    "Le recensioni devono riferirsi a un'esperienza reale, essere pertinenti e rispettose. Contenuti falsi, ricattatori, discriminatori o illegali possono essere rimossi.",
  ],
  [
    "report",
    "Come segnalo un problema?",
    "Usa il pulsante di segnalazione o il modulo Contatti, includendo URL, categoria, descrizione e prove disponibili. Non inviare documenti sensibili se non richiesti.",
  ],
  [
    "delete",
    "Come elimino l'account?",
    "Usa la funzione nelle impostazioni, se disponibile, oppure contatta l'assistenza. L'eliminazione non annulla gli obblighi già maturati e alcuni dati possono essere conservati quando la legge lo richiede.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

const faqEn: PublicFaqItem[] = [
  [
    "what",
    "What is Buildink?",
    "It is a platform that connects construction-sector participants and makes it easier to publish, find and assess profiles and opportunities.",
  ],
  [
    "profile",
    "Which profile should I choose?",
    "Choose the role that reflects your main activity: individual, project owner, worker, contractor/company, subcontractor, supplier or service provider. Do not select a role to obtain permissions that do not apply to you.",
  ],
  [
    "fees",
    "Is registration free?",
    "Any charges must be shown clearly before purchase. If a feature is paid, you will see the price, duration, renewal and applicable conditions before confirming.",
  ],
  [
    "awards",
    "Does Buildink award work?",
    "No. Users assess opportunities and decide independently whether to contact one another, submit a bid or enter into a contract.",
  ],
  [
    "verification",
    "Does verification guarantee a user?",
    "No. It only reflects checks performed. Before engaging, verify identity, experience, permissions, insurance, contract terms and payment arrangements.",
  ],
  [
    "publish",
    "How do I publish a project or tender?",
    "Sign in, open the relevant form available to your role, enter complete information and publish. Do not include unnecessary personal data or confidential documents.",
  ],
  [
    "edit",
    "Can I edit or delete content?",
    "Where the feature is available, use Edit or Delete in the relevant area. Some data may be retained for legal obligations, fraud prevention or dispute management.",
  ],
  [
    "reviews",
    "How do reviews work?",
    "Reviews must relate to a genuine experience and be relevant and respectful. False, extortionate, discriminatory or illegal content may be removed.",
  ],
  [
    "report",
    "How do I report a problem?",
    "Use the report button or Contact form and include the URL, category, description and available evidence. Do not send sensitive documents unless requested.",
  ],
  [
    "delete",
    "How do I delete my account?",
    "Use the account settings function where available, or contact support. Deletion does not cancel obligations already accrued, and some data may be retained where legally required.",
  ],
].map(([id, title, content]) => ({ id, title, content }))

const pages: Record<CopyLocale, Record<StaticContentType, PageCopy>> = {
  it: {
    about: {
      eyebrow: "Chi siamo",
      title: "Chi siamo",
      description:
        "Buildink è una piattaforma digitale dedicata al settore delle costruzioni. Aiuta proprietari di progetti, imprese, subappaltatori, lavoratori, fornitori e prestatori di servizi a presentare le proprie competenze, trovare opportunità e avviare collaborazioni in modo più ordinato e trasparente.",
      sections: [
        { id: "operatore", title: "Operatore", body: operatorIt },
        {
          id: "missione",
          title: "La nostra missione",
          body: "Rendere più semplice trovare persone, imprese, materiali, attrezzature e opportunità affidabili nel mondo delle costruzioni, riducendo passaggi manuali e informazioni frammentate.",
        },
        {
          id: "offerta",
          title: "Cosa offre Buildink",
          body: "Buildink offre strumenti per presentarsi, trovare opportunità e valutare potenziali collaborazioni.",
          items: [
            "profili professionali e aziendali;",
            "pubblicazione e ricerca di progetti, gare e offerte;",
            "ricerca di fornitori, servizi e attrezzature;",
            "strumenti di verifica e segnalazione;",
            "recensioni e informazioni utili per valutare una collaborazione.",
          ],
        },
        {
          id: "limiti",
          title: "Prima di collaborare",
          body: "Buildink facilita il contatto tra gli utenti, ma non sostituisce le verifiche professionali, tecniche, fiscali o legali necessarie prima di firmare un contratto o iniziare un lavoro.",
        },
      ],
    },
    "how-it-works": {
      eyebrow: "Come funziona",
      title: "Come funziona",
      description:
        "Crea l'account, completa il profilo, esplora o pubblica opportunità e definisci gli accordi direttamente con la controparte.",
      sections: [
        {
          id: "passaggi",
          title: "I passaggi",
          body: "Usa Buildink in modo trasparente e pubblica solo informazioni che sei autorizzato a condividere.",
          items: [
            "1. Crea l'account. Scegli il tipo di profilo che descrive meglio la tua attività e inserisci informazioni accurate.",
            "2. Completa il profilo. Aggiungi competenze, servizi, area operativa, esperienze e documenti richiesti. Pubblica solo dati che sei autorizzato a condividere.",
            "3. Esplora o pubblica. Cerca professionisti, imprese, fornitori, attrezzature, progetti e gare, oppure pubblica una nuova opportunità se il tuo ruolo lo consente.",
            "4. Confronta e comunica. Valuta profili, verifiche, dettagli dell'opportunità e offerte. Chiedi chiarimenti prima di assumere impegni.",
            "5. Concludi in sicurezza. Definisci per iscritto prezzo, tempi, responsabilità, assicurazioni, sicurezza e condizioni di pagamento direttamente con la controparte.",
            "6. Lascia una recensione. Dopo un'esperienza reale, condividi un feedback corretto, specifico e rispettoso.",
          ],
        },
        {
          id: "nota",
          title: "Nota importante",
          body: "La verifica Buildink riduce alcune incertezze, ma non garantisce qualità, solvibilità, identità continua, abilitazioni o buon esito di un rapporto. Effettua sempre le verifiche necessarie.",
        },
      ],
    },
    verification: {
      eyebrow: "Verifica e sicurezza",
      title: "Verifica e sicurezza",
      description:
        "Buildink può richiedere documenti e informazioni per verificare un account, un'identità, un'impresa o una qualifica. I controlli possono variare in base al tipo di utente, al Paese, al rischio e alle funzioni utilizzate.",
      sections: [
        {
          id: "controlli",
          title: "Cosa può essere controllato",
          body: "I controlli dipendono dal contesto e dal processo disponibile.",
          items: [
            "indirizzo e-mail e numero di telefono;",
            "identità e maggiore età;",
            "registrazione dell'impresa, Partita IVA e dati del legale rappresentante;",
            "licenze, certificazioni, assicurazioni o documenti professionali;",
            "coerenza delle informazioni del profilo e segnali di abuso o frode.",
          ],
        },
        {
          id: "badge",
          title: "Cosa significa il badge",
          body: "Un badge indica soltanto che determinati elementi sono stati controllati in un certo momento secondo il processo disponibile. Non costituisce approvazione, garanzia, certificazione professionale o promessa sulla qualità futura.",
        },
        {
          id: "obblighi",
          title: "Obblighi dell'utente",
          body: "Mantieni i dati aggiornati, non alterare documenti, non usare l'identità di altri e informa Buildink se una licenza, assicurazione o qualifica scade, viene sospesa o cambia.",
        },
        {
          id: "segnalazioni",
          title: "Segnalazioni",
          body: "Segnala immediatamente profili falsi, richieste di pagamento sospette, contenuti illegali, minacce, discriminazione, molestie o uso improprio dei dati tramite gli strumenti in piattaforma o il canale indicato nella pagina Contatti. In caso di pericolo immediato, contatta le autorità competenti.",
        },
      ],
    },
    faq: {
      eyebrow: "Domande frequenti",
      title: "Domande frequenti",
      description:
        "Risposte alle domande più comuni su account, profili, verifica, pubblicazione, recensioni, segnalazioni e cancellazione dell'account.",
      sections: [],
      faqItems: faqIt,
    },
    contact: {
      eyebrow: "Contatti",
      title: "Contatti",
      description:
        "Hai bisogno di aiuto con l'account, una verifica, un progetto, una gara, un'offerta, una segnalazione o i tuoi dati personali? Usa il modulo di contatto e seleziona la categoria corretta.",
      sections: [
        {
          id: "canali",
          title: "Canali",
          body: "L'e-mail ordinaria di assistenza e l'e-mail privacy devono essere confermate prima della pubblicazione. Nel frattempo usa il modulo di contatto per assistenza generale e diritti sui dati.",
          items: [
            "Comunicazioni legali via PEC: metwally.arm@pec.it",
            "Sede legale: METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Italia",
          ],
        },
        {
          id: "risposta",
          title: "Per ricevere una risposta più rapida",
          body: "Indica l'e-mail dell'account, il tipo di profilo, l'URL o l'ID dell'elemento interessato e una descrizione chiara. Non inviare password, codici di accesso o documenti d'identità completi tramite e-mail ordinaria.",
        },
        {
          id: "abusi",
          title: "Segnalazione di contenuti illegali o abusi",
          body: "Indica l'URL esatto, il motivo della segnalazione, la norma o il diritto che ritieni violato, i tuoi dati di contatto e una dichiarazione di buona fede. Buildink può richiedere informazioni aggiuntive e comunicherà l'esito quando previsto.",
        },
      ],
    },
    privacy: {
      eyebrow: "Informativa privacy",
      title: "Informativa privacy",
      description:
        "Bozza sostanziale. Prima della pubblicazione il titolare deve confermare fornitori, localizzazione dei dati, tempi di conservazione, cookie, servizi a pagamento e trattamenti automatizzati.",
      sections: [
        {
          id: "stato",
          title: "Stato di pubblicazione",
          body: "Bozza per implementazione e revisione legale/privacy, datata 28 agosto 2026. Non sostituisce la revisione finale di un avvocato italiano e di un professionista privacy.",
        },
        {
          id: "titolare",
          title: "1. Titolare del trattamento",
          body: "Il titolare del trattamento dei dati personali raccolti tramite Buildink è METWALLY AMR, impresa individuale, con sede in Via Galileo Galilei 1, 22078 Turate (CO), Italia, Partita IVA 03994850133, REA CO-413411. PEC: metwally.arm@pec.it. Il contatto privacy ordinario deve essere confermato prima della pubblicazione.",
        },
        {
          id: "dati",
          title: "2. Dati trattati",
          body: "Buildink può trattare le categorie di dati necessarie a fornire, proteggere e verificare il servizio.",
          items: [
            "Dati di registrazione e contatto: nome, e-mail, telefono, credenziali protette e preferenze linguistiche.",
            "Dati del profilo: ruolo, competenze, servizi, esperienza, area operativa, immagini e informazioni professionali o aziendali.",
            "Dati di verifica: documenti d'identità, registri aziendali, Partita IVA, qualifiche, licenze, assicurazioni e risultati dei controlli.",
            "Contenuti e attività: progetti, gare, offerte, messaggi, recensioni, segnalazioni, richieste di assistenza e cronologia delle azioni.",
            "Dati tecnici e di sicurezza: indirizzo IP, dispositivo, browser, log, identificatori, data e ora di accesso, eventi di sicurezza e cookie.",
            "Dati di pagamento e fatturazione, se vengono attivati servizi a pagamento. I dati completi della carta dovrebbero essere trattati dal fornitore di pagamento e non da Buildink.",
          ],
        },
        {
          id: "finalita",
          title: "3. Finalità e basi giuridiche",
          body: "Le finalità e le basi giuridiche dipendono dalla funzione utilizzata.",
          items: [
            "Erogazione del servizio: creare e gestire l'account, mostrare il profilo, consentire progetti, gare, offerte, messaggi e supporto; esecuzione del contratto o misure precontrattuali.",
            "Verifica e sicurezza: prevenire frodi, abusi e accessi non autorizzati, verificare informazioni e proteggere utenti e piattaforma; legittimo interesse e, quando necessario, obbligo legale.",
            "Obblighi legali: adempiere a richieste dell'autorità, obblighi fiscali, contabili, di conservazione e tutela in giudizio; obbligo legale e legittimo interesse.",
            "Comunicazioni di servizio: inviare conferme, avvisi di sicurezza, aggiornamenti essenziali e messaggi relativi all'account; esecuzione del contratto e legittimo interesse.",
            "Marketing: inviare promozioni e misurare campagne solo quando richiesto dalla legge sulla base del consenso; il consenso può essere revocato in ogni momento.",
            "Analisi e miglioramento: misurare prestazioni e utilizzo, correggere errori e migliorare funzioni; consenso per strumenti non essenziali e, dove applicabile, legittimo interesse per analisi strettamente aggregate e tecniche.",
          ],
        },
        {
          id: "conferimento",
          title: "4. Conferimento dei dati",
          body: "I campi indicati come obbligatori sono necessari per creare l'account o usare una funzione. Se non li fornisci, la funzione potrebbe non essere disponibile. I dati facoltativi possono migliorare il profilo ma non sono necessari salvo diversa indicazione.",
        },
        {
          id: "fonti",
          title: "5. Fonti dei dati",
          body: "Raccogliamo dati direttamente dall'utente, dalle sue attività in piattaforma, da soggetti che interagiscono con lui e, per la verifica, da registri pubblici, fornitori di verifica o documenti autorizzati dall'utente.",
        },
        {
          id: "destinatari",
          title: "6. Destinatari",
          body: "I dati possono essere condivisi con altri utenti nella misura scelta o necessaria per la funzione; fornitori di hosting, database, autenticazione, e-mail, sicurezza, assistenza, analisi, verifica e pagamenti; consulenti professionali; autorità competenti; e soggetti coinvolti in un'operazione societaria. I fornitori agiscono secondo contratti e istruzioni appropriate quando sono responsabili del trattamento.",
        },
        {
          id: "trasferimenti",
          title: "7. Trasferimenti internazionali",
          body: "Se i dati vengono trasferiti fuori dallo Spazio Economico Europeo, Buildink utilizza un meccanismo valido, come una decisione di adeguatezza o clausole contrattuali standard, e misure supplementari quando necessarie. Paesi, fornitori e meccanismi effettivi devono essere confermati prima della pubblicazione.",
        },
        {
          id: "conservazione",
          title: "8. Conservazione",
          body: "Conserviamo i dati per il tempo necessario alle finalità indicate e successivamente per gli obblighi legali e la gestione di reclami o contestazioni. I tempi effettivi per account, verifiche, log, ticket, contratti/fatture e backup devono essere confermati prima della pubblicazione. Quando possibile, i dati vengono cancellati o anonimizzati.",
        },
        {
          id: "visibilita",
          title: "9. Visibilità dei profili",
          body: "Le informazioni contrassegnate come pubbliche possono essere visibili anche senza login e indicizzate dai motori di ricerca. Non pubblicare numeri di documento, dati bancari, indirizzi privati o altre informazioni sensibili. Le impostazioni di visibilità disponibili devono essere rispettate.",
        },
        {
          id: "automatizzate",
          title: "10. Decisioni automatizzate",
          body: "Buildink non intende adottare decisioni basate unicamente su trattamenti automatizzati che producano effetti giuridici o analogamente significativi senza fornire l'informativa e le garanzie richieste. Il funzionamento reale di risk scoring, moderazione e verifica deve essere confermato prima della pubblicazione.",
        },
        {
          id: "diritti",
          title: "11. Diritti",
          body: "Nei casi previsti puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opposizione; puoi revocare il consenso senza pregiudicare la liceità del trattamento precedente. Puoi anche presentare reclamo al Garante per la protezione dei dati personali. Il contatto privacy ordinario deve essere confermato; la PEC indicata sopra resta il canale legale formale. Potremmo chiedere informazioni ragionevoli per verificare l'identità.",
        },
        {
          id: "minori",
          title: "12. Minori",
          body: "Buildink è destinato a persone maggiorenni e operatori professionali. Non registrarti se hai meno di 18 anni. Se veniamo a conoscenza di dati di un minore raccolti in modo non conforme, adotteremo misure appropriate.",
        },
        {
          id: "sicurezza",
          title: "13. Sicurezza e modifiche",
          body: "Adottiamo misure tecniche e organizzative proporzionate al rischio, ma nessun sistema è completamente sicuro. Aggiorneremo questa informativa quando cambiano le attività di trattamento; le modifiche rilevanti saranno comunicate con mezzi appropriati.",
        },
      ],
    },
    cookies: {
      eyebrow: "Informativa cookie",
      title: "Informativa cookie",
      description:
        "I nomi esatti di cookie e storage devono provenire da un audit del dominio di produzione. Il testo della policy non sostituisce i controlli tecnici del consenso.",
      sections: [
        {
          id: "stato",
          title: "Stato di pubblicazione",
          body: "Bozza datata 28 agosto 2026. Non pubblicare una tabella cookie inventata: l'inventario deve essere compilato dopo un audit live del dominio di produzione.",
        },
        {
          id: "tecnologie",
          title: "Cosa sono cookie e tecnologie simili",
          body: "Cookie, local storage, pixel e tecnologie simili possono memorizzare o leggere informazioni sul dispositivo. Alcuni sono necessari per il funzionamento del servizio; altri servono a preferenze, misurazione o marketing.",
        },
        {
          id: "categorie",
          title: "Categorie",
          body: "Le categorie devono riflettere l'uso tecnico reale.",
          items: [
            "Necessari: autenticazione, sicurezza, bilanciamento, salvataggio del consenso e funzioni richieste. Non richiedono consenso quando strettamente necessari.",
            "Preferenze: ricordano lingua, impostazioni e scelte non essenziali. Si attivano solo con la base giuridica richiesta.",
            "Analitici: misurano utilizzo e prestazioni. Se non rientrano nei casi assimilabili ai tecnici, si attivano solo dopo il consenso.",
            "Marketing: personalizzazione pubblicitaria, attribuzione e tracciamento tra servizi. Si attivano solo dopo consenso.",
          ],
        },
        {
          id: "scelte",
          title: "Le tue scelte",
          body: "Al primo accesso puoi accettare tutto, rifiutare le tecnologie non necessarie o scegliere per categoria. Puoi cambiare idea in qualsiasi momento tramite il link Impostazioni cookie. Il rifiuto non impedisce l'uso delle funzioni essenziali.",
        },
        {
          id: "inventario",
          title: "Elenco da compilare dopo audit",
          body: "L'elenco pubblico con nome, fornitore, finalità, categoria e durata sarà aggiunto solo dopo l'audit tecnico del dominio di produzione.",
        },
        {
          id: "titolare",
          title: "Titolare e contatti",
          body: "METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Italia. Partita IVA 03994850133. PEC: metwally.arm@pec.it. Il contatto privacy ordinario deve essere confermato prima della pubblicazione.",
        },
      ],
    },
    terms: {
      eyebrow: "Termini di servizio",
      title: "Termini di servizio",
      description:
        "Termini sostanziali della piattaforma. Prima della pubblicazione devono essere confermati modello commerciale, tariffe, pagamenti, età utenti, accesso consumatori, ranking, moderazione e procedura di reclamo.",
      sections: [
        {
          id: "stato",
          title: "Stato di pubblicazione",
          body: "Bozza per implementazione e revisione legale, datata 28 agosto 2026. La versione italiana è destinata a essere quella prevalente, nei limiti consentiti dalla legge.",
        },
        {
          id: "operatore",
          title: "1. Operatore e accettazione",
          body: "Buildink è gestita da METWALLY AMR, impresa individuale con sede in Via Galileo Galilei 1, 22078 Turate (CO), Italia, Partita IVA 03994850133, REA CO-413411, PEC metwally.arm@pec.it. Creando un account o utilizzando la piattaforma accetti questi Termini e le politiche richiamate. Se agisci per un'organizzazione, dichiari di avere l'autorità necessaria.",
        },
        {
          id: "account",
          title: "2. Requisiti e account",
          body: "Devi avere almeno 18 anni, fornire informazioni vere, scegliere il ruolo corretto, proteggere le credenziali e informarci rapidamente di accessi non autorizzati. Sei responsabile delle attività del tuo account salvo uso illecito non imputabile a te.",
        },
        {
          id: "funzione",
          title: "3. Funzione della piattaforma",
          body: "Buildink offre strumenti per profili, ricerca, progetti, gare, offerte, fornitori, attrezzature, recensioni, verifica e supporto. Salvo espressa indicazione contraria, Buildink non è datore di lavoro, agenzia per il lavoro, appaltatore, rappresentante, assicuratore o parte dei contratti conclusi tra utenti.",
        },
        {
          id: "rapporti",
          title: "4. Rapporti tra utenti",
          body: "Gli utenti decidono autonomamente se avviare una collaborazione e devono concordare per iscritto oggetto, prezzo, tasse, tempi, pagamento, sicurezza, autorizzazioni, assicurazioni, responsabilità e rimedi. Ciascuna parte è responsabile delle proprie verifiche e del rispetto delle norme applicabili.",
        },
        {
          id: "gare",
          title: "5. Progetti, gare e offerte",
          body: "Chi pubblica deve descrivere l'opportunità in modo accurato, indicare criteri e scadenze e avere il diritto di farlo. Chi presenta un'offerta deve indicare condizioni, validità ed eventuali esclusioni. Una pubblicazione o offerta non crea automaticamente un contratto, salvo accordo espresso tra gli utenti.",
        },
        {
          id: "verifica",
          title: "6. Verifica",
          body: "Possiamo richiedere documenti, effettuare controlli, rifiutare o revocare un badge e ripetere una verifica. Un badge è limitato agli elementi e al momento controllati; non costituisce garanzia, approvazione, certificazione completa o sostituzione della due diligence.",
        },
        {
          id: "contenuti",
          title: "7. Contenuti dell'utente",
          body: "Mantieni la titolarità dei tuoi contenuti. Concedi a Buildink una licenza non esclusiva, mondiale e gratuita, limitata al periodo e alle finalità necessarie per ospitare, riprodurre, adattare tecnicamente e mostrare i contenuti nel servizio e promuovere le funzioni che hai reso pubbliche. Dichiari di avere i diritti e le autorizzazioni necessari.",
        },
        {
          id: "vietate",
          title: "8. Condotte vietate",
          body: "Non utilizzare Buildink per attività illegali, ingannevoli o lesive dei diritti altrui.",
          items: [
            "informazioni false, identità altrui, documenti alterati, recensioni inventate o offerte ingannevoli;",
            "contenuti illegali, diffamatori, discriminatori, minacciosi, molesti o lesivi di diritti;",
            "frodi, riciclaggio, pagamenti sospetti, spam, scraping non autorizzato o elusione delle misure di sicurezza;",
            "malware, accessi non autorizzati, test distruttivi o interferenze con la piattaforma;",
            "raccolta o pubblicazione di dati personali senza base giuridica e autorizzazione.",
          ],
        },
        {
          id: "recensioni",
          title: "9. Recensioni",
          body: "Le recensioni devono derivare da esperienze reali, essere pertinenti e non essere usate per ricatto o vantaggi indebiti. Possiamo richiedere prove, limitarne la visibilità o rimuoverle se violano questi Termini o la legge.",
        },
        {
          id: "segnalazioni",
          title: "10. Segnalazioni, moderazione e reclami",
          body: "Puoi segnalare contenuti presumibilmente illegali o contrari ai Termini indicando URL, motivo, elementi di prova e dati di contatto. Possiamo limitare, rimuovere o disabilitare contenuti e account, conservare prove e informare le autorità quando consentito o richiesto. Quando applicabile, forniremo una motivazione e un canale per contestare la decisione. Le segnalazioni in malafede possono comportare restrizioni.",
        },
        {
          id: "chiusura",
          title: "11. Sospensione e chiusura",
          body: "Puoi chiudere l'account secondo le funzioni disponibili. Possiamo sospendere o chiudere un account per violazioni, rischi di sicurezza, obblighi legali, mancato pagamento o inattività, usando misure proporzionate e preavviso quando possibile. Le clausole che per natura devono sopravvivere restano efficaci.",
        },
        {
          id: "prezzi",
          title: "12. Prezzi e pagamenti",
          body: "Il modello commerciale deve essere confermato prima della pubblicazione. Eventuali prezzi, imposte, rinnovi, commissioni, cancellazioni e rimborsi saranno mostrati prima dell'acquisto. I pagamenti tra utenti restano responsabilità delle parti salvo servizio di pagamento espressamente offerto da Buildink.",
        },
        {
          id: "ip",
          title: "13. Proprietà intellettuale",
          body: "La piattaforma, il marchio Buildink, il software, la struttura e i contenuti propri sono protetti dalle norme applicabili. Non puoi copiarli, modificarli, rivenderli o utilizzarli oltre quanto necessario per usare il servizio, salvo autorizzazione o diritto di legge.",
        },
        {
          id: "disponibilita",
          title: "14. Disponibilità e servizi terzi",
          body: "Possiamo modificare o interrompere funzioni per manutenzione, sicurezza o sviluppo. Non garantiamo disponibilità continua o assenza di errori. Link e servizi di terzi sono soggetti alle condizioni dei rispettivi fornitori.",
        },
        {
          id: "responsabilita",
          title: "15. Garanzie e responsabilità",
          body: "Nei limiti consentiti dalla legge, il servizio è fornito secondo disponibilità e Buildink non garantisce risultati commerciali, qualità degli utenti o buon esito dei contratti. Nulla limita la responsabilità che non può essere esclusa, inclusa quella per dolo o colpa grave, né i diritti inderogabili del consumatore. Per utenti professionali, eventuali limiti economici devono essere definiti dopo revisione legale del modello commerciale.",
        },
        {
          id: "legge",
          title: "16. Legge applicabile e controversie",
          body: "Si applica la legge italiana, fatti salvi i diritti inderogabili riconosciuti ai consumatori dalla legge del loro Paese. Foro competente e procedura reclami devono essere confermati prima della pubblicazione. Prima di adire un'autorità, invita l'altra parte e Buildink, quando pertinente, a tentare una soluzione ragionevole.",
        },
        {
          id: "modifiche",
          title: "17. Modifiche e lingua",
          body: "Possiamo aggiornare i Termini per ragioni legali, tecniche o operative. Le modifiche sostanziali saranno comunicate con un preavviso appropriato. La versione italiana prevale in caso di divergenze, nei limiti consentiti dalla legge; la versione inglese è fornita per accessibilità.",
        },
      ],
    },
  },
  en: {
    about: {
      eyebrow: "About us",
      title: "About us",
      description:
        "Buildink is a digital platform for the construction sector. It helps project owners, contractors, subcontractors, workers, suppliers and service providers present their capabilities, find opportunities and start collaborations in a more organised and transparent way.",
      sections: [
        { id: "operator", title: "Operator", body: operatorEn },
        {
          id: "mission",
          title: "Our mission",
          body: "To make it easier to find suitable people, companies, materials, equipment and opportunities in construction while reducing manual steps and fragmented information.",
        },
        {
          id: "offers",
          title: "What Buildink offers",
          body: "Buildink provides tools for professional discovery and collaboration.",
          items: [
            "professional and company profiles;",
            "project, tender and bid publishing and discovery;",
            "supplier, service and equipment discovery;",
            "verification and reporting tools;",
            "reviews and useful information for assessing a potential collaboration.",
          ],
        },
        {
          id: "limits",
          title: "Before you engage",
          body: "Buildink helps users connect but does not replace the professional, technical, tax or legal checks that should be completed before signing a contract or starting work.",
        },
      ],
    },
    "how-it-works": {
      eyebrow: "How it works",
      title: "How it works",
      description:
        "Create your account, complete your profile, browse or publish opportunities, and agree terms directly with the other party.",
      sections: [
        {
          id: "steps",
          title: "The steps",
          body: "Use Buildink transparently and publish only information you are authorised to share.",
          items: [
            "1. Create your account. Choose the profile type that best describes your activity and provide accurate information.",
            "2. Complete your profile. Add skills, services, operating area, experience and requested documents. Publish only information you are authorised to share.",
            "3. Browse or publish. Search for professionals, companies, suppliers, equipment, projects and tenders, or publish a new opportunity if your role permits it.",
            "4. Compare and communicate. Review profiles, verification information, opportunity details and bids. Ask questions before making commitments.",
            "5. Agree safely. Confirm price, timing, responsibilities, insurance, safety requirements and payment terms in writing with the other party.",
            "6. Leave a review. After a genuine experience, share feedback that is fair, specific and respectful.",
          ],
        },
        {
          id: "important",
          title: "Important",
          body: "Buildink verification may reduce some uncertainty, but it does not guarantee quality, solvency, continuing identity, licences or a successful engagement. Always carry out your own checks.",
        },
      ],
    },
    verification: {
      eyebrow: "Verification & safety",
      title: "Verification & safety",
      description:
        "Buildink may request documents and information to verify an account, identity, company or qualification. Checks may vary by user type, country, risk and features used.",
      sections: [
        {
          id: "checks",
          title: "What may be checked",
          body: "Checks depend on the context and available process.",
          items: [
            "email address and phone number;",
            "identity and adult status;",
            "company registration, VAT details and authorised representative;",
            "licences, certifications, insurance or professional documents;",
            "consistency of profile information and signals of abuse or fraud.",
          ],
        },
        {
          id: "badge",
          title: "What a badge means",
          body: "A badge only indicates that certain elements were checked at a particular time using the process then available. It is not an endorsement, guarantee, professional certification or promise of future performance.",
        },
        {
          id: "responsibilities",
          title: "Your responsibilities",
          body: "Keep information current, do not alter documents, do not use another person's identity, and tell Buildink if a licence, insurance policy or qualification expires, is suspended or changes.",
        },
        {
          id: "reporting",
          title: "Reporting concerns",
          body: "Promptly report fake profiles, suspicious payment requests, illegal content, threats, discrimination, harassment or misuse of data through the platform tools or the channel shown on the Contact page. If there is immediate danger, contact the competent authorities.",
        },
      ],
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Frequently asked questions",
      description:
        "Answers to common questions about accounts, profiles, verification, publishing, reviews, reporting and account deletion.",
      sections: [],
      faqItems: faqEn,
    },
    contact: {
      eyebrow: "Contact",
      title: "Contact",
      description:
        "Need help with your account, verification, a project, tender, bid, report or personal data? Use the contact form and select the correct category.",
      sections: [
        {
          id: "channels",
          title: "Channels",
          body: "The ordinary support email and privacy email must be confirmed before publication. Until then, use the contact form for general support and data-rights requests.",
          items: [
            "Formal legal notices by certified email (PEC): metwally.arm@pec.it",
            "Registered office: METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Italy",
          ],
        },
        {
          id: "respond",
          title: "Help us respond faster",
          body: "Include your account email, profile type, the relevant URL or item ID, and a clear description. Do not send passwords, access codes or complete identity documents by ordinary email.",
        },
        {
          id: "abuse",
          title: "Reporting illegal content or abuse",
          body: "Provide the exact URL, reason for the report, the law or right you believe has been infringed, your contact details and a good-faith statement. Buildink may request more information and will communicate the outcome where required.",
        },
      ],
    },
    privacy: {
      eyebrow: "Privacy Policy",
      title: "Privacy Policy",
      description:
        "Substantive draft. The controller must confirm vendors, data locations, retention periods, cookies, paid services and automated processing before publication.",
      sections: [
        {
          id: "status",
          title: "Publication status",
          body: "Draft for implementation and legal/privacy review dated 28 August 2026. It is not a substitute for final review by an Italian lawyer and privacy professional.",
        },
        {
          id: "controller",
          title: "1. Controller",
          body: "The controller of personal data collected through Buildink is METWALLY AMR, a sole proprietorship registered at Via Galileo Galilei 1, 22078 Turate (CO), Italy, VAT number 03994850133, REA CO-413411. Certified email (PEC): metwally.arm@pec.it. The ordinary privacy contact must be confirmed before publication.",
        },
        {
          id: "data",
          title: "2. Data we process",
          body: "Buildink may process the categories of data needed to provide, protect and verify the service.",
          items: [
            "Registration and contact data: name, email, phone, protected credentials and language preferences.",
            "Profile data: role, skills, services, experience, operating area, images, and professional or company information.",
            "Verification data: identity documents, company records, VAT details, qualifications, licences, insurance and check results.",
            "Content and activity: projects, tenders, bids, messages, reviews, reports, support requests and action history.",
            "Technical and security data: IP address, device, browser, logs, identifiers, access date and time, security events and cookies.",
            "Payment and billing data if paid services are enabled. Full card details should be processed by the payment provider rather than Buildink.",
          ],
        },
        {
          id: "purposes",
          title: "3. Purposes and legal bases",
          body: "Purposes and legal bases depend on the feature used.",
          items: [
            "Providing the service: create and manage accounts, display profiles, and enable projects, tenders, bids, messages and support; performance of a contract or pre-contractual steps.",
            "Verification and security: prevent fraud, abuse and unauthorised access, verify information, and protect users and the platform; legitimate interests and, where necessary, legal obligations.",
            "Legal compliance: respond to authorities and meet tax, accounting, retention and legal-claims obligations; legal obligation and legitimate interests.",
            "Service communications: send confirmations, security notices, essential updates and account messages; contract performance and legitimate interests.",
            "Marketing: send promotions and measure campaigns only on the legally required basis, normally consent; consent may be withdrawn at any time.",
            "Analytics and improvement: measure performance and use, fix errors and improve features; consent for non-essential tools and, where applicable, legitimate interests for strictly technical or aggregated analysis.",
          ],
        },
        {
          id: "required",
          title: "4. Required data",
          body: "Fields marked as required are needed to create an account or use a feature. If you do not provide them, the relevant feature may not be available. Optional information may improve a profile but is not required unless stated otherwise.",
        },
        {
          id: "sources",
          title: "5. Data sources",
          body: "We obtain data directly from users, their platform activity, people who interact with them and, for verification, public registers, verification providers or documents supplied with the user's authority.",
        },
        {
          id: "recipients",
          title: "6. Recipients",
          body: "Data may be shared with other users to the extent selected or necessary for a feature; providers of hosting, database, authentication, email, security, support, analytics, verification and payments; professional advisers; competent authorities; and parties involved in a business transaction. Service providers act under appropriate contracts and instructions where they are processors.",
        },
        {
          id: "transfers",
          title: "7. International transfers",
          body: "If data is transferred outside the European Economic Area, Buildink uses a valid mechanism, such as an adequacy decision or Standard Contractual Clauses, and supplementary measures where required. Actual countries, providers and mechanisms must be confirmed before publication.",
        },
        {
          id: "retention",
          title: "8. Retention",
          body: "We retain data for as long as necessary for the stated purposes and afterwards for legal obligations and the handling of claims or disputes. Actual periods for accounts, verification, logs, support tickets, contracts/invoices and backups must be confirmed before publication. Where possible, data is deleted or anonymised.",
        },
        {
          id: "profiles",
          title: "9. Public profiles",
          body: "Information marked as public may be visible without sign-in and indexed by search engines. Do not publish identity-document numbers, bank details, private addresses or other sensitive information. Available visibility settings must be respected.",
        },
        {
          id: "automated",
          title: "10. Automated decisions",
          body: "Buildink does not intend to make decisions based solely on automated processing that produce legal or similarly significant effects without providing the required information and safeguards. The actual operation of risk scoring, moderation and verification must be confirmed before publication.",
        },
        {
          id: "rights",
          title: "11. Your rights",
          body: "Where applicable, you may request access, correction, deletion, restriction, portability or object to processing; you may withdraw consent without affecting prior lawful processing. You may also complain to the Italian Data Protection Authority. The ordinary privacy contact must be confirmed; the PEC above remains the formal legal channel. We may request reasonable information to verify identity.",
        },
        {
          id: "children",
          title: "12. Children",
          body: "Buildink is intended for adults and professional operators. Do not register if you are under 18. If we learn that a child's data has been collected improperly, we will take appropriate steps.",
        },
        {
          id: "security",
          title: "13. Security and changes",
          body: "We use technical and organisational measures proportionate to risk, but no system is completely secure. We will update this notice when processing activities change and communicate material changes through appropriate channels.",
        },
      ],
    },
    cookies: {
      eyebrow: "Cookie Policy",
      title: "Cookie Policy",
      description:
        "The exact cookie names and storage items must come from a production-domain audit. Policy text cannot replace technical consent controls.",
      sections: [
        {
          id: "status",
          title: "Publication status",
          body: "Draft dated 28 August 2026. Do not publish an invented cookie table: the inventory must be completed after a live production-domain audit.",
        },
        {
          id: "technologies",
          title: "What cookies and similar technologies are",
          body: "Cookies, local storage, pixels and similar technologies can store or read information on a device. Some are required for the service to work; others support preferences, measurement or marketing.",
        },
        {
          id: "categories",
          title: "Categories",
          body: "Categories must reflect actual technical use.",
          items: [
            "Strictly necessary: authentication, security, load balancing, consent storage and requested functions. Consent is not required where they are strictly necessary.",
            "Preferences: remember language, settings and non-essential choices. They are enabled only on the legally required basis.",
            "Analytics: measure use and performance. Unless they qualify for the limited exemption applicable to technical-equivalent analytics, they are enabled only after consent.",
            "Marketing: advertising personalisation, attribution and cross-service tracking. They are enabled only after consent.",
          ],
        },
        {
          id: "choices",
          title: "Your choices",
          body: "On first visit, you can accept all, reject non-essential technologies or choose by category. You can change your mind at any time through the Cookie settings link. Refusal will not prevent use of essential features.",
        },
        {
          id: "inventory",
          title: "Table to complete after audit",
          body: "The public inventory with name, provider, purpose, category and duration will be added only after the production-domain technical audit.",
        },
        {
          id: "controller",
          title: "Controller and contact",
          body: "METWALLY AMR, Via Galileo Galilei 1, 22078 Turate (CO), Italy. VAT 03994850133. PEC: metwally.arm@pec.it. The ordinary privacy contact must be confirmed before publication.",
        },
      ],
    },
    terms: {
      eyebrow: "Terms of Service",
      title: "Terms of Service",
      description:
        "Substantive platform terms. Confirm the commercial model, fees, payments, user age, consumer access, ranking, moderation and complaint process before publication.",
      sections: [
        {
          id: "status",
          title: "Publication status",
          body: "Draft for implementation and legal review dated 28 August 2026. The Italian version is intended to control in case of inconsistency to the extent permitted by law.",
        },
        {
          id: "operator",
          title: "1. Operator and acceptance",
          body: "Buildink is operated by METWALLY AMR, a sole proprietorship registered at Via Galileo Galilei 1, 22078 Turate (CO), Italy, VAT number 03994850133, REA CO-413411, certified email (PEC) metwally.arm@pec.it. By creating an account or using the platform, you agree to these Terms and the policies they reference. If you act for an organisation, you confirm that you have authority to bind it.",
        },
        {
          id: "eligibility",
          title: "2. Eligibility and accounts",
          body: "You must be at least 18, provide truthful information, select the correct role, protect your credentials and promptly report unauthorised access. You are responsible for activity on your account except unlawful use not attributable to you.",
        },
        {
          id: "role",
          title: "3. Platform role",
          body: "Buildink provides tools for profiles, discovery, projects, tenders, bids, suppliers, equipment, reviews, verification and support. Unless expressly stated otherwise, Buildink is not an employer, employment agency, contractor, representative, insurer or party to contracts entered into between users.",
        },
        {
          id: "engagements",
          title: "4. User-to-user engagements",
          body: "Users decide independently whether to engage and should agree in writing on scope, price, taxes, timing, payment, safety, permissions, insurance, responsibility and remedies. Each party is responsible for its checks and compliance with applicable law.",
        },
        {
          id: "projects",
          title: "5. Projects, tenders and bids",
          body: "Publishers must describe opportunities accurately, state criteria and deadlines, and have authority to publish. Bidders must state terms, validity and exclusions. A listing or bid does not automatically create a contract unless users expressly agree otherwise.",
        },
        {
          id: "verification",
          title: "6. Verification",
          body: "We may request documents, perform checks, refuse or withdraw a badge and repeat verification. A badge is limited to the elements checked and the time of checking; it is not a guarantee, endorsement, complete certification or substitute for due diligence.",
        },
        {
          id: "content",
          title: "7. User content",
          body: "You retain ownership of your content. You grant Buildink a non-exclusive, worldwide, royalty-free licence, limited to the period and purposes needed to host, reproduce, technically adapt and display content in the service and promote features you have made public. You confirm that you have the necessary rights and permissions.",
        },
        {
          id: "prohibited",
          title: "8. Prohibited conduct",
          body: "Do not use Buildink for illegal, deceptive or rights-infringing activity.",
          items: [
            "false information, impersonation, altered documents, fabricated reviews or misleading bids;",
            "illegal, defamatory, discriminatory, threatening, harassing or rights-infringing content;",
            "fraud, money laundering, suspicious payment schemes, spam, unauthorised scraping or circumvention of security controls;",
            "malware, unauthorised access, destructive testing or interference with the platform;",
            "collecting or publishing personal data without a lawful basis and authority.",
          ],
        },
        {
          id: "reviews",
          title: "9. Reviews",
          body: "Reviews must arise from genuine experiences, remain relevant and not be used for extortion or improper advantage. We may request evidence, limit visibility or remove reviews that breach these Terms or the law.",
        },
        {
          id: "reports",
          title: "10. Reports, moderation and complaints",
          body: "You may report allegedly illegal content or content that breaches these Terms by providing the URL, reason, evidence and contact details. We may restrict, remove or disable content and accounts, preserve evidence and inform authorities where permitted or required. Where applicable, we will provide reasons and a route to challenge the decision. Bad-faith reporting may lead to restrictions.",
        },
        {
          id: "closure",
          title: "11. Suspension and closure",
          body: "You may close your account using available features. We may suspend or close an account for breaches, security risks, legal obligations, non-payment or inactivity, using proportionate measures and notice where possible. Clauses that by nature should survive remain effective.",
        },
        {
          id: "prices",
          title: "12. Prices and payments",
          body: "The commercial model must be confirmed before publication. Any prices, taxes, renewals, commissions, cancellation and refund terms will be shown before purchase. Payments between users remain the parties' responsibility unless Buildink expressly offers a payment service.",
        },
        {
          id: "ip",
          title: "13. Intellectual property",
          body: "The platform, Buildink brand, software, structure and original content are protected by applicable law. You may not copy, modify, resell or use them beyond what is necessary to use the service, unless authorised or permitted by law.",
        },
        {
          id: "availability",
          title: "14. Availability and third parties",
          body: "We may change or interrupt features for maintenance, security or development. We do not guarantee uninterrupted or error-free availability. Third-party links and services are governed by their providers' terms.",
        },
        {
          id: "liability",
          title: "15. Warranties and liability",
          body: "To the extent permitted by law, the service is provided as available and Buildink does not guarantee commercial results, user quality or successful contracts. Nothing limits liability that cannot lawfully be excluded, including for wilful misconduct or gross negligence, or mandatory consumer rights. For professional users, any financial cap should be set only after legal review of the commercial model.",
        },
        {
          id: "law",
          title: "16. Governing law and disputes",
          body: "Italian law applies, without prejudice to mandatory rights granted to consumers by the law of their country. Jurisdiction and the complaint procedure must be confirmed before publication. Before starting formal proceedings, the parties should attempt a reasonable solution with the other party and Buildink where relevant.",
        },
        {
          id: "changes",
          title: "17. Changes and language",
          body: "We may update these Terms for legal, technical or operational reasons. Material changes will be notified with appropriate notice. The Italian version prevails in case of inconsistency to the extent permitted by law; the English version is provided for accessibility.",
        },
      ],
    },
  },
}

export function getReviewedStaticPublicPage(
  type: StaticContentType,
  locale: Locale,
): PublicContentPageView {
  // The supplied copy pack contains reviewed Italian and English only.
  // Other site locales intentionally receive the English reviewed copy rather
  // than an unreviewed runtime translation of legal/trust text.
  const copyLocale: CopyLocale = locale === "it" ? "it" : "en"
  const page = pages[copyLocale][type]

  return {
    contentType: "page",
    slug: type,
    locale: copyLocale,
    version: PUBLIC_COPY_VERSION,
    publishedAt: null,
    updatedAt: PUBLIC_COPY_DRAFT_DATE,
    type,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    featuredImageUrl: null,
    sections: page.sections,
    faqItems: page.faqItems ?? [],
  }
}
