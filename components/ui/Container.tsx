type ContainerProps = {
  children: React.ReactNode;
  wide?: boolean;
};

const Container = ({ children, wide = false }: ContainerProps) => {
  return (
    <div
      className={`mx-auto px-6 ${wide ? "max-w-[1440px]" : "max-w-(--container-width)"}`}
    >
      {children}
    </div>
  );
};

export default Container;
