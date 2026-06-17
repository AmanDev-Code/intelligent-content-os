"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AboutUsContent {
  seoTitle: string;
  seoDescription: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroEyebrow: string;
  mainContent: string;
  missionStatement: string;
  values: Array<{ title: string; description: string }>;
}

const DEFAULT_VALUES: AboutUsContent["values"] = [
  { title: "Transparency", description: "Clear pricing, honest roadmap, no dark patterns." },
  { title: "Ownership", description: "You own your content. Your examples stay yours." },
  { title: "Reliability", description: "99.9% delivery target, encrypted tokens, secure by default." },
  { title: "Creativity", description: "AI assists; humans create. We amplify your ideas." },
];

export function AboutUsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [edit, setEdit] = useState<Partial<AboutUsContent>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiClient.get("/admin/site-content/content/about_us")) as {
        key: string;
        content?: AboutUsContent;
        isDefault: boolean;
      };
      const content = (data?.content as AboutUsContent | undefined) ?? null;
      setEdit({
        seoTitle: content?.seoTitle ?? "",
        seoDescription: content?.seoDescription ?? "",
        heroHeadline: content?.heroHeadline ?? "",
        heroSubtitle: content?.heroSubtitle ?? "",
        heroEyebrow: content?.heroEyebrow ?? "",
        mainContent: content?.mainContent ?? "",
        missionStatement: content?.missionStatement ?? "",
        values: content?.values ?? DEFAULT_VALUES,
      });
      setIsDefault(data?.isDefault ?? true);
    } catch {
      toast.error("Failed to load About Us content");
      // Set defaults on error
      setEdit({
        seoTitle: "About Us | Trndinn",
        seoDescription: "Learn about Trndinn's mission, values, and the team building the future of social content creation.",
        heroHeadline: "Building the future of social content creation",
        heroSubtitle: "We're on a mission to help creators, brands, and teams publish with confidence—powered by AI that respects your voice and your data.",
        heroEyebrow: "About Trndinn",
        mainContent: "",
        missionStatement: "Helping creators publish with confidence—powered by AI that respects their voice.",
        values: DEFAULT_VALUES,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const merged: AboutUsContent = {
    seoTitle: edit.seoTitle ?? "",
    seoDescription: edit.seoDescription ?? "",
    heroHeadline: edit.heroHeadline ?? "",
    heroSubtitle: edit.heroSubtitle ?? "",
    heroEyebrow: edit.heroEyebrow ?? "",
    mainContent: edit.mainContent ?? "",
    missionStatement: edit.missionStatement ?? "",
    values: edit.values ?? DEFAULT_VALUES,
  };

  const dirty =
    edit.seoTitle !== undefined ||
    edit.seoDescription !== undefined ||
    edit.heroHeadline !== undefined ||
    edit.heroSubtitle !== undefined ||
    edit.heroEyebrow !== undefined ||
    edit.mainContent !== undefined ||
    edit.missionStatement !== undefined ||
    edit.values !== undefined;

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/admin/site-content/content/about_us", {
        content: merged,
      });
      toast.success("About Us page saved");
      setEdit({});
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset About Us page to default content? Your custom edits will be discarded.")) return;
    try {
      await apiClient.post("/admin/site-content/content/about_us/reset", {});
      toast.success("Reset to default");
      setEdit({});
      await load();
    } catch {
      toast.error("Reset failed");
    }
  };

  const updateValue = (index: number, field: "title" | "description", value: string) => {
    const newValues = [...(edit.values ?? merged.values)];
    newValues[index] = { ...newValues[index], [field]: value };
    setEdit((e) => ({ ...e, values: newValues }));
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              About Us Page
              {isDefault ? (
                <Badge variant="outline">built-in default</Badge>
              ) : (
                <Badge variant="secondary">customized</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Edit content for the public About Us page. All fields support markdown.
              <Link
                href="/about-us"
                target="_blank"
                className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
              >
                preview <ExternalLink className="h-3 w-3" />
              </Link>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SEO Section */}
        <div className="rounded-lg border border-border/60 p-4">
          <h3 className="mb-4 font-display text-sm font-semibold">SEO Metadata</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="seoTitle">Page Title</Label>
              <Input
                id="seoTitle"
                value={merged.seoTitle}
                onChange={(e) => setEdit((p) => ({ ...p, seoTitle: e.target.value }))}
                placeholder="About Us | Trndinn"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <Textarea
                id="seoDescription"
                rows={2}
                value={merged.seoDescription}
                onChange={(e) => setEdit((p) => ({ ...p, seoDescription: e.target.value }))}
                placeholder="Brief description for search engines"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="rounded-lg border border-border/60 p-4">
          <h3 className="mb-4 font-display text-sm font-semibold">Hero Section</h3>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="heroEyebrow">Eyebrow Label</Label>
              <Input
                id="heroEyebrow"
                value={merged.heroEyebrow}
                onChange={(e) => setEdit((p) => ({ ...p, heroEyebrow: e.target.value }))}
                placeholder="e.g., About Trndinn"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="heroHeadline">Headline</Label>
              <Input
                id="heroHeadline"
                value={merged.heroHeadline}
                onChange={(e) => setEdit((p) => ({ ...p, heroHeadline: e.target.value }))}
                placeholder="Main headline for the page"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="heroSubtitle">Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                rows={2}
                value={merged.heroSubtitle}
                onChange={(e) => setEdit((p) => ({ ...p, heroSubtitle: e.target.value }))}
                placeholder="Supporting subtitle text"
              />
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="rounded-lg border border-border/60 p-4">
          <h3 className="mb-4 font-display text-sm font-semibold">Mission Statement</h3>
          <div className="space-y-1.5">
            <Label htmlFor="missionStatement">Mission Statement</Label>
            <Textarea
              id="missionStatement"
              rows={2}
              value={merged.missionStatement}
              onChange={(e) => setEdit((p) => ({ ...p, missionStatement: e.target.value }))}
              placeholder="Short mission statement displayed prominently"
            />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="rounded-lg border border-border/60 p-4">
          <h3 className="mb-4 font-display text-sm font-semibold">Main Content (Markdown)</h3>
          <div className="space-y-1.5">
            <Label htmlFor="mainContent">Body Content</Label>
            <Textarea
              id="mainContent"
              rows={16}
              className="font-mono text-xs leading-relaxed"
              value={merged.mainContent}
              onChange={(e) => setEdit((p) => ({ ...p, mainContent: e.target.value }))}
              placeholder="## Our Story

Write your main content here using Markdown formatting..."
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown: headings, lists, bold, italics, links. Use {"##"} for section headings.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="rounded-lg border border-border/60 p-4">
          <h3 className="mb-4 font-display text-sm font-semibold">Values</h3>
          <div className="space-y-4">
            {(edit.values ?? merged.values).map((value, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-border/40 p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`value-title-${index}`}>Title</Label>
                  <Input
                    id={`value-title-${index}`}
                    value={value.title}
                    onChange={(e) => updateValue(index, "title", e.target.value)}
                    placeholder="e.g., Transparency"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`value-desc-${index}`}>Description</Label>
                  <Textarea
                    id={`value-desc-${index}`}
                    rows={2}
                    value={value.description}
                    onChange={(e) => updateValue(index, "description", e.target.value)}
                    placeholder="Brief description of this value"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={!dirty || saving} className="cursor-pointer">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
          {!isDefault && (
            <Button variant="outline" onClick={reset} className="cursor-pointer">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset to default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
