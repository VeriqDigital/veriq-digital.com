import Container from "./Container";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section
      id={id}
      className={`overflow-x-clip py-24${className ? ` ${className}` : ""}`}
    >
      <Container>{children}</Container>
    </section>
  );
};

export default Section;
