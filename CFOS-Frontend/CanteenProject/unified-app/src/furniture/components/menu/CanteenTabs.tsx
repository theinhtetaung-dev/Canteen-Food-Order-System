import { cn } from "@furniture/lib/utils";

interface CanteenTabsProps {
  activeCanteen: number;
  onChange: (canteen: number) => void;
}

const canteens = [
  { id: 1, label: "Canteen 1" },
  { id: 2, label: "Canteen 2" },
];

export function CanteenTabs({ activeCanteen, onChange }: CanteenTabsProps) {
  return (
    <div className="flex justify-center gap-4">
      {canteens.map((canteen) => {
        const isActive = activeCanteen === canteen.id;
        return (
          <button
            key={canteen.id}
            type="button"
            onClick={() => onChange(canteen.id)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300",
              isActive
                ? "bg-brand text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand",
            )}
          >
            {canteen.label}
          </button>
        );
      })}
    </div>
  );
}
