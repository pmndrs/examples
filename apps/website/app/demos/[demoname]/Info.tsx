import { ReactNode } from "react";
import { RxInfoCircled } from "react-icons/rx";

import { getLibraryLabel } from "@/const/libraries";
import type { Demo } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** The panel is a stack of these — a small caps label over its content. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function Info({ demo }: { demo: Demo }) {
  const libraryLabels = Array.from(
    new Set(demo.libraries.map(getLibraryLabel)),
  );

  return (
    <Popover>
      {/* One button, so the group's `rounded-4xl` ends meet and it draws a
          disc. It is a group of one on purpose: a second control can land
          beside it without the pill having to be rebuilt. */}
      <ButtonGroup className="rounded-4xl shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Show demo info"
                /* `secondary` reads the same open or shut; the panel is
                   anchored to this button, so it should look pressed while the
                   panel is up. */
                className="aria-expanded:bg-primary aria-expanded:text-primary-foreground"
              >
                <RxInfoCircled />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">info</TooltipContent>
        </Tooltip>
      </ButtonGroup>

      <PopoverContent
        align="end"
        sideOffset={8}
        /* 12px of clearance, the same margin the bar itself keeps — the panel
           is as wide as the viewport allows on a phone, so without it Radix
           would park it flush against the edge. */
        collisionPadding={12}
        /* Radix measures the room left under the trigger and publishes it as
           `--radix-popover-content-available-height`, which is what the old
           `max-height: min(100dvh - 4.5rem, 34rem)` was approximating by
           hand. */
        className="max-h-(--radix-popover-content-available-height) w-[min(24rem,calc(100dvw-1.5rem))] overflow-y-auto overscroll-contain"
      >
        <PopoverHeader>
          <PopoverTitle>{demo.title}</PopoverTitle>
          {demo.description && (
            <PopoverDescription>{demo.description}</PopoverDescription>
          )}
        </PopoverHeader>

        {demo.authors.length > 0 && (
          <Section title={demo.authors.length > 1 ? "Authors" : "Author"}>
            <p>{demo.authors.join(", ")}</p>
          </Section>
        )}

        {demo.publishedAt && (
          <Section title="Published">
            <p>{formatDate(demo.publishedAt)}</p>
          </Section>
        )}

        {demo.tags.length > 0 && (
          <Section title="Tags">
            <ul className="flex flex-wrap gap-1">
              {demo.tags.map((tag) => (
                <Badge key={tag} variant="secondary" asChild>
                  <li>{tag}</li>
                </Badge>
              ))}
            </ul>
          </Section>
        )}

        {libraryLabels.length > 0 && (
          <Section title="Libraries">
            <ul className="flex flex-wrap gap-1">
              {libraryLabels.map((library) => (
                <Badge key={library} variant="secondary" asChild>
                  <li>{library}</li>
                </Badge>
              ))}
            </ul>
          </Section>
        )}

        {demo.assets.length > 0 && (
          <Section title="Assets">
            <ul className="flex flex-col gap-2.5 text-xs">
              {demo.assets.map((asset) => (
                <li key={asset.name}>
                  {asset.source ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={asset.source}
                    >
                      {asset.name}
                    </a>
                  ) : (
                    asset.name
                  )}
                  {asset.creator && (
                    <span className="text-muted-foreground">
                      {" "}
                      by {asset.creator}
                    </span>
                  )}
                  {asset.license && (
                    <span className="text-muted-foreground">
                      {" — "}
                      {asset.licenseUrl ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={asset.licenseUrl}
                        >
                          {asset.license}
                        </a>
                      ) : (
                        asset.license
                      )}
                    </span>
                  )}
                  {asset.modified && (
                    <span className="text-muted-foreground"> (modified)</span>
                  )}
                  {asset.notes && (
                    <span className="block text-muted-foreground">
                      {asset.notes}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </PopoverContent>
    </Popover>
  );
}
