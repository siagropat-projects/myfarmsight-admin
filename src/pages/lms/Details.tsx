import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  Clock,
  Calendar,
  BookOpen,
  Layout,
  ArrowRight,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useLearningStore } from "../../stores/learning";
import LoadingOverlay from "../../components/ui/LoadingOverlay";

type ViewState = "module" | "lesson_preview";

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedModule,
    getModuleDetails,
    loading,
    clearSelected,
    activateModule,
    hideModule,
  } = useLearningStore();

  const [activeView, setActiveView] = useState<ViewState>("module");
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (id) getModuleDetails(id);
    return () => clearSelected();
  }, [id, getModuleDetails, clearSelected]);

  const handleStatusChange = async (action: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      await action();
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading && !selectedModule) return <LoadingState />;
  if (!selectedModule) return <EmptyState />;

  const currentLesson = selectedModule.lessons.find(
    (l) => l.id === currentLessonId,
  );

  return (
    <div className="mx-auto pb-20">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() =>
            activeView === "lesson_preview"
              ? setActiveView("module")
              : navigate(-1)
          }
          className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-100 shadow-sm bg-white"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">LMS Management</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider italic">
            {activeView === "module"
              ? "Module Overview"
              : `Lesson: ${currentLesson?.title}`}
          </p>
        </div>
      </div>

      {/* Standardized Tabs - REMOVED AS PER REQUEST */}

      {activeView === "module" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {/* Module Metadata */}
          <div className="md:col-span-2 space-y-8">
            <section>
              {(selectedModule.image_url || selectedModule.imageUrl) && (
                <div className="w-full h-80 bg-gray-100 rounded-2xl mb-8 overflow-hidden border border-gray-100 shadow-sm">
                  <img
                    src={selectedModule.image_url || selectedModule.imageUrl}
                    className="w-full h-full object-cover"
                    alt={selectedModule.title}
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedModule.title}
              </h2>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {selectedModule.lessons.length} Lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />{" "}
                  {format(new Date(selectedModule.created_at), "MMM. dd, yyyy")}
                </span>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed font-medium">
                {selectedModule.description}
              </p>
            </section>

            <section className="pt-8 border-t border-gray-50">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layout size={18} className="text-green-600" /> Curriculum (
                {selectedModule.lessons.length} Lessons)
              </h3>
              <div className="space-y-3">
                {selectedModule.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLessonId(lesson.id);
                      setActiveView("lesson_preview");
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 hover:shadow-md hover:shadow-green-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-xs font-black text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {lesson.title}
                      </span>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all"
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Module Settings
              </p>
              <div className="space-y-6">
                <InfoRow label="Category" value={selectedModule.category} />
                <InfoRow label="Level" value={selectedModule.level} />
                <InfoRow
                  label="Current Status"
                  value={selectedModule.status}
                  isBadge
                />

                <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                  {selectedModule.status === "active" ? (
                    <button
                      onClick={() =>
                        handleStatusChange(() => hideModule(selectedModule.id))
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      <EyeOff size={16} /> Hide Module
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleStatusChange(() =>
                          activateModule(selectedModule.id),
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-brand text-xs font-bold rounded-xl hover:bg-green-100 transition-all border border-green-200"
                    >
                      <CheckCircle size={16} /> Activate Module
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Lesson Preview View */
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
          {currentLesson ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <article className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentLesson.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Clock size={14} />{" "}
                        {currentLesson.duration_minutes || 5} mins
                      </span>
                    </div>
                  </div>

                  {currentLesson.video_url ? (
                    <div className="w-full aspect-video bg-black rounded-2xl mb-8 overflow-hidden border border-gray-100 shadow-inner">
                      <video
                        src={currentLesson.video_url}
                        controls
                        className="w-full h-full object-contain"
                        poster={selectedModule.image_url || selectedModule.imageUrl}
                      />
                    </div>
                  ) : (
                    (selectedModule.image_url || selectedModule.imageUrl) && (
                      <div className="w-full h-80 bg-gray-50 rounded-2xl mb-8 overflow-hidden border border-gray-100">
                        <img
                          src={selectedModule.image_url || selectedModule.imageUrl}
                          className="w-full h-full object-cover"
                          alt="cover"
                        />
                      </div>
                    )
                  )}

                  <div
                    className="text-gray-700 leading-relaxed font-medium space-y-4 prose prose-green max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                </article>
              </div>

              {/* Sidebar for Lesson View */}
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Quick Navigation
                  </p>
                  <div className="space-y-3">
                    {selectedModule.lessons.map((lesson, idx) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLessonId(lesson.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                          currentLessonId === lesson.id
                            ? "bg-green-50 border border-green-200 text-brand"
                            : "bg-gray-50 border border-transparent text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-black ${currentLessonId === lesson.id ? "text-brand" : "text-gray-400"}`}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-bold truncate">
                          {lesson.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                Lesson content not found
              </p>
            </div>
          )}
        </div>
      )}

      {isActionLoading && (
        <LoadingOverlay message="Updating module status..." />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  isBadge = false,
}: {
  label: string;
  value: string;
  isBadge?: boolean;
}) {
  const isHidden = value.toLowerCase() === "hidden";
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
        {label}
      </p>
      {isBadge ? (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isHidden ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-brand border border-green-100"}`}
        >
          {value}
        </span>
      ) : (
        <p className="text-sm font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <h3 className="text-lg font-bold text-gray-900">Module not found</h3>
      <button
        onClick={() => window.history.back()}
        className="mt-4 text-green-600 font-bold text-sm underline"
      >
        Go Back
      </button>
    </div>
  );
}
