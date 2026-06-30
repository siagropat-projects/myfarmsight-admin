import { useState, useEffect } from "react";
import {
  BookOpen,
  Video,
  Image as ImageIcon,
  Type,
  Layers,
  BarChart,
  Check,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  ArrowLeft,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLearningStore } from "../../stores/learning";
import { uploadToCloudinary } from "../../utils/upload";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router";

type Tab = "module" | "lesson";

// --- TipTap Toolbar Component ---
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-b-0 border-gray-200 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("bold") ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("italic") ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("bulletList") ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("orderedList") ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive("blockquote") ? "bg-gray-200 text-green-600" : "text-gray-600"}`}
      >
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function Create() {
  const { createModule, createLesson, modules, fetchModules } =
    useLearningStore();

  const [activeTab, setActiveTab] = useState<Tab>("module");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdModuleId, setCreatedModuleId] = useState<string>("");
  const [editorError, setEditorError] = useState(false);

  // Module Form State
  const [moduleData, setModuleData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    image: null as File | null,
    status: "active",
  });

  // Lesson Form State
  const [lessonData, setLessonData] = useState({
    moduleId: "",
    title: "",
    content: "",
    video: null as File | null,
    duration: "",
    status: "active",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: lessonData.content,
    onUpdate: ({ editor }) => {
      setLessonData((prev) => ({ ...prev, content: editor.getHTML() }));

      if (!editor.isEmpty && editor.getText().trim() !== "") {
        setEditorError(false);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 max-w-none",
      },
    },
  });

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Sync editor content when createdModuleId or activeTab changes if needed
  // But here we usually start fresh or sync once.
  useEffect(() => {
    if (editor && editor.getHTML() !== lessonData.content) {
      // editor.commands.setContent(lessonData.content);
    }
  }, [lessonData.content, editor]);

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (moduleData.image) {
        imageUrl = await uploadToCloudinary(
          moduleData.image,
          "image",
          setUploadProgress,
        );
      }

      const res: any = await createModule({
        ...moduleData,
        image_url: imageUrl,
      });

      // If successful, pre-select this module for the lesson tab
      setCreatedModuleId(res.id);
      setLessonData((prev) => ({ ...prev, moduleId: res.id }));
      setUploadProgress(0);
      setActiveTab("lesson");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditorEmpty =
      !editor || editor.isEmpty || editor.getText().trim() === "";

    if (isEditorEmpty) {
      setEditorError(true);
      editor?.commands.focus();
      return;
    }

    setEditorError(false);
    setLoading(true);
    try {
      let videoUrl = "";
      if (lessonData.video) {
        videoUrl = await uploadToCloudinary(
          lessonData.video,
          "video",
          setUploadProgress,
        );
      }

      await createLesson({
        ...lessonData,
        video_url: videoUrl,
        moduleId: lessonData.moduleId || createdModuleId,
      });

      // Reset or redirect logic here
      if (editor) editor.commands.clearContent();
      setLessonData({
        moduleId: "",
        title: "",
        content: "",
        video: null,
        duration: "",
        status: "active",
      });
      setActiveTab("module");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Content</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
        {(["module", "lesson"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 cursor-pointer py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Setup
          </button>
        ))}
      </div>

      {/* Progress Bar (Visible during uploads) */}
      {uploadProgress > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 animate-in fade-in">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
              Uploading Media...
            </span>
            <span className="text-xs font-bold text-green-700">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-green-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {activeTab === "module" ? (
        <form
          onSubmit={handleModuleSubmit}
          className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Module Title"
              placeholder="e.g. Introduction to Poultry"
              leftIcon={<Type size={18} />}
              value={moduleData.title}
              onChange={(e) =>
                setModuleData({ ...moduleData, title: e.target.value })
              }
              required
            />
            <Input
              label="Category"
              placeholder="e.g. Livestock"
              leftIcon={<Layers size={18} />}
              value={moduleData.category}
              onChange={(e) =>
                setModuleData({ ...moduleData, category: e.target.value })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] outline-none min-h-[120px]"
              placeholder="Enter module overview..."
              value={moduleData.description}
              onChange={(e) =>
                setModuleData({ ...moduleData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Level
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#4CAF50]"
                value={moduleData.level}
                onChange={(e) =>
                  setModuleData({ ...moduleData, level: e.target.value })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <FileUpload
              label="Module Cover Image"
              icon={<ImageIcon size={20} />}
              onFileSelect={(file: any) =>
                setModuleData({ ...moduleData, image: file })
              }
              file={moduleData.image}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={loading}
              className="w-full md:w-auto"
            >
              Save & Continue to Lessons <Check size={18} />
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleLessonSubmit}
          className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Parent Module
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#4CAF50] font-medium"
              value={lessonData.moduleId}
              onChange={(e) =>
                setLessonData({ ...lessonData, moduleId: e.target.value })
              }
              required
            >
              <option value="">Select a module...</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Lesson Title"
              placeholder="e.g. Brooding Essentials"
              leftIcon={<BookOpen size={18} />}
              value={lessonData.title}
              onChange={(e) =>
                setLessonData({ ...lessonData, title: e.target.value })
              }
              required
            />
            <Input
              label="Duration (mins)"
              placeholder="e.g. 15"
              leftIcon={<BarChart size={18} />}
              value={lessonData.duration}
              required
              onChange={(e) =>
                setLessonData({ ...lessonData, duration: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Lesson Body <span className="text-red-500">*</span>
            </label>
            <div className="w-full">
              <MenuBar editor={editor} />
              <div
                className={`rounded-b-lg border bg-white transition-colors ${
                  editorError
                    ? "border-red-500 ring-2 ring-red-500/10"
                    : "border-gray-200"
                }`}
              >
                <EditorContent editor={editor} />
              </div>
              {editorError && (
                <p className="text-xs font-semibold text-red-500 mt-1">
                  Please write some content overview for this lesson body before
                  publishing.
                </p>
              )}
            </div>
          </div>

          <FileUpload
            label="Lesson Video"
            icon={<Video size={20} />}
            accept="video/*"
            onFileSelect={(file: any) =>
              setLessonData({ ...lessonData, video: file })
            }
            file={lessonData.video}
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <Button variant="secondary" onClick={() => setActiveTab("module")}>
              Back
            </Button>
            <Button type="submit" isLoading={loading}>
              Publish Lesson
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// --- Internal Helper: File Upload UI ---
function FileUpload({
  label,
  onFileSelect,
  file,
  icon,
  accept = "image/*",
}: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center ${
          file
            ? "border-green-500 bg-green-50"
            : "border-gray-200 hover:border-green-500 bg-gray-50"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase tracking-widest">
            <Check size={16} /> {file.name.substring(0, 20)}...
          </div>
        ) : (
          <>
            <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400 mb-2">
              {icon}
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
              Click to upload media
            </p>
          </>
        )}
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        />
      </div>
    </div>
  );
}
