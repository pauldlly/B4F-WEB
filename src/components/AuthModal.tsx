import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  X
} from "lucide-react";

import {
  type FormEvent,
  useEffect,
  useState
} from "react";

import { media } from "../data/media";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useI18n } from "../i18n/LanguageProvider";
import { useAuth } from "../providers/AuthProvider";

type AuthMode = "login" | "register";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export function AuthModal() {
  const {
    authOpen,
    authMode,
    configured,
    closeAuth,
    openAuth,
    signIn,
    signUp,
    resetPassword
  } = useAuth();

  const { t } = useI18n();

  const [mode, setMode] =
    useState<AuthMode>(authMode);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [visiblePassword, setVisiblePassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [feedback, setFeedback] =
    useState<Feedback>(null);

  useBodyScrollLock(authOpen);

  useEffect(() => {
    setMode(authMode);
    setErrors({});
    setFeedback(null);
    setVisiblePassword(false);
  }, [authMode, authOpen]);

  if (!authOpen) {
    return null;
  }

  const changeMode = (
    next: AuthMode
  ) => {
    setMode(next);
    setErrors({});
    setFeedback(null);
    setPassword("");
    setVisiblePassword(false);

    openAuth(next);
  };

  const clearError = (
    field: keyof FieldErrors
  ) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current
      };

      delete next[field];

      return next;
    });

    if (
      feedback?.type === "error"
    ) {
      setFeedback(null);
    }
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (
      mode === "register" &&
      !name.trim()
    ) {
      nextErrors.name =
        "Tu as oublié ton prénom et ton nom.";
    } else if (
      mode === "register" &&
      name.trim().length < 2
    ) {
      nextErrors.name =
        "Ton nom semble incomplet.";
    }

    if (!email.trim()) {
      nextErrors.email =
        "Tu as oublié ton adresse e-mail.";
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          email.trim()
        )
      ) {
        nextErrors.email =
          "Entre une adresse e-mail valide.";
      }
    }

    if (!password) {
      nextErrors.password =
        "Tu as oublié ton mot de passe.";
    } else if (
      password.length < 8
    ) {
      nextErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const getFriendlyError = (
    error: unknown
  ) => {
    if (
      !(error instanceof Error)
    ) {
      return "Une erreur est survenue. Réessaie dans quelques instants.";
    }

    const message =
      error.message.toLowerCase();

    if (
      message.includes(
        "invalid login credentials"
      ) ||
      message.includes(
        "invalid credentials"
      )
    ) {
      return "E-mail ou mot de passe incorrect.";
    }

    if (
      message.includes(
        "email not confirmed"
      )
    ) {
      return "Ton adresse e-mail n’a pas encore été confirmée. Vérifie ta boîte mail.";
    }

    if (
      message.includes(
        "user already registered"
      ) ||
      message.includes(
        "already registered"
      )
    ) {
      return "Un compte existe déjà avec cette adresse e-mail.";
    }

    if (
      message.includes(
        "password should be"
      ) ||
      (
        message.includes(
          "password"
        ) &&
        message.includes(
          "characters"
        )
      )
    ) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (
      message.includes(
        "rate limit"
      ) ||
      message.includes(
        "too many requests"
      )
    ) {
      return "Trop de tentatives. Attends quelques instants avant de réessayer.";
    }

    if (
      message.includes(
        "network"
      ) ||
      message.includes(
        "fetch"
      )
    ) {
      return "Impossible de contacter le serveur. Vérifie ta connexion internet.";
    }

    return error.message;
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFeedback(null);

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (
        mode === "login"
      ) {
        await signIn(
          email.trim(),
          password
        );

        return;
      }

      const result =
        await signUp(
          name.trim(),
          email.trim(),
          password
        );

      if (
        result.needsConfirmation
      ) {
        setFeedback({
          type: "success",
          message:
            "Compte créé ! Vérifie ta boîte e-mail pour confirmer ton inscription."
        });
      }
    } catch (
      error: unknown
    ) {
      setFeedback({
        type: "error",
        message:
          getFriendlyError(
            error
          )
      });
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    setFeedback(null);

    if (!email.trim()) {
      setErrors((current) => ({
        ...current,
        email:
          "Entre ton adresse e-mail pour recevoir le lien."
      }));

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        email.trim()
      )
    ) {
      setErrors((current) => ({
        ...current,
        email:
          "Entre une adresse e-mail valide."
      }));

      return;
    }

    try {
      setLoading(true);

      await resetPassword(
        email.trim()
      );

      setFeedback({
        type: "success",
        message:
          "Lien envoyé ! Vérifie ta boîte e-mail pour réinitialiser ton mot de passe."
      });
    } catch (
      error: unknown
    ) {
      setFeedback({
        type: "error",
        message:
          getFriendlyError(
            error
          )
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center overflow-x-hidden bg-black/85 backdrop-blur-xl md:items-center md:p-6">
      <button
        type="button"
        aria-label={t(
          "common.close"
        )}
        onClick={closeAuth}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 grid h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-hidden bg-[#101010] shadow-[0_35px_120px_rgba(0,0,0,.8)] md:h-[min(740px,calc(100dvh-48px))] md:max-w-[1080px] md:grid-cols-[0.9fr_1.1fr] md:rounded-[32px] md:border md:border-white/[0.09]">
        <aside className="relative hidden min-h-0 min-w-0 overflow-hidden md:block">
          <img
            src={media.club}
            alt="Ambiance B4F Barcelona"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.06)_0%,rgba(0,0,0,.2)_35%,rgba(0,0,0,.94)_100%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(249,115,22,.20),transparent_34%),radial-gradient(circle_at_90%_85%,rgba(236,72,153,.15),transparent_35%)]" />

          <div className="relative flex h-full min-w-0 flex-col px-9 py-9">
            <img
              src="/brand/b4f-header-white.png"
              alt="B4F Events"
              className="w-28 object-contain lg:w-32"
            />

            <div className="mt-auto max-w-[390px] pb-1">
              <span className="font-subtitle text-[10px] uppercase tracking-[0.2em] text-secondary">
                B4F Experience
              </span>

              <h2 className="mt-4 font-title text-[clamp(2.8rem,4vw,4.3rem)] uppercase leading-[0.82] tracking-[-0.045em]">
                Ta nuit.

                <span className="block">
                  Tes billets.
                </span>

                <span className="block text-gradient">
                  Partout.
                </span>
              </h2>

              <p className="mt-5 max-w-[340px] font-body text-sm leading-6 text-white/50">
                Retrouve tous tes billets, packs et
                réservations B4F au même endroit.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Billets",
                  "Packs",
                  "Réservations"
                ].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 font-subtitle text-[9px] uppercase tracking-[0.14em] text-white/45 backdrop-blur"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="custom-scrollbar relative min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 max-w-full rounded-full bg-secondary/[0.045] blur-[100px]" />

          <div className="sticky top-0 z-20 flex min-h-[72px] w-full min-w-0 max-w-full items-center gap-3 overflow-x-hidden border-b border-white/[0.06] bg-[#101010]/90 px-4 backdrop-blur-2xl sm:px-5 md:px-7">
            <div className="shrink-0 md:hidden">
              <img
                src="/brand/b4f-header-white.png"
                alt="B4F Events"
                className="h-9 w-16 object-contain object-left"
              />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="grid min-w-0 flex-1 grid-cols-2 rounded-[14px] border border-white/[0.07] bg-white/[0.035] p-1">
                <button
                  type="button"
                  onClick={() =>
                    changeMode(
                      "login"
                    )
                  }
                  className={`min-h-[42px] min-w-0 truncate rounded-[11px] px-2 font-subtitle text-[11px] transition-all duration-300 ${
                    mode ===
                    "login"
                      ? "bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,.25)]"
                      : "text-white/30 hover:text-white/70"
                  }`}
                >
                  Connexion
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeMode(
                      "register"
                    )
                  }
                  className={`min-h-[42px] min-w-0 truncate rounded-[11px] px-2 font-subtitle text-[11px] transition-all duration-300 ${
                    mode ===
                    "register"
                      ? "bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,.25)]"
                      : "text-white/30 hover:text-white/70"
                  }`}
                >
                  S’inscrire
                </button>
              </div>

              <button
                type="button"
                onClick={closeAuth}
                className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] border border-white/[0.07] bg-white/[0.035] text-white/35 transition hover:bg-white/[0.08] hover:text-white"
                aria-label={t(
                  "common.close"
                )}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative mx-auto flex min-h-[calc(100%-72px)] w-full min-w-0 max-w-[570px] flex-col justify-center overflow-x-hidden px-5 py-8 sm:px-8 md:px-10 md:py-10">
            <div className="mb-7 min-w-0">
              <span className="font-subtitle text-[10px] uppercase tracking-[0.2em] text-secondary">
                {mode === "login"
                  ? "Welcome back"
                  : "Bienvenue chez B4F"}
              </span>

              <h2 className="mt-2 max-w-md break-words font-title text-[clamp(2.4rem,4vw,3.5rem)] uppercase leading-[0.86] tracking-[-0.035em]">
                {mode === "login" ? (
                  <>
                    Retrouve
                    <span className="block text-gradient">
                      tes soirées.
                    </span>
                  </>
                ) : (
                  <>
                    Rejoins
                    <span className="block text-gradient">
                      l’expérience.
                    </span>
                  </>
                )}
              </h2>

            </div>

            {!configured && (
              <div className="mb-5 w-full max-w-full overflow-hidden rounded-[16px] border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
                <p className="break-words font-body text-xs leading-5 text-red-200">
                  {t(
                    "auth.notConfigured"
                  )}
                </p>
              </div>
            )}

            <form
              onSubmit={submit}
              noValidate
              className="w-full min-w-0 space-y-4 overflow-x-hidden"
            >
              {mode ===
                "register" && (
                <label className="block min-w-0">
                  <span className="mb-2 block font-subtitle text-[11px] text-white/60">
                    Prénom et nom
                  </span>

                  <div className="relative min-w-0">
                    <UserRound
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition ${
                        errors.name
                          ? "text-red-400"
                          : "text-white/20"
                      }`}
                    />

                    <input
                      value={
                        name
                      }
                      onChange={(
                        event
                      ) => {
                        setName(
                          event
                            .target
                            .value
                        );

                        clearError(
                          "name"
                        );
                      }}
                      className={`min-h-[54px] w-full min-w-0 max-w-full rounded-[15px] border bg-white/[0.035] pl-12 pr-4 font-body text-sm text-white outline-none transition placeholder:text-white/20 ${
                        errors.name
                          ? "border-red-500/60 bg-red-500/[0.035] focus:border-red-400"
                          : "border-white/[0.08] hover:border-white/15 focus:border-white/30 focus:bg-white/[0.05]"
                      }`}
                      placeholder="Jean Dupont"
                      autoComplete="name"
                      aria-invalid={
                        !!errors.name
                      }
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-1.5 break-words font-body text-[11px] text-red-400">
                      {errors.name}
                    </p>
                  )}
                </label>
              )}

              <label className="block min-w-0">
                <span className="mb-2 block font-subtitle text-[11px] text-white/60">
                  E-mail
                </span>

                <div className="relative min-w-0">
                  <Mail
                    size={17}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition ${
                      errors.email
                        ? "text-red-400"
                        : "text-white/20"
                    }`}
                  />

                  <input
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) => {
                      setEmail(
                        event
                          .target
                          .value
                      );

                      clearError(
                        "email"
                      );
                    }}
                    className={`min-h-[54px] w-full min-w-0 max-w-full rounded-[15px] border bg-white/[0.035] pl-12 pr-4 font-body text-sm text-white outline-none transition placeholder:text-white/20 ${
                      errors.email
                        ? "border-red-500/60 bg-red-500/[0.035] focus:border-red-400"
                        : "border-white/[0.08] hover:border-white/15 focus:border-white/30 focus:bg-white/[0.05]"
                    }`}
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    aria-invalid={
                      !!errors.email
                    }
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 break-words font-body text-[11px] text-red-400">
                    {errors.email}
                  </p>
                )}
              </label>

              <label className="block min-w-0">
                <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                  <span className="font-subtitle text-[11px] text-white/60">
                    Mot de passe
                  </span>

                  {mode ===
                    "login" && (
                    <button
                      type="button"
                      onClick={() =>
                        void forgot()
                      }
                      disabled={
                        loading ||
                        !configured
                      }
                      className="shrink-0 font-body text-[11px] text-white/30 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <LockKeyhole
                    size={17}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition ${
                      errors.password
                        ? "text-red-400"
                        : "text-white/20"
                    }`}
                  />

                  <input
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) => {
                      setPassword(
                        event
                          .target
                          .value
                      );

                      clearError(
                        "password"
                      );
                    }}
                    className={`min-h-[54px] w-full min-w-0 max-w-full rounded-[15px] border bg-white/[0.035] px-12 font-body text-sm text-white outline-none transition placeholder:text-white/20 ${
                      errors.password
                        ? "border-red-500/60 bg-red-500/[0.035] focus:border-red-400"
                        : "border-white/[0.08] hover:border-white/15 focus:border-white/30 focus:bg-white/[0.05]"
                    }`}
                    type={
                      visiblePassword
                        ? "text"
                        : "password"
                    }
                    placeholder="8 caractères minimum"
                    autoComplete={
                      mode ===
                      "login"
                        ? "current-password"
                        : "new-password"
                    }
                    aria-invalid={
                      !!errors.password
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setVisiblePassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 transition hover:text-white/70"
                    aria-label={
                      visiblePassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {visiblePassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 break-words font-body text-[11px] text-red-400">
                    {
                      errors.password
                    }
                  </p>
                )}
              </label>

              {feedback && (
                <div
                  className={`flex w-full min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-[16px] border px-4 py-3.5 ${
                    feedback.type ===
                    "success"
                      ? "border-green-500/20 bg-green-500/[0.07]"
                      : "border-red-500/20 bg-red-500/[0.07]"
                  }`}
                >
                  {feedback.type ===
                  "success" ? (
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                  ) : (
                    <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-red-400" />
                  )}

                  <p
                    className={`min-w-0 break-words font-body text-xs leading-5 ${
                      feedback.type ===
                      "success"
                        ? "text-green-100/75"
                        : "text-red-100/75"
                    }`}
                  >
                    {
                      feedback.message
                    }
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !configured
                }
                className="group mt-2 flex min-h-[54px] w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-[15px] bg-white px-5 font-subtitle text-sm text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>
                  {loading
                    ? t(
                        "common.loading"
                      )
                    : mode ===
                        "login"
                      ? "Se connecter"
                      : "Créer mon compte"}
                </span>

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

          </div>
        </div>
      </section>
    </div>
  );
}