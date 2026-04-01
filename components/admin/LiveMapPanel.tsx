import { Check } from "lucide-react";

/* ── Delivery Steps ──────────────────── */
type StepStatus = "done" | "active" | "pending";

interface DeliveryStep {
  label: string;
  status: StepStatus;
}

const STEPS: DeliveryStep[] = [
  { label: "In the Kitchen", status: "done" },
  { label: "Picked up by Driver", status: "done" },
  { label: "On the Way", status: "active" },
  { label: "Delivery on its Way", status: "pending" },
  { label: "Delivered", status: "pending" },
];

function StatusDot({ status }: { status: StepStatus }) {
  const color =
    status === "done"
      ? "bg-[#3ED598]"
      : status === "active"
        ? "bg-[#FFB62C]"
        : "bg-[#22272F]";
  return <div className={`h-3 w-3 rounded-full ${color}`} />;
}

function StatusRadio({ status }: { status: StepStatus }) {
  const ring =
    status === "done"
      ? "border-[#2A2F38] bg-[#3ED598]"
      : status === "active"
        ? "border-[#FFB62C] bg-[#FFB62C]"
        : "border-[#2A2F38] bg-white";
  return <div className={`h-5 w-5 rounded-full border ${ring}`} />;
}

export default function LiveMapPanel() {
  return (
    <div className="relative flex-1 overflow-hidden rounded-lg bg-white">
      {/* ── Map placeholder ──────────── */}
      <div className="flex h-full min-h-[500px] items-center justify-center bg-[#ddd]">
        <span className="font-body text-sm text-[#999]">
          Map view — integration pending
        </span>
      </div>

      {/* ── Order Status Overlay ─────── */}
      <div className="absolute left-6 top-6 w-[245px] rounded-lg bg-[#22272F] p-5 shadow-xl">
        <h3 className="font-body text-[15px] font-semibold text-white">
          Order Details
        </h3>

        <div className="mt-5 space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-[#2A2F38] bg-[#22272F] px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                {step.label === "Delivered" ? (
                  <span className="font-body text-[13px] font-semibold text-white">
                    ✓
                  </span>
                ) : (
                  <StatusDot status={step.status} />
                )}
                <span className="font-body text-[13px] font-semibold text-white">
                  {step.label}
                </span>
              </div>
              <StatusRadio status={step.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── ETA Badge ────────────────── */}
      <div className="absolute bottom-6 right-6 rounded bg-[#22272F] px-3 py-1">
        <span className="font-body text-xs font-semibold text-white">
          ETA: 15 mins
        </span>
      </div>
    </div>
  );
}
