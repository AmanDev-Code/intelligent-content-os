import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface MediaItem {
  id: string;
  title: string;
  visual_url: string;
  visual_type: string | null;
  created_at: string;
}

export default function Media() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMedia = async () => {
      const { data } = await supabase
        .from("generated_content")
        .select("id, title, visual_url, visual_type, created_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .not("visual_url", "is", null)
        .order("created_at", { ascending: false });
      setItems((data as MediaItem[] | null) ?? []);
      setLoading(false);
    };
    fetchMedia();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center border border-border max-w-lg mx-auto">
        <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="text-sm font-semibold mb-1">No media yet</h3>
        <p className="text-xs text-muted-foreground">
          Generate content with visuals to see them here.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden border border-border group">
          <div className="aspect-square relative">
            <img
              src={item.visual_url}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-2">
            <p className="text-xs font-medium truncate">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(item.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
