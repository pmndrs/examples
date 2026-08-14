/**
 * What an example imports, read as text.
 *
 * This is what `apis` in `pmndrs.json` is checked against: an entry that names
 * an identifier the example does not import is either a typo or rot -- drei
 * renames an API, someone fixes the import, and the metadata keeps advertising
 * the old name to every agent that reads the document.
 *
 * Textual on purpose. The alternative, resolving the module and asking whether
 * the export exists, reproves what the build already enforces: rollup fails the
 * bundle on a missing named export, and the e2e suite then renders the scene.
 * What no build can catch is metadata drifting away from source, and that needs
 * nothing more than the names as written.
 */

/**
 * An import statement, from the keyword at the start of a line to the module
 * string. `[\s\S]` rather than `.` because the member list is usually spread
 * over lines; lazy, so each statement stops at its own `from`.
 */
const IMPORT_STATEMENT = /^import\s+([\s\S]*?)\s+from\s*["'][^"']*["']/gm;

/** `import type { Mesh } from "three"` -- a type, never an API. */
const TYPE_ONLY = /^type\s/;

const MEMBER_LIST = /\{([\s\S]*)\}/;

/**
 * The identifiers one import clause brings in, named as the library names them:
 * `{ useMask as mask }` is `useMask`, because that is what a reader would go
 * looking for. A namespace binding is its local name -- `* as THREE` has no
 * other one.
 */
function bindings(clause) {
  const names = [];

  // Whatever sits outside the braces, which comes first when there is both: a
  // default binding, or a namespace.
  for (const part of clause.replace(MEMBER_LIST, "").split(",")) {
    const binding = part.trim();
    const namespace = binding.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
    if (namespace) names.push(namespace[1]);
    else if (/^[A-Za-z_$][\w$]*$/.test(binding)) names.push(binding);
  }

  const members = clause.match(MEMBER_LIST);
  if (members) {
    for (const member of members[1].split(",")) {
      const imported = member
        .trim()
        .split(/\s+as\s+/)[0]
        .trim();
      if (imported && !TYPE_ONLY.test(imported)) names.push(imported);
    }
  }

  return names;
}

/** Every identifier `source` imports. */
export function importedIdentifiers(source) {
  const identifiers = new Set();

  for (const [, clause] of source.matchAll(IMPORT_STATEMENT)) {
    if (TYPE_ONLY.test(clause)) continue;
    for (const name of bindings(clause)) identifiers.add(name);
  }

  return identifiers;
}
