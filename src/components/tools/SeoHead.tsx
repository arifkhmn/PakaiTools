import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ title, description, canonicalPath }) => {
  useEffect(() => {
    // Set title
    const fullTitle = `${title} — PakaiTools`;
    document.title = fullTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Update Canonical URL
    if (canonicalPath) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://pakaitools.id${canonicalPath}`);
    }
  }, [title, description, canonicalPath]);

  return null;
};
