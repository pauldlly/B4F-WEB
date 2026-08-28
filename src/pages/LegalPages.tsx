import {
  BadgeEuro,
  Building2,
  CalendarClock,
  Cookie,
  CreditCard,
  Database,
  FileCheck2,
  FileText,
  Fingerprint,
  Globe2,
  Handshake,
  Headphones,
  Landmark,
  LockKeyhole,
  Mail,
  RefreshCcw,
  Scale,
  ShieldCheck,
  TicketCheck,
  UserRoundCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";

/* =========================================================
   TYPES
========================================================= */

type LegalSection = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  points: string[];
};

type LegalLayoutProps = {
  title: string;
  description: string;
  path: string;
  updatedAt?: string;
  essentials: string[];
  sections: LegalSection[];
  children?: ReactNode;
};

/* =========================================================
   COMPANY INFORMATION
========================================================= */

const companyName =
  import.meta.env.VITE_LEGAL_COMPANY_NAME ||
  "B4F EVENTS";

const companyAddress =
  import.meta.env.VITE_LEGAL_COMPANY_ADDRESS ||
  "296 avenue Daumesnil, 75012 Paris, France";

const legalEmail =
  import.meta.env.VITE_LEGAL_EMAIL ||
  "contact.b4fevents@gmail.com";

const supportEmail =
  import.meta.env.VITE_SUPPORT_EMAIL ||
  "contact.b4fevents@gmail.com";

const companyRegistration =
  import.meta.env.VITE_LEGAL_COMPANY_REGISTRATION ||
  "Forme juridique, capital social, SIREN/RCS et numéro de TVA : à compléter";

const publicationDirector =
  import.meta.env.VITE_LEGAL_PUBLICATION_DIRECTOR ||
  "À compléter";

const hostingIdentity =
  import.meta.env.VITE_HOSTING_IDENTITY ||
  "À compléter selon l’hébergeur utilisé pour le site";

/* =========================================================
   LEGAL LAYOUT
========================================================= */

function LegalLayout({
  title,
  description,
  path,
  updatedAt = "28 août 2026",
  essentials,
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/[0.07] pb-14 pt-28 sm:pb-20 sm:pt-36">
        <div className="party-orb party-orb-orange absolute -left-32 top-10 h-80 w-80" />

        <div className="party-orb party-orb-pink absolute -right-32 bottom-0 h-80 w-80" />

        <div className="page-shell relative">
          <Reveal className="max-w-4xl">
            <span className="inline-flex items-center gap-2 font-subtitle text-xs uppercase tracking-[0.2em] text-secondary">
              <FileText size={17} />
              Informations juridiques B4F
            </span>

            <h1 className="mt-5 font-title text-[clamp(2.7rem,6vw,6.4rem)] uppercase leading-[0.84] ">
              {title}
            </h1>

            <p className="mt-6 max-w-2xl font-body text-base leading-8 text-white/50 sm:text-lg">
              {description}
            </p>

            <div className="mt-7 flex flex-wrap gap-2 font-subtitle text-[10px] uppercase tracking-[0.13em] text-white/[0.45]">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                B4F EVENTS
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Mise à jour : {updatedAt}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="page-shell py-10 sm:py-16">
        {/* ESSENTIALS */}

        <Reveal>
          <div className="grid gap-5 rounded-[28px] border border-secondary/25 bg-[linear-gradient(135deg,rgba(251,146,60,.14),rgba(255,105,180,.06),rgba(255,255,255,.025))] p-5 sm:p-7 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <span className="inline-flex items-center gap-2 font-subtitle text-xs uppercase tracking-[0.16em] text-secondary">
                <ShieldCheck size={17} />
                À retenir
              </span>

              <h2 className="mt-3 font-title text-2xl uppercase leading-[0.92] sm:text-3xl">
                Les points essentiels
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {essentials.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[18px] border border-white/[0.07] bg-black/20 p-4"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/[0.15] text-secondary">
                    <FileCheck2 size={14} />
                  </span>

                  <p className="font-body text-sm leading-6 text-white/[0.55]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* SECTIONS */}

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <Reveal
                key={section.title}
                delay={Math.min(index * 45, 270)}
                direction="scale"
              >
                <article className="h-full rounded-[26px] border border-white/[0.08] bg-[#121212] p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-subtitle text-[10px] uppercase tracking-[0.17em] text-secondary">
                        {String(index + 1).padStart(2, "0")}
                        {" · "}
                        {section.eyebrow}
                      </span>

                      <h2 className="mt-3 font-title text-2xl uppercase leading-[0.93]">
                        {section.title}
                      </h2>
                    </div>

                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/70">
                      <Icon size={20} />
                    </span>
                  </div>

                  <p className="mt-4 font-body text-sm leading-7 text-white/[0.45]">
                    {section.description}
                  </p>

                  <div className="my-5 h-px bg-white/[0.08]" />

                  <ol className="space-y-3">
                    {section.points.map((point, pointIndex) => (
                      <li
                        key={`${section.title}-${pointIndex}`}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.05] font-subtitle text-[10px] text-secondary">
                          {pointIndex + 1}
                        </span>

                        <p className="font-body text-sm leading-6 text-white/[0.48]">
                          {point}
                        </p>
                      </li>
                    ))}
                  </ol>
                </article>
              </Reveal>
            );
          })}
        </div>

        {children}

        {/* CONTACT */}

        <div className="mt-10 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-subtitle text-xs uppercase tracking-[0.16em] text-primary">
                Contact
              </span>

              <h2 className="mt-2 font-title text-xl uppercase">
                Une question sur ce document ?
              </h2>

              <p className="mt-2 font-body text-sm leading-6 text-white/[0.42]">
                Écrivez-nous à {legalEmail}.
                Pour une commande, un billet ou une demande d’assistance,
                indiquez si possible votre référence de commande.
              </p>
            </div>
<a
  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    supportEmail
  )}&su=${encodeURIComponent("Contact B4F EVENTS")}`}
  target="_blank"
  rel="noopener noreferrer"
  className="secondary-button shrink-0"
>
  <Mail size={17} />
  Contacter B4F
</a>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   CONDITIONS GÉNÉRALES DE VENTE
========================================================= */

export function TermsPage() {
  return (
    <LegalLayout
      title="Conditions générales de vente"
      description="Les règles applicables à l’achat de billets, de packs, d’options et de tables proposés par B4F EVENTS."
      path="/cgv"
      essentials={[
        "Le prix total de la commande est présenté avant le paiement.",
        "La commande est confirmée uniquement après validation effective du paiement.",
        "Chaque billet et QR code est unique et peut être contrôlé à l’entrée.",
        "Les conditions d’annulation, de remboursement ou de report sont précisées selon l’événement concerné.",
      ]}
      sections={[
        {
          eyebrow: "Vendeur",
          title: "Identité et champ d’application",
          description:
            "Les présentes conditions encadrent les ventes réalisées par l’intermédiaire des services B4F EVENTS.",
          icon: Building2,
          points: [
            `B4F EVENTS — ${companyAddress}.`,
            `Contact : ${supportEmail}.`,
            "Les présentes conditions s’appliquent aux billets, packs, options, réservations de tables et services additionnels proposés par B4F.",
            "La version applicable est celle présentée au client au moment de la validation de sa commande.",
          ],
        },

        {
          eyebrow: "Offre",
          title: "Événements, packs et disponibilité",
          description:
            "Les principales caractéristiques de chaque offre sont présentées avant l’achat.",
          icon: TicketCheck,
          points: [
            "Les fiches événements peuvent notamment préciser le nom de l’événement, la date, le lieu, le tarif, les horaires et les conditions d’accès.",
            "Un pack peut comprendre plusieurs événements, billets, dates, options ou prestations.",
            "La disponibilité d’un produit n’est définitivement garantie qu’après validation de la commande et du paiement.",
            "Certains horaires, programmes ou éléments liés à un événement peuvent évoluer lorsque les contraintes de l’organisateur ou du lieu le nécessitent.",
          ],
        },

        {
          eyebrow: "Prix",
          title: "Tarifs et frais",
          description:
            "Le montant dû par le client est indiqué avant la confirmation définitive du paiement.",
          icon: BadgeEuro,
          points: [
            "Les prix sont indiqués en euros.",
            "Les éventuels frais de service, suppléments, options ou acomptes sont affichés avant la validation de la commande.",
            "Les tarifs peuvent évoluer pour les commandes futures sans modifier une commande déjà confirmée.",
            "En cas d’erreur manifeste de prix ou d’anomalie technique, B4F peut annuler la transaction et rembourser les sommes effectivement encaissées.",
          ],
        },

        {
          eyebrow: "Commande",
          title: "Parcours d’achat",
          description:
            "Le client doit vérifier les informations de sa commande avant de procéder au paiement.",
          icon: UserRoundCheck,
          points: [
            "Le client sélectionne les produits souhaités, vérifie son panier puis renseigne les informations nécessaires à la commande.",
            "Le récapitulatif peut comprendre les billets, packs, quantités, événements, options, dates et prix sélectionnés.",
            "Une vente peut être techniquement attribuée au promoteur à l’origine du lien ou de la réservation.",
            "Lorsque le site le permet, l’achat peut être effectué sans compte client.",
          ],
        },

        {
          eyebrow: "Paiement",
          title: "Validation et sécurité",
          description:
            "Le paiement est réalisé à travers le prestataire proposé lors du parcours d’achat.",
          icon: CreditCard,
          points: [
            "Une commande n’est considérée comme payée qu’après confirmation du paiement par le prestataire concerné.",
            "B4F ne conserve pas les données bancaires complètes de la carte lorsque celles-ci sont traitées directement par le prestataire de paiement.",
            "Une transaction refusée, expirée ou abandonnée ne garantit pas la conservation des billets ou places sélectionnés.",
            "Des contrôles de sécurité et de lutte contre la fraude peuvent être effectués.",
          ],
        },

        {
          eyebrow: "Billet",
          title: "Émission et utilisation",
          description:
            "Les billets numériques permettent l’accès aux événements auxquels ils sont associés.",
          icon: Fingerprint,
          points: [
            "Le billet est associé à un identifiant et/ou à un QR code unique.",
            "Une fois un QR code validé lors du contrôle d’accès, une copie du même billet peut être refusée.",
            "Le client est responsable de la conservation et de la confidentialité de son billet.",
            "Selon l’événement, une pièce d’identité ou une condition d’âge peut être demandée à l’entrée.",
          ],
        },

        {
          eyebrow: "Accès",
          title: "Règles des établissements",
          description:
            "La possession d’un billet ne dispense pas du respect des règles imposées par l’établissement ou l’organisateur.",
          icon: ShieldCheck,
          points: [
            "Le participant doit respecter les horaires, règles de sécurité et conditions particulières indiquées pour l’événement.",
            "L’accès peut être refusé notamment en cas de fraude, comportement dangereux, violence, harcèlement, ivresse manifeste ou non-respect des règles de l’établissement.",
            "Le non-respect d’une condition clairement annoncée avant l’achat ne donne pas nécessairement droit à un remboursement.",
            "B4F promeut un environnement respectueux et ne tolère aucune discrimination, menace ou comportement mettant autrui en danger.",
          ],
        },

        {
          eyebrow: "Changements",
          title: "Annulation et report",
          description:
            "Les modalités applicables dépendent de la nature de la modification apportée à l’événement.",
          icon: CalendarClock,
          points: [
            "En cas d’annulation définitive, les modalités de remboursement applicables sont communiquées aux clients concernés.",
            "En cas de report, le billet peut rester valable pour la nouvelle date selon les conditions annoncées.",
            "Une modification mineure d’horaire ou de programmation n’entraîne pas automatiquement un remboursement.",
            "Les événements de force majeure sont traités conformément aux règles légales applicables.",
          ],
        },

        {
          eyebrow: "Rétractation",
          title: "Droit de rétractation",
          description:
            "Certaines prestations de loisirs fournies à une date déterminée peuvent bénéficier d’une exception au droit de rétractation.",
          icon: Scale,
          points: [
            "Le client doit vérifier attentivement la date, l’événement, le lieu, le tarif et les quantités avant de payer.",
            "Un changement d’avis personnel n’entraîne pas automatiquement l’annulation ou le remboursement d’un billet.",
            "Toute politique commerciale plus favorable proposée pour un événement reste applicable lorsqu’elle est clairement annoncée.",
            "Les droits impératifs accordés au consommateur par la législation applicable restent pleinement applicables.",
          ],
        },

        {
          eyebrow: "Assistance",
          title: "Réclamations et contact",
          description:
            "B4F met à disposition une adresse permettant au client de signaler un problème relatif à une commande.",
          icon: Headphones,
          points: [
            `Adresse de contact : ${supportEmail}.`,
            "Pour faciliter le traitement, le client est invité à indiquer son nom, son e-mail et sa référence de commande.",
            "Les demandes sont traitées dans les meilleurs délais selon leur nature et la proximité de l’événement.",
            "Les droits du consommateur prévus par la législation applicable restent inchangés.",
          ],
        },
      ]}
    />
  );
}

/* =========================================================
   POLITIQUE DE CONFIDENTIALITÉ
========================================================= */

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      description="Découvrez comment B4F EVENTS collecte, utilise, protège et supprime les données personnelles nécessaires au fonctionnement de ses services."
      path="/confidentialite"
      updatedAt="28 août 2026"
      essentials={[
        "Les comptes de l’application B4F sont créés manuellement par l’administrateur.",
        "B4F ne vend pas les données personnelles de ses utilisateurs.",
        "Vous pouvez demander l’accès, la rectification ou la suppression de vos données.",
        `Les demandes de suppression peuvent être envoyées à ${legalEmail}.`,
      ]}
      sections={[
        /* =====================================================
           1 - RESPONSABLE
        ===================================================== */

        {
          eyebrow: "Responsable",
          title: "Qui traite vos données ?",
          description:
            "B4F EVENTS est responsable des traitements de données personnelles réalisés dans le cadre de ses services.",
          icon: Building2,
          points: [
            `Responsable du traitement : ${companyName}.`,
            `Adresse : ${companyAddress}.`,
            `Contact relatif aux données personnelles : ${legalEmail}.`,
            "Les services B4F sont notamment proposés dans le cadre d’activités événementielles à Barcelone et en Espagne.",
          ],
        },

        /* =====================================================
           2 - CRÉATION DES COMPTES
        ===================================================== */

        {
          eyebrow: "Compte",
          title: "Création des comptes",
          description:
            "Les comptes utilisés dans l’application B4F ne sont pas librement créés depuis l’application.",
          icon: UserRoundCheck,
          points: [
            "Les comptes utilisateur de l’application sont créés manuellement par un administrateur B4F.",
            "L’utilisateur ne peut pas créer lui-même son compte depuis l’application.",
            "Les identifiants nécessaires à la connexion sont transmis à l’utilisateur par un canal externe approprié.",
            "L’accès au compte est personnel et les identifiants ne doivent pas être communiqués à une autre personne.",
          ],
        },

        /* =====================================================
           3 - DONNÉES COLLECTÉES
        ===================================================== */

        {
          eyebrow: "Données",
          title: "Données personnelles collectées",
          description:
            "B4F collecte uniquement les informations nécessaires au fonctionnement, à la sécurité et à l’administration de ses services.",
          icon: Database,
          points: [
            "Nom et prénom.",
            "Adresse e-mail.",
            "Numéro de téléphone lorsque celui-ci est renseigné.",
            "Sexe lorsque cette information est nécessaire aux fonctionnalités utilisées.",
            "Informations liées au compte utilisateur et au profil promoteur associé.",
            "Informations relatives aux clients ou réservations rattachées à l’utilisateur lorsque les fonctions de l’application le nécessitent.",
            "Historique et données générées lors de l’utilisation de l’application.",
          ],
        },

        /* =====================================================
           4 - DONNÉES TECHNIQUES
        ===================================================== */

        {
          eyebrow: "Technique",
          title: "Données d’utilisation",
          description:
            "Certaines informations techniques peuvent être enregistrées automatiquement lors de l’utilisation du service.",
          icon: Fingerprint,
          points: [
            "Adresse IP.",
            "Type d’appareil, système d’exploitation et informations techniques similaires.",
            "Type de navigateur lorsqu’un service B4F est utilisé depuis le web.",
            "Date et heure d’utilisation du service.",
            "Pages ou fonctionnalités utilisées.",
            "Journaux techniques, erreurs et données de diagnostic nécessaires au fonctionnement et à la sécurité du service.",
          ],
        },

        /* =====================================================
           5 - PERMISSIONS
        ===================================================== */

        {
          eyebrow: "Permissions",
          title: "Caméra et notifications",
          description:
            "Certaines fonctionnalités de l’application nécessitent l’autorisation préalable de l’utilisateur.",
          icon: ShieldCheck,
          points: [
            "L’accès à la caméra peut être demandé lorsque celui-ci est nécessaire à une fonctionnalité de l’application, notamment pour l’utilisation de fonctions liées aux billets ou QR codes.",
            "L’application peut demander l’autorisation d’envoyer des notifications push.",
            "Ces autorisations peuvent être refusées ou retirées depuis les paramètres du téléphone.",
            "Le retrait d’une autorisation peut empêcher certaines fonctionnalités associées de fonctionner correctement.",
          ],
        },

        /* =====================================================
           6 - FINALITÉS
        ===================================================== */

        {
          eyebrow: "Utilisation",
          title: "Pourquoi utilisons-nous vos données ?",
          description:
            "Les données personnelles sont utilisées uniquement dans le cadre de finalités déterminées liées aux services B4F.",
          icon: FileCheck2,
          points: [
            "Fournir, exploiter et maintenir l’application et les services B4F.",
            "Créer, administrer et sécuriser les comptes utilisateur.",
            "Permettre la gestion des billets, réservations, clients, ventes et opérations associées.",
            "Permettre l’exécution des contrats et prestations proposés.",
            "Répondre aux demandes d’assistance et aux demandes des utilisateurs.",
            "Contacter un utilisateur par e-mail, téléphone, notification ou autre moyen approprié lorsque cela est nécessaire au service.",
            "Prévenir les utilisations frauduleuses et protéger la sécurité du service.",
            "Analyser les performances du service et corriger les problèmes techniques.",
          ],
        },

        /* =====================================================
           7 - DESTINATAIRES
        ===================================================== */

        {
          eyebrow: "Accès",
          title: "Qui peut accéder aux données ?",
          description:
            "L’accès aux données personnelles est limité aux personnes et prestataires ayant besoin de ces informations.",
          icon: Handshake,
          points: [
            "Les administrateurs et membres habilités de l’équipe B4F.",
            "Les personnes chargées du support, de la gestion ou du contrôle des opérations.",
            "Les prestataires techniques nécessaires au fonctionnement de l’application.",
            "Supabase lorsque ses services sont utilisés pour la base de données, l’authentification ou les fonctions serveur.",
            "Les prestataires de paiement lorsque leur intervention est nécessaire au traitement d’une transaction.",
            "Les autorités compétentes lorsque la communication des données est imposée par une obligation légale.",
          ],
        },

        /* =====================================================
           8 - PAIEMENT
        ===================================================== */

        {
          eyebrow: "Paiement",
          title: "Données bancaires",
          description:
            "Les informations bancaires complètes sont traitées par les prestataires de paiement utilisés par B4F.",
          icon: CreditCard,
          points: [
            "B4F ne conserve pas le numéro complet de carte bancaire lorsque le paiement est traité directement par le prestataire de paiement.",
            "B4F peut conserver la référence de transaction, le montant, le statut du paiement et les informations nécessaires au support ou à la comptabilité.",
            "Les prestataires de paiement appliquent également leurs propres politiques de confidentialité et mesures de sécurité.",
          ],
        },

        /* =====================================================
           9 - CONSERVATION
        ===================================================== */

        {
          eyebrow: "Conservation",
          title: "Durée de conservation",
          description:
            "Les données personnelles sont conservées uniquement pendant la durée nécessaire aux objectifs pour lesquels elles ont été collectées.",
          icon: CalendarClock,
          points: [
            "Les données du compte sont conservées tant que celui-ci est nécessaire au fonctionnement du service ou jusqu’à leur suppression lorsqu’elle peut légalement être effectuée.",
            "Les informations nécessaires à la comptabilité ou à la preuve des transactions peuvent être conservées pendant les durées imposées par la loi.",
            "Certaines informations nécessaires à la sécurité peuvent être conservées pendant une durée limitée afin de détecter les fraudes ou incidents.",
            "Lorsqu’une donnée n’est plus nécessaire et qu’aucune obligation légale n’impose sa conservation, elle peut être supprimée ou anonymisée.",
          ],
        },

        /* =====================================================
           10 - SUPPRESSION
        ===================================================== */

        {
          eyebrow: "Suppression",
          title: "Demander la suppression de vos données",
          description:
            "Tout utilisateur peut demander la suppression de ses données personnelles en contactant directement B4F EVENTS.",
          icon: RefreshCcw,
          points: [
            `La demande doit être envoyée à ${legalEmail}.`,
            `Objet conseillé : « Demande de suppression de données ».`,
            "Le message doit préciser le nom et le prénom de la personne concernée.",
            "Le message doit préciser l’adresse e-mail associée au compte afin de permettre son identification.",
            "Des informations complémentaires strictement nécessaires peuvent être demandées afin d’éviter la suppression frauduleuse du compte d’un tiers.",
          ],
        },

        /* =====================================================
           11 - DONNÉES SUPPRIMÉES
        ===================================================== */

        {
          eyebrow: "Effacement",
          title: "Quelles données sont supprimées ?",
          description:
            "Lorsque la demande est recevable et qu’aucune obligation légale n’impose leur conservation, les données personnelles associées au compte sont supprimées.",
          icon: Database,
          points: [
            "Nom et prénom.",
            "Adresse e-mail.",
            "Numéro de téléphone.",
            "Sexe lorsque cette information est enregistrée.",
            "Informations du profil utilisateur ou promoteur.",
            "Données personnelles liées aux fonctionnalités utilisées dans l’application.",
            "Données d’authentification associées au compte. Le mot de passe n’est pas conservé en clair par B4F.",
            "Les autres données personnelles directement rattachées à l’utilisateur lorsqu’elles ne doivent pas légalement être conservées.",
          ],
        },

        /* =====================================================
           12 - DÉLAI
        ===================================================== */

        {
          eyebrow: "Délai",
          title: "Traitement de la demande",
          description:
            "B4F s’efforce de traiter rapidement les demandes relatives aux données personnelles.",
          icon: CalendarClock,
          points: [
            "Les demandes simples de suppression sont généralement traitées dans un délai de 7 jours après leur réception.",
            "Ce délai peut être prolongé lorsqu’une vérification complémentaire est nécessaire ou lorsqu’une obligation légale impose une analyse particulière.",
            "La personne concernée est informée lorsque des informations supplémentaires sont nécessaires au traitement de sa demande.",
          ],
        },

        /* =====================================================
           13 - DONNÉES CONSERVÉES
        ===================================================== */

        {
          eyebrow: "Exceptions",
          title: "Données pouvant être conservées",
          description:
            "La suppression d’un compte n’implique pas nécessairement l’effacement immédiat de toutes les informations lorsqu’une conservation est légalement nécessaire.",
          icon: Landmark,
          points: [
            "Certaines données nécessaires au respect d’obligations légales, fiscales ou comptables peuvent être conservées pendant la durée prévue par la réglementation.",
            "Des informations nécessaires à la constatation, à l’exercice ou à la défense de droits en justice peuvent être conservées lorsque cela est nécessaire.",
            "Des statistiques anonymisées peuvent être conservées lorsqu’elles ne permettent plus d’identifier directement une personne.",
            "Les sauvegardes techniques peuvent nécessiter un délai supplémentaire avant la disparition définitive d’une donnée supprimée du système actif.",
          ],
        },

        /* =====================================================
           14 - DROITS
        ===================================================== */

        {
          eyebrow: "RGPD",
          title: "Vos droits",
          description:
            "Les personnes concernées disposent de plusieurs droits concernant leurs données personnelles.",
          icon: UserRoundCheck,
          points: [
            "Droit d’accès à vos données personnelles.",
            "Droit de demander la rectification de données inexactes ou incomplètes.",
            "Droit de demander l’effacement de vos données lorsque les conditions légales sont réunies.",
            "Droit de demander la limitation de certains traitements.",
            "Droit de vous opposer à certains traitements lorsque la réglementation le permet.",
            "Droit à la portabilité des données lorsque ce droit est applicable.",
            "Droit de retirer votre consentement lorsque le traitement repose sur celui-ci.",
            `Pour exercer ces droits : ${legalEmail}.`,
            "Vous pouvez également introduire une réclamation auprès de la CNIL ou de l’autorité de protection des données compétente.",
          ],
        },

        /* =====================================================
           15 - INTERNATIONAL
        ===================================================== */

        {
          eyebrow: "International",
          title: "Transfert des données",
          description:
            "Les données peuvent être traitées dans différents pays selon les infrastructures et prestataires utilisés.",
          icon: Globe2,
          points: [
            "Les informations peuvent être traitées dans les pays où B4F ou ses prestataires techniques disposent d’infrastructures.",
            "Certains traitements peuvent donc impliquer un transfert en dehors du pays de résidence de l’utilisateur.",
            "Lorsque les données sont transférées hors de l’Espace économique européen, B4F veille à utiliser les mécanismes juridiques et garanties appropriés lorsqu’ils sont nécessaires.",
            "L’utilisation du service implique le traitement des informations conformément à la présente politique et à la réglementation applicable.",
          ],
        },

        /* =====================================================
           16 - SÉCURITÉ
        ===================================================== */

        {
          eyebrow: "Sécurité",
          title: "Protection des données",
          description:
            "B4F met en œuvre des mesures techniques et organisationnelles destinées à protéger les informations personnelles.",
          icon: LockKeyhole,
          points: [
            "Les communications avec les services en ligne utilisent des mécanismes de chiffrement appropriés.",
            "Les accès administratifs sont limités aux personnes autorisées.",
            "Les droits d’accès aux données sont limités en fonction des besoins des utilisateurs et administrateurs.",
            "Les informations sensibles et clés privées ne doivent pas être intégrées directement dans l’application ou le navigateur.",
            "Des journaux techniques peuvent être utilisés afin de détecter les erreurs, incidents et tentatives d’accès anormales.",
            "Aucun système informatique ne pouvant garantir une sécurité absolue, B4F met en œuvre des moyens raisonnables et adaptés afin de limiter les risques.",
          ],
        },

        /* =====================================================
           17 - MINEURS
        ===================================================== */

        {
          eyebrow: "Mineurs",
          title: "Vie privée des enfants",
          description:
            "Le service n’est pas conçu pour collecter volontairement les informations personnelles d’enfants.",
          icon: ShieldCheck,
          points: [
            "B4F ne collecte pas sciemment les données personnelles de personnes de moins de 13 ans.",
            "Si un parent ou représentant légal pense qu’un enfant a transmis des données personnelles à B4F, il peut contacter l’équipe afin d’en demander la vérification et, lorsque cela est applicable, la suppression.",
            `La demande peut être envoyée à ${legalEmail}.`,
            "Les règles d’âge propres aux événements restent indépendantes de cette politique de confidentialité.",
          ],
        },

        /* =====================================================
           18 - LIENS EXTERNES
        ===================================================== */

        {
          eyebrow: "Tiers",
          title: "Liens vers d’autres services",
          description:
            "Les services B4F peuvent contenir des liens menant vers des sites ou plateformes gérés par des tiers.",
          icon: Globe2,
          points: [
            "B4F n’exerce pas de contrôle sur les sites externes accessibles depuis ses services.",
            "Les sites et services tiers disposent de leurs propres conditions et politiques de confidentialité.",
            "Les utilisateurs sont invités à consulter la politique de confidentialité du service tiers avant de lui transmettre des données personnelles.",
            "B4F ne peut être tenue responsable des pratiques d’un service tiers indépendant.",
          ],
        },

        /* =====================================================
           19 - MODIFICATIONS
        ===================================================== */

        {
          eyebrow: "Mise à jour",
          title: "Modification de cette politique",
          description:
            "La politique de confidentialité peut évoluer afin de tenir compte des modifications du service ou de la réglementation.",
          icon: RefreshCcw,
          points: [
            "La nouvelle version est publiée sur cette page.",
            "La date de dernière mise à jour affichée en haut du document est modifiée à chaque évolution significative.",
            "Lorsque cela est nécessaire, les utilisateurs peuvent être informés d’un changement important directement dans le service ou par un autre moyen approprié.",
            "Les utilisateurs sont invités à consulter périodiquement cette page.",
          ],
        },

        /* =====================================================
           20 - CONTACT
        ===================================================== */

        {
          eyebrow: "Contact",
          title: "Nous contacter",
          description:
            "Pour toute question concernant vos données personnelles ou cette politique de confidentialité, vous pouvez contacter B4F EVENTS.",
          icon: Mail,
          points: [
            `E-mail : ${legalEmail}.`,
            `Adresse : ${companyAddress}.`,
            "Pour une demande relative à un compte, précisez le nom, le prénom et l’adresse e-mail associée.",
            `Pour une suppression : objet conseillé « Demande de suppression de données ».`,
          ],
        },
      ]}
    />
  );
}

/* =========================================================
   MENTIONS LÉGALES
========================================================= */

export function LegalNoticesPage() {
  return (
    <LegalLayout
      title="Mentions légales"
      description="Informations relatives à l’éditeur, à l’exploitation et à l’hébergement des services B4F EVENTS."
      path="/mentions-legales"
      essentials={[
        `Le site et les services sont exploités sous le nom B4F EVENTS.`,
        `Adresse communiquée : ${companyAddress}.`,
        `Contact : ${legalEmail}.`,
        "Les contenus et éléments graphiques du site sont protégés par les règles de propriété intellectuelle applicables.",
      ]}
      sections={[
        {
          eyebrow: "Éditeur",
          title: "B4F EVENTS",
          description:
            "Les services sont édités et exploités sous le nom B4F EVENTS.",
          icon: Building2,
          points: [
            `Nom : ${companyName}.`,
            `Adresse : ${companyAddress}.`,
            `Contact : ${legalEmail}.`,
            companyRegistration,
          ],
        },

        {
          eyebrow: "Publication",
          title: "Responsable éditorial",
          description:
            "Le directeur de publication est responsable des contenus publiés sur le service.",
          icon: UserRoundCheck,
          points: [
            `Directeur de publication : ${publicationDirector}.`,
            `Contact : ${legalEmail}.`,
          ],
        },

        {
          eyebrow: "Hébergement",
          title: "Infrastructure technique",
          description:
            "Plusieurs prestataires techniques peuvent intervenir dans le fonctionnement de la plateforme.",
          icon: Database,
          points: [
            `Hébergement du site : ${hostingIdentity}.`,
            "Base de données, authentification et services backend : Supabase lorsque ces services sont activés.",
            "Paiement : SumUp lorsque ce moyen de paiement est proposé au client.",
            "D’autres prestataires strictement nécessaires peuvent être utilisés pour l’envoi d’e-mails ou le fonctionnement technique du service.",
          ],
        },

        {
          eyebrow: "Création",
          title: "Conception et maintenance",
          description:
            "La plateforme est développée et maintenue pour le compte de B4F EVENTS.",
          icon: FileText,
          points: [
            "Conception et identité digitale : B4F EVENTS.",
            "Développement et maintenance : B4F EVENTS et ses éventuels prestataires techniques.",
            "Les photographies et vidéos utilisées restent la propriété de leurs auteurs ou sont utilisées conformément aux droits accordés à B4F.",
            "Dernière mise à jour générale du site : août 2026.",
          ],
        },

        {
          eyebrow: "Propriété",
          title: "Propriété intellectuelle",
          description:
            "Les contenus du site ne peuvent pas être librement reproduits ou exploités commercialement.",
          icon: Landmark,
          points: [
            "Les textes, éléments graphiques, interfaces, logos, marques, photographies, vidéos et éléments techniques sont protégés lorsqu’ils remplissent les conditions légales de protection.",
            "La marque et l’identité visuelle B4F ne peuvent pas être utilisées de manière à laisser croire à une association ou autorisation inexistante.",
            "Les marques, noms et logos appartenant à des établissements ou partenaires restent la propriété de leurs titulaires.",
            "Toute reproduction ou exploitation commerciale non autorisée peut faire l’objet des mesures prévues par la législation applicable.",
          ],
        },

        {
          eyebrow: "Responsabilité",
          title: "Disponibilité du service",
          description:
            "B4F met en œuvre des moyens raisonnables pour assurer la disponibilité et la fiabilité de ses services.",
          icon: ShieldCheck,
          points: [
            "Le service peut être temporairement indisponible pour maintenance, mise à jour ou incident technique.",
            "Certaines informations relatives aux événements peuvent évoluer après leur publication.",
            "Les utilisateurs doivent consulter les informations communiquées avant l’événement, notamment les horaires et conditions d’accès.",
            "B4F ne peut garantir une disponibilité permanente et sans interruption de l’ensemble de ses services.",
          ],
        },

      ]}
    />
  );
}

/* =========================================================
   COOKIES
========================================================= */

export function CookiesPage() {
  const reopenSettings = () => {
    window.dispatchEvent(
      new CustomEvent(
        "b4f-open-cookie-settings",
      ),
    );
  };

  return (
    <LegalLayout
      title="Politique relative aux cookies"
      description="Informations relatives aux cookies et stockages utilisés pour assurer le fonctionnement des services B4F EVENTS."
      path="/cookies"
      essentials={[
        "Les stockages nécessaires permettent notamment de conserver le panier, la langue ou une session.",
        "Les traceurs optionnels ne doivent être activés qu’après le choix de l’utilisateur lorsqu’un consentement est requis.",
        "Refuser les cookies optionnels doit rester aussi simple que les accepter.",
        "Les préférences peuvent être modifiées ultérieurement.",
      ]}
      sections={[
        {
          eyebrow: "Nécessaires",
          title: "Fonctionnement du service",
          description:
            "Certains stockages sont nécessaires au fonctionnement technique du site et des fonctionnalités demandées par l’utilisateur.",
          icon: LockKeyhole,
          points: [
            "Conservation temporaire du panier et des produits sélectionnés.",
            "Conservation de la langue ou de certaines préférences d’affichage.",
            "Maintien d’une session authentifiée lorsqu’un utilisateur se connecte.",
            "Conservation technique de certaines références nécessaires pour accéder à une commande ou à un billet.",
            "Attribution d’une réservation ou d’une vente à un promoteur lorsqu’un lien dédié est utilisé.",
          ],
        },

        {
          eyebrow: "Optionnels",
          title: "Mesure d’audience et services tiers",
          description:
            "Des traceurs supplémentaires peuvent être utilisés si des fonctionnalités optionnelles sont ajoutées au site.",
          icon: Cookie,
          points: [
            "Mesure d’audience destinée à comprendre l’utilisation du site.",
            "Services publicitaires ou d’attribution marketing lorsqu’ils sont effectivement utilisés.",
            "Contenus intégrés provenant de plateformes tierces pouvant déposer leurs propres cookies.",
            "Lorsque le consentement est légalement requis, ces services ne doivent être activés qu’après le choix de l’utilisateur.",
          ],
        },

        {
          eyebrow: "Choix",
          title: "Consentement et refus",
          description:
            "L’utilisateur doit pouvoir choisir librement l’utilisation des traceurs optionnels.",
          icon: FileCheck2,
          points: [
            "Les choix Accepter et Refuser doivent être proposés de manière claire.",
            "Le refus des traceurs optionnels ne doit pas empêcher l’utilisation des fonctions essentielles du site.",
            "Le choix peut être mémorisé afin de ne pas afficher le bandeau à chaque visite.",
            "Un nouveau consentement peut être demandé lorsqu’un changement significatif intervient dans les finalités ou les traceurs utilisés.",
          ],
        },

        {
          eyebrow: "Gestion",
          title: "Modifier vos préférences",
          description:
            "Les utilisateurs peuvent modifier leur choix à tout moment.",
          icon: RefreshCcw,
          points: [
            "Le gestionnaire de cookies peut être rouvert depuis cette page lorsque la fonctionnalité est disponible.",
            "Les cookies et stockages locaux peuvent également être supprimés depuis les paramètres du navigateur.",
            "La suppression de certains stockages nécessaires peut vider le panier ou déconnecter l’utilisateur.",
            "Le retrait du consentement s’applique aux utilisations futures des traceurs concernés.",
          ],
        },
      ]}
    >
      <Reveal>
        <div className="mt-8 flex flex-col gap-4 rounded-[24px] border border-primary/20 bg-primary/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <span className="font-subtitle text-xs uppercase tracking-[0.16em] text-primary">
              Vos préférences
            </span>

            <h2 className="mt-2 font-title text-xl uppercase">
              Gérer mes préférences de cookies
            </h2>

            <p className="mt-2 max-w-xl font-body text-sm leading-6 text-white/40">
              Vous pouvez modifier à tout moment
              les autorisations accordées aux
              traceurs optionnels.
            </p>
          </div>

          <button
            type="button"
            onClick={reopenSettings}
            className="secondary-button shrink-0"
          >
            <Cookie size={18} />
            Gérer mes cookies
          </button>
        </div>
      </Reveal>
    </LegalLayout>
  );
}