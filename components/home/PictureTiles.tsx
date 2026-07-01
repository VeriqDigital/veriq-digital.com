import Image from "next/image";
import gymInterior from "@/public/GymInterior.png";
import roofTop from "@/public/Rooftop2.png";
import recovery from "@/public/Recovery.png";

const tiles = [
  {
    title: "Rare Machines",
    alt: "Gym interior with strength machines",
    image: gymInterior,
  },
  {
    title: "Rooftop Amenities",
    alt: "Rooftop gym amenities",
    image: roofTop,
  },
  {
    title: "Recovery Spaces",
    alt: "Gym recovery amenities",
    image: recovery,
  },
  {
    title: "Elite Atmosphere",
    alt: "Premium gym training area",
    image: gymInterior,
  },
];

const PictureTiles = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-24">
      <h1 className="max-w-3xl font-heading text-5xl font-black leading-tight text-white md:text-7xl">
        A kingdom looking for its king.
      </h1>

      <p className="mt-8 max-w-4xl text-2xl leading-tight text-white/85 md:text-4xl">
        A king doesn't live with the small folk. So why would you train with
        them?
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className="relative min-h-80 overflow-hidden rounded-2xl border border-white/20"
          >
            <Image
              src={tile.image}
              alt={tile.alt}
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/10" />

            <h2 className="absolute left-6 top-6 font-heading text-xl font-black text-white">
              {tile.title}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PictureTiles;
