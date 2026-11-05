import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

const REQUIRED_COLUMNS = [
  "Age",
  "Gender",
  "Hormonal Changes",
  "Family History",
  "Race/Ethnicity",
  "Body Weight",
  "Calcium Intake",
  "Vitamin D Intake",
  "Physical Activity",
  "Smoking",
  "Alcohol Consumption",
  "Medical Conditions",
  "Medications",
  "Prior Fractures",
];

interface CsvUploadProps {
  onPredict: (rows: Record<string, string>[]) => void;
}

export default function CsvUpload({ onPredict }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const processFile = useCallback((file: File) => {
    setError(null);
    setRows([]);
    setColumns([]);
    setFileName(null);

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (!results.data.length) {
          setError("CSV file is empty.");
          return;
        }

        const csvCols = results.meta.fields ?? Object.keys(results.data[0]);
        const missing = REQUIRED_COLUMNS.filter(
          (c) => !csvCols.map((h) => h.trim()).includes(c)
        );

        if (missing.length > 0) {
          setError(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
          return;
        }

        setFileName(file.name);
        setColumns(csvCols);
        setRows(results.data);
      },
      error() {
        setError("Failed to parse CSV file.");
      },
    });
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const previewRows = rows.slice(0, 5);
  const previewCols = columns.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
          dragOver
            ? "border-[#0077B6] bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#0077B6]/50"
        }`}
      >
        <Upload
          size={36}
          className={`${dragOver ? "text-[#0077B6]" : "text-gray-400 dark:text-gray-500"}`}
        />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          <span className="font-semibold text-[#0077B6]">Click to upload</span> or drag and
          drop your CSV file
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">.csv files only</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File info + preview */}
      {fileName && rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <FileSpreadsheet size={20} className="text-green-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {rows.length} row{rows.length !== 1 ? "s" : ""} &middot; {columns.length}{" "}
                columns
              </p>
            </div>
            <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {previewCols.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  {columns.length > 8 && (
                    <th className="px-3 py-2 text-left font-semibold text-gray-400 dark:text-gray-500">
                      +{columns.length - 8} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {previewRows.map((row, i) => (
                  <tr
                    key={i}
                    className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {previewCols.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[140px] truncate"
                      >
                        {row[col] ?? ""}
                      </td>
                    ))}
                    {columns.length > 8 && <td className="px-3 py-2 text-gray-400">…</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 text-center">
                Showing 5 of {rows.length} rows
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={() => onPredict(rows)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#0077B6] hover:bg-[#005f8f] text-white font-medium text-sm transition-colors duration-200 shadow-sm"
          >
            Upload &amp; Predict All
          </button>
        </div>
      )}
    </div>
  );
}
