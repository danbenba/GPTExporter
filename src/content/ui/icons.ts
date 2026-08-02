const ICON_ATTRS =
  'viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"';

function icon(paths: string): string {
  return `<svg ${ICON_ATTRS}>${paths}</svg>`;
}

export const logoSvg = icon(`
<path d="M11.667 4.167H6.25c-1.151 0-2.083.932-2.083 2.083v7.5c0 1.151.932 2.083 2.083 2.083h7.5c1.151 0 2.083-.932 2.083-2.083V8.333"/>
<path d="M10.417 9.583 16.25 3.75"/>
<path d="M12.5 3.75h3.75V7.5"/>
`);

export const exportIconSvg = icon(`
<path d="M16.667 9.583c0 3.107-2.985 5.625-6.667 5.625-.77 0-1.51-.11-2.197-.313L4.583 16.25l.99-2.834c-1.39-1.03-2.24-2.472-2.24-4.062 0-3.107 2.985-5.625 6.667-5.625s6.667 2.518 6.667 5.625Z"/>
<path d="M10 6.667v4.166"/>
<path d="M8.125 8.958 10 6.667l1.875 2.291"/>
`);

export const closeIconSvg = icon(`<path d="M5.417 5.417 14.583 14.583M14.583 5.417 5.417 14.583"/>`);

export const checkIconSvg = icon(`<path d="M4.167 10.417 8.333 14.583 15.833 5.833"/>`);

export const chevronIconSvg = icon(`<path d="M5.417 7.917 10 12.5l4.583-4.583"/>`);

export const copyIconSvg = icon(`
<path d="M8.125 7.083h6.25c.575 0 1.042.467 1.042 1.042v6.25c0 .575-.467 1.042-1.042 1.042h-6.25a1.042 1.042 0 0 1-1.042-1.042v-6.25c0-.575.467-1.042 1.042-1.042Z"/>
<path d="M12.5 5V4.583c0-.575-.467-1.041-1.042-1.041h-5.83c-.576 0-1.045.466-1.045 1.041v5.834c0 .575.467 1.041 1.042 1.041H5.833"/>
`);

export const downloadIconSvg = icon(`
<path d="M10 3.75v7.5"/>
<path d="M7.083 8.75 10 11.667l2.917-2.917"/>
<path d="M3.75 13.333v.834c0 1.15.933 2.083 2.083 2.083h8.334c1.15 0 2.083-.933 2.083-2.083v-.834"/>
`);

export const markdownIconSvg = icon(`
<path d="M3.75 5.417h12.5c.46 0 .833.373.833.833v7.5c0 .46-.373.833-.833.833H3.75a.833.833 0 0 1-.833-.833v-7.5c0-.46.373-.833.833-.833Z"/>
<path d="M5.833 12.083V7.917L7.917 10 10 7.917v4.166"/>
<path d="M13.333 7.917v4.166M11.667 10.417l1.666 1.666L15 10.417"/>
`);

export const htmlIconSvg = icon(`
<path d="M6.667 6.667 3.333 10l3.334 3.333"/>
<path d="M13.333 6.667 16.667 10l-3.334 3.333"/>
<path d="M11.25 4.583 8.75 15.417"/>
`);

export const jsonIconSvg = icon(`
<path d="M8.333 3.75c-1.38 0-2.083.7-2.083 2.083 0 1.384.208 2.5-1.667 2.5v3.334c1.875 0 1.667 1.116 1.667 2.5 0 1.383.703 2.083 2.083 2.083"/>
<path d="M11.667 3.75c1.38 0 2.083.7 2.083 2.083 0 1.384-.208 2.5 1.667 2.5v3.334c-1.875 0-1.667 1.116-1.667 2.5 0 1.383-.703 2.083-2.083 2.083"/>
`);

export const textIconSvg = icon(`
<path d="M4.167 5.833h11.666"/>
<path d="M4.167 10h11.666"/>
<path d="M4.167 14.167h7.083"/>
`);

export const pdfIconSvg = icon(`
<path d="M11.25 2.917H6.25c-1.151 0-2.083.932-2.083 2.083v10c0 1.151.932 2.083 2.083 2.083h7.5c1.151 0 2.083-.932 2.083-2.083V7.5l-4.583-4.583Z"/>
<path d="M11.25 2.917V7.5h4.583"/>
<path d="M7.5 11.667h5M7.5 14.167h3.333"/>
`);

export const formatIcons: Record<string, string> = {
  markdown: markdownIconSvg,
  html: htmlIconSvg,
  json: jsonIconSvg,
  text: textIconSvg,
  pdf: pdfIconSvg,
};

export const spinnerSvg = `<svg class="gptx-spinner-svg" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.33" opacity="0.25"/>
<path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" stroke="currentColor" stroke-width="1.33" stroke-linecap="round"/>
</svg>`;
