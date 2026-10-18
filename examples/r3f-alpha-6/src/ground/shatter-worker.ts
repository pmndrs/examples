import { shatterTitle, type ShatterJob } from "./shatter";

self.onmessage = ({ data }: MessageEvent<ShatterJob>) => {
  const result = shatterTitle(data);
  postMessage(result, {
    transfer: [
      result.track,
      ...result.shards.flatMap((shard) =>
        shard.attributes.map(([, array]) => array),
      ),
    ].map((array) => array.buffer as ArrayBuffer),
  });
};
