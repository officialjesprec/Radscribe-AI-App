import React from "react";
import {
  ListFilter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Send,
  Database,
  Building,
  UserCheck,
} from "lucide-react";

export interface WorklistItem {
  id: string;
  patientName: string;
  mrn: string;
  accession: string;
  modality: "XR" | "CT" | "MR" | "US" | "MG";
  examDescription: string;
  clinicalIndication: string;
  urgency: "STAT" | "URGENT" | "ROUTINE";
  status: "Completed" | "In Progress" | "Pending";
  orderingPhysician: string;
}

export const SAMPLE_WORKLIST: WorklistItem[] = [
  {
    id: "wl-1",
    patientName: "HENDERSON, ROBERT",
    mrn: "MRN-920412",
    accession: "ACC-2026-88102",
    modality: "XR",
    examDescription: "Chest X-Ray 2 Views PA/Lateral",
    clinicalIndication: "Fever, cough, left pleuritic chest pain. Rule out pneumonia.",
    urgency: "URGENT",
    status: "In Progress",
    orderingPhysician: "Dr. Angela Martinez, MD (Pulmonology)",
  },
  {
    id: "wl-2",
    patientName: "VASQUEZ, ELENA",
    mrn: "MRN-481903",
    accession: "ACC-2026-88103",
    modality: "CT",
    examDescription: "CT Abdomen & Pelvis with IV Contrast",
    clinicalIndication: "28 yo female with acute RLQ pain and fever.",
    urgency: "STAT",
    status: "Pending",
    orderingPhysician: "Dr. David Chang, MD (Emergency Medicine)",
  },
  {
    id: "wl-3",
    patientName: "THOMPSON, MARCUS",
    mrn: "MRN-773190",
    accession: "ACC-2026-88104",
    modality: "MR",
    examDescription: "MRI Brain with & without Gadolinium",
    clinicalIndication: "Optic neuritis, bilateral lower extremity paresthesias.",
    urgency: "ROUTINE",
    status: "Pending",
    orderingPhysician: "Dr. Sarah Lin, MD (Neurology)",
  },
  {
    id: "wl-4",
    patientName: "KOWALSKI, ANNA",
    mrn: "MRN-330192",
    accession: "ACC-2026-88105",
    modality: "MG",
    examDescription: "Bilateral Screening Digital Mammography with 3D Tomo",
    clinicalIndication: "Routine annual breast cancer screening.",
    urgency: "ROUTINE",
    status: "Pending",
    orderingPhysician: "Dr. Rebecca Miller, MD (Women's Health)",
  },
  {
    id: "wl-5",
    patientName: "O'CONNOR, LIAM",
    mrn: "MRN-559104",
    accession: "ACC-2026-88106",
    modality: "CT",
    examDescription: "CTA Chest for Pulmonary Embolism",
    clinicalIndication: "Post-op hip replacement with sudden hypoxia and tachycardia.",
    urgency: "STAT",
    status: "Pending",
    orderingPhysician: "Dr. James Wilson, MD (Critical Care)",
  },
];

interface WorklistSidebarProps {
  items: WorklistItem[];
  selectedItem: WorklistItem;
  onSelectItem: (item: WorklistItem) => void;
  onSendHl7Simulated: () => void;
  isSendingHl7: boolean;
  hl7SentSuccess: boolean;
}

export const WorklistSidebar: React.FC<WorklistSidebarProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onSendHl7Simulated,
  isSendingHl7,
  hl7SentSuccess,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#161618] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl text-neutral-300">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0A1930] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-xs tracking-wider uppercase text-white font-sans">
            PACS / RIS Reading Queue
          </span>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-semibold">
          {items.length} Studies Active
        </span>
      </div>

      {/* Hospital Reading Room Info */}
      <div className="p-3 bg-[#111113] border-b border-[#232326] text-xs space-y-1">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-neutral-500" />
            Reading Station: <strong>Console 04 (Dark Suite)</strong>
          </span>
          <span className="text-emerald-400 font-mono text-[11px] font-semibold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-500">
          <span>Attending: Dr. Jesprec, MD</span>
          <span>DICOM Modality Worklist v3.4</span>
        </div>
      </div>

      {/* Worklist Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#232326]">
        {items.map((item) => {
          const isSelected = selectedItem.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`w-full text-left p-3.5 transition-all flex flex-col gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#0A1930]/80 border-l-4 border-l-blue-500 text-white"
                  : "hover:bg-[#1E1E22] text-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs tracking-wide">
                  {item.patientName}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    item.urgency === "STAT"
                      ? "bg-[#D9381E] text-white"
                      : item.urgency === "URGENT"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {item.urgency}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                <span className="font-medium text-neutral-300">
                  [{item.modality}] {item.examDescription}
                </span>
              </div>

              <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between">
                <span>{item.accession}</span>
                <span
                  className={`flex items-center gap-1 ${
                    item.status === "In Progress"
                      ? "text-blue-400"
                      : item.status === "Completed"
                      ? "text-emerald-400"
                      : "text-neutral-500"
                  }`}
                >
                  {item.status === "In Progress" && <Clock className="w-3 h-3 animate-spin" />}
                  {item.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                  {item.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* HL7 ORU_R01 Dispatch Simulation Box */}
      <div className="p-3.5 bg-[#111113] border-t border-[#232326] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">EHR / PACS Integration</span>
          <span className="text-[10px] font-mono text-neutral-400">HL7 v2.5 / FHIR</span>
        </div>

        <button
          onClick={onSendHl7Simulated}
          disabled={isSendingHl7}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#0A1930] hover:bg-[#112240] border border-blue-500/30 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {isSendingHl7 ? (
            <>
              <Clock className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Transmitting ORU_R01 Payload...</span>
            </>
          ) : hl7SentSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Dispatched to Epic Radiant!</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulate HL7 Push to PACS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
