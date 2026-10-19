/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  label = "Content",
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

  return (
    <div className="my-5">
      {label && (
        <label className="block font-semibold my-2">
          {label}
        </label>
      )}

      {/* Added a wrapper div with some padding to ensure the toolbar doesn't overlap text */}
      <div className=" rounded pb-10"> 
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={quillFormats}
          className="h-48"
        />
      </div>
    </div>
  );
};

export default TextEditor;