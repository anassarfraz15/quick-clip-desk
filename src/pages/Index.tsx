import { useEffect, useState } from "react";
import { Download, FileText, Link2, Scissors, Camera, Chrome, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRIMARY = "#7C5CFF";

const Index = () => {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("qn-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("qn-theme", dark ? "dark" : "light");
  }, [dark]);

  const t = dark
    ? {
        bg: "#0B0D12",
        surface: "#14171F",
        border: "#23262F",
        text: "#E5E7EB",
        muted: "#9CA3AF",
        chip: "#1E1A33",
        codeBg: "#1A1D24",
      }
    : {
        bg: "#F7F8FA",
        surface: "#FFFFFF",
        border: "#EEF0F3",
        text: "#1F2937",
        muted: "#6B7280",
        chip: "#EFEBFF",
        codeBg: "#F7F8FA",
      };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = "/quicknotes-extension.zip";
    a.download = "quicknotes-extension.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const features = [
    { icon: FileText, label: "Take Note", kbd: "Alt + N" },
    { icon: Link2, label: "Save Link", kbd: "Alt + L" },
    { icon: Scissors, label: "Clip Selection", kbd: "Alt + S" },
    { icon: Camera, label: "Screenshot", kbd: "Alt + ⇧ + S" },
  ];

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: t.bg, color: t.text }}
    >
      <div className="mx-auto max-w-3xl px-6 py-16 relative">
        {/* Theme toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle dark mode"
          className="absolute top-6 right-6 w-10 h-10 rounded-full grid place-items-center border transition hover:scale-105"
          style={{ backgroundColor: t.surface, borderColor: t.border, color: t.text }}
        >
          <span className="relative w-5 h-5 block">
            <Sun
              className="w-5 h-5 absolute inset-0 transition-all duration-300"
              style={{
                opacity: dark ? 0 : 1,
                transform: dark ? "rotate(-90deg) scale(0.5)" : "rotate(0) scale(1)",
              }}
            />
            <Moon
              className="w-5 h-5 absolute inset-0 transition-all duration-300"
              style={{
                opacity: dark ? 1 : 0,
                transform: dark ? "rotate(0) scale(1)" : "rotate(90deg) scale(0.5)",
              }}
            />
          </span>
        </button>

        <header className="flex items-center justify-center gap-3 mb-12">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center text-white shadow-lg"
            style={{ backgroundColor: PRIMARY, boxShadow: `0 8px 20px ${PRIMARY}55` }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-bold leading-tight">QuickNotes</h1>
            <p className="text-xs" style={{ color: t.muted }}>
              Your ideas, always with you.
            </p>
          </div>
        </header>

        <section className="text-center mb-12">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
            style={{ backgroundColor: t.chip, color: PRIMARY }}
          >
            <Chrome className="w-3 h-3" />
            Chrome Extension
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Capture every idea,<br />in one keystroke.
          </h2>
          <p className="text-base max-w-lg mx-auto mb-8" style={{ color: t.muted }}>
            A minimal, distraction-free note-taking extension. Notes, links, clips and
            screenshots — all in one beautiful popup.
          </p>
          <Button
            size="lg"
            onClick={handleDownload}
            className="text-white font-semibold rounded-xl px-7 py-6 text-base shadow-lg hover:scale-[1.02] transition"
            style={{ backgroundColor: PRIMARY, boxShadow: `0 10px 24px ${PRIMARY}66` }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Extension
          </Button>
          <p className="text-xs mt-3" style={{ color: t.muted }}>
            Manifest V3 · Chrome, Edge, Brave, Arc
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {features.map((f) => (
            <div
              key={f.label}
              className="border rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md transition"
              style={{ backgroundColor: t.surface, borderColor: t.border }}
            >
              <div
                className="w-10 h-10 rounded-xl grid place-items-center mb-2"
                style={{ backgroundColor: t.chip, color: PRIMARY }}
              >
                <f.icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold">{f.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: t.muted }}>
                {f.kbd}
              </div>
            </div>
          ))}
        </section>

        <section
          className="border rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: t.surface, borderColor: t.border }}
        >
          <h3 className="font-bold text-base mb-4">Install in 4 steps</h3>
          <ol className="space-y-3 text-sm">
            {[
              "Click Download Extension and unzip the file.",
              <>
                Open{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-[12px]"
                  style={{ backgroundColor: t.codeBg }}
                >
                  chrome://extensions
                </code>{" "}
                in your browser.
              </>,
              <>Enable <strong>Developer mode</strong> in the top-right corner.</>,
              <>Click <strong>Load unpacked</strong> and select the unzipped folder.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full grid place-items-center text-xs font-bold"
                  style={{ backgroundColor: t.chip, color: PRIMARY }}
                >
                  {i + 1}
                </span>
                <span className="pt-0.5" style={{ color: t.text }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="text-center text-xs mt-12" style={{ color: t.muted }}>
          Created by Anas with <span className="text-red-500">❤️</span>
        </footer>
      </div>
    </main>
  );
};

export default Index;
