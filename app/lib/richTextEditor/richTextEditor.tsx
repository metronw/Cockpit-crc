import {Dispatch, useCallback, SetStateAction} from 'react'
import { mergeAttributes } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useDropzone } from "react-dropzone";
import { JsonValue } from '@prisma/client/runtime/library';

export function RichTextEditor({value="<p>Welcome to the editor!</p>", onValueChange}:{value:JsonValue, onValueChange?: Dispatch<SetStateAction<JsonValue>> | undefined}) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage,
      Placeholder.configure({ placeholder: "Start typing here..." }),
    ],
    // @ts-expect-error: Temporary mismatch
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onValueChange ? onValueChange(content) : null
      // debounceSaveContent(content);
    },
  });

  const onDrop = useCallback(
  async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.url) {
      if (file.type.startsWith("image/")) {
        editor?.chain().focus().setImage({ src: data.url }).run();
      } 
      // else if (file.type.startsWith("video/")) {
      //   editor?.chain().focus().setVideo({ src: data.url }).run();
      // }
    }
  },
  [editor]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "10px",
          marginBottom: "10px",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag & drop images or videos here, or click to select files</p>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}




export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "400px",
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          return attributes.width ? { width: attributes.width } : {};
        },
      },
      height: {
        default: "400px",
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          return attributes.height ? { height: attributes.height } : {};
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
});