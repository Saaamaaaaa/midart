export default function ProgressBar({ progress = 0, markers = [], showPercent = false, className = '' }) {
  return (
    <div className={className}>
      <div className="relative w-full h-4 bg-gray-100 rounded-full border-2 border-gray-800 overflow-visible">
        {/* Progress fill */}
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />

        {/* Markers */}
        {markers.map((marker, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rounded-full cursor-pointer hover:scale-125 transition-transform group"
            style={{ left: `${marker.pos}%`, transform: 'translate(-50%, -50%)' }}
            title={`${marker.date} - ${marker.label}`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {marker.date} - {marker.label}
            </div>
          </div>
        ))}
      </div>

      {showPercent && (
        <div className="text-center mt-2 text-sm text-gray-600">
          {progress}%
        </div>
      )}
    </div>
  );
}
