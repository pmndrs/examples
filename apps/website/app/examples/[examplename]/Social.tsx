"use client";

import { ReactNode, useRef } from "react";
import { toast } from "sonner";
import { GoCommandPalette } from "react-icons/go";
import { RxOpenInNewWindow } from "react-icons/rx";
import { SiCodesandbox, SiGithub, SiStackblitz } from "react-icons/si";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRovingTabIndex } from "@/hooks/use-roving-tabindex";

export function Social({
  examplename,
  embed_url,
}: {
  examplename: string;
  embed_url: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  /* The bar reads as one object, so it answers to Tab as one: five icon
     buttons would otherwise be five stops for what is visibly a single pill. */
  const roving = useRovingTabIndex(groupRef, { orientation: "horizontal" });

  const command = `npx -y degit pmndrs/examples/examples/${examplename} ${examplename} && cd ${examplename} && npm i && npm run dev`;

  const handleClick = async () => {
    await navigator.clipboard.writeText(command);

    toast.success("Degit command copied", {
      description: (
        <div className="flex min-w-0 flex-col gap-2">
          <span>
            Paste in your terminal to install <strong>{examplename}</strong>{" "}
            locally.
          </span>
          <code className="rounded-sm bg-muted px-2 py-1 font-mono text-[0.7rem] leading-relaxed break-all whitespace-pre-wrap">
            <span className="select-none">$ </span>
            {command}
          </code>
        </div>
      ),
    });
  };

  /* `degit` is the odd one out: it copies rather than navigates, so it is the
     entry with no `href` and the only real `<button>` in the group. */
  const actions: { label: string; icon: ReactNode; href?: string }[] = [
    { label: "fullpage", icon: <RxOpenInNewWindow />, href: embed_url },
    {
      label: "code",
      icon: <SiGithub />,
      href: `https://github.com/pmndrs/examples/tree/main/examples/${examplename}`,
    },
    {
      label: "stackblitz",
      icon: <SiStackblitz />,
      href: `https://stackblitz.com/github/pmndrs/examples/tree/main/examples/${examplename}`,
    },
    {
      label: "codesandbox",
      icon: <SiCodesandbox />,
      href: `https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/${examplename}`,
    },
    { label: "degit", icon: <GoCommandPalette /> },
  ];

  return (
    /* `ButtonGroup` is a div, so the landmark has to come from somewhere: four
       of the five entries leave the page. */
    <nav aria-label="Example links">
      {/* The group draws no box of its own — the buttons, sitting flush, are
          the pill. It only needs the matching radius so the shadow traces that
          pill rather than the rectangle around it.

          No divider between the buttons, and that takes saying so: the group
          drops each button's *left* border, but every button keeps a 1px
          transparent one on its right and paints `bg-clip-padding`, so the
          page shows through the join as a hairline. Dropping the right border
          too on everything but the last button closes it — the outer edge is
          left alone, where the same 1px is what keeps the shadow off the
          background colour. */}
      <ButtonGroup
        ref={groupRef}
        {...roving}
        className="rounded-4xl shadow-lg backdrop-blur-sm [&>*:not(:last-child)]:border-r-0"
      >
        {actions.map(({ label, icon, href }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                href ? (
                  /* The variants, not the component: Base UI's `Button` is a
                     real <button> and asks to stay one — rendered as an <a> it
                     wants `nativeButton={false}`, which trades the link role
                     for `role="button"`. These are links. */
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={href}
                    aria-label={label}
                    className={cn(
                      /* `icon-lg`, not `lg`: on the icon scale that is the
                         size — plain `lg` would add the text sizes' horizontal
                         padding and stretch each square into a lozenge. */
                      buttonVariants({ variant: "secondary", size: "icon-lg" }),
                      /* Prose links are underlined site-wide from
                         `@layer base`; an icon-only button is not prose. */
                      "no-underline",
                    )}
                  >
                    {icon}
                  </a>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-lg"
                    onClick={handleClick}
                    aria-label={label}
                  >
                    {icon}
                  </Button>
                )
              }
            />
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        ))}
      </ButtonGroup>
    </nav>
  );
}
