import { createHash } from "node:crypto";

/**
 * Generate a stable port number for a given name within a specified range.
 * @param {string} name - The name to hash.
 * @param {int} minPort - The minimum port number.
 * @param {int} maxPort - The maximum port number.
 * @returns {int} - The generated port number.
 */
export function generatePort(name, minPort = 5173, maxPort = 6000) {
  // 1. Hash the name to get a stable, reproducible hash code.
  const hash = createHash("sha256");
  hash.update(name);
  const hashDigest = hash.digest("hex");

  // 2. Convert the hash code to a number using BigInt.
  const hashNumber = BigInt("0x" + hashDigest);

  // 3. Scale the hash number to the desired port range.
  const range = maxPort - minPort + 1;
  const port = minPort + Number(hashNumber % BigInt(range));

  return port;
}
