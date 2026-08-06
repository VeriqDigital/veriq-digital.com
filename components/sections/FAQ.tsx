import { faqs } from "@/data/faq";

const FAQ = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-(--primary-readable)">
          FAQ
        </p>
        <h2 className="mt-4 font-heading text-4xl font-black uppercase text-(--foreground) md:text-6xl">
          Common Questions
        </h2>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-2">
        {faqs.map((item, index) => (
          <details
            key={item.question}
            name="homepage-faq"
            open={index === 0}
            className="group w-full self-start rounded-lg border border-white/10 bg-(--surface) text-(--surface-foreground) transition duration-200 hover:scale-[1.01]"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
              <span className="font-heading text-xs font-black uppercase tracking-[0.3em]">
                {item.question}
              </span>
              <span
                className="text-xl leading-none group-open:hidden"
                aria-hidden="true"
              >
                +
              </span>
              <span
                className="hidden text-xl leading-none group-open:inline"
                aria-hidden="true"
              >
                x
              </span>
            </summary>
            <p className="px-5 pb-5 text-white/65">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
