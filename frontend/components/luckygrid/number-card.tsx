interface NumberCardProps {
  number: number
  isSelected: boolean
  isPicked: boolean
  onClick: () => void
  disabled: boolean
  colorClass?: string
}

export default function NumberCard({ number, isSelected, isPicked, onClick, disabled, colorClass }: NumberCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative aspect-square rounded-lg font-bold text-lg
        ${colorClass ? colorClass : "bg-card"} 
        ${isPicked ? "bg-destructive/20 text-destructive border border-destructive/50 cursor-not-allowed" : ""}
        ${isSelected ? "border-2 border-primary scale-105 shadow-lg hover:scale-110 hover:animate-bounce" : ""}
        ${!isPicked && !isSelected ? "cursor-pointer transform transition duration-300 ease-out hover:scale-110 hover:animate-bounce" : ""}
        ${disabled && !isSelected ? "cursor-not-allowed opacity-60" : ""}
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        active:scale-95
      `}
    >
      {/* Number: hide when selected */}
      <span className={`flex items-center text-white justify-center h-full w-full transition-opacity duration-200 ${isSelected ? "opacity-0" : "opacity-100"}`}>
        {number}
      </span>

      {/* Checkmark appears when selected */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 animate-pulse text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Indicator for picked numbers */}
      {isPicked && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-destructive rounded-full" />
        </div>
      )}
    </button>
  )
}
