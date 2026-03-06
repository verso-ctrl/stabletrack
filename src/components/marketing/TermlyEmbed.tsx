'use client';

import { useEffect, useRef } from 'react';

export function TermlyEmbed({ dataId }: { dataId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Set the non-standard name attribute Termly requires to find this div
    ref.current.setAttribute('name', 'termly-embed');

    // Inject the script only once — after the div is in the DOM with name set
    if (!document.getElementById('termly-jssdk')) {
      const script = document.createElement('script');
      script.id = 'termly-jssdk';
      script.src = 'https://app.termly.io/embed-policy.min.js';
      document.body.appendChild(script);
    }
  }, []);

  return <div ref={ref} data-id={dataId} />;
}
