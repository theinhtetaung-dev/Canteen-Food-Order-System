import { cn } from "@user/lib/utils";

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
    <div className="flex gap-8 border-b border-gray-200 px-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {canteens.map((canteen) => {
        const isActive = activeCanteen === canteen.id;
        return (
          <button
            key={canteen.id}
            type="button"
            onClick={() => onChange(canteen.id)}
            className={cn(
              "whitespace-nowrap pb-3 text-sm font-semibold transition-all duration-300 relative",
              isActive
                ? "text-brand"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            {canteen.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-brand rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
