//import TiptapRenderer from '../tip-tap/TiptapRenderer/ClientRenderer';

interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  // todo: this must be temporary and experimental solution for rendering html content until we hava better support for react 19
  return <div dangerouslySetInnerHTML={{ __html: value }}></div>;
  //return <TiptapRenderer>{value}</TiptapRenderer>;
};

export default Renderer;
