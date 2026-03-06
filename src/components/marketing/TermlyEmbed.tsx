'use client';

import Script from 'next/script';

export function TermlyEmbed({ dataId }: { dataId: string }) {
  return (
    <>
      {/* dangerouslySetInnerHTML ensures the name attribute survives React rendering */}
      <div
        dangerouslySetInnerHTML={{
          __html: `<div name="termly-embed" data-id="${dataId}"></div>`,
        }}
      />
      <Script
        id="termly-jssdk"
        strategy="afterInteractive"
        src="https://app.termly.io/embed-policy.min.js"
      />
    </>
  );
}
