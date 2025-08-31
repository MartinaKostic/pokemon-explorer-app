type Props = {
  isOpen: boolean;
  operationType: "sorting" | "stat-filtering";
  onConfirm: () => void;
  onAddFilters?: () => void;
};

export function HeavyOperationDialog({
  isOpen,
  operationType,
  onConfirm,
  onAddFilters,
}: Props) {
  if (!isOpen) return null;

  const isStatFiltering = operationType === "stat-filtering";

  return (
    <div className="fixed inset-0 bg-slate-500/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Heavy Operation
          </h3>

          <p className="text-sm text-slate-600 mb-4">
            {isStatFiltering ? (
              <>
                This will search through all Pokemon data and can take a while
                to complete.
              </>
            ) : (
              <>
                Sorting all Pokemon without filters can take a while to
                complete.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-2 bg-yellow-500 text-slate-900 font-medium rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Continue Anyway
          </button>
          {onAddFilters && (
            <button
              onClick={onAddFilters}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Filters First
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
