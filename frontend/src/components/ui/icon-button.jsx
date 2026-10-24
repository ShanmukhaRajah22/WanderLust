import { Pencil, Trash2 } from "lucide-react";

export function TrashIcon({ label = "Delete", ...props }) {
  return <Trash2 aria-label={label} {...props} />;
}

export function PenIcon({ label = "Edit", ...props }) {
  return <Pencil aria-label={label} {...props} />;
}
