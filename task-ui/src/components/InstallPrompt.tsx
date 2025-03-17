import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

const InstallPWA = () => {
  const [showDialog, setShowDialog] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt.current = e as any;
      setShowDialog(true);

      console.log("beforeinstallprompt event was fired.");
    });

    window.addEventListener("appinstalled", () => {
      setShowDialog(false);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
      window.removeEventListener("appinstalled", () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt.current) {
      (deferredPrompt.current as any).prompt();
      setShowDialog(false);
    }
  };

  return (
    <div>
      {/* Install PWA Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[90%] max-w-[95%] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold text-left">
              Install Redtra Task Manager
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-left">
              Click the button below to install Redtra Task Manager on your device.
            </p>
            <p className="text-sm text-muted-foreground text-left">
            Redtra Task Manager will be installed on your device and you can start using
              it immediately.
            </p>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={handleInstallClick}
            >
              <Download className="mr-2 h-4 w-4" /> Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstallPWA;