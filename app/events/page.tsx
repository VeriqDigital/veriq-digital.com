import Section from "@/components/ui/Section";
import Image from "next/image";
import eventCalendar from "@/public/EventCalendar.png";

const events = [
  {
    title: "Rare Machines",
  },
  {
    title: "Rooftop Amenities",
  },
  {
    title: "Recovery Spaces",
  },
  {
    title: "Elite Atmosphere",
  },
];

const page = () => {
  return (
    <Section>
      <div className="mx-auto flex w-full max-w-5xl flex-col">
        <div className="group relative aspect-1672/941 overflow-hidden rounded-2xl border border-white/20 transition-transform duration-500 ease-out hover:scale-[1.02]">
          <Image
            src={eventCalendar}
            alt="Event Calendar"
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-contain"
          />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event.title}
              className="group relative min-h-80 overflow-hidden rounded-2xl border border-white/20 bg-white/5 transition-transform duration-500 ease-out hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 ease-out group-hover:opacity-0" />

              <h2 className="absolute left-6 top-6 font-heading text-xl font-black text-white">
                {event.title}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default page;
