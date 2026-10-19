/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type FormDataType = {
  content: string;
  [key: string]: any;
};

type UpdateTextEditorProps = {
  formData: FormDataType;
  setFormData: any;
  previousContent?: string;
};

const UpdateTextEditor: React.FC<UpdateTextEditorProps> = ({
  formData,
  setFormData,
  previousContent,
}) => {
  // const quillModules = {
  //   toolbar: [
  //     [{ header: [1, 2, 3, 4, 5, 6, false] }],
  //     [{ size: ["small", false, "large", "huge"] }],
  //     ["bold", "italic", "underline", "strike"],
  //     [{ color: [] }, { background: [] }],
  //     [{ list: "ordered" }, { list: "bullet" }],
  //     ["link", "image"],
  //     ["clean"],
  //   ],
  // };

  // const quillFormats: string[] = [
  //   "header",
  //   "size",
  //   "bold",
  //   "italic",
  //   "underline",
  //   "strike",
  //   "color",
  //   "background",
  //   "list",
  //   "bullet",
  //   "link",
  //   "image",
  // ];

  // const handleContentChange = (value: string): void => {
  //   setFormData((prev:any) => ({
  //     ...prev,
  //     content: value,
  //   }));
  // };

  // Set initial content only once when previousContent arrives
  useEffect(() => {
    if (!formData.content && previousContent) {
      setFormData((prev:any) => ({
        ...prev,
        content: previousContent,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousContent]); // 👈 only depend on previousContent

  return (
    <div className="my-5">
      <label className="block font-semibold text-[#191C1F] my-2">
        Blog Content
      </label>

      {/* <ReactQuill
        value={formData.content}
        onChange={handleContentChange}
        modules={quillModules}
        formats={quillFormats}
        className="bg-white rounded"
      /> */}
    </div>
  );
};

export default UpdateTextEditor;