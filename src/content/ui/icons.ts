export const logoSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#0FA47F"/>
<path d="M12 16.5V7.5M12 7.5L8.25 11.25M12 7.5L15.75 11.25" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.5 16.5H16.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

export const exportIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 12.917V3.75M10 3.75L6.25 7.5M10 3.75L13.75 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.75 13.75V15C3.75 15.6904 4.30964 16.25 5 16.25H15C15.6904 16.25 16.25 15.6904 16.25 15V13.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export const closeIconSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

export const checkIconSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.5 12.5L9.5 17.5L19.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const chevronIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const markdownIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.75" y="4.25" width="16.5" height="11.5" rx="2" stroke="currentColor" stroke-width="1.4"/>
<path d="M4.5 12.5V7.5L7 10L9.5 7.5V12.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.75 7.5V12.5M13.75 12.5L11.75 10.5M13.75 12.5L15.75 10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const htmlIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 6.5L3.5 10L7 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13 6.5L16.5 10L13 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 4.5L9 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export const jsonIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 3.5C6 3.5 5.5 4.5 5.5 5.75C5.5 7 5.75 8.25 4 8.9V11.1C5.75 11.75 5.5 13 5.5 14.25C5.5 15.5 6 16.5 7.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M12.5 3.5C14 3.5 14.5 4.5 14.5 5.75C14.5 7 14.25 8.25 16 8.9V11.1C14.25 11.75 14.5 13 14.5 14.25C14.5 15.5 14 16.5 12.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export const textIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 5.5H16M4 10H16M4 14.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export const pdfIconSvg = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5 2.75H6C5.30964 2.75 4.75 3.30964 4.75 4V16C4.75 16.6904 5.30964 17.25 6 17.25H14C14.6904 17.25 15.25 16.6904 15.25 16V6.5L11.5 2.75Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M11.5 2.75V6.5H15.25" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M7.5 13.5H12.5M7.5 10.75H12.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

export const formatIcons: Record<string, string> = {
  markdown: markdownIconSvg,
  html: htmlIconSvg,
  json: jsonIconSvg,
  text: textIconSvg,
  pdf: pdfIconSvg,
};
