"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface ImportResult {
  id: string;
  filename: string;
  total_rows: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
  created_at: string;
}

interface ParsedRow {
  email: string;
  name?: string;
  tags?: string[];
}

export function SubscriberImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseCSV = useCallback((text: string): ParsedRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const tagsIdx = headers.findIndex((h) => h.includes("tag"));

    if (emailIdx === -1) {
      throw new Error("CSV must have an 'email' column");
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const email = values[emailIdx];
      if (!email || !email.includes("@")) continue;

      rows.push({
        email,
        name: nameIdx >= 0 ? values[nameIdx] : undefined,
        tags: tagsIdx >= 0 && values[tagsIdx] ? values[tagsIdx].split(";") : undefined,
      });
    }

    return rows;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      setResult(null);
      setParseError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = parseCSV(text);
          setParsedData(parsed);
          if (parsed.length === 0) {
            setParseError("No valid email addresses found in the file");
          }
        } catch (err: any) {
          setParseError(err.message || "Failed to parse file");
          setParsedData([]);
        }
      };
      reader.readAsText(f);
    },
    [parseCSV]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.name.endsWith(".csv") || f.name.endsWith(".txt"))) {
        handleFile(f);
      } else {
        setParseError("Please upload a CSV file");
      }
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    try {
      const res = await apiClient.post("/admin/newsletter/subscribers/import", {
        data: parsedData,
        filename: file?.name || "import.csv",
        source: "csv_import",
      });
      setResult(res as ImportResult);
      setParsedData([]);
      setFile(null);
    } catch (err: any) {
      setParseError(err?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    setParseError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4">Import Subscribers</h3>

          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {result.failed === 0 ? (
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-medium">Import Complete</p>
                  <p className="text-xs text-muted-foreground">
                    {result.imported} imported, {result.failed} failed out of{" "}
                    {result.total_rows} rows
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Errors:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <div
                        key={i}
                        className="text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded"
                      >
                        Row {err.row}: {err.email} - {err.error}
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ...and {result.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={reset} variant="outline">
                Import More
              </Button>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border"
                )}
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
                <p className="text-sm font-medium">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV should have columns: email (required), name, tags
                </p>
              </div>

              {parseError && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  {parseError}
                </div>
              )}

              {file && parsedData.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {parsedData.length} subscribers
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      Remove
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium">
                              Email
                            </th>
                            <th className="text-left px-4 py-2 font-medium">
                              Name
                            </th>
                            <th className="text-left px-4 py-2 font-medium">
                              Tags
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {parsedData.slice(0, 10).map((row, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2">{row.email}</td>
                              <td className="px-4 py-2 text-muted-foreground">
                                {row.name || "—"}
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">
                                {row.tags?.join(", ") || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedData.length > 10 && (
                      <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
                        ...and {parsedData.length - 10} more rows
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {parsedData.length} Subscribers
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-3">CSV Format Guide</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your CSV file should have the following columns:
          </p>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <p>email,name,tags</p>
            <p>john@example.com,John Doe,newsletter;updates</p>
            <p>jane@example.com,Jane Smith,newsletter</p>
            <p>bob@example.com,,</p>
          </div>
          <ul className="mt-4 text-sm text-muted-foreground space-y-1">
            <li>• <strong>email</strong> (required): Valid email address</li>
            <li>• <strong>name</strong> (optional): Subscriber's name</li>
            <li>• <strong>tags</strong> (optional): Semicolon-separated tags</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
