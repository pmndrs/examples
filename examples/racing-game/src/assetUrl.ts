// Assets live in public/; the site serves each example under /<examplename>, so
// root-absolute paths 404 there. BASE_URL is not guaranteed to end with '/'.
export const assetUrl = (path: string) =>
  import.meta.env.BASE_URL.replace(/\/?$/, "/") + path.replace(/^\//, "");
