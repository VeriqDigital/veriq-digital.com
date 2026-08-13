import Container from "./Container";

type SectionProps = {
  children: React.ReactNode;
  id?: string;
};

const Section = ({ children, id }: SectionProps) => {
  return (
    <section id={id} className="overflow-x-clip py-24">
      <Container>{children}</Container>
    </section>
  );
};

export default Section;
