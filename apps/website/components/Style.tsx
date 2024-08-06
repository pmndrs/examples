export function Style({ css }: { css: string }) {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  );
}
