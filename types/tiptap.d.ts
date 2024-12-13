import "tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    setImage: (options: { src: string }) => ReturnType;
  }
}

declare module '@tiptap/starter-kit';
declare module '@tiptap/extension-image';
// declare module '@tiptap/extension-video';