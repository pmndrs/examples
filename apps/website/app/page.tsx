import { Style } from "@/components/Style";

export default function Page() {
  return (
    <div>
      <Style
        css={`
          @scope {
            :scope {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              min-height: 100dvh;
            }
          }
        `}
      />
      Select a demo
    </div>
  );
}
