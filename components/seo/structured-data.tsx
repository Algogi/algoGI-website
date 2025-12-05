"use client";

import { useEffect } from "react";

interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint: {
    "@type": string;
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs: string[];
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

interface ServiceSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  provider: {
    "@type": string;
    name: string;
  };
  areaServed: string;
  serviceType: string;
}

interface ArticleSchema {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  author: {
    "@type": string;
    name: string;
  };
  publisher: {
    "@type": string;
    name: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
  datePublished?: string;
  dateModified?: string;
}

interface ContactPageSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
}

export function OrganizationStructuredData() {
  useEffect(() => {
    const schema: OrganizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AlgoGI",
      url: "https://algogi.com",
      logo: "https://algogi.com/images/algogi-logo.png",
      description:
        "AI agent development and intelligent automation solutions company specializing in AI-powered software development, bespoke AI platforms, and intelligent automation.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-302-930-0149",
        contactType: "Sales",
        email: "Sales@algogi.com",
      },
      sameAs: [
        "https://facebook.com",
        "https://twitter.com",
        "https://instagram.com",
        "https://linkedin.com",
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "131 Continental Drive, Suite 305",
        addressLocality: "Newark",
        addressRegion: "DE",
        postalCode: "19713",
        addressCountry: "US",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    script.id = "organization-schema";
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("organization-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}

export function ServiceStructuredData({
  name,
  description,
  serviceType,
}: {
  name: string;
  description: string;
  serviceType: string;
}) {
  useEffect(() => {
    const schema: ServiceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      description,
      provider: {
        "@type": "Organization",
        name: "AlgoGI",
      },
      areaServed: "Worldwide",
      serviceType,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    script.id = `service-schema-${name.replace(/\s+/g, "-").toLowerCase()}`;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(
        `service-schema-${name.replace(/\s+/g, "-").toLowerCase()}`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [name, description, serviceType]);

  return null;
}

export function ArticleStructuredData({
  headline,
  description,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}) {
  useEffect(() => {
    const schema: ArticleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline,
      description,
      author: {
        "@type": "Organization",
        name: "AlgoGI",
      },
      publisher: {
        "@type": "Organization",
        name: "AlgoGI",
        logo: {
          "@type": "ImageObject",
          url: "https://algogi.com/images/algogi-logo.png",
        },
      },
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    script.id = `article-schema-${headline.replace(/\s+/g, "-").toLowerCase()}`;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(
        `article-schema-${headline.replace(/\s+/g, "-").toLowerCase()}`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [headline, description, datePublished, dateModified]);

  return null;
}

export function ContactPageStructuredData() {
  useEffect(() => {
    const schema: ContactPageSchema = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact AlgoGI",
      description:
        "Contact AlgoGI to discuss your AI and software development needs. Get a clear plan in your inbox within 24 hours.",
      url: "https://algogi.com/contact",
      telephone: "+1-302-930-0149",
      email: "Sales@algogi.com",
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    script.id = "contact-page-schema";
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("contact-page-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}

