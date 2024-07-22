import seedrandom from "seedrandom";

console.log("deterministic-random");

// globalThis.Math.random = () => 0.2;
seedrandom("hello.", { global: true });
