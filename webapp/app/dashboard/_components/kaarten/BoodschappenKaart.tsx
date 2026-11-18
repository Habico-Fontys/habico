import { ArrowUpRight, ShoppingBasket } from "lucide-react";
import { DashboardKaart } from "../DashboardKaart";
import { Pijl } from "../Pijl";
import { euro } from "../../_lib/euro";
import type { Product } from "../../boodschappenlijst/data";

export type BoodschappenKaartProps = {
  href: string;
  productenNodig: Product[];
};

export function BoodschappenKaart({
  href,
  productenNodig,
}: BoodschappenKaartProps) {
  // Korte lijst: één klik brengt je naar de volledige boodschappenpagina.
  return (
    <DashboardKaart
      href={href}
      label="Open de gezamenlijke boodschappenlijst"
      className="border border-[#e3e2e0] bg-[#fcfaf7]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Nog op het lijstje</h2>
        <Pijl />
      </div>
      <p className="mt-2 text-xs text-[#6687b0]">
        Kleine dingen. Fijn voor iedereen.
      </p>
      <div className="my-5 divide-y divide-[#e3e2e0]">
        {productenNodig.length > 0 ? (
          productenNodig.slice(0, 2).map((product) => (
            <div key={product.id} className="flex items-center gap-3 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e9eaff] text-[#1D38FF]">
                <ShoppingBasket size={17} />
              </span>
              <div>
                <p className="text-sm font-medium">{product.naam}</p>
                <p className="mt-1 text-xs text-[#6687b0]">
                  {product.omschrijving || "Nog nodig"}
                </p>
              </div>
              <span className="ml-auto whitespace-nowrap text-xs font-semibold">
                {euro(product.prijs)}
              </span>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-[#6687b0]">
            Alles op het lijstje is al gekocht.
          </p>
        )}
      </div>
      <span className="mt-auto flex items-center justify-between text-xs font-semibold text-[#1D38FF]">
        {productenNodig.length} producten nodig <ArrowUpRight size={16} />
      </span>
    </DashboardKaart>
  );
}
