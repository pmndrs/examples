export default function NotFound() {
  return (
    <>
      {/* GitHub Pages serves this page (as 404.html) for every unknown path,
          which makes it the catch-all for pre-#152 /demos/<name> URLs that the
          static stubs in out.sh don't cover (missing trailing slash, deep
          links). Inline so it runs before paint, without hydration. The
          trailing slash is dropped from the target: Next exports flat
          <name>.html files, so the slash form 404s on GitHub Pages. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const match = location.pathname.match(/^(.*?)\\/demos\\/(.+?)\\/?$/);
              if (match) {
                location.replace(
                  match[1] + "/examples/" + match[2] + location.search + location.hash,
                );
              }
            })();
          `,
        }}
      />
      <div className="flex min-h-dvh w-full items-center justify-center">
        Example not found
      </div>
    </>
  );
}
