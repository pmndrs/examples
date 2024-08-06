"use client";

import { useRouter } from "next/navigation";

export function Dev({ demoname }: { demoname: string }) {
  const { refresh } = useRouter();

  const cmd = `npm run -w demos/${demoname} dev3`;

  return (
    <div className="Dev">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @scope {
              pre {background:rgb(13,13,13); padding:1rem; border-radius:.35rem;}
              code {
                color:white;
                text-overflow:ellipsis; overflow:hidden; display:block;
              }
              code:before {content:"$ ";}

              pre {
                position:relative;
                a {position:absolute; bottom:100%; right:0; cursor:pointer;}
              }

            }
          `,
        }}
      />

      <p>Start this demo with :</p>
      <pre
        onClick={(e) => {
          navigator.clipboard.writeText(cmd);
        }}
      >
        <code>{cmd}</code>
        <a>copy</a>
      </pre>
      <p>
        Then <a onClick={(e) => refresh()}>refresh</a>
      </p>
    </div>
  );
}
