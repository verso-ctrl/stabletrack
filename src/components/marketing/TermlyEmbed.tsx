'use client';

import { useEffect, useRef } from 'react';

export function TermlyEmbed({ dataId }: { dataId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Set the non-standard name attribute Termly requires to find this div
    ref.current.setAttribute('name', 'termly-embed');

    // Always remove and re-inject so client-side navigation triggers a fresh load
    const existing = document.getElementById('termly-jssdk');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'termly-jssdk';
    script.src = 'https://app.termly.io/embed-policy.min.js';
    document.body.appendChild(script);
  }, [dataId]);

  return <div ref={ref} data-id={dataId} />;
}
