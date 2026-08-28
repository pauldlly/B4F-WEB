import {
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileUp,
  GraduationCap,
  Handshake,
  Home,
  Images,
  LoaderCircle,
  Megaphone,
  PartyPopper,
  Send,
  UsersRound,
  Video,
} from "lucide-react";

import {
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  PhoneInput,
  type ParsedCountry,
} from "react-international-phone";

import "react-international-phone/style.css";

import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";
import { media } from "../data/media";

/* =========================================================
   DATA
========================================================= */

const roles = [
  {
    icon: Megaphone,
    number: "01",
    title: "Promoteur terrain",
    tag: "Le plus recherché",
    text:
      "Rencontre du monde, crée du contact et accompagne les clients vers les meilleures soirées de Barcelone.",
  },
  {
    icon: Camera,
    number: "02",
    title: "Créateur de contenu",
    tag: "Photo · Reels · TikTok",
    text:
      "Capture l’énergie B4F et crée les Reels, TikToks, photos et vidéos qui font vivre nos événements sur les réseaux.",
  },
  {
    icon: BriefcaseBusiness,
    number: "03",
    title: "Communication & marketing",
    tag: "Design · Instagram · Event",
    text:
      "Imagine les affiches, publications Instagram, visuels et campagnes qui accompagnent les événements B4F.",
  },
] as const;

const process = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Ta candidature",
    text:
      "Remplis le formulaire en ligne et présente-nous rapidement ton profil.",
  },
  {
    number: "02",
    icon: Video,
    title: "Call découverte",
    text:
      "Premier échange en visio pour faire connaissance et découvrir B4F, les missions et la saison.",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Call manager",
    text:
      "Deuxième échange avec un manager et une mise en situation.",
  },
  {
    number: "04",
    icon: PartyPopper,
    title: "Welcome to B4F",
    text:
      "C’est validé. Prépare tes valises et rejoins l’équipe pour vivre ton été à Barcelone.",
  },
];

/* =========================================================
   TYPES
========================================================= */

type HiringForm = {
  firstName: string;
  lastName: string;
  age: string;

  phoneCode: string;
  phone: string;

  email: string;
  instagram: string;

  role: string;

  startDate: string;
  endDate: string;

  housingNeeded:
    | "yes"
    | "no"
    | "";

  housingStartDate: string;
  housingEndDate: string;

  languages: string;
  experience: string;
  message: string;

  portfolioLinks: string;
};

type FormErrors =
  Partial<
    Record<
      keyof HiringForm,
      string
    >
  >;

/* =========================================================
   INITIAL FORM
========================================================= */

const initialForm: HiringForm = {
  firstName: "",
  lastName: "",
  age: "",

  phoneCode: "+33",
  phone: "",

  email: "",
  instagram: "",

  role: "Promoteur terrain",

  startDate: "",
  endDate: "",

  housingNeeded: "",

  housingStartDate: "",
  housingEndDate: "",

  languages: "",
  experience: "",
  message: "",

  portfolioLinks: "",
};

/* =========================================================
   PHONE STYLE
========================================================= */

const phoneStyle = {
  width: "100%",

  "--react-international-phone-height":
    "52px",

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
    "#242424",

  "--react-international-phone-focused-dropdown-item-background-color":
    "#202020",

  "--react-international-phone-dropdown-shadow":
    "0 28px 80px rgba(0,0,0,.8)",

  "--react-international-phone-dropdown-item-height":
    "44px",

  "--react-international-phone-dropdown-preferred-list-divider-color":
    "rgba(255,255,255,.08)",

  "--react-international-phone-dropdown-preferred-list-divider-margin":
    "6px 0",
} as CSSProperties;

/* =========================================================
   PAGE
========================================================= */

export function JoinTeamPage() {
  const formRef =
    useRef<HTMLFormElement | null>(
      null,
    );

  const roleRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const housingRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<HiringForm>(
      initialForm,
    );

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  const [
    cv,
    setCv,
  ] =
    useState<File | null>(
      null,
    );

  const [
    presentationVideo,
    setPresentationVideo,
  ] =
    useState<File | null>(
      null,
    );

  const [
    workSamples,
    setWorkSamples,
  ] =
    useState<File[]>([]);

  const [
    fileError,
    setFileError,
  ] =
    useState("");

  const [
    mediaError,
    setMediaError,
  ] =
    useState("");

  const [
    roleOpen,
    setRoleOpen,
  ] =
    useState(false);

  const [
    housingOpen,
    setHousingOpen,
  ] =
    useState(false);

  const [
    submitState,
    setSubmitState,
  ] =
    useState<
      | "idle"
      | "loading"
      | "success"
      | "error"
    >("idle");


  /* =====================================================
     CLOSE DROPDOWNS
  ===================================================== */

  useEffect(() => {
    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        roleRef.current &&
        !roleRef.current.contains(
          target,
        )
      ) {
        setRoleOpen(
          false,
        );
      }

      if (
        housingRef.current &&
        !housingRef.current.contains(
          target,
        )
      ) {
        setHousingOpen(
          false,
        );
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setRoleOpen(
          false,
        );

        setHousingOpen(
          false,
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  /* =====================================================
     UPDATE FIELD
  ===================================================== */

  const update = <
    K extends keyof HiringForm,
  >(
    field: K,
    value: HiringForm[K],
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [field]:
          value,
      }),
    );

    setErrors(
      (
        current,
      ) => {
        if (
          !current[
            field
          ]
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[
          field
        ];

        return next;
      },
    );

    setSubmitError(
      "",
    );

    if (
      submitState ===
      "error"
    ) {
      setSubmitState(
        "idle",
      );
    }
  };

  /* =====================================================
     ROLE
  ===================================================== */

  const isPromoter =
    form.role ===
    "Promoteur terrain";

  const isCreative =
    form.role ===
      "Créateur de contenu" ||
    form.role ===
      "Communication & marketing";

  const selectedRole =
    roles.find(
      (
        role,
      ) =>
        role.title ===
        form.role,
    ) ??
    roles[0];

  const SelectedRoleIcon =
    selectedRole.icon;

  /* =====================================================
     INPUT CLASS
  ===================================================== */

  const fieldClass = (
    field:
      keyof HiringForm,
    extra = "",
  ) =>
    `
      form-input
      !min-h-[52px]
      !w-full
      !max-w-full
      !rounded-[14px]
      !px-3.5
      !text-[13px]
      sm:!min-h-[54px]
      sm:!rounded-[16px]
      sm:!px-4
      sm:!text-sm
      !bg-white/[0.035]
      outline-none
      ring-0
      focus:outline-none
      focus:ring-0

      ${
        errors[
          field
        ]
          ? "border-red-500/70 !bg-white/[0.035] focus:border-red-400"
          : ""
      }

      ${extra}
    `;

  /* =====================================================
     PHONE
  ===================================================== */

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

    setForm(
      (
        current,
      ) => ({
        ...current,

        phone:
          value,

        phoneCode:
          dialCode
            ? `+${dialCode}`
            : "",
      }),
    );

    setErrors(
      (
        current,
      ) => {
        if (
          !current.phone
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next.phone;

        return next;
      },
    );

    setSubmitError(
      "",
    );

    if (
      submitState ===
      "error"
    ) {
      setSubmitState(
        "idle",
      );
    }
  };

  /* =====================================================
     HOUSING
  ===================================================== */

  const selectHousing = (
    value:
      | "yes"
      | "no",
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        housingNeeded:
          value,

        housingStartDate:
          value ===
          "no"
            ? ""
            : current.housingStartDate,

        housingEndDate:
          value ===
          "no"
            ? ""
            : current.housingEndDate,
      }),
    );

    setErrors(
      (
        current,
      ) => {
        const next = {
          ...current,
        };

        delete next.housingNeeded;

        if (
          value ===
          "no"
        ) {
          delete next.housingStartDate;
          delete next.housingEndDate;
        }

        return next;
      },
    );

    setHousingOpen(
      false,
    );

    setSubmitError(
      "",
    );

    if (
      submitState ===
      "error"
    ) {
      setSubmitState(
        "idle",
      );
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm =
    () => {
      const nextErrors:
        FormErrors = {};

      if (
        !form.firstName.trim()
      ) {
        nextErrors.firstName =
          "Tu as oublié ton prénom.";
      }

      if (
        !form.lastName.trim()
      ) {
        nextErrors.lastName =
          "Tu as oublié ton nom.";
      }

      if (
        !form.age.trim()
      ) {
        nextErrors.age =
          "Indique ton âge.";
      } else if (
        Number.isNaN(
          Number(
            form.age,
          ),
        ) ||
        Number(
          form.age,
        ) < 18
      ) {
        nextErrors.age =
          "Tu dois avoir au moins 18 ans.";
      }

      const phoneDigits =
        form.phone.replace(
          /\D/g,
          "",
        );

      const codeDigits =
        form.phoneCode.replace(
          /\D/g,
          "",
        );

      const subscriberDigits =
        phoneDigits.startsWith(
          codeDigits,
        )
          ? phoneDigits.slice(
              codeDigits.length,
            )
          : phoneDigits;

      if (
        !form.phone.trim() ||
        subscriberDigits.length ===
          0
      ) {
        nextErrors.phone =
          "Tu as oublié ton numéro de téléphone.";
      } else if (
        subscriberDigits.length <
        6
      ) {
        nextErrors.phone =
          "Ton numéro de téléphone semble incomplet.";
      }

      if (
        !form.email.trim()
      ) {
        nextErrors.email =
          "Tu as oublié ton adresse e-mail.";
      } else {
        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
          !emailRegex.test(
            form.email.trim(),
          )
        ) {
          nextErrors.email =
            "Entre une adresse e-mail valide.";
        }
      }

      if (
        !form.role
      ) {
        nextErrors.role =
          "Choisis le poste qui t’intéresse.";
      }

      if (
        !form.startDate
      ) {
        nextErrors.startDate =
          "Indique ta date d’arrivée.";
      }

      if (
        !form.endDate
      ) {
        nextErrors.endDate =
          "Indique ta date de fin de disponibilité.";
      }

      if (
        form.startDate &&
        form.endDate &&
        form.endDate <
          form.startDate
      ) {
        nextErrors.endDate =
          "La date de fin doit être après la date de début.";
      }

      if (
        !form.housingNeeded
      ) {
        nextErrors.housingNeeded =
          "Indique si tu as besoin d’un logement.";
      }

      if (
        form.housingNeeded ===
        "yes"
      ) {
        if (
          !form.housingStartDate
        ) {
          nextErrors.housingStartDate =
            "Indique la date de début du logement.";
        }

        if (
          !form.housingEndDate
        ) {
          nextErrors.housingEndDate =
            "Indique la date de fin du logement.";
        }

        if (
          form.housingStartDate &&
          form.housingEndDate &&
          form.housingEndDate <
            form.housingStartDate
        ) {
          nextErrors.housingEndDate =
            "La date de fin du logement doit être après la date de début.";
        }
      }

      setErrors(
        nextErrors,
      );

      const errorKeys =
        Object.keys(
          nextErrors,
        );

      if (
        errorKeys.length >
        0
      ) {
        setSubmitError(
          `${
            errorKeys.length ===
            1
              ? "Il manque une information"
              : `Il manque ${errorKeys.length} informations`
          }. Vérifie les champs en rouge.`,
        );

        setSubmitState(
          "error",
        );

        requestAnimationFrame(
          () => {
            const firstInvalid =
              formRef.current
                ?.querySelector<HTMLElement>(
                  '[data-invalid="true"]',
                );

            firstInvalid?.scrollIntoView(
              {
                behavior:
                  "smooth",

                block:
                  "center",
              },
            );

            const input =
              firstInvalid
                ?.querySelector<
                  | HTMLInputElement
                  | HTMLTextAreaElement
                  | HTMLButtonElement
                >(
                  "input, textarea, button",
                );

            input?.focus();
          },
        );

        return false;
      }

      return true;
    };

  /* =====================================================
     CV
  ===================================================== */

  const selectCv = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target
        .files?.[0] ??
      null;

    setFileError(
      "",
    );

    if (!file) {
      setCv(
        null,
      );

      return;
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowed.includes(
        file.type,
      )
    ) {
      setFileError(
        "Format accepté : PDF, DOC ou DOCX.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      8 *
        1024 *
        1024
    ) {
      setFileError(
        "Ton CV dépasse 8 Mo. Choisis un fichier plus léger.",
      );

      event.target.value =
        "";

      return;
    }

    setCv(
      file,
    );
  };

  /* =====================================================
     VIDEO
  ===================================================== */

  const selectPresentationVideo =
    (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target
          .files?.[0] ??
        null;

      setMediaError(
        "",
      );

      if (!file) {
        setPresentationVideo(
          null,
        );

        return;
      }

      if (
        !file.type.startsWith(
          "video/",
        )
      ) {
        setMediaError(
          "Le fichier sélectionné doit être une vidéo.",
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        100 *
          1024 *
          1024
      ) {
        setMediaError(
          "Ta vidéo dépasse 100 Mo. Choisis une vidéo plus légère.",
        );

        event.target.value =
          "";

        return;
      }

      setPresentationVideo(
        file,
      );
    };

  /* =====================================================
     WORK SAMPLES
  ===================================================== */

  const selectWorkSamples = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    const files =
      Array.from(
        event.target
          .files ??
          [],
      );

    setMediaError(
      "",
    );

    if (
      !files.length
    ) {
      setWorkSamples(
        [],
      );

      return;
    }

    if (
      files.length >
      6
    ) {
      setMediaError(
        "Tu peux ajouter jusqu’à 6 réalisations maximum.",
      );

      event.target.value =
        "";

      return;
    }

    const invalid =
      files.find(
        (
          file,
        ) =>
          !file.type.startsWith(
            "image/",
          ) &&
          !file.type.startsWith(
            "video/",
          ) &&
          file.type !==
            "application/pdf",
      );

    if (
      invalid
    ) {
      setMediaError(
        "Formats acceptés : images, vidéos ou PDF.",
      );

      event.target.value =
        "";

      return;
    }

    const tooLarge =
      files.find(
        (
          file,
        ) =>
          file.size >
          50 *
            1024 *
            1024,
      );

    if (
      tooLarge
    ) {
      setMediaError(
        `${tooLarge.name} dépasse 50 Mo.`,
      );

      event.target.value =
        "";

      return;
    }

    setWorkSamples(
      files,
    );
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const submit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setSubmitError(
        "",
      );

      setSubmitState(
        "idle",
      );

      const valid =
        validateForm();

      if (
        !valid
      ) {
        return;
      }

      setSubmitState(
        "loading",
      );

      const endpoint =
        import.meta.env
          .VITE_HIRING_FORM_ENDPOINT?.trim();

      if (
        !endpoint
      ) {
        setSubmitState(
          "error",
        );

        setSubmitError(
          "Le service d’envoi des candidatures n’est pas configuré. Contacte l’équipe B4F.",
        );

        return;
      }

      try {
        const body =
          new FormData();

          Object.entries(
            form,
          ).forEach(
            ([
              key,
              value,
            ]) => {
              body.append(
                key,
                value,
              );
            },
          );

          if (
            cv
          ) {
            body.append(
              "cv",
              cv,
            );
          }

          if (
            isPromoter &&
            presentationVideo
          ) {
            body.append(
              "presentationVideo",
              presentationVideo,
            );
          }

          if (
            isCreative
          ) {
            workSamples.forEach(
              (
                file,
              ) => {
                body.append(
                  "workSamples",
                  file,
                );
              },
            );
          }

          const response =
            await fetch(
              endpoint,
              {
                method:
                  "POST",

                body,
              },
            );

          if (
            !response.ok
          ) {
            let serverMessage =
              "";

            try {
              const data =
                await response.json();

              serverMessage =
                data?.message ||
                data?.error ||
                "";
            } catch {
              serverMessage =
                "";
            }

            throw new Error(
              serverMessage ||
                `Erreur ${response.status}. La candidature n’a pas pu être envoyée.`,
            );
          }

        setSubmitState(
          "success",
        );

        setSubmitError(
          "",
        );

        /*
         * Réinitialise complètement
         * le formulaire après un envoi réussi.
         */
        setForm({
          ...initialForm,
        });

        setErrors(
          {},
        );

        setCv(
          null,
        );

        setPresentationVideo(
          null,
        );

        setWorkSamples(
          [],
        );

        setFileError(
          "",
        );

        setMediaError(
          "",
        );

        setRoleOpen(
          false,
        );

        setHousingOpen(
          false,
        );

        /*
         * Important pour vider réellement
         * les <input type="file"> du navigateur.
         */
        formRef.current?.reset();

        return;
      } catch (
        error
      ) {
        setSubmitState(
          "error",
        );

        if (
          error instanceof
          TypeError
        ) {
          setSubmitError(
            "Impossible de contacter le serveur. Vérifie ta connexion internet puis réessaie.",
          );
        } else if (
          error instanceof
          Error
        ) {
          setSubmitError(
            error.message,
          );
        } else {
          setSubmitError(
            "Une erreur est survenue pendant l’envoi de ta candidature.",
          );
        }

        return;
      }
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <style>{`
        @keyframes b4f-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .b4f-marquee {
          animation: b4f-marquee 18s linear infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .b4f-marquee {
            animation: none;
          }
        }

        input[type="date"] {
          min-width: 0;
        }

        @media (max-width: 639px) {
          input[type="date"] {
            font-size: 13px;
          }
        }
      `}</style>

      <Seo
        title="Rejoins B4F à Barcelone"
        description="Rejoins l’équipe B4F à Barcelone : promotion, création de contenu, communication et événementiel."
        path="/rejoindre"
        image={
          media.crowd
        }
        structuredData={{
          "@context":
            "https://schema.org",

          "@type":
            "JobPosting",

          title:
            "Promoteur événementiel B4F à Barcelone",

          description:
            "Rejoins B4F pour promouvoir des événements, accompagner les clients et participer au développement de l’agence.",

          employmentType:
            "TEMPORARY",

          hiringOrganization:
            {
              "@type":
                "Organization",

              name:
                "B4F EVENTS",
            },

          jobLocation: {
            "@type":
              "Place",

            address: {
              "@type":
                "PostalAddress",

              addressLocality:
                "Barcelona",

              addressCountry:
                "ES",
            },
          },
        }}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          min-h-[650px]
          overflow-hidden
          bg-black
          sm:min-h-[700px]
          lg:min-h-[84svh]
        "
      >
        <img
          src={
            media.crowd
          }
          alt="B4F Barcelona"
          fetchPriority="high"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-[60%_center]
            sm:object-center
          "
        />

        {/* MOBILE OVERLAY */}
        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(180deg,rgba(0,0,0,.50)_0%,rgba(0,0,0,.62)_35%,rgba(0,0,0,.95)_100%)]
            lg:bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.72)_45%,rgba(0,0,0,.16)_100%)]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#090909]
            via-transparent
            to-black/30
          "
        />

        <div
          className="
            party-orb
            party-orb-orange
            absolute
            -left-40
            bottom-0
            h-[260px]
            w-[260px]
            opacity-20
            sm:h-[340px]
            sm:w-[340px]
            sm:opacity-25
          "
        />

        <div
          className="
            party-orb
            party-orb-pink
            absolute
            -right-28
            top-24
            h-[260px]
            w-[260px]
            opacity-20
            sm:-right-20
            sm:top-32
            sm:h-[340px]
            sm:w-[340px]
            sm:opacity-25
          "
        />

        <div
          className="
            page-shell
            relative
            flex
            min-h-[610px]
            items-end
            pb-20
            pt-24
            sm:min-h-[660px]
            sm:pb-24
            sm:pt-28
            lg:min-h-[72svh]
          "
        >
          <Reveal className="w-full max-w-5xl">
            {/* BADGES */}
            <div
              className="
                mb-4
                flex
                max-w-full
                flex-wrap
                gap-2
                sm:mb-5
                sm:gap-3
              "
            >
              <span
                className="
                  max-w-full
                  rounded-full
                  border
                  border-white/15
                  bg-white/[0.08]
                  px-3
                  py-2
                  font-subtitle
                  text-[8px]
                  uppercase
                  tracking-[0.13em]
                  backdrop-blur-xl
                  sm:px-4
                  sm:text-[10px]
                  sm:tracking-[0.18em]
                "
              >
                Barcelona · Summer
                2026
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-secondary/30
                  bg-secondary/10
                  px-3
                  py-2
                  font-subtitle
                  text-[8px]
                  uppercase
                  tracking-[0.13em]
                  text-secondary
                  sm:px-4
                  sm:text-[10px]
                  sm:tracking-[0.18em]
                "
              >
                Recrutement ouvert
              </span>
            </div>

            <p
              className="
                font-subtitle
                text-[10px]
                uppercase
                tracking-[0.14em]
                text-white/50
                sm:text-sm
                sm:tracking-[0.2em]
              "
            >
              Fatigué du job d’été
              classique ?
            </p>

            <h1
              className="
                mb-7
                mt-3
                max-w-5xl
                font-title
                text-[clamp(2.8rem,15vw,4.5rem)]
                uppercase
                leading-[0.82]
                tracking-[-0.05em]
                sm:mb-10
                sm:mt-4
                sm:text-[clamp(4rem,10vw,5.5rem)]
                lg:mb-12
                lg:text-[clamp(4.5rem,7.5vw,6.2rem)]
              "
            >
              Barcelone
              <br className="sm:hidden" />
              {" "}t’attend.

              <span className="block text-gradient">
                B4F aussi.
              </span>
            </h1>
          </Reveal>
        </div>

        {/* MARQUEE */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            overflow-hidden
            border-y
            border-white/[0.08]
            bg-black/55
            py-2.5
            backdrop-blur-xl
            sm:py-3
          "
        >
          <div
            className="
              b4f-marquee
              flex
              w-max
              whitespace-nowrap
              font-title
              text-base
              uppercase
              tracking-[0.05em]
              text-white/15
              sm:text-xl
            "
          >
            <span className="pr-12">
              Barcelona · B4F ·
              Summer 2027 · Work ·
              Party · Meet · Live ·
              Barcelona · B4F ·
              Summer 2027 · Work ·
              Party · Meet · Live ·
            </span>

            <span
              aria-hidden="true"
              className="pr-12"
            >
              Barcelona · B4F ·
              Summer 2027 · Work ·
              Party · Meet · Live ·
              Barcelona · B4F ·
              Summer 2027 · Work ·
              Party · Meet · Live ·
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section
        className="
          page-shell
          py-10
          sm:py-14
          lg:py-16
        "
      >
        <Reveal>
          <div
            className="
              grid
              gap-8
              lg:grid-cols-[1.15fr_0.85fr]
              lg:items-end
              lg:gap-12
            "
          >
            <div>
              <span
                className="
                  inline-flex
                  items-center
                  gap-3
                  font-subtitle
                  text-[9px]
                  uppercase
                  tracking-[0.17em]
                  text-secondary
                  sm:text-[11px]
                  sm:tracking-[0.22em]
                "
              >
                Ton été. Ton aventure.
              </span>

              <h2
                className="
                  mt-2
                  max-w-3xl
                  font-title
                  text-[34px]
                  uppercase
                  leading-[0.88]
                  tracking-[-0.035em]
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Bien plus qu’un

                <span className="block text-gradient">
                  simple job d’été.
                </span>
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  font-body
                  text-[14px]
                  leading-6
                  text-white/45
                  sm:mt-5
                  sm:text-base
                  sm:leading-7
                "
              >
                Travaille, rencontre du
                monde et découvre
                Barcelone autrement, au
                cœur de l’expérience
                B4F.
              </p>
            </div>

            <div
              className="
                border-l
                border-white/10
                pl-5
                sm:pl-8
              "
            >
              <span
                className="
                  font-title
                  text-4xl
                  leading-none
                  text-secondary/30
                  sm:text-5xl
                "
              >
                “
              </span>

              <p
                className="
                  -mt-1
                  max-w-md
                  font-body
                  text-base
                  leading-7
                  text-white/65
                  sm:-mt-2
                  sm:text-xl
                  sm:leading-8
                "
              >
                On bosse sérieusement.

                <span className="block text-white">
                  Le reste un peu
                  moins.
                </span>
              </p>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  sm:mt-5
                "
              >
                <span className="h-px w-7 bg-white/20" />

                <span
                  className="
                    font-subtitle
                    text-[8px]
                    uppercase
                    tracking-[0.15em]
                    text-white/30
                    sm:text-[10px]
                    sm:tracking-[0.18em]
                  "
                >
                  B4F · Barcelona
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <section
        className="
          page-shell
          pb-10
          sm:pb-14
          lg:pb-16
        "
      >
        <div
          className="
            grid
            grid-cols-2
            gap-2.5
            sm:gap-3
            md:grid-cols-4
            md:grid-rows-[230px_230px]
          "
        >
          {/* LARGE */}
          <Reveal
            className="
              relative
              col-span-2
              h-[320px]
              overflow-hidden
              rounded-[20px]
              sm:h-[390px]
              sm:rounded-[24px]
              md:row-span-2
              md:h-auto
            "
          >
            <img
              src={
                media.backstage
              }
              alt="B4F team"
              className="
                h-full
                w-full
                object-cover
                transition
                duration-700
                hover:scale-[1.03]
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/85
                via-black/10
                to-transparent
              "
            />

            <div
              className="
                absolute
                bottom-4
                left-4
                right-4
                sm:bottom-6
                sm:left-6
                sm:right-6
              "
            >
              <span
                className="
                  font-subtitle
                  text-[8px]
                  uppercase
                  tracking-[0.17em]
                  text-secondary
                  sm:text-[10px]
                  sm:tracking-[0.2em]
                "
              >
                B4F Team
              </span>

              <p
                className="
                  mt-1.5
                  max-w-sm
                  font-title
                  text-xl
                  uppercase
                  leading-[0.95]
                  sm:mt-2
                  sm:text-3xl
                "
              >
                Des collègues qui
                deviennent des potes
              </p>
            </div>
          </Reveal>

          {/* SUNSET */}
          <Reveal
            delay={80}
            className="
              relative
              h-[180px]
              overflow-hidden
              rounded-[18px]
              sm:h-[220px]
              sm:rounded-[24px]
              md:h-auto
            "
          >
            <img
              src={
                media.sunset
              }
              alt="Barcelona summer"
              className="
                h-full
                w-full
                object-cover
              "
            />
          </Reveal>

          {/* POOL */}
          <Reveal
            delay={130}
            className="
              relative
              h-[180px]
              overflow-hidden
              rounded-[18px]
              sm:h-[220px]
              sm:rounded-[24px]
              md:h-auto
            "
          >
            <img
              src={
                media.pool
              }
              alt="B4F pool party"
              className="
                h-full
                w-full
                object-cover
              "
            />
          </Reveal>

          {/* CLUB */}
          <Reveal
            delay={180}
            className="
              relative
              col-span-2
              h-[220px]
              overflow-hidden
              rounded-[20px]
              sm:h-[260px]
              sm:rounded-[24px]
              md:h-auto
            "
          >
            <img
              src={
                media.club
              }
              alt="B4F nightlife"
              className="
                h-full
                w-full
                object-cover
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/75
                via-black/20
                to-transparent
              "
            />

            <div
              className="
                absolute
                bottom-4
                left-4
                sm:bottom-6
                sm:left-6
              "
            >
              <p
                className="
                  font-title
                  text-xl
                  uppercase
                  leading-[0.9]
                  sm:text-3xl
                "
              >
                Work hard.
                <br />
                Party harder.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          JOBS
      ===================================================== */}

      <section
        id="jobs"
        className="
          border-y
          border-white/[0.08]
          bg-[#0c0c0c]
          py-10
          sm:py-14
          lg:py-16
        "
      >
        <div className="page-shell">
          <Reveal>
            <span className="eyebrow">
              Rejoins l’équipe
            </span>

            <h2
              className="
                mt-3
                font-title
                text-[34px]
                uppercase
                leading-[0.9]
                tracking-[-0.03em]
                sm:text-5xl
              "
            >
              Trois jobs.

              <span className="block text-gradient">
                Une même aventure.
              </span>
            </h2>
          </Reveal>

          <div
            className="
              mt-7
              grid
              gap-3
              sm:mt-9
              sm:gap-4
              lg:grid-cols-3
            "
          >
            {roles.map(
              (
                role,
                index,
              ) => {
                const Icon =
                  role.icon;

                return (
                  <Reveal
                    key={
                      role.title
                    }
                    delay={
                      index *
                      80
                    }
                    direction="scale"
                    className="h-full"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        update(
                          "role",
                          role.title,
                        );

                        setRoleOpen(
                          false,
                        );

                        document
                          .getElementById(
                            "apply",
                          )
                          ?.scrollIntoView(
                            {
                              behavior:
                                "smooth",
                            },
                          );
                      }}
                      className="
                        group
                        relative
                        flex
                        h-full
                        min-h-[250px]
                        w-full
                        flex-col
                        overflow-hidden
                        rounded-[22px]
                        border
                        border-white/[0.08]
                        bg-[#111]
                        p-5
                        text-left
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:border-secondary/30
                        hover:bg-[#141414]
                        sm:min-h-[300px]
                        sm:rounded-[26px]
                        sm:p-6
                      "
                    >
                      <span
                        className="
                          pointer-events-none
                          absolute
                          -right-2
                          -top-7
                          font-title
                          text-[110px]
                          leading-none
                          text-white/[0.025]
                          sm:-right-3
                          sm:-top-10
                          sm:text-[145px]
                        "
                      >
                        {
                          role.number
                        }
                      </span>

                      <div
                        className="
                          relative
                          z-10
                          flex
                          items-start
                          justify-between
                          gap-2
                          sm:gap-3
                        "
                      >
                        <span
                          className="
                            grid
                            h-11
                            w-11
                            shrink-0
                            place-items-center
                            rounded-[14px]
                            border
                            border-white/10
                            bg-white/[0.04]
                            text-secondary
                            sm:h-12
                            sm:w-12
                            sm:rounded-[16px]
                          "
                        >
                          <Icon
                            size={20}
                          />
                        </span>

                        <span
                          className="
                            max-w-[65%]
                            rounded-full
                            border
                            border-white/[0.08]
                            bg-white/[0.04]
                            px-2.5
                            py-1.5
                            text-right
                            font-subtitle
                            text-[7px]
                            uppercase
                            leading-4
                            tracking-[0.1em]
                            text-white/35
                            sm:max-w-none
                            sm:px-3
                            sm:text-[9px]
                            sm:tracking-[0.15em]
                          "
                        >
                          {
                            role.tag
                          }
                        </span>
                      </div>

                      <div
                        className="
                          relative
                          z-10
                          mt-auto
                          pt-8
                          sm:pt-12
                        "
                      >
                        <span
                          className="
                            font-subtitle
                            text-[9px]
                            uppercase
                            tracking-[0.16em]
                            text-secondary
                            sm:text-[11px]
                            sm:tracking-[0.2em]
                          "
                        >
                          Poste{" "}
                          {
                            role.number
                          }
                        </span>

                        <h3
                          className="
                            mt-2
                            font-title
                            text-2xl
                            uppercase
                            leading-[0.9]
                            sm:text-3xl
                          "
                        >
                          {
                            role.title
                          }
                        </h3>

                        <p
                          className="
                            mt-3
                            font-body
                            text-[13px]
                            leading-6
                            text-white/40
                            sm:mt-4
                            sm:text-sm
                          "
                        >
                          {
                            role.text
                          }
                        </p>
                      </div>
                    </button>
                  </Reveal>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ===================================================== */}

      <section
        className="
          border-b
          border-white/[0.08]
          bg-[#0c0c0c]
          py-10
          sm:py-14
          lg:py-16
        "
      >
        <div className="page-shell">
          <Reveal className="text-center">
            <span className="eyebrow">
              Le recrutement
            </span>

            <h2
              className="
                mx-auto
                mt-3
                max-w-3xl
                font-title
                text-[34px]
                uppercase
                leading-[0.9]
                tracking-[-0.03em]
                sm:text-5xl
              "
            >
              4 étapes.

              <span className="block text-gradient">
                Et bienvenue chez B4F.
              </span>
            </h2>
          </Reveal>

          <div
            className="
              mt-7
              grid
              gap-3
              sm:mt-9
              sm:grid-cols-2
              sm:gap-4
              lg:grid-cols-4
            "
          >
            {process.map(
              (
                step,
                index,
              ) => {
                const Icon =
                  step.icon;

                return (
                  <Reveal
                    key={
                      step.number
                    }
                    delay={
                      index *
                      80
                    }
                    className="h-full"
                  >
                    <article
                      className="
                        h-full
                        rounded-[20px]
                        border
                        border-white/[0.08]
                        bg-[#111]
                        p-5
                        sm:rounded-[22px]
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <span
                          className="
                            grid
                            h-12
                            w-12
                            place-items-center
                            rounded-full
                            border
                            border-secondary/30
                            text-secondary
                            sm:h-14
                            sm:w-14
                          "
                        >
                          <Icon
                            size={20}
                          />
                        </span>

                        <span
                          className="
                            font-title
                            text-3xl
                            text-white/[0.08]
                          "
                        >
                          {
                            step.number
                          }
                        </span>
                      </div>

                      <h3
                        className="
                          mt-5
                          font-title
                          text-xl
                          uppercase
                        "
                      >
                        {
                          step.title
                        }
                      </h3>

                      <p
                        className="
                          mt-3
                          font-body
                          text-[13px]
                          leading-6
                          text-white/40
                          sm:text-sm
                        "
                      >
                        {
                          step.text
                        }
                      </p>
                    </article>
                  </Reveal>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          APPLY
      ===================================================== */}

      <section
        id="apply"
        className="
          page-shell
          py-10
          sm:py-14
          lg:py-16
        "
      >
        <div
          className="
            grid
            gap-9
            lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]
            lg:items-start
            lg:gap-10
            xl:gap-14
          "
        >
          {/* =================================================
              LEFT
          ================================================= */}

          <Reveal className="min-w-0 lg:sticky lg:top-28">
            <h2
              className="
                font-title
                text-[38px]
                uppercase
                leading-[0.88]
                tracking-[-0.035em]
                sm:text-5xl
              "
            >
              Ton été

              <span className="block text-gradient">
                commence ici.
              </span>
            </h2>

            <div
              className="
                mt-6
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-1
              "
            >
              {[
                "18 ans minimum",
                "Motivé et ponctuel",
                "À l’aise avec le contact",
                "Disponible à Barcelone",
                "Envie de rejoindre une vraie équipe",
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      font-body
                      text-[13px]
                      text-white/55
                      sm:text-sm
                    "
                  >
                    <span
                      className="
                        grid
                        h-6
                        w-6
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-secondary/10
                        text-secondary
                      "
                    >
                      <Check
                        size={13}
                      />
                    </span>

                    {
                      item
                    }
                  </div>
                ),
              )}
            </div>

            {/* STUDENTS */}
            <div
              className="
                mt-7
                border-l-2
                border-secondary
                pl-4
                sm:pl-5
              "
            >
              <div className="flex items-center gap-3">
                <GraduationCap
                  size={20}
                  className="text-secondary"
                />

                <span
                  className="
                    font-subtitle
                    text-[9px]
                    uppercase
                    tracking-[0.16em]
                    text-secondary
                    sm:text-[10px]
                    sm:tracking-[0.18em]
                  "
                >
                  Étudiants
                </span>
              </div>

              <h3
                className="
                  mt-3
                  font-title
                  text-xl
                  uppercase
                "
              >
                Stage à Barcelone ?
              </h3>

              <p
                className="
                  mt-2
                  max-w-md
                  font-body
                  text-[13px]
                  leading-6
                  text-white/45
                  sm:text-sm
                "
              >
                Tu recherches une
                expérience à
                l’international ? B4F
                accueille aussi les
                étudiants en stage
                conventionné.
              </p>
            </div>

            {/* IMAGE */}
            <div
              className="
                mt-7
                overflow-hidden
                rounded-[20px]
                sm:rounded-[24px]
              "
            >
              <img
                src={
                  media.sunset
                }
                alt="Barcelona"
                className="
                  h-[220px]
                  w-full
                  object-cover
                  sm:h-64
                  lg:h-56
                "
              />
            </div>
          </Reveal>

          {/* =================================================
              FORM
          ================================================= */}

          <Reveal
            delay={100}
            direction="scale"
            className="min-w-0"
          >
            <form
              ref={
                formRef
              }
              onSubmit={
                submit
              }
              noValidate
              className="
                min-w-0
                overflow-visible
                rounded-[22px]
                border
                border-white/[0.09]
                bg-[#111]
                p-4
                shadow-2xl
                shadow-black/30
                sm:rounded-[28px]
                sm:p-6
                lg:p-7
              "
            >
              {/* FORM HEADER */}
              <div
                className="
                  mb-5
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-white/[0.08]
                  pb-5
                  sm:mb-6
                "
              >
                <div className="min-w-0">
                  <span
                    className="
                      font-subtitle
                      text-[8px]
                      uppercase
                      tracking-[0.13em]
                      text-secondary
                      sm:text-[10px]
                      sm:tracking-[0.15em]
                    "
                  >
                    Candidature B4F
                  </span>

                  <h3
                    className="
                      mt-1
                      font-title
                      text-[24px]
                      uppercase
                      leading-none
                      sm:text-3xl
                    "
                  >
                    Faisons connaissance
                  </h3>
                </div>

                <span
                  className="
                    hidden
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-white/[0.05]
                    sm:grid
                  "
                >
                  <UsersRound
                    size={19}
                  />
                </span>
              </div>

              {/* SUBMIT ERROR */}
              {submitError && (
                <div
                  className="
                    mb-5
                    rounded-[16px]
                    border
                    border-red-500/25
                    bg-red-500/10
                    p-3.5
                    sm:rounded-[18px]
                    sm:p-4
                  "
                >
                  <strong
                    className="
                      font-subtitle
                      text-[13px]
                      text-red-100
                      sm:text-sm
                    "
                  >
                    Impossible d’envoyer
                    la candidature
                  </strong>

                  <p
                    className="
                      mt-1
                      font-body
                      text-[12px]
                      leading-5
                      text-red-200/70
                      sm:text-sm
                      sm:leading-6
                    "
                  >
                    {
                      submitError
                    }
                  </p>
                </div>
              )}

              {/* =================================================
                  FORM GRID
              ================================================= */}

              <div
                className="
                  grid
                  min-w-0
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                {/* FIRST NAME */}
                <label
                  className="min-w-0"
                  data-invalid={
                    errors.firstName
                      ? "true"
                      : undefined
                  }
                >
                  <FieldLabel>
                    Prénom
                  </FieldLabel>

                  <input
                    value={
                      form.firstName
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "firstName",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "firstName",
                    )}
                    placeholder="Ton prénom"
                    aria-invalid={
                      !!errors.firstName
                    }
                  />

                  <FieldError>
                    {
                      errors.firstName
                    }
                  </FieldError>
                </label>

                {/* LAST NAME */}
                <label
                  className="min-w-0"
                  data-invalid={
                    errors.lastName
                      ? "true"
                      : undefined
                  }
                >
                  <FieldLabel>
                    Nom
                  </FieldLabel>

                  <input
                    value={
                      form.lastName
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "lastName",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "lastName",
                    )}
                    placeholder="Ton nom"
                    aria-invalid={
                      !!errors.lastName
                    }
                  />

                  <FieldError>
                    {
                      errors.lastName
                    }
                  </FieldError>
                </label>

                {/* AGE */}
                <label
                  className="min-w-0"
                  data-invalid={
                    errors.age
                      ? "true"
                      : undefined
                  }
                >
                  <FieldLabel>
                    Âge
                  </FieldLabel>

                  <input
                    value={
                      form.age
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "age",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "age",
                    )}
                    type="number"
                    inputMode="numeric"
                    min="18"
                    max="99"
                    placeholder="Ex. 21"
                    aria-invalid={
                      !!errors.age
                    }
                  />

                  <FieldError>
                    {
                      errors.age
                    }
                  </FieldError>
                </label>

                {/* PHONE */}
                <div
                  data-invalid={
                    errors.phone
                      ? "true"
                      : undefined
                  }
                  className="min-w-0"
                >
                  <FieldLabel>
                    Téléphone
                  </FieldLabel>

                  <div
                    className={`
                      relative
                      w-full
                      min-w-0
                      overflow-visible
                      rounded-[14px]
                      border
                      bg-white/[0.035]
                      transition
                      sm:rounded-[16px]

                      ${
                        errors.phone
                          ? "border-red-500/60 bg-white/[0.035]"
                          : "border-white/[0.09] hover:border-white/15 focus-within:border-white/20"
                      }
                    `}
                  >
                    <PhoneInput
                      defaultCountry="fr"
                      value={
                        form.phone
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
                          "6 12 34 56 78",
                      }}
                      style={
                        phoneStyle
                      }
                      inputStyle={{
                        width:
                          "100%",

                        minWidth:
                          0,

                        height:
                          "52px",

                        padding:
                          "0 10px",

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
                            "58px",

                          minWidth:
                            "58px",

                          height:
                            "52px",

                          border:
                            "none",

                          borderRight:
                            "1px solid rgba(255,255,255,.08)",

                          borderRadius:
                            "13px 0 0 13px",

                          background:
                            "transparent",

                          outline:
                            "none",

                          boxShadow:
                            "none",
                        },

                        buttonContentWrapperStyle:
                          {
                            gap:
                              "5px",
                          },

                        flagStyle: {
                          width:
                            "20px",
                        },

                        dropdownArrowStyle:
                          {
                            borderTopColor:
                              "rgba(255,255,255,.35)",
                          },

                        dropdownStyleProps:
                          {
                            style:
                              {
                                width:
                                  "min(350px, calc(100vw - 32px))",

                                maxWidth:
                                  "calc(100vw - 32px)",

                                maxHeight:
                                  "300px",

                                padding:
                                  "7px",

                                background:
                                  "#151515",

                                border:
                                  "1px solid rgba(255,255,255,.1)",

                                borderRadius:
                                  "16px",

                                overflowX:
                                  "hidden",

                                boxShadow:
                                  "0 28px 80px rgba(0,0,0,.8)",

                                zIndex:
                                  200,
                              },

                            listItemStyle:
                              {
                                minHeight:
                                  "42px",

                                margin:
                                  "2px 0",

                                padding:
                                  "0 8px",

                                borderRadius:
                                  "9px",
                              },

                            listItemFlagStyle:
                              {
                                width:
                                  "20px",
                              },

                            listItemCountryNameStyle:
                              {
                                color:
                                  "rgba(255,255,255,.78)",

                                fontSize:
                                  "12px",
                              },

                            listItemDialCodeStyle:
                              {
                                color:
                                  "rgba(255,255,255,.32)",

                                fontSize:
                                  "11px",
                              },
                          },
                      }}
                    />
                  </div>

                  <FieldError>
                    {
                      errors.phone
                    }
                  </FieldError>
                </div>

                {/* EMAIL */}
                <label
                  className="min-w-0"
                  data-invalid={
                    errors.email
                      ? "true"
                      : undefined
                  }
                >
                  <FieldLabel>
                    E-mail
                  </FieldLabel>

                  <input
                    value={
                      form.email
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "email",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "email",
                    )}
                    type="email"
                    placeholder="ton@email.com"
                    aria-invalid={
                      !!errors.email
                    }
                  />

                  <FieldError>
                    {
                      errors.email
                    }
                  </FieldError>
                </label>

                {/* INSTAGRAM */}
                <label className="min-w-0">
                  <FieldLabel>
                    Instagram
                  </FieldLabel>

                  <input
                    value={
                      form.instagram
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "instagram",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "instagram",
                    )}
                    placeholder="@toncompte"
                  />
                </label>

                {/* =================================================
                    ROLE
                ================================================= */}

                <div
                  ref={
                    roleRef
                  }
                  data-invalid={
                    errors.role
                      ? "true"
                      : undefined
                  }
                  className="
                    relative
                    z-40
                    min-w-0
                    sm:col-span-2
                  "
                >
                  <FieldLabel>
                    Poste recherché
                  </FieldLabel>

                  <button
                    type="button"
                    onClick={() => {
                      setRoleOpen(
                        (
                          current,
                        ) =>
                          !current,
                      );

                      setHousingOpen(
                        false,
                      );
                    }}
                    className={`
                      flex
                      min-h-[58px]
                      w-full
                      min-w-0
                      items-center
                      gap-2.5
                      rounded-[14px]
                      border
                      px-3
                      text-left
                      outline-none
                      ring-0
                      transition
                      focus:outline-none
                      focus:ring-0
                      sm:min-h-[60px]
                      sm:gap-3
                      sm:rounded-[16px]
                      sm:px-3.5

                      ${
                        errors.role
                          ? "border-red-500/60 bg-white/[0.035]"
                          : roleOpen
                            ? "border-secondary/35 bg-white/[0.055]"
                            : "border-white/[0.09] bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.045]"
                      }
                    `}
                    aria-haspopup="listbox"
                    aria-expanded={
                      roleOpen
                    }
                  >
                    <span
                      className={`
                        grid
                        h-9
                        w-9
                        shrink-0
                        place-items-center
                        rounded-[11px]
                        sm:h-10
                        sm:w-10
                        sm:rounded-[12px]

                        ${
                          roleOpen
                            ? "bg-secondary/10 text-secondary"
                            : "bg-white/[0.045] text-white/40"
                        }
                      `}
                    >
                      <SelectedRoleIcon
                        size={18}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong
                        className="
                          block
                          text-left
                          font-subtitle
                          text-[12px]
                          leading-4
                          text-white/80
                          sm:text-sm
                        "
                      >
                        {
                          selectedRole.title
                        }
                      </strong>

                      <span
                        className="
                          mt-1
                          block
                          text-left
                          font-body
                          text-[9px]
                          leading-4
                          text-white/28
                          sm:text-[10px]
                        "
                      >
                        {
                          selectedRole.tag
                        }
                      </span>
                    </span>

                    <span
                      className={`
                        grid
                        h-8
                        w-8
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-white/[0.045]
                        text-white/30
                        transition-all

                        ${
                          roleOpen
                            ? "rotate-180 bg-secondary/10 text-secondary"
                            : ""
                        }
                      `}
                    >
                      <ChevronDown
                        size={15}
                      />
                    </span>
                  </button>

                  {roleOpen && (
                    <div
                      role="listbox"
                      className="
                        absolute
                        left-0
                        right-0
                        top-[calc(100%+8px)]
                        z-[100]
                        max-h-[320px]
                        overflow-y-auto
                        rounded-[16px]
                        border
                        border-white/[0.1]
                        bg-[#171717]
                        p-1.5
                        shadow-[0_28px_90px_rgba(0,0,0,.85)]
                        backdrop-blur-xl
                        sm:rounded-[18px]
                      "
                    >
                      {roles.map(
                        (
                          role,
                        ) => {
                          const Icon =
                            role.icon;

                          const selected =
                            form.role ===
                            role.title;

                          return (
                            <button
                              key={
                                role.title
                              }
                              type="button"
                              role="option"
                              aria-selected={
                                selected
                              }
                              onClick={() => {
                                update(
                                  "role",
                                  role.title,
                                );

                                setRoleOpen(
                                  false,
                                );
                              }}
                              className={`
                                group
                                flex
                                w-full
                                items-center
                                gap-2.5
                                rounded-[12px]
                                px-2.5
                                py-2.5
                                text-left
                                transition
                                sm:gap-3
                                sm:rounded-[13px]
                                sm:px-3
                                sm:py-3

                                ${
                                  selected
                                    ? "bg-white/[0.085]"
                                    : "hover:bg-white/[0.045]"
                                }
                              `}
                            >
                              <span
                                className={`
                                  grid
                                  h-10
                                  w-10
                                  shrink-0
                                  place-items-center
                                  rounded-[12px]
                                  transition
                                  sm:h-11
                                  sm:w-11
                                  sm:rounded-[13px]

                                  ${
                                    selected
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-white/[0.04] text-white/35 group-hover:text-white/60"
                                  }
                                `}
                              >
                                <Icon
                                  size={18}
                                />
                              </span>

                              <span className="min-w-0 flex-1">
                                <strong
                                  className={`
                                    block
                                    font-subtitle
                                    text-[12px]
                                    leading-4
                                    sm:text-sm

                                    ${
                                      selected
                                        ? "text-white"
                                        : "text-white/70"
                                    }
                                  `}
                                >
                                  {
                                    role.title
                                  }
                                </strong>

                                <span
                                  className="
                                    mt-1
                                    block
                                    font-body
                                    text-[9px]
                                    leading-4
                                    text-white/30
                                    sm:text-[10px]
                                  "
                                >
                                  {
                                    role.tag
                                  }
                                </span>
                              </span>

                              {selected && (
                                <span
                                  className="
                                    grid
                                    h-7
                                    w-7
                                    shrink-0
                                    place-items-center
                                    rounded-full
                                    bg-white
                                    text-black
                                  "
                                >
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                  />
                                </span>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  <FieldError>
                    {
                      errors.role
                    }
                  </FieldError>
                </div>

                {/* =================================================
                    DATES
                ================================================= */}

                <label
                  className="min-w-0"
                  data-invalid={
                    errors.startDate
                      ? "true"
                      : undefined
                  }
                >
                  <FieldLabel>
                    Disponible à partir du
                  </FieldLabel>

                  <input
                    type="date"
                    value={
                      form.startDate
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "startDate",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "startDate",
                    )}
                    aria-invalid={
                      !!errors.startDate
                    }
                  />

                  <FieldError>
                    {
                      errors.startDate
                    }
                  </FieldError>
                </label>

                <label
                  className="min-w-0"
                  data-invalid={
                    errors.endDate
                      ? "true"
                      : undefined
                  }
                >
                  <FieldLabel>
                    Disponible jusqu’au
                  </FieldLabel>

                  <input
                    type="date"
                    value={
                      form.endDate
                    }
                    min={
                      form.startDate ||
                      undefined
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "endDate",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "endDate",
                    )}
                    aria-invalid={
                      !!errors.endDate
                    }
                  />

                  <FieldError>
                    {
                      errors.endDate
                    }
                  </FieldError>
                </label>

                {/* =================================================
                    HOUSING
                ================================================= */}

                <div
                  ref={
                    housingRef
                  }
                  data-invalid={
                    errors.housingNeeded
                      ? "true"
                      : undefined
                  }
                  className="
                    relative
                    z-30
                    min-w-0
                    sm:col-span-2
                  "
                >
                  <FieldLabel>
                    Besoin d’un logement ?
                  </FieldLabel>

                  <button
                    type="button"
                    onClick={() => {
                      setHousingOpen(
                        (
                          current,
                        ) =>
                          !current,
                      );

                      setRoleOpen(
                        false,
                      );
                    }}
                    className={`
                      flex
                      min-h-[58px]
                      w-full
                      min-w-0
                      items-center
                      gap-2.5
                      rounded-[14px]
                      border
                      px-3
                      text-left
                      outline-none
                      ring-0
                      transition
                      focus:outline-none
                      focus:ring-0
                      sm:gap-3
                      sm:rounded-[16px]
                      sm:px-3.5

                      ${
                        errors.housingNeeded
                          ? "border-red-500/60 bg-white/[0.035]"
                          : housingOpen
                            ? "border-secondary/35 bg-white/[0.055]"
                            : "border-white/[0.09] bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.045]"
                      }
                    `}
                    aria-haspopup="listbox"
                    aria-expanded={
                      housingOpen
                    }
                  >
                    <span
                      className={`
                        grid
                        h-9
                        w-9
                        shrink-0
                        place-items-center
                        rounded-[11px]
                        sm:h-10
                        sm:w-10
                        sm:rounded-[12px]

                        ${
                          housingOpen
                            ? "bg-secondary/10 text-secondary"
                            : "bg-white/[0.045] text-white/35"
                        }
                      `}
                    >
                      <Home
                        size={18}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong
                        className={`
                          block
                          font-subtitle
                          text-[12px]
                          leading-4
                          sm:text-sm

                          ${
                            form.housingNeeded
                              ? "text-white/80"
                              : "text-white/35"
                          }
                        `}
                      >
                        {form.housingNeeded ===
                        "yes"
                          ? "Oui, j’ai besoin d’un logement"
                          : form.housingNeeded ===
                              "no"
                            ? "Non, j’ai déjà un logement"
                            : "Sélectionner"}
                      </strong>

                      <span
                        className="
                          mt-1
                          hidden
                          font-body
                          text-[10px]
                          leading-4
                          text-white/25
                          sm:block
                        "
                      >
                        {form.housingNeeded ===
                        "yes"
                          ? "Indique ensuite les dates souhaitées"
                          : form.housingNeeded ===
                              "no"
                            ? "Aucune information supplémentaire nécessaire"
                            : "Dis-nous si tu as besoin d’une solution à Barcelone"}
                      </span>
                    </span>

                    <span
                      className={`
                        grid
                        h-8
                        w-8
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-white/[0.045]
                        text-white/30
                        transition-all

                        ${
                          housingOpen
                            ? "rotate-180 bg-secondary/10 text-secondary"
                            : ""
                        }
                      `}
                    >
                      <ChevronDown
                        size={15}
                      />
                    </span>
                  </button>

                  {housingOpen && (
                    <div
                      role="listbox"
                      className="
                        absolute
                        left-0
                        right-0
                        top-[calc(100%+8px)]
                        z-[100]
                        overflow-hidden
                        rounded-[16px]
                        border
                        border-white/[0.1]
                        bg-[#171717]
                        p-1.5
                        shadow-[0_28px_90px_rgba(0,0,0,.85)]
                        backdrop-blur-xl
                        sm:rounded-[18px]
                      "
                    >
                      {[
                        {
                          value:
                            "yes" as const,

                          title:
                            "Oui",

                          description:
                            "J’ai besoin d’un logement à Barcelone",
                        },

                        {
                          value:
                            "no" as const,

                          title:
                            "Non",

                          description:
                            "J’ai déjà une solution de logement",
                        },
                      ].map(
                        (
                          option,
                        ) => {
                          const selected =
                            form.housingNeeded ===
                            option.value;

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              role="option"
                              aria-selected={
                                selected
                              }
                              onClick={() =>
                                selectHousing(
                                  option.value,
                                )
                              }
                              className={`
                                group
                                flex
                                w-full
                                items-center
                                gap-2.5
                                rounded-[12px]
                                px-2.5
                                py-2.5
                                text-left
                                transition
                                sm:gap-3
                                sm:rounded-[13px]
                                sm:px-3
                                sm:py-3

                                ${
                                  selected
                                    ? "bg-white/[0.085]"
                                    : "hover:bg-white/[0.045]"
                                }
                              `}
                            >
                              <span
                                className={`
                                  grid
                                  h-10
                                  w-10
                                  shrink-0
                                  place-items-center
                                  rounded-[12px]
                                  sm:h-11
                                  sm:w-11
                                  sm:rounded-[13px]

                                  ${
                                    selected
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-white/[0.04] text-white/35"
                                  }
                                `}
                              >
                                <Home
                                  size={18}
                                />
                              </span>

                              <span className="min-w-0 flex-1">
                                <strong
                                  className={`
                                    block
                                    font-subtitle
                                    text-[12px]
                                    sm:text-sm

                                    ${
                                      selected
                                        ? "text-white"
                                        : "text-white/70"
                                    }
                                  `}
                                >
                                  {
                                    option.title
                                  }
                                </strong>

                                <span
                                  className="
                                    mt-1
                                    block
                                    font-body
                                    text-[9px]
                                    leading-4
                                    text-white/30
                                    sm:text-[10px]
                                  "
                                >
                                  {
                                    option.description
                                  }
                                </span>
                              </span>

                              {selected && (
                                <span
                                  className="
                                    grid
                                    h-7
                                    w-7
                                    shrink-0
                                    place-items-center
                                    rounded-full
                                    bg-white
                                    text-black
                                  "
                                >
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                  />
                                </span>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  <FieldError>
                    {
                      errors.housingNeeded
                    }
                  </FieldError>
                </div>

                {/* HOUSING DATES */}
                {form.housingNeeded ===
                  "yes" && (
                  <>
                    <label
                      className="min-w-0"
                      data-invalid={
                        errors.housingStartDate
                          ? "true"
                          : undefined
                      }
                    >
                      <FieldLabel>
                        Logement du
                      </FieldLabel>

                      <input
                        type="date"
                        value={
                          form.housingStartDate
                        }
                        onChange={(
                          event,
                        ) =>
                          update(
                            "housingStartDate",
                            event.target.value,
                          )
                        }
                        className={fieldClass(
                          "housingStartDate",
                        )}
                        aria-invalid={
                          !!errors.housingStartDate
                        }
                      />

                      <FieldError>
                        {
                          errors.housingStartDate
                        }
                      </FieldError>
                    </label>

                    <label
                      className="min-w-0"
                      data-invalid={
                        errors.housingEndDate
                          ? "true"
                          : undefined
                      }
                    >
                      <FieldLabel>
                        Jusqu’au
                      </FieldLabel>

                      <input
                        type="date"
                        value={
                          form.housingEndDate
                        }
                        min={
                          form.housingStartDate ||
                          undefined
                        }
                        onChange={(
                          event,
                        ) =>
                          update(
                            "housingEndDate",
                            event.target.value,
                          )
                        }
                        className={fieldClass(
                          "housingEndDate",
                        )}
                        aria-invalid={
                          !!errors.housingEndDate
                        }
                      />

                      <FieldError>
                        {
                          errors.housingEndDate
                        }
                      </FieldError>
                    </label>
                  </>
                )}

                {/* LANGUAGES */}
                <label
                  className="
                    min-w-0
                    sm:col-span-2
                  "
                >
                  <FieldLabel>
                    Langues parlées
                  </FieldLabel>

                  <input
                    value={
                      form.languages
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "languages",
                        event.target.value,
                      )
                    }
                    className={fieldClass(
                      "languages",
                    )}
                    placeholder="Français, anglais, espagnol..."
                  />
                </label>

                {/* EXPERIENCE */}
                <label
                  className="
                    min-w-0
                    sm:col-span-2
                  "
                >
                  <FieldLabel>
                    Ton expérience
                  </FieldLabel>

                  <textarea
                    value={
                      form.experience
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "experience",
                        event.target.value,
                      )
                    }
                    className="
                      form-input
                      min-h-[105px]
                      w-full
                      max-w-full
                      resize-y
                      rounded-[14px]
                      px-3.5
                      py-3.5
                      text-[13px]
                      !bg-white/[0.035]
                      outline-none
                      ring-0
                      focus:outline-none
                      focus:ring-0
                      sm:rounded-[16px]
                      sm:px-4
                      sm:py-4
                      sm:text-sm
                    "
                    placeholder="Commercial, événementiel, réseaux sociaux, association..."
                  />
                </label>

                {/* WHY */}
                <label
                  className="
                    min-w-0
                    sm:col-span-2
                  "
                >
                  <FieldLabel>
                    Pourquoi veux-tu
                    rejoindre B4F ?
                  </FieldLabel>

                  <textarea
                    value={
                      form.message
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "message",
                        event.target.value,
                      )
                    }
                    className="
                      form-input
                      min-h-[110px]
                      w-full
                      max-w-full
                      resize-y
                      rounded-[14px]
                      px-3.5
                      py-3.5
                      text-[13px]
                      !bg-white/[0.035]
                      outline-none
                      ring-0
                      focus:outline-none
                      focus:ring-0
                      sm:rounded-[16px]
                      sm:px-4
                      sm:py-4
                      sm:text-sm
                    "
                    placeholder="Parle-nous un peu de toi..."
                  />
                </label>

                {/* =================================================
                    PROMOTER VIDEO
                ================================================= */}

                {isPromoter && (
                  <label
                    className="
                      min-w-0
                      sm:col-span-2
                    "
                  >
                    <span
                      className="
                        mb-1
                        block
                        font-subtitle
                        text-[11px]
                        leading-5
                        sm:text-xs
                      "
                    >
                      Vidéo de
                      présentation

                      <span
                        className="
                          ml-2
                          text-secondary
                        "
                      >
                        Facultative ·
                        recommandée
                      </span>
                    </span>

                    <p
                      className="
                        mb-3
                        font-body
                        text-[11px]
                        leading-5
                        text-white/35
                        sm:text-xs
                      "
                    >
                      Présente-toi en 30
                      secondes à 1
                      minute : qui tu es,
                      ce qui te motive et
                      pourquoi tu veux
                      rejoindre B4F.
                    </p>

                    <span
                      className="
                        group
                        flex
                        min-h-[110px]
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[17px]
                        border
                        border-dashed
                        border-white/15
                        bg-white/[0.035]
                        p-4
                        text-center
                        transition
                        hover:border-secondary/40
                        sm:min-h-28
                        sm:rounded-[20px]
                        sm:p-5
                      "
                    >
                      {presentationVideo ? (
                        <>
                          <FileCheck2
                            size={25}
                            className="text-success"
                          />

                          <strong
                            className="
                              mt-2
                              block
                              w-full
                              truncate
                              font-subtitle
                              text-[12px]
                              sm:text-sm
                            "
                          >
                            {
                              presentationVideo.name
                            }
                          </strong>
                        </>
                      ) : (
                        <>
                          <Video
                            size={27}
                            className="text-secondary"
                          />

                          <strong
                            className="
                              mt-2
                              font-subtitle
                              text-[12px]
                              sm:text-sm
                            "
                          >
                            Ajouter ma
                            vidéo
                          </strong>

                          <span
                            className="
                              mt-1
                              font-body
                              text-[10px]
                              text-white/35
                              sm:text-xs
                            "
                          >
                            Vidéo · 100 Mo
                            maximum
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="video/*"
                        onChange={
                          selectPresentationVideo
                        }
                        className="sr-only"
                      />
                    </span>
                  </label>
                )}

                {/* =================================================
                    CREATIVE
                ================================================= */}

                {isCreative && (
                  <>
                    <label
                      className="
                        min-w-0
                        sm:col-span-2
                      "
                    >
                      <span
                        className="
                          mb-1
                          block
                          font-subtitle
                          text-[11px]
                          leading-5
                          sm:text-xs
                        "
                      >
                        Exemples de
                        réalisations

                        <span className="ml-2 text-secondary">
                          Facultatif ·
                          recommandé
                        </span>
                      </span>

                      <p
                        className="
                          mb-3
                          font-body
                          text-[11px]
                          leading-5
                          text-white/35
                          sm:text-xs
                        "
                      >
                        Reels, TikToks,
                        affiches, posts
                        Instagram,
                        vidéos, photos ou
                        autres créations.
                      </p>

                      <textarea
                        value={
                          form.portfolioLinks
                        }
                        onChange={(
                          event,
                        ) =>
                          update(
                            "portfolioLinks",
                            event.target.value,
                          )
                        }
                        className="
                          form-input
                          min-h-[90px]
                          w-full
                          resize-y
                          rounded-[14px]
                          px-3.5
                          py-3.5
                          text-[13px]
                          !bg-white/[0.035]
                          outline-none
                          ring-0
                          focus:outline-none
                          focus:ring-0
                          sm:rounded-[16px]
                          sm:px-4
                          sm:py-4
                          sm:text-sm
                        "
                        placeholder="Liens Instagram, TikTok, Drive, Canva, Behance..."
                      />
                    </label>

                    <label
                      className="
                        min-w-0
                        sm:col-span-2
                      "
                    >
                      <span
                        className="
                          group
                          flex
                          min-h-[110px]
                          cursor-pointer
                          flex-col
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[17px]
                          border
                          border-dashed
                          border-white/15
                          bg-white/[0.035]
                          p-4
                          text-center
                          transition
                          hover:border-secondary/40
                          sm:min-h-28
                          sm:rounded-[20px]
                          sm:p-5
                        "
                      >
                        {workSamples.length ? (
                          <>
                            <FileCheck2
                              size={25}
                              className="text-success"
                            />

                            <strong
                              className="
                                mt-2
                                font-subtitle
                                text-[12px]
                                sm:text-sm
                              "
                            >
                              {
                                workSamples.length
                              }{" "}
                              réalisation
                              {workSamples.length >
                              1
                                ? "s"
                                : ""}{" "}
                              ajoutée
                              {workSamples.length >
                              1
                                ? "s"
                                : ""}
                            </strong>
                          </>
                        ) : (
                          <>
                            <Images
                              size={27}
                              className="text-secondary"
                            />

                            <strong
                              className="
                                mt-2
                                font-subtitle
                                text-[12px]
                                sm:text-sm
                              "
                            >
                              Ajouter mes
                              réalisations
                            </strong>

                            <span
                              className="
                                mt-1
                                font-body
                                text-[10px]
                                leading-4
                                text-white/35
                                sm:text-xs
                              "
                            >
                              Images,
                              vidéos ou
                              PDF · jusqu’à
                              6 fichiers
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,application/pdf"
                          onChange={
                            selectWorkSamples
                          }
                          className="sr-only"
                        />
                      </span>
                    </label>
                  </>
                )}

                {/* =================================================
                    CV
                ================================================= */}

                <label
                  className="
                    min-w-0
                    sm:col-span-2
                  "
                >
                  <span
                    className="
                      mb-2
                      block
                      font-subtitle
                      text-[11px]
                      sm:text-xs
                    "
                  >
                    CV

                    <span className="ml-2 text-white/25">
                      Facultatif
                    </span>
                  </span>

                  <span
                    className="
                      group
                      flex
                      min-h-[110px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-[17px]
                      border
                      border-dashed
                      border-white/15
                      bg-white/[0.035]
                      p-4
                      text-center
                      transition
                      hover:border-secondary/40
                      sm:min-h-28
                      sm:rounded-[20px]
                      sm:p-5
                    "
                  >
                    {cv ? (
                      <>
                        <FileCheck2
                          size={25}
                          className="text-success"
                        />

                        <strong
                          className="
                            mt-2
                            block
                            w-full
                            truncate
                            font-subtitle
                            text-[12px]
                            sm:text-sm
                          "
                        >
                          {
                            cv.name
                          }
                        </strong>
                      </>
                    ) : (
                      <>
                        <FileUp
                          size={27}
                          className="text-secondary"
                        />

                        <strong
                          className="
                            mt-2
                            font-subtitle
                            text-[12px]
                            sm:text-sm
                          "
                        >
                          Ajouter mon CV
                        </strong>

                        <span
                          className="
                            mt-1
                            font-body
                            text-[10px]
                            text-white/35
                            sm:text-xs
                          "
                        >
                          PDF, DOC ou DOCX
                          · 8 Mo max
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={
                        selectCv
                      }
                      className="sr-only"
                    />
                  </span>

                  {fileError && (
                    <span
                      className="
                        mt-2
                        block
                        font-body
                        text-[11px]
                        leading-5
                        text-red-400
                        sm:text-xs
                      "
                    >
                      {
                        fileError
                      }
                    </span>
                  )}
                </label>

                {/* MEDIA ERROR */}
                {mediaError && (
                  <div
                    className="
                      rounded-[14px]
                      border
                      border-red-500/20
                      bg-red-500/10
                      p-3
                      font-body
                      text-[11px]
                      leading-5
                      text-red-200
                      sm:col-span-2
                      sm:rounded-[16px]
                      sm:text-xs
                    "
                  >
                    {
                      mediaError
                    }
                  </div>
                )}
              </div>

              {/* SUCCESS */}
              {submitState ===
                "success" && (
                <div
                  className="
                    mt-5
                    flex
                    gap-3
                    rounded-[16px]
                    border
                    border-success/25
                    bg-success/10
                    p-3.5
                    font-body
                    text-[12px]
                    leading-5
                    text-green-100
                    sm:rounded-[18px]
                    sm:p-4
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  <CheckCircle2
                    size={18}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />

                  <span>
                    Ta candidature a bien
                    été envoyée.
                  </span>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  submitState ===
                  "loading"
                }
                className="
                  primary-button
                  mt-5
                  min-h-[52px]
                  w-full
                  px-4
                  text-[11px]
                  sm:min-h-[54px]
                  sm:text-xs
                "
              >
                {submitState ===
                  "loading" && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {submitState ===
                "loading"
                  ? "Envoi…"
                  : "Envoyer ma candidature"}

                {submitState !==
                  "loading" && (
                  <Send
                    size={17}
                  />
                )}
              </button>

              <p
                className="
                  mt-3
                  px-2
                  text-center
                  font-body
                  text-[9px]
                  leading-4
                  text-white/25
                  sm:text-[10px]
                  sm:leading-5
                "
              >
                Ces informations sont
                utilisées uniquement
                dans le cadre du
                recrutement B4F.
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span
      className="
        mb-1.5
        block
        font-subtitle
        text-[11px]
        leading-5
        text-white/75
        sm:mb-2
        sm:text-xs
      "
    >
      {
        children
      }
    </span>
  );
}

function FieldError({
  children,
}: {
  children?:
    string;
}) {
  if (
    !children
  ) {
    return null;
  }

  return (
    <span
      className="
        mt-1.5
        block
        font-body
        text-[10px]
        leading-4
        text-red-400
        sm:text-xs
      "
    >
      {
        children
      }
    </span>
  );
}