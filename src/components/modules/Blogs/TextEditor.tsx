/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type FormDataType = {
  content: string;
  [key: string]: any; // keeps compatibility with your existing formData
};

type TextEditorProps = {
  formData: FormDataType;
  setFormData: any;
};

const TextEditor: React.FC<TextEditorProps> = ({
  formData,
  setFormData,
}) => {
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats: string[] = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const handleContentChange = (value: string): void => {
    setFormData({ ...formData, content: value });
  };

  return (
    <div className="my-5">
      <label className="block font-semibold text-[#191C1F] my-2">
        Blog Content
      </label>

      <ReactQuill
        value={formData.content}
        onChange={handleContentChange}
        modules={quillModules}
        formats={quillFormats}
        className="bg-white rounded"
      />
    </div>
  );
};

export default TextEditor;