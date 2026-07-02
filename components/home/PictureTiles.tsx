"use client";

import { useEffect, useRef, useState } from "react";
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
  const textRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setTextVisible(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-6 pb-24 pt-8 md:pt-12">
      <div
        ref={textRef}
        className={`origin-bottom transition-all duration-700 ease-out ${
          textVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-75 opacity-0"
        }`}
      >
        <h1 className="max-w-3xl font-heading text-5xl font-black leading-tight text-white md:text-7xl">
          A kingdom looking for its king.
        </h1>

        <p className="mt-8 max-w-4xl text-2xl leading-tight text-white/85 md:text-4xl">
          A king doesn&apos;t live with the small folk. So why would you train with
          them?
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className="group relative min-h-80 overflow-hidden rounded-2xl border border-white/20"
          >
            <Image
              src={tile.image}
              alt={tile.alt}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 ease-out group-hover:opacity-0" />

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
