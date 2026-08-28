import {
  AlertTriangle,
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

import { Seo } from "../components/Seo";
import { Reveal } from "../components/Reveal";

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

const companyName = import.meta.env.VITE_LEGAL_COMPANY_NAME || "[À COMPLÉTER — raison sociale B4F]";
const companyAddress = import.meta.env.VITE_LEGAL_COMPANY_ADDRESS || "[À COMPLÉTER — adresse du siège]";
const companyRegistration =
  import.meta.env.VITE_LEGAL_COMPANY_REGISTRATION ||
  "[À COMPLÉTER — forme juridique, capital, RCS/RNE et TVA]";
const legalEmail = import.meta.env.VITE_LEGAL_EMAIL || "[À COMPLÉTER — e-mail juridique]";
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "[À COMPLÉTER — e-mail support client]";
const hostingIdentity =
  import.meta.env.VITE_HOSTING_IDENTITY || "[À COMPLÉTER — nom, adresse et contact de l’hébergeur]";

function LegalLayout({
  title,
  description,
  path,
  updatedAt = "6 août 2026",
  essentials,
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <>
      <Seo title={title} description={description} path={path} />

      <section className="relative overflow-hidden border-b border-white/[0.07] pb-14 pt-28 sm:pb-20 sm:pt-36">
        <div className="party-orb party-orb-orange absolute -left-32 top-10 h-80 w-80" />
        <div className="party-orb party-orb-pink absolute -right-32 bottom-0 h-80 w-80" />
        <div className="page-shell relative">
          <Reveal className="max-w-4xl">
            <span className="inline-flex items-center gap-2 font-subtitle text-xs uppercase tracking-[0.2em] text-secondary">
              <FileText size={17} /> Informations juridiques B4F
            </span>
            <h1 className="mt-5 font-title text-[clamp(2.7rem,8vw,6.4rem)] uppercase leading-[0.84] tracking-[-0.055em]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl font-body text-base leading-8 text-white/50 sm:text-lg">
              {description}
            </p>
            <div className="mt-7 flex flex-wrap gap-2 font-subtitle text-[10px] uppercase tracking-[0.13em] text-white/[0.45]">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Version de travail
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Mise à jour : {updatedAt}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-shell py-10 sm:py-16">
        <Reveal>
          <div className="grid gap-5 rounded-[28px] border border-secondary/25 bg-[linear-gradient(135deg,rgba(251,146,60,.14),rgba(255,105,180,.06),rgba(255,255,255,.025))] p-5 sm:p-7 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <span className="inline-flex items-center gap-2 font-subtitle text-xs uppercase tracking-[0.16em] text-secondary">
                <ShieldCheck size={17} /> À retenir
              </span>
              <h2 className="mt-3 font-title text-2xl uppercase leading-[0.92] sm:text-3xl">
                Les points essentiels
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {essentials.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/[0.07] bg-black/20 p-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/[0.15] text-secondary">
                    <FileCheck2 size={14} />
                  </span>
                  <p className="font-body text-sm leading-6 text-white/[0.55]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>


        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Reveal key={section.title} delay={Math.min(index * 45, 270)} direction="scale">
                <article className="h-full rounded-[26px] border border-white/[0.08] bg-[#121212] p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-subtitle text-[10px] uppercase tracking-[0.17em] text-secondary">
                        {String(index + 1).padStart(2, "0")} · {section.eyebrow}
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
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.05] font-subtitle text-[10px] text-secondary">
                          {pointIndex + 1}
                        </span>
                        <p className="font-body text-sm leading-6 text-white/[0.48]">{point}</p>
                      </li>
                    ))}
                  </ol>
                </article>
              </Reveal>
            );
          })}
        </div>

        {children}

        <div className="mt-10 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-subtitle text-xs uppercase tracking-[0.16em] text-primary">Contact</span>
              <h2 className="mt-2 font-title text-xl uppercase">Une question sur ce document ?</h2>
              <p className="mt-2 font-body text-sm leading-6 text-white/[0.42]">
                Écrivez à {legalEmail}. Pour une commande ou un billet, utilisez {supportEmail} et indiquez votre référence.
              </p>
            </div>
            <a href={`mailto:${supportEmail}`} className="secondary-button shrink-0">
              <Mail size={17} /> Contacter B4F
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Conditions générales de vente"
      description="Les règles applicables à l’achat de billets, de packs, d’options et de tables sur la billetterie B4F EVENTS."
      path="/cgv"
      essentials={[
        "Le prix total, y compris les frais, doit être présenté avant le paiement.",
        "La commande n’est confirmée qu’après validation effective du paiement.",
        "Chaque QR code est personnel, unique et contrôlé à l’entrée.",
        "Les conditions d’annulation ou de report sont précisées avant l’achat.",
      ]}
      sections={[
        {
          eyebrow: "Vendeur",
          title: "Identité et champ d’application",
          description: "Ces conditions définissent la relation entre le client et l’entité qui commercialise la billetterie B4F.",
          icon: Building2,
          points: [
            `Vendeur : ${companyName}, ${companyAddress}, ${companyRegistration}.`,
            "Elles s’appliquent aux billets unitaires, packs multi-événements, options, tables et services additionnels affichés sur le site.",
            "La version acceptée au moment de la commande reste applicable à cette commande.",
            "Le client confirme avoir la capacité juridique de contracter et fournir des informations exactes.",
          ],
        },
        {
          eyebrow: "Offre",
          title: "Événements, packs et disponibilité",
          description: "Les caractéristiques essentielles doivent être visibles avant que le client n’ajoute un produit au panier.",
          icon: TicketCheck,
          points: [
            "Chaque fiche précise au minimum le nom, la date, l’horaire, le lieu, le tarif, les conditions d’accès et le contenu inclus.",
            "Un pack peut contenir des événements obligatoires, des choix de dates, des options ou des tables autorisées.",
            "Les visuels, artistes, horaires et programmes peuvent être adaptés lorsque la nature de l’événement le justifie, sous réserve d’une information loyale du client.",
            "La disponibilité affichée reste indicative jusqu’à la vérification du stock par le serveur au moment du paiement.",
          ],
        },
        {
          eyebrow: "Prix",
          title: "Tarifs et frais",
          description: "Le client doit connaître le montant réellement dû avant de confirmer sa commande.",
          icon: BadgeEuro,
          points: [
            "Les prix sont affichés en euros, toutes taxes comprises lorsque cela est applicable.",
            "Les frais de service, acomptes de table et coûts additionnels sont détaillés séparément avant validation.",
            "Les tarifs peuvent évoluer pour les commandes futures, sans modifier une commande déjà payée.",
            "En cas d’erreur manifeste de prix, B4F peut annuler la commande et rembourser le montant encaissé après information du client.",
          ],
        },
        {
          eyebrow: "Commande",
          title: "Parcours d’achat",
          description: "Le site permet un achat invité ou l’utilisation facultative d’un compte client.",
          icon: UserRoundCheck,
          points: [
            "Le client sélectionne ses billets ou son pack, vérifie le panier, renseigne ses coordonnées puis accepte les CGV.",
            "Le récapitulatif final indique les produits, quantités, dates choisies, options, prix et frais.",
            "L’affiliation à un promoteur peut être enregistrée techniquement lorsqu’un lien dédié a été utilisé, sans augmenter le prix client.",
            "Le compte client est facultatif ; il facilite uniquement la centralisation des commandes et billets.",
          ],
        },
        {
          eyebrow: "Paiement",
          title: "Validation et sécurité",
          description: "Le paiement est traité par le prestataire indiqué pendant le parcours d’achat.",
          icon: CreditCard,
          points: [
            "La commande devient ferme après confirmation du paiement par le prestataire et réception de la confirmation B4F.",
            "B4F ne doit pas stocker les données complètes de carte bancaire lorsque le paiement est opéré par un prestataire certifié.",
            "Une tentative refusée, expirée ou abandonnée ne garantit pas la conservation du stock.",
            "Les contrôles antifraude peuvent conduire à une demande de justificatif, une suspension ou un remboursement de la commande.",
          ],
        },
        {
          eyebrow: "Billet",
          title: "Émission et utilisation",
          description: "Chaque accès est matérialisé par un billet numérique comportant un identifiant unique.",
          icon: Fingerprint,
          points: [
            "Le billet est accessible via le lien sécurisé de commande et, lorsque disponible, dans l’espace client.",
            "Le premier scan valide du QR code rend les copies et captures suivantes inutilisables.",
            "Le client est responsable de la confidentialité de son billet et doit vérifier son accessibilité avant de se rendre sur place.",
            "Une pièce d’identité, une condition d’âge ou le nom du titulaire peuvent être contrôlés selon la fiche de l’événement et les règles du lieu.",
          ],
        },
        {
          eyebrow: "Accès",
          title: "Règles du lieu et comportement",
          description: "L’achat d’un billet ne dispense pas le participant de respecter les règles de sécurité et d’admission.",
          icon: ShieldCheck,
          points: [
            "Le participant respecte les horaires d’entrée, le dress code communiqué, les limites d’âge et les consignes du personnel.",
            "L’accès peut être refusé en cas d’ivresse manifeste, violence, harcèlement, possession d’objets interdits, fraude ou non-respect des règles légales du lieu.",
            "Un refus justifié par le comportement du participant ou une condition annoncée à l’avance ne donne pas automatiquement droit à remboursement.",
            "B4F promeut une fête respectueuse : aucune discrimination, menace ou mise en danger n’est tolérée.",
          ],
        },
        {
          eyebrow: "Changements",
          title: "Annulation, report et force majeure",
          description: "La solution dépend de l’importance de la modification et de la politique annoncée pour l’événement.",
          icon: CalendarClock,
          points: [
            "En cas d’annulation définitive par l’organisateur, les modalités et délais de remboursement sont communiqués au client.",
            "En cas de report, le billet peut rester valable pour la nouvelle date ou faire l’objet d’une option définie dans la politique de remboursement.",
            "Une modification mineure d’horaire, d’artiste ou de programmation n’entraîne pas nécessairement un remboursement lorsqu’elle ne change pas la nature essentielle de l’expérience.",
            "Les conséquences d’un événement extérieur imprévisible ou irrésistible sont traitées selon la loi applicable et les engagements de l’organisateur.",
          ],
        },
        {
          eyebrow: "Rétractation",
          title: "Absence de droit de rétractation",
          description: "Les billets de loisirs datés sont généralement soumis à une exception au droit de rétractation lorsque le droit français s’applique.",
          icon: Scale,
          points: [
            "Le client est invité à vérifier la date, le lieu, le tarif, les quantités et les choix du pack avant le paiement.",
            "Sauf disposition plus favorable annoncée par B4F, un changement d’avis personnel n’entraîne pas automatiquement un échange ou un remboursement.",
            "Toute politique commerciale volontaire plus favorable doit être décrite clairement sur la fiche et la page Remboursements.",
            "Cette clause doit être adaptée si une autre législation nationale impérative s’applique à la vente.",
          ],
        },
        {
          eyebrow: "Assistance",
          title: "Réclamations, médiation et droit applicable",
          description: "Le client dispose d’un canal clair pour signaler une difficulté liée à sa commande.",
          icon: Headphones,
          points: [
            `Réclamation : ${supportEmail}, avec la référence de commande, le produit concerné et les justificatifs utiles.`,
            "B4F accuse réception et traite la demande dans un délai raisonnable compatible avec la proximité de l’événement.",
            "Médiateur de la consommation : [À COMPLÉTER — nom, adresse et site du médiateur compétent].",
            "Droit applicable et juridiction : [À COMPLÉTER après validation juridique], sans priver le consommateur des protections impératives dont il bénéficie.",
          ],
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      description="Comment B4F utilise et protège les données nécessaires à la réservation, au billet digital et à l’assistance client."
      path="/confidentialite"
      essentials={[
        "Le compte est facultatif pour acheter.",
        "Les données ne sont utilisées que pour des finalités déterminées.",
        "B4F ne vend pas les données personnelles des clients.",
        "Les personnes peuvent exercer leurs droits auprès du contact indiqué.",
      ]}
      sections={[
        {
          eyebrow: "Responsable",
          title: "Qui traite vos données ?",
          description: "Le responsable détermine pourquoi et comment les données de la billetterie sont utilisées.",
          icon: Building2,
          points: [
            `Responsable : ${companyName}, ${companyAddress}, ${companyRegistration}.`,
            `Contact données personnelles : ${legalEmail}.`,
            "Lorsque B4F agit uniquement pour le compte d’un organisateur distinct, les rôles doivent être précisés dans la fiche ou le contrat concerné.",
          ],
        },
        {
          eyebrow: "Données",
          title: "Catégories collectées",
          description: "Seules les informations utiles au service et à sa sécurité doivent être collectées.",
          icon: Database,
          points: [
            "Identité et contact : nom, téléphone, e-mail, indicatif pays et langue.",
            "Commande : événements, pack, dates choisies, options, tables, quantités, prix, référence, statut de paiement et billets.",
            "Compte facultatif : identifiant d’authentification, e-mail, nom affiché et historique rattaché.",
            "Technique et sécurité : journaux de connexion, appareil, navigateur, adresse IP, erreurs et traces antifraude strictement nécessaires.",
            "Affiliation : identifiant du promoteur associé au lien utilisé, afin d’attribuer la vente sans afficher cette information au public.",
          ],
        },
        {
          eyebrow: "Finalités",
          title: "Pourquoi les utiliser ?",
          description: "Chaque traitement doit être rattaché à une finalité et à une base juridique appropriée.",
          icon: FileCheck2,
          points: [
            "Exécuter la commande, encaisser le paiement, délivrer et scanner les billets.",
            "Gérer les packs, le stock, les réservations temporaires, les remboursements et le support.",
            "Prévenir la fraude, sécuriser les comptes, enquêter sur une anomalie et défendre les droits de B4F.",
            "Respecter les obligations comptables, fiscales et légales applicables.",
            "Envoyer des nouveautés ou offres uniquement lorsque la base juridique requise existe et avec une possibilité de désinscription.",
          ],
        },
        {
          eyebrow: "Destinataires",
          title: "Qui peut y accéder ?",
          description: "Les accès sont limités aux personnes et prestataires qui en ont besoin pour leur mission.",
          icon: Handshake,
          points: [
            "Équipes B4F habilitées : support, administration, finance et contrôle d’accès.",
            "Organisateurs, lieux et agents de scan pour les seules informations nécessaires à l’admission.",
            "Prestataires techniques réellement activés, notamment Supabase pour la base et l’authentification, SumUp pour le paiement, l’hébergeur web et les outils d’envoi de messages.",
            "Autorités ou conseils lorsque la loi l’exige ou qu’une défense juridique le justifie.",
          ],
        },
        {
          eyebrow: "Paiement",
          title: "Données bancaires",
          description: "Le paiement doit être isolé du reste de la billetterie et confié au prestataire affiché pendant l’achat.",
          icon: CreditCard,
          points: [
            "Les données complètes de carte sont saisies dans l’environnement du prestataire de paiement et ne doivent pas être enregistrées dans la base B4F.",
            "B4F conserve les références, montants, statuts et éléments nécessaires à la preuve comptable et au support.",
            "Les contrôles du prestataire peuvent générer leurs propres traitements, décrits dans sa politique de confidentialité.",
          ],
        },
        {
          eyebrow: "Durées",
          title: "Combien de temps ?",
          description: "Les durées exactes doivent être définies dans le registre interne de B4F.",
          icon: CalendarClock,
          points: [
            "Commandes et justificatifs comptables : [À COMPLÉTER selon les obligations légales applicables].",
            "Billets et données de scan : [À COMPLÉTER selon la durée utile au contrôle, aux contestations et à la fraude].",
            "Compte client : pendant son utilisation puis [À COMPLÉTER] après la dernière activité ou la demande de suppression.",
            "Prospection : [À COMPLÉTER], avec suppression ou renouvellement du consentement lorsque nécessaire.",
            "Journaux de sécurité et cookies : durées proportionnées détaillées dans la politique Cookies.",
          ],
        },
        {
          eyebrow: "International",
          title: "Hébergement et transferts",
          description: "La localisation des prestataires et leurs mécanismes de protection doivent être documentés.",
          icon: Globe2,
          points: [
            "B4F privilégie des régions d’hébergement compatibles avec les utilisateurs européens lorsque cette option existe.",
            "Tout transfert hors Espace économique européen doit reposer sur un mécanisme juridique approprié et des garanties complémentaires si nécessaires.",
            "La liste finale des pays, prestataires et garanties doit être tenue à jour avant la mise en production.",
          ],
        },
        {
          eyebrow: "Droits",
          title: "Vos choix et vos droits",
          description: "Les droits dépendent du traitement et de sa base juridique.",
          icon: UserRoundCheck,
          points: [
            "Demander l’accès, la rectification, l’effacement, la limitation ou la portabilité lorsque les conditions sont réunies.",
            "S’opposer à certains traitements et retirer un consentement sans remettre en cause les traitements antérieurs.",
            `Exercer une demande à ${legalEmail}, avec les informations permettant d’identifier la commande ou le compte.`,
            "Introduire une réclamation auprès de l’autorité de protection des données compétente, notamment la CNIL en France.",
          ],
        },
        {
          eyebrow: "Sécurité",
          title: "Protection et mineurs",
          description: "La sécurité combine des mesures techniques, organisationnelles et humaines.",
          icon: LockKeyhole,
          points: [
            "Contrôles d’accès, politiques RLS Supabase, chiffrement des communications, sauvegardes, journalisation et limitation des privilèges.",
            "Les clés secrètes et droits d’administration ne doivent jamais être placés dans le navigateur.",
            "Les conditions d’âge de chaque événement restent applicables même lorsqu’un mineur peut consulter le site.",
            "Toute violation présentant un risque est analysée et notifiée conformément aux règles applicables.",
          ],
        },
      ]}
    />
  );
}

export function LegalNoticesPage() {
  return (
    <LegalLayout
      title="Mentions légales"
      description="Identification de l’éditeur, de l’hébergeur et règles de propriété intellectuelle du site B4F EVENTS."
      path="/mentions-legales"
      essentials={[
        "L’identité de l’entité éditrice doit correspondre à celle qui exploite le site.",
        "Le directeur de publication et l’hébergeur doivent être identifiés.",
        "Les visuels et logos partenaires restent la propriété de leurs titulaires.",
        "Un contact clair doit être accessible aux utilisateurs.",
      ]}
      sections={[
        {
          eyebrow: "Éditeur",
          title: "Informations de la société",
          description: "Les informations ci-dessous doivent être remplacées par les données officielles de l’exploitant.",
          icon: Building2,
          points: [companyName, companyAddress, companyRegistration, `Contact : ${legalEmail}`],
        },
        {
          eyebrow: "Publication",
          title: "Responsable éditorial",
          description: "Le directeur de publication est la personne légalement responsable des contenus édités.",
          icon: UserRoundCheck,
          points: [
            "Directeur ou directrice de publication : [À COMPLÉTER — nom et qualité].",
            "Responsable de la billetterie : [À COMPLÉTER].",
            "Contact presse et partenaires : [À COMPLÉTER].",
          ],
        },
        {
          eyebrow: "Hébergement",
          title: "Infrastructure technique",
          description: "Les mentions doivent identifier l’hébergeur du front et, si utile, les principaux services de données.",
          icon: Database,
          points: [
            hostingIdentity,
            "Base de données et authentification : Supabase [À COMPLÉTER — entité contractante, région et adresse].",
            "Paiement : SumUp [À COMPLÉTER — entité contractante et lien vers les conditions applicables].",
          ],
        },
        {
          eyebrow: "Création",
          title: "Conception et maintenance",
          description: "Les crédits techniques peuvent être adaptés selon les contrats réellement conclus.",
          icon: FileText,
          points: [
            "Conception, développement et identité digitale : B4F EVENTS / [À COMPLÉTER].",
            "Photographies et vidéos : crédits indiqués sur les contenus ou licences des bibliothèques utilisées.",
            "Dernière mise à jour du site : août 2026.",
          ],
        },
        {
          eyebrow: "Droits",
          title: "Propriété intellectuelle",
          description: "Le site et son contenu ne peuvent pas être réutilisés librement sans autorisation.",
          icon: Landmark,
          points: [
            "La marque B4F, le code, les textes, compositions, illustrations et éléments graphiques sont protégés dans la mesure permise par la loi.",
            "Les noms, marques et logos des clubs partenaires appartiennent à leurs propriétaires et sont présentés à titre d’identification de collaborations ou lieux.",
            "Toute reproduction substantielle, extraction, revente ou utilisation commerciale non autorisée est interdite.",
            "Les liens vers des sites tiers n’impliquent pas une validation permanente de leur contenu ou de leur disponibilité.",
          ],
        },
        {
          eyebrow: "Responsabilité",
          title: "Disponibilité et informations",
          description: "B4F s’efforce de maintenir des informations fiables tout en tenant compte des contraintes événementielles.",
          icon: ShieldCheck,
          points: [
            "Le site peut être temporairement interrompu pour maintenance, sécurité ou incident extérieur.",
            "Les horaires, programmes et conditions d’accès peuvent évoluer ; la fiche de l’événement et les messages de commande doivent être consultés avant le départ.",
            "B4F ne saurait être responsable d’un usage frauduleux d’un billet communiqué volontairement à un tiers.",
            "Les limitations de responsabilité ne s’appliquent pas lorsque la loi interdit de les opposer au consommateur.",
          ],
        },
      ]}
    />
  );
}

export function CookiesPage() {
  const reopenSettings = () => {
    window.dispatchEvent(new CustomEvent("b4f-open-cookie-settings"));
  };

  return (
    <LegalLayout
      title="Politique relative aux cookies"
      description="Les stockages indispensables au panier et les règles applicables aux éventuels traceurs optionnels."
      path="/cookies"
      essentials={[
        "Le panier, la langue et la session utilisent des stockages nécessaires.",
        "Les traceurs optionnels ne doivent pas être activés avant le consentement.",
        "Refuser doit être aussi simple qu’accepter.",
        "Le choix peut être modifié à tout moment depuis le pied de page.",
      ]}
      sections={[
        {
          eyebrow: "Nécessaires",
          title: "Fonctionnement du service",
          description: "Ces stockages permettent de fournir une fonctionnalité expressément demandée et ne sont pas utilisés pour la publicité.",
          icon: LockKeyhole,
          points: [
            "Panier local : conserve les billets et packs sélectionnés entre les pages.",
            "Langue : mémorise la version choisie par l’utilisateur.",
            "Authentification facultative : maintient la session Supabase du compte lorsque le client se connecte.",
            "Billets locaux de démonstration et références de commande : assurent l’accès sur l’appareil utilisé.",
            "Affiliation promoteur : mémorise l’identifiant transmis par le lien afin d’attribuer la vente au futur backend.",
          ],
        },
        {
          eyebrow: "Optionnels",
          title: "Audience, publicité et médias",
          description: "Ces catégories ne doivent être activées que si des outils correspondants sont réellement ajoutés au site.",
          icon: Cookie,
          points: [
            "Mesure d’audience : statistiques de navigation non indispensables à la fourniture de la billetterie.",
            "Publicité et personnalisation : ciblage, attribution marketing ou reciblage.",
            "Médias tiers : lecteurs vidéo, cartes ou contenus sociaux susceptibles de déposer leurs propres traceurs.",
            "La version livrée ne charge pas d’outil publicitaire par défaut ; toute future intégration doit être reliée au gestionnaire de consentement.",
          ],
        },
        {
          eyebrow: "Choix",
          title: "Consentement et refus",
          description: "Le bandeau doit proposer des actions compréhensibles et équilibrées.",
          icon: FileCheck2,
          points: [
            "Les boutons Tout refuser et Tout accepter sont présentés au même niveau de visibilité et avec une action unique.",
            "Fermer le bandeau sans accepter est traité comme un refus des traceurs optionnels.",
            "Le choix est enregistré afin de ne pas solliciter l’utilisateur à chaque page ; six mois constitue une durée généralement recommandée à adapter au contexte.",
            "Le retrait du consentement doit être aussi simple que son octroi.",
          ],
        },
        {
          eyebrow: "Gestion",
          title: "Modifier ou supprimer",
          description: "L’utilisateur peut rouvrir le panneau depuis cette page ou le pied de page.",
          icon: RefreshCcw,
          points: [
            "La modification prend effet pour les prochains chargements de services optionnels.",
            "Les stockages peuvent aussi être supprimés depuis les réglages du navigateur, au risque de vider le panier ou de déconnecter le compte.",
            "Lorsque de nouveaux traceurs sont ajoutés ou que leurs finalités évoluent, la politique et le consentement doivent être actualisés.",
          ],
        },
      ]}
    >
      <Reveal>
        <div className="mt-8 flex flex-col gap-4 rounded-[24px] border border-primary/20 bg-primary/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <span className="font-subtitle text-xs uppercase tracking-[0.16em] text-primary">Vos préférences</span>
            <h2 className="mt-2 font-title text-xl uppercase">Rouvrir le gestionnaire de cookies</h2>
          </div>
          <button type="button" onClick={reopenSettings} className="secondary-button shrink-0">
            <Cookie size={18} /> Gérer mes cookies
          </button>
        </div>
      </Reveal>
    </LegalLayout>
  );
}
