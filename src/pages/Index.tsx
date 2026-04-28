import { Download, FileText, Link2, Scissors, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRIMARY = "#7C5CFF";

const Index = () => {
  const handleDownload = () => {
    fetch("/quicknotes-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "quicknotes-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  const features = [
    { icon: FileText, label: "Take Note", kbd: "Alt + N" },
    { icon: Link2, label: "Save Link", kbd: "Alt + L" },
    { icon: Scissors, label: "Clip Selection", kbd: "Alt + S" },
    { icon: Camera, label: "Screenshot", kbd: "Alt + ⇧ + S" },
  ];

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1F2937]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="flex items-center gap-3 mb-12">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center text-white shadow-lg"
            style={{ backgroundColor: PRIMARY, boxShadow: `0 8px 20px ${PRIMARY}55` }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">QuickNotes</h1>
            <p className="text-xs text-[#6B7280]">Your ideas, always with you.</p>
          </div>
        </header>

        <section className="text-center mb-12">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
            style={{ backgroundColor: "#EFEBFF", color: PRIMARY }}
          >
            <Sparkles className="w-3 h-3" />
            Chrome Extension
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Capture every idea,<br />in one keystroke.
          </h2>
          <p className="text-base text-[#6B7280] max-w-lg mx-auto mb-8">
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
          <p className="text-xs text-[#6B7280] mt-3">Manifest V3 · Chrome, Edge, Brave, Arc</p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {features.map((f) => (
            <div
              key={f.label}
              className="bg-white border border-[#EEF0F3] rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md transition"
            >
              <div
                className="w-10 h-10 rounded-xl grid place-items-center mb-2"
                style={{ backgroundColor: "#EFEBFF", color: PRIMARY }}
              >
                <f.icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold">{f.label}</div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">{f.kbd}</div>
            </div>
          ))}
        </section>

        <section className="bg-white border border-[#EEF0F3] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base mb-4">Install in 4 steps</h3>
          <ol className="space-y-3 text-sm">
            {[
              "Click Download Extension and unzip the file.",
              <>Open <code className="px-1.5 py-0.5 bg-[#F7F8FA] rounded text-[12px]">chrome://extensions</code> in your browser.</>,
              <>Enable <strong>Developer mode</strong> in the top-right corner.</>,
              <>Click <strong>Load unpacked</strong> and select the unzipped folder.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full grid place-items-center text-xs font-bold"
                  style={{ backgroundColor: "#EFEBFF", color: PRIMARY }}
                >
                  {i + 1}
                </span>
                <span className="text-[#1F2937] pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="text-center text-xs text-[#6B7280] mt-12">
          Built with care · Stores notes locally with chrome.storage
        </footer>
      </div>
    </main>
  );
};

export default Index;
