import {
  lazy,
  Suspense,
} from "react";

import {
  Route,
  Routes,
} from "react-router-dom";

import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { CatalogRealtimeSync } from "./components/CatalogRealtimeSync";
import { CookieBanner } from "./components/CookieBanner";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PageSkeleton } from "./components/Skeletons";
import { ScrollToTop } from "./components/ScrollToTop";
import { WhatsAppAssistant } from "./components/WhatsAppAssistant";

/* =========================================================
   PAGES
========================================================= */

const HomePage =
  lazy(() =>
    import(
      "./pages/HomePage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.HomePage,
      }),
    ),
  );

const EventsPage =
  lazy(() =>
    import(
      "./pages/EventsPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.EventsPage,
      }),
    ),
  );

const PacksPage =
  lazy(() =>
    import(
      "./pages/PacksPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.PacksPage,
      }),
    ),
  );

const AboutPage =
  lazy(() =>
    import(
      "./pages/AboutPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.AboutPage,
      }),
    ),
  );

const HelpPage =
  lazy(() =>
    import(
      "./pages/HelpPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.HelpPage,
      }),
    ),
  );

const JoinTeamPage =
  lazy(() =>
    import(
      "./pages/JoinTeamPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.JoinTeamPage,
      }),
    ),
  );

const EventPage =
  lazy(() =>
    import(
      "./pages/EventPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.EventPage,
      }),
    ),
  );

const PackPage =
  lazy(() =>
    import(
      "./pages/PackPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.PackPage,
      }),
    ),
  );

const CheckoutPage =
  lazy(() =>
    import(
      "./pages/CheckoutPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.CheckoutPage,
      }),
    ),
  );

const PaymentReturnPage =
  lazy(() =>
    import(
      "./pages/PaymentReturnPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.PaymentReturnPage,
      }),
    ),
  );

const MyTicketsPage =
  lazy(() =>
    import(
      "./pages/MyTicketsPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.MyTicketsPage,
      }),
    ),
  );

const OrderPage =
  lazy(() =>
    import(
      "./pages/OrderPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.OrderPage,
      }),
    ),
  );

const AccountPage =
  lazy(() =>
    import(
      "./pages/AccountPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.AccountPage,
      }),
    ),
  );

const AuthCallbackPage =
  lazy(() =>
    import(
      "./pages/AuthCallbackPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.AuthCallbackPage,
      }),
    ),
  );

/* =========================================================
   PAGES LÉGALES
========================================================= */

const TermsPage =
  lazy(() =>
    import(
      "./pages/LegalPages"
    ).then(
      (
        module,
      ) => ({
        default:
          module.TermsPage,
      }),
    ),
  );

const PrivacyPage =
  lazy(() =>
    import(
      "./pages/LegalPages"
    ).then(
      (
        module,
      ) => ({
        default:
          module.PrivacyPage,
      }),
    ),
  );

const LegalNoticesPage =
  lazy(() =>
    import(
      "./pages/LegalPages"
    ).then(
      (
        module,
      ) => ({
        default:
          module.LegalNoticesPage,
      }),
    ),
  );

const CookiesPage =
  lazy(() =>
    import(
      "./pages/LegalPages"
    ).then(
      (
        module,
      ) => ({
        default:
          module.CookiesPage,
      }),
    ),
  );

const NotFoundPage =
  lazy(() =>
    import(
      "./pages/NotFoundPage"
    ).then(
      (
        module,
      ) => ({
        default:
          module.NotFoundPage,
      }),
    ),
  );

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <div
      className="
        min-h-screen
        bg-ink
        text-white
      "
    >
      <ScrollToTop />

      <CatalogRealtimeSync />

      <Header />

      <main>
        <Suspense
          fallback={
            <PageSkeleton />
          }
        >
          <Routes>
            {/* =================================================
                HOME
            ================================================= */}

            <Route
              path="/"
              element={
                <HomePage />
              }
            />

            {/* =================================================
                CATALOGUE
            ================================================= */}

            <Route
              path="/events"
              element={
                <EventsPage />
              }
            />

            <Route
              path="/packs"
              element={
                <PacksPage />
              }
            />

            {/* =================================================
                AUTRES PAGES
            ================================================= */}

            <Route
              path="/about"
              element={
                <AboutPage />
              }
            />

            <Route
              path="/aide"
              element={
                <HelpPage />
              }
            />

            <Route
              path="/rejoindre"
              element={
                <JoinTeamPage />
              }
            />

            {/* =================================================
                ÉVÉNEMENT NORMAL

                Exemple :
                /event/66
            ================================================= */}

            <Route
              path="/event/:eventId"
              element={
                <EventPage />
              }
            />

            {/* =================================================
                LIEN AFFILIÉ ÉVÉNEMENT

                Exemple :
                /paul-dailly:66

                affiliate =
                "paul-dailly:66"

                EventPage extrait :
                promoter = paul-dailly
                eventId = 66
            ================================================= */}

            <Route
              path="/:affiliate"
              element={
                <EventPage />
              }
            />

            {/* =================================================
                PACK NORMAL
            ================================================= */}

            <Route
              path="/pack/:packId"
              element={
                <PackPage />
              }
            />

            {/* =================================================
                ANCIEN LIEN PACK PROMOTEUR

                Conservé pour le moment.
            ================================================= */}

            <Route
              path="/:promoterReference/pack/:packId"
              element={
                <PackPage />
              }
            />

            {/* =================================================
                PAIEMENT
            ================================================= */}

            <Route
              path="/checkout"
              element={
                <CheckoutPage />
              }
            />

            <Route
              path="/paiement/retour"
              element={
                <PaymentReturnPage />
              }
            />

            {/* =================================================
                BILLETS / COMMANDES
            ================================================= */}

            <Route
              path="/mes-billets"
              element={
                <MyTicketsPage />
              }
            />

            <Route
              path="/commande/:orderId"
              element={
                <OrderPage />
              }
            />

            {/* =================================================
                COMPTE
            ================================================= */}

            <Route
              path="/compte"
              element={
                <AccountPage />
              }
            />

            <Route
              path="/auth/callback"
              element={
                <AuthCallbackPage />
              }
            />

            {/* =================================================
                PAGES LÉGALES
            ================================================= */}

            <Route
              path="/cgv"
              element={
                <TermsPage />
              }
            />

            <Route
              path="/confidentialite"
              element={
                <PrivacyPage />
              }
            />

            <Route
              path="/mentions-legales"
              element={
                <LegalNoticesPage />
              }
            />

            <Route
              path="/cookies"
              element={
                <CookiesPage />
              }
            />

            {/* =================================================
                404
                TOUJOURS EN DERNIER
            ================================================= */}

            <Route
              path="*"
              element={
                <NotFoundPage />
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <CartDrawer />

      <AuthModal />

      <CookieBanner />

      <WhatsAppAssistant />
    </div>
  );
}