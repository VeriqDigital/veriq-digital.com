import Container from "./Container";

type SectionProps = {
  children: React.ReactNode;
  compactTop?: boolean;
  id?: string;
};

const Section = ({ children, compactTop = false, id }: SectionProps) => {
  return (
    <section
      id={id}
      className={
        compactTop
          ? "relative z-10 overflow-x-clip pb-24 pt-4 sm:-mt-16 sm:pt-0 md:-mt-28 lg:-mt-32"
          : "overflow-x-clip py-24"
      }
    >
      <Container>{children}</Container>
    </section>
  );
};

export default Section;
