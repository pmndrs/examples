export default function Page() {
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @scope {
              :scope {display:flex; align-items:center; justify-content:center; width:100%; min-height:100dvh;}
            }
          `,
        }}
      />
      Select a demo
    </div>
  );
}
