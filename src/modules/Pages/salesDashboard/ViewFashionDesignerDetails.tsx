import { useParams } from "react-router-dom";

export default function ViewFashionDesignerDetails() {
  const { id } = useParams();
  return <div>{id}</div>;
}
