import { useParams } from "react-router-dom";

export default function AdminViewProductRep() {
  const { id } = useParams();
  return <div>{id}</div>;
}
