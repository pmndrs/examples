/**
 * The long-form explainer an example carries in its own `README.md`, and the
 * identifiers its prose names.
 *
 * Two readers share this file. `bin/build-llms.mjs` lifts the explainer out of
 * the README and inlines it into `/examples/<name>.md`, so the document agents
 * are served carries the explanation rather than a one-line description and 200
 * lines of TSX. `bin/validate-pmndrs-metadata.mjs` reads the identifiers back
 * out and checks them against the example's source, which is the only thing
 * keeping the prose from rotting quietly.
 *
 * Both are textual, and deliberately so. No markdown parser, no import
 * resolution: what the rule needs is the names as written, and a dependency
 * here would sit on the critical path of the site build and of `turbo`'s cache.
 */

/**
 * The header every example's README opens with -- three badges, the `degit`
 * line, the thumbnail -- and nothing else, in all 170 of them. It is generated
 * scaffolding, so the explainer goes under it rather than into it: the badges
 * and the scaffold command are one block, and prose spliced into the middle
 * separates the command from the links that point at the same thing.
 *
 * The thumbnail is the last line of that block, which makes it the marker. A
 * README without one has no explainer to find -- better than guessing, which
 * would publish the badges as an explanation the first time the header moves.
 */
const THUMBNAIL = /^!\[[^\]]*\]\(\s*thumbnail[^)]*\)[^\S\n]*$/gm;

/** The prose under the badge header, or `""` when the example has none. */
export function explainerOf(readme) {
  const markers = [...readme.matchAll(THUMBNAIL)];
  if (markers.length === 0) return "";

  const last = markers[markers.length - 1];
  return readme.slice(last.index + last[0].length).trim();
}

/**
 * A fenced block is quoted code, not prose about this example: it may show a
 * reader how to carry the technique into their own scene, where the names are
 * theirs and not ours. Exempt, so the rule stays a rule about what the prose
 * claims.
 */
const FENCED_BLOCK = /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm;

/** An inline code span, single- or multi-backtick. */
const CODE_SPAN = /(`+)([^`][\s\S]*?)\1/g;

const IDENTIFIER = /[A-Za-z_$][A-Za-z0-9_$]*/g;

/**
 * Every identifier-shaped word in `text`. Applied to source it is a vocabulary,
 * applied to a code span it is what that span claims -- and the check is the
 * difference, which is why both sides tokenize the same way. Matching whole
 * words rather than substrings is the point: prose naming `Mask` must not pass
 * because the source happens to contain `useMask`.
 */
export function identifiersIn(text) {
  return new Set(text.match(IDENTIFIER) ?? []);
}

/**
 * The identifiers a document puts in backticks. Whole spans are tokenized
 * rather than taken verbatim, because a technique carried by a prop is written
 * as the prop is written -- `gl={{ stencil: true }}` names `gl` and `stencil`,
 * and both are checkable.
 */
export function backtickedIdentifiers(markdown) {
  const names = new Set();

  for (const [, , span] of markdown
    .replace(FENCED_BLOCK, "")
    .matchAll(CODE_SPAN)) {
    for (const name of identifiersIn(span)) names.add(name);
  }

  return names;
}
