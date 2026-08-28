/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_PROMOTER_WHATSAPP_NUMBER?: string;
  readonly VITE_DEFAULT_PROMOTER_WHATSAPP_NUMBER?: string;
  readonly VITE_PARTY_PLANNER_WHATSAPP_NUMBER?: string;
  readonly VITE_HIRING_FORM_ENDPOINT?: string;
  readonly VITE_HIRING_WHATSAPP_NUMBER?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_LEGAL_EMAIL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_TIKTOK_URL?: string;
  readonly VITE_STATS_TICKETS?: string;
  readonly VITE_STATS_PROMOTERS?: string;
  readonly VITE_STATS_EVENTS?: string;
  readonly VITE_STATS_CUSTOMERS?: string;
  readonly VITE_LEGAL_COMPANY_NAME?: string;
  readonly VITE_LEGAL_COMPANY_ADDRESS?: string;
  readonly VITE_LEGAL_COMPANY_REGISTRATION?: string;
  readonly VITE_HOSTING_IDENTITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
