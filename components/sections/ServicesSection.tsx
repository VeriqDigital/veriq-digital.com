import { services } from "@/data/services";

const ServicesSection = () => {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-(--primary)">
          Services
        </p>
        <h2 className="mt-4 max-w-xl font-heading text-4xl font-black uppercase leading-tight text-(--foreground) md:text-6xl">
          Replace These Cards With What The Business Actually Sells
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-lg border border-white/10 bg-(--surface) p-6"
          >
            <h3 className="font-heading text-xl font-black uppercase text-white">
              {service.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-white/65">
              {service.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
