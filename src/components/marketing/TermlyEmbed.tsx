'use client';

import Script from 'next/script';

export function TermlyEmbed({ dataId }: { dataId: string }) {
  return (
    <>
      <div
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ name: 'termly-embed' } as any)}
        data-id={dataId}
      />
      <Script
        id="termly-jssdk"
        strategy="afterInteractive"
        src="https://app.termly.io/embed-policy.min.js"
      />
    </>
  );
}
