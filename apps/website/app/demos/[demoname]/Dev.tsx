"use client";

import { Style } from "@/components/Style";
import { useRouter } from "next/navigation";

export function Dev({ demoname }: { demoname: string }) {
  const { refresh } = useRouter();

  const cmd = `pnpm --filter @demo/${demoname} dev3`;

  return (
    <div className="Dev">
      <Style
        css={`
          @scope {
            :scope {
              width: min(100%, 46rem);
            }

            .content {
              display: grid;
              gap: 1rem;
              justify-items: start;
            }

            p {
              margin: 0;
            }

            pre {
              background: rgb(13, 13, 13);
              padding: 1rem;
              border-radius: 0.35rem;
              margin: 0;
              width: 100%;
            }
            code {
              color: white;
              text-overflow: ellipsis;
              overflow: hidden;
              display: block;
            }
            code:before {
              content: "$ ";
            }

            pre {
              position: relative;
              a {
                position: absolute;
                bottom: 100%;
                right: 0;
                cursor: pointer;
              }
            }
          }
        `}
      />

      <div className="content">
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
    </div>
  );
}
