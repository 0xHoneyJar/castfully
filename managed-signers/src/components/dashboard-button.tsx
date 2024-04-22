import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardButton({
  children,
  onClick,
  isLoading,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}) {
  return (
    <>
      {isLoading ? (
        <Button onClick={onClick} disabled={true}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </Button>
      ) : (
        <Button onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      )}
    </>
  );
}
