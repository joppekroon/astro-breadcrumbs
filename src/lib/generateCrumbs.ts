import { formatLinkText } from "./formatLinkText";
import type { BreadcrumbItem, BreadcrumbsProps } from "../Breadcrumbs.astro";

type GenerateCrumbs = {
  crumbs: BreadcrumbsProps["crumbs"];
  paths: string[];
  indexText: BreadcrumbsProps["indexText"];
  hasTrailingSlash: boolean;
  linkTextFormat: BreadcrumbsProps["linkTextFormat"];
  customBaseUrl: BreadcrumbsProps["customBaseUrl"];
  excludeCurrentPage: BreadcrumbsProps["excludeCurrentPage"];
};

export const generateCrumbs = ({
  crumbs,
  paths,
  indexText,
  hasTrailingSlash,
  linkTextFormat,
  customBaseUrl,
  excludeCurrentPage,
}: GenerateCrumbs) => {
  /**
   * If crumbs are passed, use them.
   */
  if (crumbs && crumbs?.length > 0) {
    return crumbs;
  }

  const parts: Array<BreadcrumbItem> = [];
  const baseUrl = import.meta.env.BASE_URL;

  const hasBaseUrl = baseUrl !== "/";

  // If both Astro baseUrl and customBaseUrl are present, remove the first item from the paths array
  // This is because the first item is the Astro base url and we don't want to duplicate it
  if (hasBaseUrl && customBaseUrl) {
    paths = paths.slice(1);
  }

  // Set the custom base url as the first item in the paths array
  if (customBaseUrl) {
    paths.unshift(customBaseUrl);
  }
  /**
   * Loop through the paths and create a breadcrumb item for each.
   */
  paths.forEach((text: string, index: number) => {
    /**
     * generateHref will create the href out of the paths array.
     * Example: ["path1", "path2"] => /path1/path2
     */
    const generateHref = `/${paths.slice(0, index + 1).join("/")}`;

    const addTrailingSlash = hasTrailingSlash
      ? `${generateHref}/`
      : generateHref;

    const finalHref = addTrailingSlash;

    // strip out any file extensions
    const matches = text.match(/^(.+?)(\.[a-z0-9]+)?\/?$/i);

    if (matches && matches[2]) {
      text = matches[1];
    }

    parts.push({
      text: formatLinkText(text, linkTextFormat),
      href: finalHref,
    });
  });

  /**
   * If there is NO base URL, the index item is missing.
   * Add it to the start of the array.
   */
  if (!hasBaseUrl && !customBaseUrl) {
    parts.unshift({
      text: indexText!,
      href: baseUrl,
    });
  }

  /**
   * If there is a base URL, the index item is present.
   * Modify the first item to use the index page text.
   */
  parts[0] = {
    text: indexText!,
    href: parts[0]?.href,
  };

  /**
   * If excludeCurrentPage is true, remove the last item from the parts array.
   */
  if (excludeCurrentPage) {
    parts.pop();
  }

  return parts;
};
