"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { MediaPickerModal } from "@/components/MediaPicker";

type Mode = "visual" | "html";

function ToolbarButton({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`richtext-toolbar-btn${active ? " is-active" : ""}`}
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <span className="richtext-toolbar-sep" />;
}

function TiptapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [, rerender] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "richtext-content rich-text",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const refresh = () => rerender((n) => n + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien :", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return <div className="richtext-editor richtext-editor-loading">Chargement...</div>;
  }

  return (
    <div className="richtext-editor">
      <div className="richtext-toolbar" role="toolbar" aria-label="Mise en forme">
        <ToolbarButton
          title="Annuler"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          &#8617;
        </ToolbarButton>
        <ToolbarButton
          title="Retablir"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          &#8618;
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          title="Titre 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="Titre 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Titre 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          title="Paragraphe"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          P
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          title="Gras"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italique"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Souligne"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolbarButton>
        <ToolbarButton
          title="Barre"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span style={{ textDecoration: "line-through" }}>S</span>
        </ToolbarButton>
        <ToolbarButton
          title="Code inline"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {"</>"}
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          title="Aligner a gauche"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          &#8676;
        </ToolbarButton>
        <ToolbarButton
          title="Centrer"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          &#8596;
        </ToolbarButton>
        <ToolbarButton
          title="Aligner a droite"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          &#8677;
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          title="Liste a puces"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          &bull;
        </ToolbarButton>
        <ToolbarButton
          title="Liste numerotee"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          title="Citation"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;
        </ToolbarButton>
        <ToolbarButton
          title="Bloc de code"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"{ }"}
        </ToolbarButton>
        <ToolbarButton
          title="Separateur"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          &#8212;
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton title="Lien" active={editor.isActive("link")} onClick={setLink}>
          &#128279;
        </ToolbarButton>
        <ToolbarButton
          title="Retirer le lien"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          &#10006;
        </ToolbarButton>
        <ToolbarButton title="Image" onClick={() => setMediaOpen(true)}>
          &#128247;
        </ToolbarButton>
        <ToolbarButton
          title="Effacer la mise en forme"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          &#8999;
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(item) => {
          editor.chain().focus().setImage({ src: item.url, alt: item.alt || "" }).run();
          setMediaOpen(false);
        }}
      />
    </div>
  );
}

export function RichTextField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("visual");
  const [visualKey, setVisualKey] = useState(0);

  const switchMode = (next: Mode) => {
    if (next === "visual") setVisualKey((k) => k + 1);
    setMode(next);
  };

  return (
    <div className="richtext-field">
      <div className="richtext-mode-tabs" role="tablist" aria-label="Mode d'edition">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "visual"}
          className={`richtext-mode-tab${mode === "visual" ? " is-active" : ""}`}
          onClick={() => switchMode("visual")}
        >
          Rich text
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "html"}
          className={`richtext-mode-tab${mode === "html" ? " is-active" : ""}`}
          onClick={() => switchMode("html")}
        >
          HTML
        </button>
      </div>

      {mode === "visual" ? (
        <TiptapEditor key={visualKey} value={value || ""} onChange={onChange} />
      ) : (
        <textarea
          className="admin-textarea richtext-html"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Votre contenu HTML...</p>"
        />
      )}
    </div>
  );
}
