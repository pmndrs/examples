import Nav from "@/components/Nav";
import { Style } from "@/components/Style";
import { getDemos } from "@/lib/helper";

const demos = getDemos();

export default function Page() {
  return (
    <div>
      <Style
        css={`
          @scope {
            :scope {
            }

            .Nav {
              ul {
                padding: 0;
                gap: 0;

                display: grid;
                --w: calc(7 * var(--fs));
                grid-template-columns: repeat(auto-fit, minmax(var(--w), 1fr));
              }
              li {
                max-inline-size: none;
              }

              a img {
                width: 100%;
                height: auto;
              }
            }
          }
        `}
      />

      <Nav demos={demos} />
    </div>
  );
}
