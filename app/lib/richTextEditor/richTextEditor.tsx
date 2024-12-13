import { Dispatch, SetStateAction} from 'react'
import { mergeAttributes } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
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
    editable: onValueChange ? true : false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onValueChange ? onValueChange(content) : null
      // debounceSaveContent(content);
    },
  });

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const data = await response.json();
      console.log(data)
      return data.url; // URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement; // Explicitly cast target
      if (target.files && target.files[0]) { // Ensure files is not null
        const file = target.files[0];
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          editor?.chain().focus().setImage({ src: imageUrl }).run();
        }
      }
    };
    
    input.click();
  };

  return (
    <div>
      {
        onValueChange && <button onClick={addImage} >Upload Image</button>      
      }
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