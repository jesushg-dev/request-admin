//import TiptapRenderer from '../tip-tap/TiptapRenderer/ClientRenderer';

interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  return <div>{value}</div>;
  //return <TiptapRenderer>{value}</TiptapRenderer>;
};

export default Renderer;
