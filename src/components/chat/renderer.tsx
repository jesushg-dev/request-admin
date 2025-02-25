import TiptapRenderer from '../tip-tap/TiptapRenderer/ClientRenderer';

interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  return <TiptapRenderer>{value}</TiptapRenderer>;
};

export default Renderer;
