import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Headphones,
  LoaderCircle,
  Mail,
  MessageCircle,
  Send,
  Ticket
} from "lucide-react";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useRef,
  useState
} from "react";

import {
  PhoneInput,
  type ParsedCountry
} from "react-international-phone";

import "react-international-phone/style.css";

import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";
import { media } from "../data/media";
import { useAuth } from "../providers/AuthProvider";
import { createSupportRequest } from "../services/support";

type SupportForm = {
  name: string;
  email: string;
  phoneCode: string;
  phone: string;
  topic: string;
  orderReference: string;
  message: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const topics = [
  "Billets et commande",
  "Paiement SumUp",
  "Accès à une soirée",
  "Pack",
  "Promoteur",
  "Remboursement",
  "Avantage partenaire",
  "Autre"
];

const faqGroups = [
  {
    category: "Général",
    questions: [
      {
        question:
          "Le compte B4F est-il obligatoire ?",
        answer:
          "Non. Tu peux acheter un billet ou un pack sans créer de compte. Le compte permet surtout de retrouver plus facilement tes commandes et réservations."
      },
      {
        question:
          "Comment contacter B4F si j’ai une question ?",
        answer:
          "Pour une question générale, tu peux écrire directement à l’équipe B4F sur WhatsApp ou utiliser le formulaire de support."
      },
      {
        question:
          "Qui contacter pour une question sur ma soirée ?",
        answer:
          "Pour ton rendez-vous, ton groupe ou le déroulement de la soirée, contacte directement ton promoteur sur WhatsApp."
      }
    ]
  },
  {
    category: "Billets & QR codes",
    questions: [
      {
        question:
          "Où retrouver mes billets après l’achat ?",
        answer:
          "Après confirmation du paiement, ta commande apparaît dans « Mes billets ». Si tu as acheté sans compte, conserve également le lien sécurisé associé à ta commande."
      },
      {
        question:
          "Quand mon QR code est-il créé ?",
        answer:
          "Les billets et QR codes sont créés uniquement lorsque le paiement a bien été confirmé."
      },
      {
        question:
          "Puis-je télécharger plusieurs billets dans un seul PDF ?",
        answer:
          "Oui. Le PDF peut regrouper les différents billets de ta commande avec les informations liées à chaque réservation."
      },
      {
        question:
          "Mon paiement est passé mais je ne vois pas mon billet. Que faire ?",
        answer:
          "Envoie-nous ta référence de commande et l’e-mail utilisé lors de l’achat afin que nous puissions retrouver rapidement la transaction."
      }
    ]
  },
  {
    category: "Paiement",
    questions: [
      {
        question:
          "Quand ma commande est-elle validée ?",
        answer:
          "La commande est validée lorsque le paiement est confirmé. Les billets ne sont pas générés avant cette confirmation."
      },
      {
        question:
          "Que faire si mon paiement échoue ?",
        answer:
          "Vérifie les informations de paiement puis réessaie. Si le problème continue, contacte B4F avec ton e-mail et ta référence de commande si tu en as une."
      }
    ]
  },
  {
    category: "Promoteur",
    questions: [
      {
        question:
          "Comment retrouver le contact de mon promoteur ?",
        answer:
          "Lorsqu’une commande est associée à un promoteur, son contact peut être retrouvé depuis les informations liées à ta réservation."
      },
      {
        question:
          "J’ai une question concernant le rendez-vous avant la soirée.",
        answer:
          "Contacte directement ton promoteur sur WhatsApp. C’est le meilleur interlocuteur pour les informations de rendez-vous, de groupe et d’accès."
      }
    ]
  },
  {
    category: "Packs & avantages",
    questions: [
      {
        question:
          "Où retrouver les événements compris dans mon pack ?",
        answer:
          "Les éléments associés à ton pack sont accessibles depuis ta réservation afin que tu puisses retrouver les événements et billets concernés."
      },
      {
        question:
          "Comment utiliser un avantage partenaire ?",
        answer:
          "Ouvre une commande payée et présente un billet B4F valide au partenaire. Les éventuelles conditions sont précisées avec l’avantage."
      }
    ]
  }
];

const allQuestions =
  faqGroups.flatMap((group) =>
    group.questions.map((item) => ({
      ...item,
      category: group.category
    }))
  );

const initialForm: SupportForm = {
  name: "",
  email: "",
  phoneCode: "+33",
  phone: "",
  topic: "Billets et commande",
  orderReference: "",
  message: ""
};

const phoneStyle = {
  width: "100%",

  "--react-international-phone-height":
    "54px",

  "--react-international-phone-background-color":
    "transparent",

  "--react-international-phone-text-color":
    "#ffffff",

  "--react-international-phone-font-size":
    "14px",

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
    "42px"
} as CSSProperties;

export function HelpPage() {
  const { user } = useAuth();

  const formRef =
    useRef<HTMLFormElement | null>(
      null
    );

  const topicRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    openQuestion,
    setOpenQuestion
  ] = useState<string | null>(
    null
  );

  const [
    topicOpen,
    setTopicOpen
  ] = useState(false);

  const [form, setForm] =
    useState<SupportForm>(
      initialForm
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [sending, setSending] =
    useState(false);

  const [success, setSuccess] =
    useState<string | null>(
      null
    );

  const [error, setError] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,

      name:
        current.name ||
        user.user_metadata
          ?.full_name ||
        "",

      email:
        current.email ||
        user.email ||
        ""
    }));
  }, [user]);

  useEffect(() => {
    const closeDropdown = (
      event: MouseEvent
    ) => {
      if (
        topicRef.current &&
        !topicRef.current.contains(
          event.target as Node
        )
      ) {
        setTopicOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      closeDropdown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeDropdown
      );
    };
  }, []);

  const promoterNumber =
    String(
      import.meta.env
        .VITE_PROMOTER_WHATSAPP_NUMBER ||
        "33652195888"
    ).replace(/\D/g, "");

  const supportNumber =
    String(
      import.meta.env
        .VITE_SUPPORT_WHATSAPP_NUMBER ||
        "33652195888"
    ).replace(/\D/g, "");

  const promoterMessage = [
    "Bonjour 👋",
    "J’ai une question concernant une soirée B4F.",

    form.orderReference
      ? `Commande : ${form.orderReference}`
      : ""
  ]
    .filter(Boolean)
    .join("\n");

  const promoterWhatsappUrl =
    `https://wa.me/${promoterNumber}?text=${encodeURIComponent(
      promoterMessage
    )}`;

  const supportWhatsappMessage = [
    "Bonjour B4F 👋",

    form.name
      ? `Nom : ${form.name}`
      : "",

    form.orderReference
      ? `Commande : ${form.orderReference}`
      : "",

    `Sujet : ${form.topic}`,

    form.message
      ? `Message : ${form.message}`
      : "J’ai une question."
  ]
    .filter(Boolean)
    .join("\n");

  const supportWhatsappUrl =
    `https://wa.me/${supportNumber}?text=${encodeURIComponent(
      supportWhatsappMessage
    )}`;

  const phoneValue =
    form.phone
      ? `${form.phoneCode}${form.phone}`
      : "";

  const update = <
    K extends keyof SupportForm
  >(
    field: K,
    value: SupportForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));

    if (
      field === "name" ||
      field === "email" ||
      field === "phone" ||
      field === "message"
    ) {
      setErrors((current) => ({
        ...current,
        [field]: undefined
      }));
    }

    setError(null);
    setSuccess(null);
  };

  const handlePhoneChange = (
    value: string,
    meta: {
      country: ParsedCountry;
      inputValue: string;
    }
  ) => {
    const dialCode =
      meta.country.dialCode;

    const digits =
      value.replace(/\D/g, "");

    const nationalNumber =
      digits.startsWith(
        dialCode
      )
        ? digits.slice(
            dialCode.length
          )
        : digits;

    setForm((current) => ({
      ...current,

      phoneCode:
        dialCode
          ? `+${dialCode}`
          : "",

      phone:
        nationalNumber
    }));

    setErrors((current) => ({
      ...current,
      phone: undefined
    }));

    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    const nextErrors: FormErrors =
      {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Indique ton nom.";
    }

    if (form.email.trim()) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          form.email.trim()
        )
      ) {
        nextErrors.email =
          "Entre une adresse e-mail valide.";
      }
    }

    if (form.phone.trim()) {
      const digits =
        `${form.phoneCode}${form.phone}`.replace(
          /\D/g,
          ""
        );

      if (
        digits.length < 7
      ) {
        nextErrors.phone =
          "Le numéro semble incomplet.";
      }
    }

    if (!form.message.trim()) {
      nextErrors.message =
        "Explique-nous rapidement ta demande.";
    } else if (
      form.message.trim().length <
      10
    ) {
      nextErrors.message =
        "Ajoute quelques détails pour que l’on puisse t’aider.";
    }

    setErrors(nextErrors);

    const valid =
      Object.keys(nextErrors)
        .length === 0;

    if (!valid) {
      requestAnimationFrame(
        () => {
          const firstInvalid =
            formRef.current
              ?.querySelector<HTMLElement>(
                '[data-invalid="true"]'
              );

          firstInvalid
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });

          firstInvalid
            ?.querySelector<HTMLElement>(
              "input, textarea, button"
            )
            ?.focus();
        }
      );
    }

    return valid;
  };

  const submit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSending(true);

      const result =
        await createSupportRequest(
          form
        );

      setSuccess(
        `Demande envoyée · référence ${result.requestId
          .slice(0, 8)
          .toUpperCase()}`
      );

      setForm((current) => ({
        ...current,
        message: ""
      }));

      setErrors({});
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d’envoyer ta demande pour le moment."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Aide et FAQ B4F EVENTS"
        description="Besoin d'aide avec un billet, une commande, un paiement, un pack ou une soirée B4F ? Retrouvez notre FAQ et contactez notre équipe."
        path="/aide"
        image={media.backstage}
        structuredData={{
          "@context":
            "https://schema.org",

          "@type":
            "FAQPage",

          mainEntity:
            allQuestions.map(
              (item) => ({
                "@type":
                  "Question",

                name:
                  item.question,

                acceptedAnswer: {
                  "@type":
                    "Answer",

                  text:
                    item.answer
                }
              })
            )
        }}
      />

      <section className="relative overflow-hidden bg-black">
        <img
          src={media.backstage}
          alt="B4F Barcelona"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.96)_0%,rgba(0,0,0,.78)_45%,rgba(0,0,0,.38)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25)_0%,rgba(0,0,0,.08)_40%,rgba(0,0,0,.88)_100%)]" />

        <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-secondary/[0.07] blur-[140px]" />

        <div className="page-shell relative min-h-[690px] pt-[150px] sm:min-h-[720px] sm:pt-[165px] lg:min-h-[700px] lg:pt-[155px]">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start">
            <Reveal>
              <div className="max-w-[780px]">
                <p className="font-subtitle text-[11px] uppercase tracking-[0.22em] text-white/40 sm:text-xs">
                  Billet · Paiement · Pack · Soirée
                </p>

                <h1 className="mt-4 font-title text-[clamp(3.4rem,6.2vw,6.1rem)] uppercase leading-[0.82] tracking-[-0.05em]">
                  Besoin d’un
                  <span className="block">
                    coup de
                  </span>

                  <span className="block text-gradient">
                    main ?
                  </span>
                </h1>

                <p className="mt-6 max-w-md font-body text-sm leading-7 text-white/45 sm:text-base">
                  Trouve la bonne réponse ou
                  contacte directement la bonne
                  personne.
                </p>
              </div>
            </Reveal>

            <div className="space-y-3">
              <Reveal delay={40}>
                <a
                  href={
                    promoterWhatsappUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[138px] items-center gap-5 rounded-[24px] border border-white/[0.12] bg-black/40 p-5 backdrop-blur-2xl transition duration-300 hover:border-green-400/30 hover:bg-black/55"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[17px] bg-green-400/10 text-green-400">
                    <MessageCircle
                      size={24}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="font-subtitle text-[9px] uppercase tracking-[0.19em] text-green-400">
                       Autre question
                    </span>

                    <h3 className="mt-2 font-title text-2xl uppercase leading-none">
                      WhatsApp B4F
                    </h3>

                    <p className="mt-3 font-body text-sm text-white/38">
                      Écris directement à
                      notre équipe.
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-white/20 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </a>
              </Reveal>

              <Reveal delay={120}>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "support-form"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth"
                      })
                  }
                  className="group flex min-h-[138px] w-full items-center gap-5 rounded-[24px] border border-white/[0.12] bg-black/40 p-5 text-left backdrop-blur-2xl transition duration-300 hover:border-white/25 hover:bg-black/55"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[17px] bg-white/[0.07] text-white">
                    <Send
                      size={22}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="font-subtitle text-[9px] uppercase tracking-[0.19em] text-white/35">
                      Demande détaillée
                    </span>

                    <h3 className="mt-2 font-title text-2xl uppercase leading-none">
                      Formulaire
                    </h3>

                    <p className="mt-3 font-body text-sm leading-5 text-white/38">
                      Pour une commande ou
                      un problème nécessitant
                      un suivi.
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="shrink-0 text-white/20 transition duration-300 group-hover:translate-x-1 group-hover:text-white"
                  />
                </button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section
        id="support-form"
        className="scroll-mt-24 border-t border-white/[0.08] bg-[#0c0c0c] py-16 sm:py-20"
      >
        <div className="page-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">
                Support
              </span>

              <h2 className="mt-3 max-w-lg font-title text-2xl uppercase leading-[0.9] sm:text-4xl">
                Explique-nous
                <span className="block text-gradient">
                  ton problème.
                </span>
              </h2>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-white/[0.04] text-secondary">
                    <Ticket
                      size={18}
                    />
                  </span>

                  <div>
                    <strong className="font-subtitle text-sm">
                      Référence
                    </strong>

                    <p className="mt-1 font-body text-xs leading-5 text-white/35">
                      Elle nous permet de
                      retrouver ta commande.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-white/[0.04] text-white/60">
                    <Mail
                      size={18}
                    />
                  </span>

                  <div>
                    <strong className="font-subtitle text-sm">
                      E-mail
                    </strong>

                    <p className="mt-1 font-body text-xs leading-5 text-white/35">
                      Utilise si possible celui
                      qui a servi pour l’achat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div className="rounded-[28px] border border-white/[0.08] bg-[#111] p-5 sm:p-7">
              <form
                ref={formRef}
                onSubmit={submit}
                noValidate
                className="grid gap-5 sm:grid-cols-2"
              >
                <label
                  data-invalid={
                    errors.name
                      ? "true"
                      : undefined
                  }
                  className="block"
                >
                  <span className="mb-2 block font-subtitle text-xs">
                    Nom
                  </span>

                  <input
                    className={`form-input min-h-[54px] ${
                      errors.name
                        ? "border-red-500/60 bg-red-500/[0.04]"
                        : ""
                    }`}
                    value={
                      form.name
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Ton nom"
                    aria-invalid={
                      !!errors.name
                    }
                  />

                  {errors.name && (
                    <span className="mt-1.5 block font-body text-xs text-red-400">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label
                  data-invalid={
                    errors.email
                      ? "true"
                      : undefined
                  }
                  className="block"
                >
                  <span className="mb-2 block font-subtitle text-xs">
                    E-mail
                  </span>

                  <input
                    className={`form-input min-h-[54px] ${
                      errors.email
                        ? "border-red-500/60 bg-red-500/[0.04]"
                        : ""
                    }`}
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="you@email.com"
                    aria-invalid={
                      !!errors.email
                    }
                  />

                  {errors.email && (
                    <span className="mt-1.5 block font-body text-xs text-red-400">
                      {errors.email}
                    </span>
                  )}
                </label>

                <div
                  data-invalid={
                    errors.phone
                      ? "true"
                      : undefined
                  }
                  className="min-w-0 sm:col-span-2"
                >
                  <span className="mb-2 block font-subtitle text-xs">
                    Téléphone
                  </span>

                  <div
                    className={`relative w-full overflow-visible rounded-[16px] border bg-white/[0.035] transition ${
                      errors.phone
                        ? "border-red-500/60 bg-red-500/[0.04]"
                        : "border-white/[0.09] hover:border-white/15 focus-within:border-white/25"
                    }`}
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
                        "gb",
                        "it",
                        "de",
                        "nl",
                        "pt"
                      ]}
                      forceDialCode
                      inputProps={{
                        name:
                          "phone",

                        autoComplete:
                          "tel",

                        placeholder:
                          "06 12 34 56 78"
                      }}
                      style={
                        phoneStyle
                      }
                      inputStyle={{
                        width:
                          "100%",

                        height:
                          "54px",

                        padding:
                          "0 16px",

                        background:
                          "transparent",

                        border:
                          "none",

                        outline:
                          "none"
                      }}
                      countrySelectorStyleProps={{
                        buttonStyle: {
                          width:
                            "62px",

                          height:
                            "54px",

                          border:
                            "none",

                          borderRight:
                            "1px solid rgba(255,255,255,.08)",

                          borderRadius:
                            "15px 0 0 15px",

                          background:
                            "rgba(255,255,255,.015)"
                        },

                        buttonContentWrapperStyle:
                          {
                            gap: "7px"
                          },

                        flagStyle: {
                          width:
                            "22px"
                        },

                        dropdownStyleProps:
                          {
                            style: {
                              width:
                                "min(360px, calc(100vw - 40px))",

                              maxHeight:
                                "340px",

                              padding:
                                "8px",

                              background:
                                "#151515",

                              border:
                                "1px solid rgba(255,255,255,.1)",

                              borderRadius:
                                "18px",

                              overflowX:
                                "hidden",

                              boxShadow:
                                "0 24px 70px rgba(0,0,0,.75)"
                            },

                            listItemStyle:
                              {
                                minHeight:
                                  "44px",

                                margin:
                                  "2px 0",

                                padding:
                                  "0 10px",

                                borderRadius:
                                  "10px"
                              },

                            listItemCountryNameStyle:
                              {
                                color:
                                  "rgba(255,255,255,.78)",

                                fontSize:
                                  "13px"
                              },

                            listItemDialCodeStyle:
                              {
                                color:
                                  "rgba(255,255,255,.32)",

                                fontSize:
                                  "12px"
                              }
                          }
                      }}
                    />
                  </div>

                  {errors.phone && (
                    <span className="mt-1.5 block font-body text-xs text-red-400">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div
                  ref={topicRef}
                  className="relative z-30"
                >
                  <span className="mb-2 block font-subtitle text-xs">
                    Sujet
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setTopicOpen(
                        (current) =>
                          !current
                      )
                    }
                    className={`flex min-h-[54px] w-full items-center justify-between gap-4 rounded-[15px] border px-4 text-left transition ${
                      topicOpen
                        ? "border-white/25 bg-white/[0.055]"
                        : "border-white/[0.09] bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.045]"
                    }`}
                    aria-expanded={
                      topicOpen
                    }
                  >
                    <span className="min-w-0 truncate font-body text-sm text-white/75">
                      {form.topic}
                    </span>

                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.05] text-white/35 transition ${
                        topicOpen
                          ? "rotate-180 bg-white/[0.08] text-white"
                          : ""
                      }`}
                    >
                      <ChevronDown
                        size={15}
                      />
                    </span>
                  </button>

                  {topicOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#171717] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.75)]">
                      <div className="max-h-[310px] overflow-y-auto">
                        {topics.map(
                          (
                            topic
                          ) => {
                            const selected =
                              form.topic ===
                              topic;

                            return (
                              <button
                                key={
                                  topic
                                }
                                type="button"
                                onClick={() => {
                                  update(
                                    "topic",
                                    topic
                                  );

                                  setTopicOpen(
                                    false
                                  );
                                }}
                                className={`flex min-h-[46px] w-full items-center justify-between gap-4 rounded-[12px] px-3.5 text-left transition ${
                                  selected
                                    ? "bg-white/[0.09] text-white"
                                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                                }`}
                              >
                                <span className="font-body text-sm">
                                  {
                                    topic
                                  }
                                </span>

                                {selected && (
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-black">
                                    <Check
                                      size={
                                        13
                                      }
                                      strokeWidth={
                                        3
                                      }
                                    />
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="mb-2 block font-subtitle text-xs">
                    Référence de commande
                  </span>

                  <input
                    className="form-input min-h-[54px]"
                    placeholder="B4F-WEB-…"
                    value={
                      form.orderReference
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        "orderReference",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label
                  data-invalid={
                    errors.message
                      ? "true"
                      : undefined
                  }
                  className="block sm:col-span-2"
                >
                  <span className="mb-2 block font-subtitle text-xs">
                    Message
                  </span>

                  <textarea
                    className={`form-input min-h-36 resize-y py-4 ${
                      errors.message
                        ? "border-red-500/60 bg-red-500/[0.04]"
                        : ""
                    }`}
                    value={
                      form.message
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        "message",
                        event.target.value
                      )
                    }
                    placeholder="Explique-nous ta demande..."
                    aria-invalid={
                      !!errors.message
                    }
                  />

                  {errors.message && (
                    <span className="mt-1.5 block font-body text-xs text-red-400">
                      {errors.message}
                    </span>
                  )}
                </label>

                {success && (
                  <div className="flex gap-3 rounded-[18px] border border-green-500/20 bg-green-500/[0.08] p-4 text-green-200 sm:col-span-2">
                    <CheckCircle2
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <p className="font-body text-sm leading-6">
                      {success}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-[18px] border border-red-500/20 bg-red-500/[0.08] p-4 font-body text-sm leading-6 text-red-200 sm:col-span-2">
                    {error}
                  </div>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={
                      sending
                    }
                    className="group flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[15px] bg-white px-5 font-subtitle text-sm text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? (
                      <LoaderCircle
                        className="animate-spin"
                        size={18}
                      />
                    ) : (
                      <Send
                        size={17}
                      />
                    )}

                    {sending
                      ? "Envoi…"
                      : "Envoyer ma demande"}
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/[0.07] bg-[#090909] py-10 sm:py-18">
        <div className="page-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow">
                FAQ
              </span>

              <h2 className="mt-3 font-title text-4xl uppercase leading-[0.88] sm:text-6xl">
                Les réponses
                <span className="block text-gradient">
                  essentielles.
                </span>
              </h2>

            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-4xl">
            {faqGroups.map(
              (
                group,
                groupIndex
              ) => (
                <Reveal
                  key={
                    group.category
                  }
                  delay={
                    groupIndex *
                    30
                  }
                >
                  <section
                    className={
                      groupIndex ===
                      0
                        ? ""
                        : "mt-10"
                    }
                  >
                    <div className="mb-1 flex items-center gap-4">
                      <span className="font-subtitle text-[10px] uppercase tracking-[0.2em] text-secondary">
                        {
                          group.category
                        }
                      </span>

                      <span className="h-px flex-1 bg-white/[0.07]" />
                    </div>

                    <div>
                      {group.questions.map(
                        (
                          item
                        ) => {
                          const isOpen =
                            openQuestion ===
                            item.question;

                          return (
                            <article
                              key={
                                item.question
                              }
                              className="border-b border-white/[0.07]"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenQuestion(
                                    isOpen
                                      ? null
                                      : item.question
                                  )
                                }
                                className="group flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                              >
                                <span className="font-subtitle text-sm leading-6 text-white/70 transition group-hover:text-white sm:text-[15px]">
                                  {
                                    item.question
                                  }
                                </span>

                                <ChevronDown
                                  size={
                                    17
                                  }
                                  className={`shrink-0 transition-all duration-300 ${
                                    isOpen
                                      ? "rotate-180 text-secondary"
                                      : "text-white/20"
                                  }`}
                                />
                              </button>

                              <div
                                className={`grid transition-all duration-300 ${
                                  isOpen
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0"
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <p className="max-w-2xl pb-6 pr-8 font-body text-sm leading-7 text-white/40">
                                    {
                                      item.answer
                                    }
                                  </p>
                                </div>
                              </div>
                            </article>
                          );
                        }
                      )}
                    </div>
                  </section>
                </Reveal>
              )
            )}
          </div>

        </div>
      </section>
    </>
  );
}