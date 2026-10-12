import { useState } from "react";
import { Flag, X } from "lucide-react";

interface ReportButtonProps {
  itemType: "post" | "comment" | "user" | "community";
  itemId: number;
}

const ReportButton = ({ itemType, itemId }: ReportButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    "Spam or misleading content",
    "Harassment or bullying",
    "Hate speech or symbols",
    "Violence or dangerous organizations",
    "Nudity or sexual activity",
    "False information",
    "Intellectual property violation",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/report_actions.php?action=submit_report",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reported_item_type: itemType,
            reported_item_id: itemId,
            reason: reason,
            description: description
          })
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        alert("Report submitted successfully. Our team will review it shortly.");
        setShowModal(false);
        setReason("");
        setDescription("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
        title="Report"
      >
        <Flag className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-gray-300 shadow-md max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Report {itemType}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Provide more context about this report..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-400 text-gray-600 rounded hover:bg-gray-100 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;