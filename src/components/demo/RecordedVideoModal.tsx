import React, { useRef } from 'react';
import { RecordedVideoData } from '../../types/demoRecorder';
import { X, Download, Play, CheckCircle2, Film, FileVideo, HardDrive, Clock } from 'lucide-react';

interface RecordedVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: RecordedVideoData | null;
}

export const RecordedVideoModal: React.FC<RecordedVideoModalProps> = ({
  isOpen,
  onClose,
  videoData,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen || !videoData) return null;

  const sizeMb = (videoData.sizeBytes / (1024 * 1024)).toFixed(2);
  const minutes = Math.floor(videoData.durationSeconds / 60);
  const seconds = videoData.durationSeconds % 60;
  const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoData.url;
    a.download = `drishti-nexus-demo-recording-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[9995] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg flex items-center space-x-2">
                <span>Demo Recording Captured Successfully</span>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-mono">
                  READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                DRISHTI-NEXUS automated end-to-end product showcase recorded via browser MediaRecorder.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="p-6 bg-slate-950/60 flex flex-col items-center">
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative">
            <video
              ref={videoRef}
              src={videoData.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          {/* Video Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">DURATION</div>
                <div className="text-sm font-bold text-white">{durationStr}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">FILE SIZE</div>
                <div className="text-sm font-bold text-white">{sizeMb} MB</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5">
              <FileVideo className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">FORMAT</div>
                <div className="text-sm font-bold text-white">WebM (VP9/Opus)</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">ENCODING</div>
                <div className="text-sm font-bold text-emerald-300">Clean Stream</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Recorded at {new Date(videoData.timestamp).toLocaleTimeString()} • Zero third-party tools required
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition border border-slate-700"
            >
              Close
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 cursor-pointer transition transform hover:scale-105"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download WebM Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
