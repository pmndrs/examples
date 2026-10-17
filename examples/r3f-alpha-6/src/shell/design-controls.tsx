import { Leva } from "leva";

export function DesignControls({ open }: { open: boolean }) {
  return (
    <aside
      id="design-controls"
      className="design-controls"
      hidden={!open}
      data-design-controls
      aria-label="Design controls"
    >
      <Leva
        hidden={!open}
        fill
        collapsed={false}
        titleBar={{
          title: <span style={{ color: "#e7e8ef" }}>Type & scene</span>,
          drag: false,
          filter: false,
        }}
        hideCopyButton
        theme={{
          colors: {
            accent1: "#af482c",
            accent2: "#ed633d",
            accent3: "#f48b6e",
          },
          sizes: { rootWidth: "320px", controlWidth: "150px" },
        }}
      />
    </aside>
  );
}
