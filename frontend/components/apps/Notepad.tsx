// Keeping the legacy filename for compatibility; the new Notes experience lives in NotesApp.
import NotesApp, { type NotesAppProps } from "./NotesApp";

export default function Notepad(props: NotesAppProps) {
  return <NotesApp {...props} />;
}
