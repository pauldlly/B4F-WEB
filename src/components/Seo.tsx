import { Helmet } from "react-helmet-async";

import { useI18n } from "../i18n/LanguageProvider";

const siteUrl =
  import.meta.env.VITE_PUBLIC_SITE_URL ||
  "http://localhost:5173";

const siteName =
  import.meta.env.VITE_SITE_NAME ||
  "B4F EVENTS";

export function Seo({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  structuredData
}: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  structuredData?:
    | Record<string, unknown>
    | null;
}) {
  const { language, locale } = useI18n();
  const canonical = `${siteUrl.replace(
    /\/$/,
    ""
  )}${path}`;

  const fullTitle = title.includes(siteName)
    ? title
    : `${title} | ${siteName}`;

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta
        name="description"
        content={description}
      />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex,nofollow"
            : "index,follow"
        }
      />
      <link
        rel="canonical"
        href={canonical}
      />
      <meta property="og:locale" content={locale.replace("-", "_")} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta
        property="og:title"
        content={fullTitle}
      />
      <meta
        property="og:description"
        content={description}
      />
      <meta
        property="og:url"
        content={canonical}
      />
      {image && (
        <meta
          property="og:image"
          content={image}
        />
      )}
      <meta name="twitter:site" content="@b4f_events" />
      <meta
        name="twitter:card"
        content="summary_large_image"
      />
      <meta
        name="twitter:title"
        content={fullTitle}
      />
      <meta
        name="twitter:description"
        content={description}
      />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
