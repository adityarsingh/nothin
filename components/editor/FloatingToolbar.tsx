import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered 
} from "lucide-react";

interface FloatingToolbarProps {
  editor: Editor | null;
}

export default function FloatingToolbar({ editor }: FloatingToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu 
      editor={editor} 
      className="flex bg-surface border border-border shadow-md rounded-lg overflow-hidden p-1 gap-1"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={<Bold className="w-4 h-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={<Italic className="w-4 h-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        icon={<Underline className="w-4 h-4" />}
      />
      
      <div className="w-px bg-border my-1 mx-1" />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 className="w-4 h-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        icon={<Heading3 className="w-4 h-4" />}
      />
      
      <div className="w-px bg-border my-1 mx-1" />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={<Quote className="w-4 h-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={<List className="w-4 h-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={<ListOrdered className="w-4 h-4" />}
      />
    </BubbleMenu>
  );
}

function ToolbarButton({ 
  onClick, 
  isActive, 
  icon 
}: { 
  onClick: () => void; 
  isActive: boolean; 
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        isActive 
          ? "bg-primary text-background" 
          : "text-text hover:bg-background"
      }`}
    >
      {icon}
    </button>
  );
}
