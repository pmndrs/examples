"use client";

import { useRouter } from "next/navigation";

export function Dev({ examplename }: { examplename: string }) {
  const { refresh } = useRouter();

  const cmd = `pnpm --filter @example/${examplename} dev3`;

  return (
    /* Was two rules in two files: the box (`h-full`, the padding, the
       centring) came from a `.Dev` selector in `page.tsx`, the width cap from
       this component's own block. Both live here now — nothing outside styles
       this any more, so the class no longer has to be named `Dev`.

       `mx-auto` carries over `justify-self: center` from that `.Dev` rule, and
       for the same reason: `main` centres its only grid item, but that item is
       the route layout's div, which fills. This one is explicitly sized, so it
       stretches to nothing and is parked at the start of its track — under
       46rem of room `min()` returns `100%` and it looks centred anyway, past
       that it sits against the left edge. */
    <div className="mx-auto grid h-full w-[min(100%,46rem)] place-items-center p-4">
      <div className="grid justify-items-start gap-4">
        <p>Start this example with :</p>
        {/* `relative` for the copy link, which hangs off the top-right corner
            rather than sitting in the flow above it. */}
        <pre
          className="relative w-full rounded-sm bg-[#0d0d0d] p-4"
          onClick={(e) => {
            navigator.clipboard.writeText(cmd);
          }}
        >
          {/* Terminal colours, not theme ones: this block is a console, and it
              reads as one in either scheme. */}
          <code className="block overflow-hidden text-ellipsis text-white before:content-['$_']">
            {cmd}
          </code>
          <a className="absolute right-0 bottom-full cursor-pointer">copy</a>
        </pre>
        <p>
          Then <a onClick={(e) => refresh()}>refresh</a>
        </p>
      </div>
    </div>
  );
}
