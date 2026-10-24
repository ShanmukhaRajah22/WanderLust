import { KineticTextLoader } from "./kinetic-text-loader";

export default function PageLoader({ text = "Loading Nestly" }) {
  return <KineticTextLoader text={text} />;
}
