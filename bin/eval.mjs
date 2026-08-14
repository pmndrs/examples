#!/usr/bin/env node

/**
 * Scores `llms.txt` on the only question the file exists to answer: does an
 * agent asking about refractive glass land on the right example?
 *
 * Human review answers "is this sentence true and well turned", which is a
 * different question and a much easier one. `aquarium · #transmission` passes
 * that review and is useless: it shares its one tag with a dozen other lines,
 * carries no words to tell it from them, and is not a refraction demo anyway.
 * The only way to catch that is to ask.
 *
 * So: for each question in `bin/eval/questions.json`, a model is handed the
 * contents of `llms.txt` and nothing else, plus the question, and answers with
 * the one example it would open. Hit if that name is in the question's
 * `expected` -- the hand-written oracle, which is the expensive part of the
 * exercise and the part no script can produce.
 *
 * A single answer rather than a ranked list, because that is what a reader
 * actually does: it opens one. `expected` is therefore the set of names a
 * maintainer would accept, not a set the answer has to cover.
 *
 * **Never in CI.** It calls a model, so it is non-deterministic, costs money
 * and needs the network -- the same reasoning that keeps a model out of the
 * `bin/` scripts the build depends on. Run it on demand, before and after a
 * pass over the descriptions, and compare against `bin/eval/baseline.md`.
 *
 *     node bin/build-llms.mjs   # llms.txt is generated, and gitignored
 *     node bin/eval.mjs
 *     node bin/eval.mjs --model anthropic/claude-opus-5
 *
 * Credentials come from the Vercel AI Gateway: `AI_GATEWAY_API_KEY` if you
 * have one, otherwise the short-lived `VERCEL_OIDC_TOKEN` that
 * `vercel env pull` writes into the gitignored `.env.local`. That token lasts
 * twelve hours, so a 401 here usually means pulling it again rather than
 * anything being wrong.
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "apps", "website", "public", "llms.txt");
const questionsPath = path.join(root, "bin", "eval", "questions.json");
const environmentPath = path.join(root, ".env.local");

const ENDPOINT = "https://ai-gateway.vercel.sh/v1/chat/completions";

/**
 * The default is what `bin/eval/baseline.md` was measured against, and it is an
 * open-weight model because the gateway's free tier refuses the hosted frontier
 * ones outright. Override it with `--model` once the workspace has credits, and
 * take a fresh baseline when you do: a score is only comparable within one
 * model, so quoting a number without naming the model says nothing.
 */
const DEFAULT_MODEL = "openai/gpt-oss-120b";

// The free tier serves a handful of requests and then closes a rolling window
// that stays shut for minutes, so a 429 halfway through would otherwise throw
// away the pass. Backing off is what paces the run rather than a fixed sleep:
// a workspace with credits never sees a 429 and never waits.
const RETRIES = 5;
const RETRY_DELAY_MS = 60_000;

const { values } = parseArgs({
  options: { model: { type: "string", default: DEFAULT_MODEL } },
});

if (!fs.existsSync(indexPath)) {
  console.error(
    `No ${path.relative(root, indexPath)}. It is generated and gitignored -- run \`node bin/build-llms.mjs\` first.`,
  );
  process.exit(1);
}

const index = fs.readFileSync(indexPath, "utf8");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

// The directory name is everything up to the first space on an index line, and
// it is the whole answer space: a reply that is not one of these is not an
// example, however plausible it reads.
const names = new Set(
  index
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split(" ")[0]),
);

const unknown = questions.flatMap(({ expected }) =>
  expected.filter((name) => !names.has(name)),
);
if (unknown.length > 0) {
  console.error("Questions expect examples that are not in the index:");
  for (const name of unknown) console.error(`- ${name}`);
  process.exit(1);
}

if (
  !process.env.AI_GATEWAY_API_KEY &&
  !process.env.VERCEL_OIDC_TOKEN &&
  fs.existsSync(environmentPath)
) {
  process.loadEnvFile(environmentPath);
}

const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
if (!token) {
  console.error(
    "No gateway credentials. Set AI_GATEWAY_API_KEY, or run `vercel env pull .env.local` for a VERCEL_OIDC_TOKEN.",
  );
  process.exit(1);
}

/**
 * The whole prompt. The index is the only thing the reader is given -- no
 * source, no per-example document, no tags of our own -- because that is
 * exactly the position an agent is in when it decides which example to fetch.
 */
const system = `You are choosing which example to open from the pmndrs examples gallery.

Below is the whole gallery, one line per example: the directory name, then an optional title in parentheses, a description, extra libraries after +, tags after # and an approximate size after ~. Any of those may be missing.

${index}
Answer with the directory name of the single example you would open, and nothing else.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ask(question) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: values.model,
        // Not determinism -- no sampler setting buys that -- but the least
        // noise available, so a rerun reproduces the score rather than a mood.
        temperature: 0,
        // Room for a reasoning model to think before it names one directory.
        max_tokens: 800,
        messages: [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
      }),
    });

    if (response.ok) {
      const body = await response.json();
      return body.choices[0].message.content ?? "";
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === RETRIES) {
      throw new Error(
        `${response.status} from the gateway: ${(await response.text()).slice(0, 200)}`,
      );
    }
    console.error(
      `  ${response.status} from the gateway, waiting ${RETRY_DELAY_MS / 1000}s`,
    );
    await sleep(RETRY_DELAY_MS);
  }
}

/**
 * Models answer with a bare name, a backticked name, or a name at the end of a
 * sentence. All three are the same answer; anything that is not a directory
 * name in the index is not.
 */
function nameOf(reply) {
  const last = reply.trim().split("\n").filter(Boolean).at(-1) ?? "";
  const candidate = last.trim().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
  return names.has(candidate) ? candidate : null;
}

let hits = 0;

for (const { question, expected } of questions) {
  // The question first, so a backoff notice lands under the question waiting
  // on it rather than ahead of it.
  console.log(question);

  const reply = await ask(question);
  const answer = nameOf(reply);
  const hit = answer !== null && expected.includes(answer);
  if (hit) hits += 1;

  const named =
    answer ?? `nothing named in ${JSON.stringify(reply.trim().slice(0, 80))}`;
  console.log(
    `  ${hit ? "✔" : "✗"} ${named}` +
      (hit ? "" : `  (expected ${expected.join(", ")})`),
  );
}

const percentage = Math.round((hits / questions.length) * 100);
console.log(
  `\n${hits}/${questions.length} (${percentage}%) · ${values.model} · ${names.size} examples, ${Buffer.byteLength(index)} bytes of index`,
);
