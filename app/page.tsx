import Section from "@/components/ui/Section";
import Hero from "@/components/home/Hero";
import Image from "next/image";
import PictureTiles from "@/components/home/PictureTiles";
import gymInterior from "@/public/GymInterior.png";
import roofTop from "@/public/Rooftop2.png";

export default function Home() {
  return (
    <>
      <Section>
        <Hero></Hero>
      </Section>
      <Section>
        <PictureTiles />
      </Section>
    </>
  );
}
