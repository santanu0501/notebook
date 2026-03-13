"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useHabitStore } from "@/store/habitStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, BookOpen } from "lucide-react";

export function JournalEditor() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    if (!content.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Call Server Action
      const { saveJournalEntry } = await import("@/app/actions/journal");
      const result = await saveJournalEntry(content);
      
      if (result.success) {
        setContent("");
      }
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm h-full flex flex-col group relative overflow-hidden transition-colors hover:border-border/80">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-3 pt-4 px-6 relative z-10 flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-semibold tracking-tight whitespace-nowrap">
            Daily Journal
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            {mounted ? format(new Date(), "MMMM d, yyyy") : "Loading date..."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative z-10 flex flex-col group/editor">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today? Reflect on your progress..."
          className="w-full flex-1 resize-none border-0 focus-visible:ring-0 md:text-base px-6 py-5 rounded-none bg-transparent placeholder:text-muted-foreground/50 transition-colors pb-8"
        />
        
        {/* Floating Save Button */}
        {content.trim() && (
          <div className="absolute bottom-5 right-5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button 
              onClick={handleSave} 
              size="sm" 
              className="gap-2 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary),0.6)] rounded-lg h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
