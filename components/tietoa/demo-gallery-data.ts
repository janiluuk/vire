/** Translation keys under `tietoa.hub.demo` for the stylized desktop slides. */
export const DEMO_GALLERY_ENTRIES = [
  ["productivity", "productivityTitle", "productivityCaption", "workbenchDesktop"],
  ["gaming", "gamingTitle", "gamingCaption", "steamDesktop"],
  ["creative", "creativeTitle", "creativeCaption", "studioDesktop"],
  ["daily", "dailyTitle", "dailyCaption", "browserDesktop"],
] as const;

export type DemoGalleryVariant = (typeof DEMO_GALLERY_ENTRIES)[number][0];

export type DemoGalleryItem = {
  variant: DemoGalleryVariant;
  title: string;
  caption: string;
  chrome: string;
};

export function buildDemoGalleryItems(
  t: (key: string) => string,
): DemoGalleryItem[] {
  return DEMO_GALLERY_ENTRIES.map(
    ([variant, titleKey, captionKey, chromeKey]) => ({
      variant,
      title: t(titleKey),
      caption: t(captionKey),
      chrome: t(chromeKey),
    }),
  );
}
