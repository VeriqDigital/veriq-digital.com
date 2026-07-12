import { testimonials } from "@/data/testimonials";

const TestimonialsSection = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {testimonials.map((testimonial) => (
        <figure
          key={`${testimonial.name}-${testimonial.detail}`}
          className="rounded-lg border border-white/10 bg-(--surface) p-6"
        >
          <blockquote className="text-lg font-semibold leading-8 text-white">
            &quot;{testimonial.quote}&quot;
          </blockquote>
          <figcaption className="mt-6 text-sm text-white/60">
            <span className="font-bold text-white">{testimonial.name}</span> /{" "}
            {testimonial.detail}
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default TestimonialsSection;
