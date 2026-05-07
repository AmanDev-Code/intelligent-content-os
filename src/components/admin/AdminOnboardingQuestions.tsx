"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

type QuestionOption = {
  value: string;
  label: string;
  icon?: string;
};

type OnboardingQuestion = {
  id: string;
  step_number: number;
  question_text: string;
  question_key: string;
  options: QuestionOption[];
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type QuestionFormData = {
  step_number: number;
  question_text: string;
  question_key: string;
  options: QuestionOption[];
  is_required: boolean;
  is_active: boolean;
};

const emptyFormData: QuestionFormData = {
  step_number: 1,
  question_text: "",
  question_key: "",
  options: [{ value: "", label: "" }],
  is_required: true,
  is_active: true,
};

export function AdminOnboardingQuestions() {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<OnboardingQuestion | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(emptyFormData);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<OnboardingQuestion | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/onboarding/questions");
      setQuestions((res as { data: OnboardingQuestion[] }).data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const openCreateDialog = () => {
    const nextStep = questions.length > 0 ? Math.max(...questions.map((q) => q.step_number)) + 1 : 1;
    setEditingQuestion(null);
    setFormData({ ...emptyFormData, step_number: nextStep });
    setDialogOpen(true);
  };

  const openEditDialog = (question: OnboardingQuestion) => {
    setEditingQuestion(question);
    setFormData({
      step_number: question.step_number,
      question_text: question.question_text,
      question_key: question.question_key,
      options: question.options.length > 0 ? question.options : [{ value: "", label: "" }],
      is_required: question.is_required,
      is_active: question.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (!formData.question_key.trim()) {
      toast.error("Question key is required");
      return;
    }
    const validOptions = formData.options.filter((o) => o.value.trim() && o.label.trim());
    if (validOptions.length === 0) {
      toast.error("At least one option with value and label is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        options: validOptions,
      };

      if (editingQuestion) {
        await apiClient.put(`/admin/onboarding/questions/${editingQuestion.id}`, payload);
        toast.success("Question updated");
      } else {
        await apiClient.post("/admin/onboarding/questions", payload);
        toast.success("Question created");
      }

      setDialogOpen(false);
      loadQuestions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;

    try {
      setSaving(true);
      await apiClient.delete(`/admin/onboarding/questions/${questionToDelete.id}`);
      toast.success("Question deleted");
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
      loadQuestions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (question: OnboardingQuestion) => {
    try {
      await apiClient.patch(`/admin/onboarding/questions/${question.id}`, {
        is_active: !question.is_active,
      });
      toast.success(question.is_active ? "Question deactivated" : "Question activated");
      loadQuestions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update question");
    }
  };

  const handleMoveUp = async (question: OnboardingQuestion) => {
    const currentIndex = questions.findIndex((q) => q.id === question.id);
    if (currentIndex <= 0) return;

    const prevQuestion = questions[currentIndex - 1];
    const orders = [
      { id: question.id, step_number: prevQuestion.step_number },
      { id: prevQuestion.id, step_number: question.step_number },
    ];

    try {
      await apiClient.post("/admin/onboarding/questions/reorder", { orders });
      loadQuestions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder");
    }
  };

  const handleMoveDown = async (question: OnboardingQuestion) => {
    const currentIndex = questions.findIndex((q) => q.id === question.id);
    if (currentIndex >= questions.length - 1) return;

    const nextQuestion = questions[currentIndex + 1];
    const orders = [
      { id: question.id, step_number: nextQuestion.step_number },
      { id: nextQuestion.id, step_number: question.step_number },
    ];

    try {
      await apiClient.post("/admin/onboarding/questions/reorder", { orders });
      loadQuestions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder");
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { value: "", label: "" }],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, field: "value" | "label", value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""} configured
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No questions configured yet. Add your first question to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead className="text-center">Options</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question.id} className={!question.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="tabular-nums">{question.step_number}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => handleMoveUp(question)}
                            disabled={index === 0}
                            className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(question)}
                            disabled={index === questions.length - 1}
                            className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {question.question_text}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {question.question_key}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {question.options.length}
                    </TableCell>
                    <TableCell className="text-center">
                      {question.is_required ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={question.is_active}
                        onCheckedChange={() => handleToggleActive(question)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setQuestionToDelete(question);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question details below."
                : "Fill in the details for the new onboarding question."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="step_number">Step Number</Label>
                <Input
                  id="step_number"
                  type="number"
                  min={1}
                  value={formData.step_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step_number: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question_key">Question Key</Label>
                <Input
                  id="question_key"
                  placeholder="e.g., role, goal, teamSize"
                  value={formData.question_key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      question_key: e.target.value.replace(/\s/g, "_"),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier used in code (no spaces)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Input
                id="question_text"
                placeholder="e.g., Who are you?"
                value={formData.question_text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question_text: e.target.value }))
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Value (e.g., founder)"
                      value={option.value}
                      onChange={(e) => updateOption(index, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Label (e.g., Founder / Entrepreneur)"
                      value={option.label}
                      onChange={(e) => updateOption(index, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={formData.options.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_required: checked }))
                  }
                />
                <Label htmlFor="is_required">Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingQuestion ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{questionToDelete?.question_text}&quot;? This
              will also delete all user responses to this question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
