interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  return <span>{value}</span>;
};

export default Renderer;
