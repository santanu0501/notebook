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
  const { addJournalEntry } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    if (!content.trim()) return;
    addJournalEntry(content);
    setContent("");
  };

  return (
    <Card className="border-border/50 bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> 
              Daily Journal
            </CardTitle>
            <CardDescription>
              {mounted ? format(new Date(), "EEEE, MMMM do, yyyy") : "Loading date..."}
            </CardDescription>
          </div>
          <Button 
            onClick={handleSave} 
            size="sm" 
            disabled={!content.trim()}
            className="gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today? Reflect on your progress..."
          className="w-full h-full min-h-[250px] resize-none border-0 focus-visible:ring-0 md:text-base p-6 rounded-none bg-transparent"
        />
      </CardContent>
    </Card>
  );
}
