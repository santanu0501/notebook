"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  onSuccess: () => void;
}

export function HabitVerificationModal({ isOpen, onOpenChange, habitName, onSuccess }: HabitVerificationModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorComment, setErrorComment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setErrorComment(null); // Reset error on new photo
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!image) return;

    setIsVerifying(true);
    setErrorComment(null);
    try {
      const { verifyHabitImage } = await import("@/app/actions/habits");
      
      // Pass the entire data URL (which includes mime type)
      const dataUrl = image;
      
      const result = await verifyHabitImage(habitName, dataUrl);
      
      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setImage(null);
      } else {
        setErrorComment(result.comment || "Failed to verify image.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setErrorComment("Something went wrong verifying the image. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (!isVerifying) {
        onOpenChange(val);
        if (!val) setImage(null);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prove It.</DialogTitle>
          <DialogDescription>
            You want to complete <strong>{habitName}</strong>? Upload a photo proving it. The AI is watching.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={isVerifying}
          />
          
          {errorComment && (
            <div className="w-full p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium min-h-[40px] flex items-start gap-2">
              <span className="text-xl">🤖</span>
              <p className="flex-1 mt-0.5">{errorComment}</p>
            </div>
          )}

          {image ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/40 bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Habit proof" className="object-cover w-full h-full" />
              {!isVerifying && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" /> Retake
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-muted-foreground gap-3"
            >
              <div className="p-4 rounded-full bg-muted/50">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">Click to Take Photo or Upload</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={!image || isVerifying}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
              </>
            ) : "Verify & Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
