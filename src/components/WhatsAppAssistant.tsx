import {
  ArrowLeft,
  Check,
  ChevronRight,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  type CSSProperties,
  useMemo,
  useState,
} from "react";

import {
  PhoneInput,
  type ParsedCountry,
} from "react-international-phone";

import "react-international-phone/style.css";

import { useI18n } from "../i18n/LanguageProvider";

import type {
  LanguageCode,
} from "../i18n/translations";

import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";

type Step =
  | "home"
  | "contact"
  | "people"
  | "date"
  | "style"
  | "budget"
  | "result";

type Answers = {
  firstName: string;
  lastName: string;

  phoneCode: string;
  phone: string;

  email: string;

  people: string;

  arrivalDate: string;
  departureDate: string;

  style: string;
  budget: string;
};

type Copy = {
  title: string;
  status: string;

  homeTitle: string;

  directTitle: string;
  directText: string;

  quizTitle: string;
  quizText: string;

  contactTitle: string;
  contactText: string;

  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  continue: string;
  back: string;
  restart: string;

  required: string;
  invalidPhone: string;
  invalidEmail: string;

  peopleTitle: string;

  dateTitle: string;
  arrivalDate: string;
  departureDate: string;

  styleTitle: string;
  budgetTitle: string;

  resultTitle: string;
  send: string;

  peopleOptions: string[];
  styleOptions: string[];
  budgetOptions: string[];

  group: string;
  atmosphere: string;
  budget: string;
};

const copies: Record<
  LanguageCode,
  Copy
> = {
  fr: {
    title:
      "B4F EVENTS",

    status:
      "Disponible",

    homeTitle:
      "Besoin d’aide ?",

    directTitle:
      "Contacter B4F",

    directText:
      "Parler directement avec notre équipe",

    quizTitle:
      "Trouver ma soirée",

    quizText:
      "On t’aide à choisir en quelques étapes",

    contactTitle:
      "Tes coordonnées",

    contactText:
      "Pour que notre équipe puisse te répondre.",

    firstName:
      "Prénom",

    lastName:
      "Nom",

    phone:
      "Téléphone",

    email:
      "E-mail",

    continue:
      "Continuer",

    back:
      "Retour",

    restart:
      "Recommencer",

    required:
      "Champ obligatoire",

    invalidPhone:
      "Numéro de téléphone invalide",

    invalidEmail:
      "Adresse e-mail invalide",

    peopleTitle:
      "Vous êtes combien ?",

    dateTitle:
      "Quand viens-tu à Barcelone ?",

    arrivalDate:
      "Date d’arrivée",

    departureDate:
      "Date de départ",

    styleTitle:
      "Quelle ambiance ?",

    budgetTitle:
      "Quel budget ?",

    resultTitle:
      "C’est prêt",

    send:
      "Envoyer à B4F",

    peopleOptions: [
      "1–2 personnes",
      "3–5 personnes",
      "6–10 personnes",
      "10+ personnes",
    ],

    styleOptions: [
      "Club",
      "Beach club",
      "Boat party",
      "Pool party",
      "Peu importe",
    ],

    budgetOptions: [
      "Moins de 20 €",
      "20–40 €",
      "40–70 €",
      "70 € et +",
      "Peu importe",
    ],

    group:
      "Groupe",

    atmosphere:
      "Ambiance",

    budget:
      "Budget",
  },

  en: {
    title:
      "B4F EVENTS",

    status:
      "Available",

    homeTitle:
      "Need help?",

    directTitle:
      "Contact B4F",

    directText:
      "Talk directly with our team",

    quizTitle:
      "Find my party",

    quizText:
      "Let us help you choose",

    contactTitle:
      "Your details",

    contactText:
      "So our team can get back to you.",

    firstName:
      "First name",

    lastName:
      "Last name",

    phone:
      "Phone",

    email:
      "Email",

    continue:
      "Continue",

    back:
      "Back",

    restart:
      "Start again",

    required:
      "Required field",

    invalidPhone:
      "Invalid phone number",

    invalidEmail:
      "Invalid email address",

    peopleTitle:
      "How many people?",

    dateTitle:
      "When are you in Barcelona?",

    arrivalDate:
      "Arrival date",

    departureDate:
      "Departure date",

    styleTitle:
      "What vibe?",

    budgetTitle:
      "What's your budget?",

    resultTitle:
      "You're ready",

    send:
      "Send to B4F",

    peopleOptions: [
      "1–2 people",
      "3–5 people",
      "6–10 people",
      "10+ people",
    ],

    styleOptions: [
      "Club",
      "Beach club",
      "Boat party",
      "Pool party",
      "No preference",
    ],

    budgetOptions: [
      "Under €20",
      "€20–40",
      "€40–70",
      "€70+",
      "No preference",
    ],

    group:
      "Group",

    atmosphere:
      "Vibe",

    budget:
      "Budget",
  },

  es: {
    title:
      "B4F EVENTS",

    status:
      "Disponible",

    homeTitle:
      "¿Necesitas ayuda?",

    directTitle:
      "Contactar B4F",

    directText:
      "Habla directamente con nuestro equipo",

    quizTitle:
      "Encontrar mi fiesta",

    quizText:
      "Te ayudamos a elegir",

    contactTitle:
      "Tus datos",

    contactText:
      "Para que nuestro equipo pueda responderte.",

    firstName:
      "Nombre",

    lastName:
      "Apellido",

    phone:
      "Teléfono",

    email:
      "E-mail",

    continue:
      "Continuar",

    back:
      "Volver",

    restart:
      "Empezar de nuevo",

    required:
      "Campo obligatorio",

    invalidPhone:
      "Número inválido",

    invalidEmail:
      "E-mail inválido",

    peopleTitle:
      "¿Cuántas personas sois?",

    dateTitle:
      "¿Cuándo vienes a Barcelona?",

    arrivalDate:
      "Fecha de llegada",

    departureDate:
      "Fecha de salida",

    styleTitle:
      "¿Qué ambiente?",

    budgetTitle:
      "¿Qué presupuesto?",

    resultTitle:
      "Todo listo",

    send:
      "Enviar a B4F",

    peopleOptions: [
      "1–2 personas",
      "3–5 personas",
      "6–10 personas",
      "10+ personas",
    ],

    styleOptions: [
      "Club",
      "Beach club",
      "Boat party",
      "Pool party",
      "Sin preferencia",
    ],

    budgetOptions: [
      "Menos de 20 €",
      "20–40 €",
      "40–70 €",
      "70 € o más",
      "Sin preferencia",
    ],

    group:
      "Grupo",

    atmosphere:
      "Ambiente",

    budget:
      "Presupuesto",
  },

  it: {
    title:
      "B4F EVENTS",

    status:
      "Disponibile",

    homeTitle:
      "Hai bisogno di aiuto?",

    directTitle:
      "Contatta B4F",

    directText:
      "Parla direttamente con il nostro team",

    quizTitle:
      "Trova la mia festa",

    quizText:
      "Ti aiutiamo a scegliere",

    contactTitle:
      "I tuoi dati",

    contactText:
      "Per permettere al nostro team di risponderti.",

    firstName:
      "Nome",

    lastName:
      "Cognome",

    phone:
      "Telefono",

    email:
      "E-mail",

    continue:
      "Continua",

    back:
      "Indietro",

    restart:
      "Ricomincia",

    required:
      "Campo obbligatorio",

    invalidPhone:
      "Numero non valido",

    invalidEmail:
      "E-mail non valida",

    peopleTitle:
      "Quante persone siete?",

    dateTitle:
      "Quando vieni a Barcellona?",

    arrivalDate:
      "Data di arrivo",

    departureDate:
      "Data di partenza",

    styleTitle:
      "Che atmosfera?",

    budgetTitle:
      "Quale budget?",

    resultTitle:
      "Tutto pronto",

    send:
      "Invia a B4F",

    peopleOptions: [
      "1–2 persone",
      "3–5 persone",
      "6–10 persone",
      "10+ persone",
    ],

    styleOptions: [
      "Club",
      "Beach club",
      "Boat party",
      "Pool party",
      "Indifferente",
    ],

    budgetOptions: [
      "Meno di 20 €",
      "20–40 €",
      "40–70 €",
      "70 € e oltre",
      "Indifferente",
    ],

    group:
      "Gruppo",

    atmosphere:
      "Atmosfera",

    budget:
      "Budget",
  },

  de: {
    title:
      "B4F EVENTS",

    status:
      "Verfügbar",

    homeTitle:
      "Brauchst du Hilfe?",

    directTitle:
      "B4F kontaktieren",

    directText:
      "Direkt mit unserem Team sprechen",

    quizTitle:
      "Party finden",

    quizText:
      "Wir helfen dir bei der Auswahl",

    contactTitle:
      "Deine Daten",

    contactText:
      "Damit unser Team dir antworten kann.",

    firstName:
      "Vorname",

    lastName:
      "Nachname",

    phone:
      "Telefon",

    email:
      "E-Mail",

    continue:
      "Weiter",

    back:
      "Zurück",

    restart:
      "Neu starten",

    required:
      "Pflichtfeld",

    invalidPhone:
      "Ungültige Telefonnummer",

    invalidEmail:
      "Ungültige E-Mail",

    peopleTitle:
      "Wie viele Personen?",

    dateTitle:
      "Wann bist du in Barcelona?",

    arrivalDate:
      "Ankunft",

    departureDate:
      "Abreise",

    styleTitle:
      "Welche Stimmung?",

    budgetTitle:
      "Welches Budget?",

    resultTitle:
      "Fertig",

    send:
      "An B4F senden",

    peopleOptions: [
      "1–2 Personen",
      "3–5 Personen",
      "6–10 Personen",
      "10+ Personen",
    ],

    styleOptions: [
      "Club",
      "Beach Club",
      "Boat Party",
      "Pool Party",
      "Egal",
    ],

    budgetOptions: [
      "Unter 20 €",
      "20–40 €",
      "40–70 €",
      "70 €+",
      "Egal",
    ],

    group:
      "Gruppe",

    atmosphere:
      "Stimmung",

    budget:
      "Budget",
  },

  nl: {
    title:
      "B4F EVENTS",

    status:
      "Beschikbaar",

    homeTitle:
      "Hulp nodig?",

    directTitle:
      "Contact B4F",

    directText:
      "Praat direct met ons team",

    quizTitle:
      "Vind mijn feest",

    quizText:
      "Wij helpen je kiezen",

    contactTitle:
      "Jouw gegevens",

    contactText:
      "Zodat ons team je kan antwoorden.",

    firstName:
      "Voornaam",

    lastName:
      "Achternaam",

    phone:
      "Telefoon",

    email:
      "E-mail",

    continue:
      "Doorgaan",

    back:
      "Terug",

    restart:
      "Opnieuw beginnen",

    required:
      "Verplicht veld",

    invalidPhone:
      "Ongeldig telefoonnummer",

    invalidEmail:
      "Ongeldig e-mailadres",

    peopleTitle:
      "Met hoeveel personen?",

    dateTitle:
      "Wanneer ben je in Barcelona?",

    arrivalDate:
      "Aankomstdatum",

    departureDate:
      "Vertrekdatum",

    styleTitle:
      "Welke sfeer?",

    budgetTitle:
      "Welk budget?",

    resultTitle:
      "Klaar",

    send:
      "Naar B4F sturen",

    peopleOptions: [
      "1–2 personen",
      "3–5 personen",
      "6–10 personen",
      "10+ personen",
    ],

    styleOptions: [
      "Club",
      "Beach club",
      "Boat party",
      "Pool party",
      "Geen voorkeur",
    ],

    budgetOptions: [
      "Minder dan €20",
      "€20–40",
      "€40–70",
      "€70+",
      "Geen voorkeur",
    ],

    group:
      "Groep",

    atmosphere:
      "Sfeer",

    budget:
      "Budget",
  },
};

const phoneStyle = {
  width:
    "100%",

  "--react-international-phone-height":
    "48px",

  "--react-international-phone-background-color":
    "transparent",

  "--react-international-phone-text-color":
    "#ffffff",

  "--react-international-phone-font-size":
    "12px",

  "--react-international-phone-border-radius":
    "0px",

  "--react-international-phone-border-color":
    "transparent",

  "--react-international-phone-country-selector-background-color":
    "transparent",

  "--react-international-phone-country-selector-background-color-hover":
    "rgba(255,255,255,.05)",

  "--react-international-phone-country-selector-border-color":
    "transparent",

  "--react-international-phone-country-selector-arrow-color":
    "rgba(255,255,255,.35)",

  "--react-international-phone-dropdown-item-background-color":
    "#151515",

  "--react-international-phone-dropdown-item-text-color":
    "rgba(255,255,255,.78)",

  "--react-international-phone-dropdown-item-dial-code-color":
    "rgba(255,255,255,.35)",

  "--react-international-phone-selected-dropdown-item-background-color":
    "#252525",

  "--react-international-phone-focused-dropdown-item-background-color":
    "#202020",

  "--react-international-phone-dropdown-shadow":
    "0 24px 70px rgba(0,0,0,.75)",

  "--react-international-phone-dropdown-item-height":
    "42px",
} as CSSProperties;

function formatSelectedDate(
  value: string,
  locale: string,
) {
  if (!value) {
    return "";
  }

  const parts =
    value.split("-");

  if (
    parts.length !== 3
  ) {
    return value;
  }

  const year =
    Number(
      parts[0],
    );

  const month =
    Number(
      parts[1],
    );

  const day =
    Number(
      parts[2],
    );

  const date =
    new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    locale || "fr-FR",
    {
      weekday:
        "short",

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    },
  )
    .format(
      date,
    )
    .replace(
      /\./g,
      "",
    );
}

export function WhatsAppAssistant() {
  const {
    language,
    locale,
  } = useI18n();

  const {
    open: cartOpen,
  } = useCart();

  const {
    authOpen,
  } = useAuth();

  const copy =
    copies[language];

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    step,
    setStep,
  ] =
    useState<Step>(
      "home",
    );

  const [
    validation,
    setValidation,
  ] =
    useState(false);

  const [
    answers,
    setAnswers,
  ] =
    useState<Answers>({
      firstName:
        "",

      lastName:
        "",

      phoneCode:
        "+33",

      phone:
        "",

      email:
        "",

      people:
        "",

      arrivalDate:
        "",

      departureDate:
        "",

      style:
        "",

      budget:
        "",
    });

  const promoterNumber =
    (
      import.meta.env
        .VITE_DEFAULT_PROMOTER_WHATSAPP_NUMBER ||
      import.meta.env
        .VITE_PROMOTER_WHATSAPP_NUMBER ||
      "33652195888"
    ).replace(
      /\D/g,
      "",
    );

  /*
   * VALIDATION CONTACT
   */
  const firstNameValid =
    answers.firstName
      .trim()
      .length >= 2;

  const lastNameValid =
    answers.lastName
      .trim()
      .length >= 2;

  const phoneValid =
    answers.phone
      .replace(
        /\D/g,
        "",
      )
      .length >= 6;

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      answers.email.trim(),
    );

  const contactValid =
    firstNameValid &&
    lastNameValid &&
    phoneValid &&
    emailValid;

  const phoneValue =
    answers.phone
      ? `${answers.phoneCode}${answers.phone}`
      : "";

  /*
   * DATES FORMATÉES
   */
  const formattedArrivalDate =
    formatSelectedDate(
      answers.arrivalDate,
      locale,
    );

  const formattedDepartureDate =
    formatSelectedDate(
      answers.departureDate,
      locale,
    );

  /*
   * WHATSAPP DIRECT
   */
  const directUrl =
    useMemo(() => {
      const text =
        encodeURIComponent(
          language ===
            "fr"
            ? "Bonjour, J’aimerais avoir des informations pour ma sortie à Barcelone."
            : "Hi, I would like some information about my night in Barcelona.",
        );

      return `https://wa.me/${promoterNumber}?text=${text}`;
    }, [
      language,
      promoterNumber,
    ]);

  /*
   * WHATSAPP QUESTIONNAIRE
   */
  const questionnaireUrl =
    useMemo(() => {
      const arrival =
        formatSelectedDate(
          answers.arrivalDate,
          locale,
        );

      const departure =
        formatSelectedDate(
          answers.departureDate,
          locale,
        );

      const text =
        encodeURIComponent(
          `Bonjour

👤 Prénom : ${answers.firstName}
👤 Nom : ${answers.lastName}
📞 Téléphone : ${answers.phoneCode} ${answers.phone}
✉️ E-mail : ${answers.email}

👥 Groupe : ${answers.people}
✈️ Arrivée : ${arrival}
🏠 Départ : ${departure}
🎉 Ambiance : ${answers.style}
💶 Budget : ${answers.budget}

🌍 Langue : ${language.toUpperCase()}

Pouvez-vous me conseiller une soirée ou un pack ?`,
        );

      return `https://wa.me/${promoterNumber}?text=${text}`;
    }, [
      answers,
      language,
      locale,
      promoterNumber,
    ]);

  /*
   * DATE MINIMUM = AUJOURD'HUI
   */
  const today =
    useMemo(() => {
      const date =
        new Date();

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() +
            1,
        ).padStart(
          2,
          "0",
        );

      const day =
        String(
          date.getDate(),
        ).padStart(
          2,
          "0",
        );

      return `${year}-${month}-${day}`;
    }, []);

  /*
   * PHONE
   */
  const handlePhoneChange = (
    value: string,
    meta: {
      country:
        ParsedCountry;

      inputValue:
        string;
    },
  ) => {
    const dialCode =
      meta.country
        .dialCode;

    const digits =
      value.replace(
        /\D/g,
        "",
      );

    const nationalNumber =
      digits.startsWith(
        dialCode,
      )
        ? digits.slice(
            dialCode.length,
          )
        : digits;

    setAnswers(
      (
        current,
      ) => ({
        ...current,

        phoneCode:
          dialCode
            ? `+${dialCode}`
            : "",

        phone:
          nationalNumber,
      }),
    );
  };

  /*
   * CONTINUER APRÈS CONTACT
   */
  const continueContact =
    () => {
      setValidation(
        true,
      );

      if (
        !contactValid
      ) {
        return;
      }

      setValidation(
        false,
      );

      setStep(
        "people",
      );
    };

  /*
   * RESET
   */
  const reset =
    () => {
      setStep(
        "home",
      );

      setValidation(
        false,
      );

      setAnswers({
        firstName:
          "",

        lastName:
          "",

        phoneCode:
          "+33",

        phone:
          "",

        email:
          "",

        people:
          "",

        arrivalDate:
          "",

        departureDate:
          "",

        style:
          "",

        budget:
          "",
      });
    };

  /*
   * RETOUR
   */
  const goBack =
    () => {
      switch (
        step
      ) {
        case "contact":
          setStep(
            "home",
          );

          break;

        case "people":
          setStep(
            "contact",
          );

          break;

        case "date":
          setStep(
            "people",
          );

          break;

        case "style":
          setStep(
            "date",
          );

          break;

        case "budget":
          setStep(
            "style",
          );

          break;

        case "result":
          setStep(
            "budget",
          );

          break;

        default:
          break;
      }
    };

  /*
   * MASQUER SI PANIER
   * OU AUTH OUVERT
   */
  if (
    cartOpen ||
    authOpen
  ) {
    return null;
  }

  return (
    <div
      className="
        fixed
        bottom-4
        right-4
        z-[42]
        sm:bottom-5
        sm:right-5
      "
    >

      {/* =========================
          ASSISTANT
      ========================== */}
      {open && (
        <section
          className={`
            mb-3
            flex
            w-[350px]
            max-w-[calc(100vw-20px)]
            flex-col
            overflow-hidden
            rounded-[22px]
            border
            border-white/[0.09]
            bg-[#101010]
            shadow-[0_26px_75px_rgba(0,0,0,.72)]

            ${
              step ===
              "home"
                ? "h-auto"
                : "h-[500px] max-h-[calc(100dvh-165px)]"
            }
          `}
        >

          {/* =========================
              HEADER
          ========================== */}
          <header
            className="
              relative
              flex
              shrink-0
              items-center
              gap-3
              overflow-hidden
              border-b
              border-white/[0.07]
              bg-[#111]
              px-3.5
              py-3
            "
          >
            {/* DARK GRADIENT */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[linear-gradient(110deg,#111_0%,#1d1d1d_48%,#111_100%)]
              "
            />

            <div className="relative flex w-full items-center gap-3">

              {/* BACK */}
              {step !==
                "home" && (
                <button
                  type="button"
                  onClick={
                    goBack
                  }
                  className="
                    grid
                    h-8
                    w-8
                    shrink-0
                    place-items-center
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.025]
                    text-white/40
                    outline-none
                    ring-0
                    transition
                    hover:bg-white/[0.06]
                    hover:text-white
                    focus:outline-none
                    focus:ring-0
                  "
                  aria-label={
                    copy.back
                  }
                >
                  <ArrowLeft
                    size={14}
                  />
                </button>
              )}

              {/* B4F LOGO */}
              <span
                className="
                  relative
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/[0.10]
                  bg-gradient-to-br
                  from-[#3a3a3a]
                  via-[#181818]
                  to-[#050505]
                  shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_8px_25px_rgba(0,0,0,.28)]
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.13),transparent_48%)]
                  "
                />

                <img
                  src="/brand/b4f-mark-gradient.png"
                  alt="B4F"
                  className="
                    relative
                    z-[1]
                    h-[30px]
                    w-[30px]
                    object-contain
                  "
                />
              </span>

              {/* B4F EVENTS */}
              <div className="min-w-0 flex-1">
                <strong
                  className="
                    block
                    font-subtitle
                    text-[13px]
                    tracking-[-0.01em]
                    text-white
                  "
                >
                  {
                    copy.title
                  }
                </strong>

                <span
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                    font-body
                    text-[10px]
                    text-white/32
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-[#25D366]
                      shadow-[0_0_8px_rgba(37,211,102,.55)]
                    "
                  />

                  {
                    copy.status
                  }
                </span>
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={() =>
                  setOpen(
                    false,
                  )
                }
                className="
                  grid
                  h-9
                  w-9
                  shrink-0
                  place-items-center
                  rounded-full
                  border
                  border-white/[0.08]
                  bg-white/[0.02]
                  text-white/30
                  outline-none
                  ring-0
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                  focus:outline-none
                  focus:ring-0
                "
                aria-label="Fermer"
              >
                <X
                  size={16}
                />
              </button>
            </div>
          </header>

          {/* =========================
              CONTENT
          ========================== */}
          <div
            className={`
              custom-scrollbar
              min-h-0
              overflow-y-auto
              overscroll-contain
              p-4

              ${
                step ===
                "home"
                  ? ""
                  : "flex-1"
              }
            `}
          >

            {/* =========================
                HOME
            ========================== */}
            {step ===
              "home" && (
              <div>
                <h2
                  className="
                    mt-0.5
                    font-title
                    text-[24px]
                    uppercase
                    leading-none
                    tracking-[-0.025em]
                    text-white
                  "
                >
                  {
                    copy.homeTitle
                  }
                </h2>

                <div className="mt-4 space-y-2">

                  {/* CONTACT */}
                  <a
                    href={
                      directUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="
                      group
                      flex
                      min-h-[64px]
                      items-center
                      gap-3
                      rounded-[16px]
                      border
                      border-white/[0.075]
                      bg-[#151515]
                      px-3
                      py-2.5
                      transition
                      hover:border-[#25D366]/25
                      hover:bg-[#171717]
                    "
                  >
                    <span
                      className="
                        grid
                        h-10
                        w-10
                        shrink-0
                        place-items-center
                        rounded-[12px]
                        bg-[#25D366]
                        text-black
                      "
                    >
                      <MessageCircle
                        size={18}
                        fill="currentColor"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong className="block font-subtitle text-[12px] text-white/90">
                        {
                          copy.directTitle
                        }
                      </strong>

                      <span className="mt-0.5 block truncate font-body text-[10px] text-white/28">
                        {
                          copy.directText
                        }
                      </span>
                    </span>

                    <ChevronRight
                      size={14}
                      className="
                        shrink-0
                        text-white/15
                        transition-transform
                        group-hover:translate-x-0.5
                        group-hover:text-white/35
                      "
                    />
                  </a>

                  {/* QUESTIONNAIRE */}
                  <button
                    type="button"
                    onClick={() =>
                      setStep(
                        "contact",
                      )
                    }
                    className="
                      group
                      flex
                      min-h-[64px]
                      w-full
                      items-center
                      gap-3
                      rounded-[16px]
                      border
                      border-white/[0.075]
                      bg-[#151515]
                      px-3
                      py-2.5
                      text-left
                      transition
                      hover:border-secondary/25
                      hover:bg-[#171717]
                    "
                  >
                    <span
                      className="
                        grid
                        h-10
                        w-10
                        shrink-0
                        place-items-center
                        rounded-[12px]
                        bg-secondary
                        text-black
                      "
                    >
                      <Sparkles
                        size={18}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong className="block font-subtitle text-[12px] text-white/90">
                        {
                          copy.quizTitle
                        }
                      </strong>

                      <span className="mt-0.5 block truncate font-body text-[10px] text-white/28">
                        {
                          copy.quizText
                        }
                      </span>
                    </span>

                    <ChevronRight
                      size={14}
                      className="
                        shrink-0
                        text-white/15
                        transition-transform
                        group-hover:translate-x-0.5
                      "
                    />
                  </button>
                </div>
              </div>
            )}

            {/* =========================
                CONTACT
            ========================== */}
            {step ===
              "contact" && (
              <div>
                <StepHeader
                  step="1/5"
                  title={
                    copy.contactTitle
                  }
                  text={
                    copy.contactText
                  }
                />

                <div className="mt-4 grid gap-3">

                  {/* FIRST + LAST NAME */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label={
                        copy.firstName
                      }
                      value={
                        answers.firstName
                      }
                      placeholder="Pierre"
                      error={
                        validation &&
                        !firstNameValid
                          ? copy.required
                          : ""
                      }
                      onChange={(
                        value,
                      ) =>
                        setAnswers(
                          (
                            current,
                          ) => ({
                            ...current,

                            firstName:
                              value,
                          }),
                        )
                      }
                    />

                    <Field
                      label={
                        copy.lastName
                      }
                      value={
                        answers.lastName
                      }
                      placeholder="Dujardin"
                      error={
                        validation &&
                        !lastNameValid
                          ? copy.required
                          : ""
                      }
                      onChange={(
                        value,
                      ) =>
                        setAnswers(
                          (
                            current,
                          ) => ({
                            ...current,

                            lastName:
                              value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <span className="mb-1.5 block font-subtitle text-[10px] text-white/50">
                      {
                        copy.phone
                      }
                    </span>

                    <div
                      className={`
                        relative
                        overflow-visible
                        rounded-[14px]
                        border
                        bg-[#151515]
                        transition

                        ${
                          validation &&
                          !phoneValid
                            ? "border-red-500/60"
                            : "border-white/[0.08] focus-within:border-white/18"
                        }
                      `}
                    >
                      <PhoneInput
                        defaultCountry="fr"
                        value={
                          phoneValue
                        }
                        onChange={
                          handlePhoneChange
                        }
                        preferredCountries={[
                          "fr",
                          "es",
                          "be",
                          "ch",
                          "gb",
                          "it",
                          "de",
                          "nl",
                          "pt",
                        ]}
                        forceDialCode
                        inputProps={{
                          name:
                            "phone",

                          autoComplete:
                            "tel",

                          placeholder:
                            "06 12 34 56 78",
                        }}
                        style={
                          phoneStyle
                        }
                        inputStyle={{
                          width:
                            "100%",

                          height:
                            "48px",

                          padding:
                            "0 12px",

                          background:
                            "transparent",

                          border:
                            "none",

                          outline:
                            "none",

                          boxShadow:
                            "none",
                        }}
                        countrySelectorStyleProps={{
                          buttonStyle: {
                            width:
                              "62px",

                            height:
                              "48px",

                            border:
                              "none",

                            borderRight:
                              "1px solid rgba(255,255,255,.07)",

                            borderRadius:
                              "13px 0 0 13px",

                            background:
                              "transparent",

                            outline:
                              "none",

                            boxShadow:
                              "none",
                          },

                          buttonContentWrapperStyle: {
                            gap:
                              "6px",
                          },

                          flagStyle: {
                            width:
                              "20px",
                          },

                          dropdownStyleProps: {
                            style: {
                              width:
                                "min(320px, calc(100vw - 36px))",

                              maxHeight:
                                "280px",

                              padding:
                                "7px",

                              background:
                                "#151515",

                              border:
                                "1px solid rgba(255,255,255,.10)",

                              borderRadius:
                                "16px",

                              overflowX:
                                "hidden",

                              boxShadow:
                                "0 28px 80px rgba(0,0,0,.8)",

                              zIndex:
                                100,
                            },

                            listItemStyle: {
                              minHeight:
                                "40px",

                              margin:
                                "2px 0",

                              padding:
                                "0 9px",

                              borderRadius:
                                "9px",
                            },

                            listItemCountryNameStyle: {
                              color:
                                "rgba(255,255,255,.78)",

                              fontSize:
                                "12px",
                            },

                            listItemDialCodeStyle: {
                              color:
                                "rgba(255,255,255,.32)",

                              fontSize:
                                "11px",
                            },
                          },
                        }}
                      />
                    </div>

                    {validation &&
                      !phoneValid && (
                        <p className="mt-1 font-body text-[9px] text-red-400">
                          {
                            copy.invalidPhone
                          }
                        </p>
                      )}
                  </div>

                  {/* EMAIL */}
                  <Field
                    label={
                      copy.email
                    }
                    value={
                      answers.email
                    }
                    placeholder="Pierre@gmail.com"
                    type="email"
                    error={
                      validation &&
                      !emailValid
                        ? copy.invalidEmail
                        : ""
                    }
                    onChange={(
                      value,
                    ) =>
                      setAnswers(
                        (
                          current,
                        ) => ({
                          ...current,

                          email:
                            value,
                        }),
                      )
                    }
                  />

                  <ContinueButton
                    label={
                      copy.continue
                    }
                    onClick={
                      continueContact
                    }
                  />
                </div>
              </div>
            )}

            {/* =========================
                PEOPLE
            ========================== */}
            {step ===
              "people" && (
              <ChoiceStep
                step="2/5"
                title={
                  copy.peopleTitle
                }
                options={
                  copy.peopleOptions
                }
                selected={
                  answers.people
                }
                onSelect={(
                  value,
                ) => {
                  setAnswers(
                    (
                      current,
                    ) => ({
                      ...current,

                      people:
                        value,
                    }),
                  );

                  setStep(
                    "date",
                  );
                }}
              />
            )}

            {/* =========================
                ARRIVAL + DEPARTURE
            ========================== */}
            {step ===
              "date" && (
              <div>
                <StepHeader
                  step="3/5"
                  title={
                    copy.dateTitle
                  }
                />

                <div className="mt-5 space-y-4">

                  {/* ARRIVAL */}
                  <label>
                    <span className="mb-1.5 block font-subtitle text-[10px] text-white/50">
                      {
                        copy.arrivalDate
                      }
                    </span>

                    <input
                      type="date"
                      min={
                        today
                      }
                      value={
                        answers.arrivalDate
                      }
                      onChange={(
                        event,
                      ) => {
                        const value =
                          event.target.value;

                        setAnswers(
                          (
                            current,
                          ) => ({
                            ...current,

                            arrivalDate:
                              value,

                            /*
                             * SI LE DÉPART
                             * DEVIENT ANTÉRIEUR
                             * À L'ARRIVÉE,
                             * ON LE RÉINITIALISE.
                             */
                            departureDate:
                              current.departureDate &&
                              current.departureDate <
                                value
                                ? ""
                                : current.departureDate,
                          }),
                        );
                      }}
                      className="
                        h-12
                        w-full
                        rounded-[14px]
                        border
                        border-white/[0.08]
                        bg-[#151515]
                        px-3.5
                        font-subtitle
                        text-[12px]
                        text-white
                        outline-none
                        ring-0
                        transition
                        focus:border-white/20
                        focus:outline-none
                        focus:ring-0
                      "
                    />

                    {answers.arrivalDate && (
                      <p className="mt-1.5 font-body text-[10px] capitalize text-white/30">
                        {
                          formattedArrivalDate
                        }
                      </p>
                    )}
                  </label>

                  {/* DEPARTURE */}
                  <label>
                    <span className="mb-1.5 block font-subtitle text-[10px] text-white/50">
                      {
                        copy.departureDate
                      }
                    </span>

                    <input
                      type="date"
                      min={
                        answers.arrivalDate ||
                        today
                      }
                      value={
                        answers.departureDate
                      }
                      onChange={(
                        event,
                      ) => {
                        /*
                         * PAS DE PASSAGE
                         * AUTOMATIQUE.
                         *
                         * ON ENREGISTRE
                         * SEULEMENT LA DATE.
                         */
                        setAnswers(
                          (
                            current,
                          ) => ({
                            ...current,

                            departureDate:
                              event.target.value,
                          }),
                        );
                      }}
                      className="
                        h-12
                        w-full
                        rounded-[14px]
                        border
                        border-white/[0.08]
                        bg-[#151515]
                        px-3.5
                        font-subtitle
                        text-[12px]
                        text-white
                        outline-none
                        ring-0
                        transition
                        focus:border-white/20
                        focus:outline-none
                        focus:ring-0
                      "
                    />

                    {answers.departureDate && (
                      <p className="mt-1.5 font-body text-[10px] capitalize text-white/30">
                        {
                          formattedDepartureDate
                        }
                      </p>
                    )}
                  </label>

                  {/* MANUAL CONTINUE */}
                  <ContinueButton
                    label={
                      copy.continue
                    }
                    disabled={
                      !answers.arrivalDate ||
                      !answers.departureDate
                    }
                    onClick={() =>
                      setStep(
                        "style",
                      )
                    }
                  />
                </div>
              </div>
            )}

            {/* =========================
                STYLE
            ========================== */}
            {step ===
              "style" && (
              <ChoiceStep
                step="4/5"
                title={
                  copy.styleTitle
                }
                options={
                  copy.styleOptions
                }
                selected={
                  answers.style
                }
                onSelect={(
                  value,
                ) => {
                  setAnswers(
                    (
                      current,
                    ) => ({
                      ...current,

                      style:
                        value,
                    }),
                  );

                  setStep(
                    "budget",
                  );
                }}
              />
            )}

            {/* =========================
                BUDGET
            ========================== */}
            {step ===
              "budget" && (
              <ChoiceStep
                step="5/5"
                title={
                  copy.budgetTitle
                }
                options={
                  copy.budgetOptions
                }
                selected={
                  answers.budget
                }
                onSelect={(
                  value,
                ) => {
                  setAnswers(
                    (
                      current,
                    ) => ({
                      ...current,

                      budget:
                        value,
                    }),
                  );

                  setStep(
                    "result",
                  );
                }}
              />
            )}

            {/* =========================
                RESULT
            ========================== */}
            {step ===
              "result" && (
              <div>

                {/* SUCCESS */}
                <div className="text-center">
                  <span
                    className="
                      mx-auto
                      grid
                      h-11
                      w-11
                      place-items-center
                      rounded-full
                      bg-green-500/10
                      text-green-400
                    "
                  >
                    <Check
                      size={19}
                    />
                  </span>

                  {/* PAS DE ✨ */}
                  <h2
                    className="
                      mt-3
                      font-title
                      text-[24px]
                      uppercase
                    "
                  >
                    {
                      copy.resultTitle
                    }
                  </h2>
                </div>

                {/* SUMMARY */}
                <div
                  className="
                    mt-4
                    overflow-hidden
                    rounded-[16px]
                    border
                    border-white/[0.07]
                    bg-[#151515]
                  "
                >
                  <SummaryRow
                    label={
                      copy.firstName
                    }
                    value={
                      answers.firstName
                    }
                  />

                  <SummaryRow
                    label={
                      copy.lastName
                    }
                    value={
                      answers.lastName
                    }
                  />

                  <SummaryRow
                    label={
                      copy.phone
                    }
                    value={
                      `${answers.phoneCode} ${answers.phone}`
                    }
                  />

                  <SummaryRow
                    label={
                      copy.email
                    }
                    value={
                      answers.email
                    }
                  />

                  <SummaryRow
                    label={
                      copy.group
                    }
                    value={
                      answers.people
                    }
                  />

                  <SummaryRow
                    label={
                      copy.arrivalDate
                    }
                    value={
                      formattedArrivalDate
                    }
                  />

                  <SummaryRow
                    label={
                      copy.departureDate
                    }
                    value={
                      formattedDepartureDate
                    }
                  />

                  <SummaryRow
                    label={
                      copy.atmosphere
                    }
                    value={
                      answers.style
                    }
                  />

                  <SummaryRow
                    label={
                      copy.budget
                    }
                    value={
                      answers.budget
                    }
                    last
                  />
                </div>

                {/* SEND */}
                <a
                  href={
                    questionnaireUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    mt-3
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    bg-[#25D366]
                    font-subtitle
                    text-[12px]
                    text-black
                    transition
                    hover:brightness-105
                  "
                >
                  {
                    copy.send
                  }

                  <Send
                    size={15}
                  />
                </a>

                {/* RESET */}
                <button
                  type="button"
                  onClick={
                    reset
                  }
                  className="
                    mt-2
                    w-full
                    py-2
                    font-body
                    text-[10px]
                    text-white/25
                    transition
                    hover:text-white/55
                  "
                >
                  {
                    copy.restart
                  }
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================
          FLOATING BUTTON
      ========================== */}
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              current,
            ) =>
              !current,
          )
        }
        className="
          group
          relative
          ml-auto
          grid
          h-14
          w-14
          place-items-center
          rounded-full
          bg-[#25D366]
          text-black
          shadow-[0_16px_50px_rgba(37,211,102,.26)]
          outline-none
          ring-0
          transition
          hover:-translate-y-0.5
          hover:scale-105
          focus:outline-none
          focus:ring-0
        "
        aria-label={
          copy.title
        }
      >
        {open ? (
          <X
            size={21}
          />
        ) : (
          <MessageCircle
            size={23}
            fill="currentColor"
          />
        )}
      </button>
    </div>
  );
}

/* =========================
   STEP HEADER
========================= */

function StepHeader({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text?: string;
}) {
  return (
    <div>
      <span
        className="
          font-subtitle
          text-[8px]
          uppercase
          tracking-[0.15em]
          text-secondary
        "
      >
        {step}
      </span>

      <h2
        className="
          mt-1.5
          font-title
          text-[24px]
          uppercase
          leading-[0.94]
        "
      >
        {title}
      </h2>

      {text && (
        <p
          className="
            mt-2
            font-body
            text-[11px]
            leading-5
            text-white/35
          "
        >
          {text}
        </p>
      )}
    </div>
  );
}

/* =========================
   FIELD
========================= */

function Field({
  label,
  value,
  placeholder,
  onChange,
  error = "",
  type = "text",
}: {
  label: string;

  value: string;

  placeholder: string;

  onChange: (
    value: string,
  ) => void;

  error?: string;

  type?: string;
}) {
  return (
    <label>
      <span
        className="
          mb-1.5
          block
          font-subtitle
          text-[10px]
          text-white/50
        "
      >
        {label}
      </span>

      <input
        type={
          type
        }
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className={`
          h-12
          w-full
          rounded-[14px]
          border
          bg-[#151515]
          px-3.5
          font-body
          text-[12px]
          text-white
          outline-none
          ring-0
          transition
          placeholder:text-white/20
          focus:outline-none
          focus:ring-0

          ${
            error
              ? "border-red-500/60"
              : "border-white/[0.08] focus:border-white/20"
          }
        `}
      />

      {error && (
        <p
          className="
            mt-1
            font-body
            text-[9px]
            text-red-400
          "
        >
          {error}
        </p>
      )}
    </label>
  );
}

/* =========================
   CONTINUE
========================= */

function ContinueButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;

  onClick: () => void;

  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className="
        mt-3
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-[14px]
        bg-secondary
        font-subtitle
        text-[12px]
        text-black
        outline-none
        ring-0
        transition
        hover:brightness-105
        focus:outline-none
        focus:ring-0
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      {label}

      <ChevronRight
        size={15}
      />
    </button>
  );
}

/* =========================
   CHOICE STEP
========================= */

function ChoiceStep({
  step,
  title,
  options,
  selected,
  onSelect,
}: {
  step: string;

  title: string;

  options: string[];

  selected: string;

  onSelect: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <StepHeader
        step={
          step
        }
        title={
          title
        }
      />

      <div className="mt-4 space-y-2">
        {options.map(
          (
            option,
          ) => {
            const active =
              option ===
              selected;

            return (
              <button
                key={
                  option
                }
                type="button"
                onClick={() =>
                  onSelect(
                    option,
                  )
                }
                className={`
                  flex
                  h-[46px]
                  w-full
                  items-center
                  justify-between
                  rounded-[14px]
                  border
                  px-3.5
                  text-left
                  font-subtitle
                  text-[11px]
                  outline-none
                  ring-0
                  transition
                  focus:outline-none
                  focus:ring-0

                  ${
                    active
                      ? "border-secondary/35 bg-secondary/[0.07] text-white"
                      : "border-white/[0.07] bg-[#151515] text-white/60 hover:border-white/[0.14] hover:text-white"
                  }
                `}
              >
                <span>
                  {option}
                </span>

                {active ? (
                  <Check
                    size={14}
                    className="text-secondary"
                  />
                ) : (
                  <ChevronRight
                    size={13}
                    className="text-white/15"
                  />
                )}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}

/* =========================
   SUMMARY
========================= */

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;

  value: string;

  last?: boolean;
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-3
        px-3.5
        py-2.5

        ${
          !last
            ? "border-b border-white/[0.05]"
            : ""
        }
      `}
    >
      <span
        className="
          shrink-0
          font-body
          text-[9px]
          text-white/25
        "
      >
        {label}
      </span>

      <strong
        className="
          min-w-0
          max-w-[220px]
          truncate
          text-right
          font-subtitle
          text-[10px]
          text-white/70
        "
      >
        {value}
      </strong>
    </div>
  );
}