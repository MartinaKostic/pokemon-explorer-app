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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Heavy Operation
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            {isStatFiltering ? (
              <>
                You're about to filter Pokemon by stats only, which means
                searching through all Pokemon. This will:
              </>
            ) : (
              <>
                You're about to sort all Pokemon without any filters, which
                requires processing a lot of data. This will:
              </>
            )}
          </p>

          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
              Take a while to complete
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
              Use more browser resources
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
              Process Pokemon in batches to stay stable
            </li>
          </ul>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">💡 Tip</p>
            <p className="text-sm text-blue-700">
              {isStatFiltering
                ? "Try adding type or generation filters to reduce the search scope."
                : "Try adding filters (type, generation, etc.) to reduce the dataset size."}
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Continue Anyway (Process all Pokemon)
          </button>
          {onAddFilters && (
            <button
              onClick={onAddFilters}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isStatFiltering
                ? "Add Type/Generation Filters First"
                : "Add Filters First"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
