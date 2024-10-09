import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { Input } from "../../../ui/input";
import type { ModelSchema, SettingsFieldProps } from "../types";
import type { ColumnDef } from "@tanstack/react-table"

import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table"
import { useEditor } from "@milkdown/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as z from "zod";
import llmModels from "../../../data/llm-models";
import { getModelListForInferenceProvider, type AIModelType } from "../../../lib/content-script/ai-models";
import type { InferenceProviderType, PromptApiOptions, PromptTokenUsage } from "../../../lib/worker/llm/interfaces";

import { CheckCheck, FlaskConical, MessageCircleWarning, MoreHorizontal, PlusIcon, Trash, Trash2 } from "lucide-react"
 
import { Button } from "../../../ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../ui/alert-dialog"

import { sendPrompt } from "../../../lib/content-script/prompt";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { LoadingSpinner } from "../../../ui/loading-spinner";
import { NewModelButton } from "./NewModelDialog";
import { transcribeInWorker } from "../../../lib/content-script/transcribe";
import { cat } from "@xenova/transformers";
import type { TranscriptionTask } from "../../../shared";
import { scrollDownMax } from "../../../lib/content-script/dom";
import { useLlmStreaming } from "../../../lib/content-script/llm";

export const models: Array<z.infer<typeof ModelSchema>> = []

const ModelCardUrlMap: {
  [key: string]: string;
} = {
  "openai": "https://platform.openai.com/docs/models",
  "anthropic": "https://docs.anthropic.com/en/docs/about-claude/models#model-names",
  "ollama": "https://ollama.com/models",
}

const getLabelForModelType = (type: AIModelType) => {
  switch (type) {
    case "embed":
      return "Embedding-Modell"
    case "tts":
      return "VoiceOver-Modell"
    case "stt":
      return "Transkriptions-Modell"
    default:
      return "Sprachmodell"
  }
}

export type AIModelEntry = { id: string, name: string, type: AIModelType }

export const LanguageModelsField = ({ form, mode, models }: SettingsFieldProps & { models: Array<AIModelEntry> }) => {

  const [isTesting, setIsTesting] = useState<z.infer<typeof ModelSchema>|null>(null)
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  const onPayloadReceived = useCallback((chunk: any) => {

    console.log("onPayloadReceived", chunk);

    if (chunk.id === currentPromptId) {

      if (chunk.finished) {
        console.log("finished testing", chunk);

        setIsTesting(null)
        toast.info("Sprachmodell erfolgreich getestet!", {
          duration: 5000,
          icon: (
            <CheckCheck className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
          ),
          style: {
            fontWeight: "normal",
          },
        });
      }

      if (chunk.error) {
        setIsTesting(null)
        toast.info(
          `Fehler beim Testen des Sprachmodells: ${chunk.error}`,
          {
            duration: 5000,
            icon: (
              <ExclamationTriangleIcon className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
            ),
            style: {
              fontWeight: "normal",
            },
          },
        );
      }
    }
  }, [currentPromptId]);


  const startPromptStreaming = useLlmStreaming({ name: "settings-test", onPayloadReceived });

  useEffect(() => {
    if (isTesting) {
      testModel(isTesting)
    }
  }, [isTesting])

  const testModel = useCallback((model: z.infer<typeof ModelSchema>) => {

    
    const apiOptionsOverrides: Partial<PromptApiOptions> = {};

    if (form.getValues().apiKey) {
      apiOptionsOverrides.apiKey = form.getValues().apiKey!;
    }

    if (form.getValues().baseURL) {
      apiOptionsOverrides.baseURL = form.getValues().baseURL!;
    }

    console.log("model type?", model.type)

    if (model.type === "tts") {

      console.log("TODO: Test VoiceOver TTS model", model)
      
    } else if (model.type === "stt") {

      // load test audio blob
      const blobUrl = chrome.runtime.getURL("data/OK.mp3")

      console.log("Test STT model", blobUrl)
      
      try {
        fetch(blobUrl).then(async(response) => {

          const blob = await response.blob()

          console.log("Fetched blob", blob)

          const transcription = await transcribeInWorker({
            blob, 
            codec: "mp3",
            prompt: "",
            providerType: form.getValues().inferenceProviderName,
            model: model.id,
            apiKey: form.getValues().apiKey!,
          } as TranscriptionTask);

          console.log("Transcription test result", transcription)

          // "OK", "Okay" etc.
          if (transcription.text && transcription.text.length >= 2) {

            toast.info("Transkriptions-Modell erfolgreich getestet!", {
              duration: 5000,
              icon: (
                <CheckCheck className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
              ),
              style: {
                fontWeight: "normal",
              },
            });
          } else {
            toast.info(
              `Fehler beim Testen des Transkriptions-Modells: Transkription nicht erfolgreich: "${transcription.text}"`,
              {
                duration: 5000,
                icon: (
                  <MessageCircleWarning className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
                ),
                style: {
                  fontWeight: "normal",
                },
              },
            );
          }
        })
      } catch (error) {
        console.log("Error fetching blob", error)
        toast.info(
          `Fehler beim Testen des Transkriptions-Modells: ${error}`,
          {
            duration: 5000,
            icon: (
              <ExclamationTriangleIcon className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
            ),
            style: {
              fontWeight: "normal",
            },
          },
        );
      } finally {
        setIsTesting(null)
      }
    } else if (model.type === "embed") {

      console.log("TODO: Test embedding model", model)

    } else {
      const promptId = `test-prompt-${Date.now()}`
      setCurrentPromptId(promptId);
      startPromptStreaming(
        {
          id: promptId,
          model: model.id,
          provider: form.getValues().inferenceProviderName,
          inferenceProvider: form.getValues().inferenceProviderName,
          text: "MUST ONLY answer with: 'OK'.",
          apiOptionsOverrides
        }
      )
    }
  }, [form, startPromptStreaming])

  const onTestModelClick = useCallback((model: z.infer<typeof ModelSchema>) => {
    console.log("test model", model)
    
    setIsTesting(model)

  }, [form])

  const onRemoveModelClick = useCallback((model: z.infer<typeof ModelSchema>) => {
    console.log("remove model", model)

    const models = form.getValues().models.filter((_model) => _model.id !== model.id)

    form.setValue("models", models)
    setData(models)
  }, [form])

  const [columns, setColumns] = useState<Array<ColumnDef<z.infer<typeof ModelSchema>>>>([])

  const onModelAdded = useCallback((model: z.infer<typeof ModelSchema>) => {
    console.log("model added", model)

    const newModels = form.getValues().models.concat(model)
    form.setValue("models", newModels)
    setData(newModels)
  }, [form])

  useEffect(() => {
    setColumns([
      {
        accessorKey: "id",
        size: 150,
        header: () => {
          return (
            <span className="ab-flex ab-flex-row ab-justify-start ab-items-center ab-text-sm">
              Modell-ID
            </span>
          )
        },
        cell: ({ row }) => {
          return <div className="ab-font-mono ab-text-sm">{row.getValue("id")}</div>
        },
      },
      {
        accessorKey: "name",
        size: 200,
        header: () => {
          return (
            <span className="ab-flex ab-flex-row ab-justify-start ab-items-center ab-text-sm">
              Anzeigename
            </span>
          )
        },
      },
      {
        accessorKey: "type",
        size: 200,
        header: () => {
          return (
            <span className="ab-flex ab-flex-row ab-justify-start ab-items-center ab-text-sm">
              Typ
            </span>
          )
        },
        cell: ({ row }) => {
          return getLabelForModelType(row.getValue("type"))
        },
      },
      {
        id: "actions",
        header: () => {
          return (
            <span className="ab-flex ab-flex-row ab-justify-end ab-items-center">
              <NewModelButton form={form} containerEl={ref.current} mode={mode} onSave={onModelAdded}/>
            </span>
          )
        },
        cell: ({ row }) => {
          const rowData = row.original
    
          return (
            <span className="ab-flex ab-flex-row ab-justify-end ab-items-center">
              <Button variant="outline" className="ab-h-8 ab-p-0 !ab-mr-2" onClick={() => onTestModelClick(rowData)}>
                {(isTesting && isTesting.id === rowData.id) ? <LoadingSpinner className="ab-shrink-0 ab-w-4 ab-h-4 ab-mr-2" /> : 
                  <FlaskConical className="ab-shrink-0 ab-h-4 ab-w-4 ab-mr-2" />}
                <span className="ab-text-sm">Testen</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger>
                  <Button variant="outline" className="ab-h-8 ab-p-0 ab-border-red-700">
                    <Trash2 className="ab-shrink-0 ab-h-4 ab-w-4 ab-text-red-700" />
                  </Button>
                </AlertDialogTrigger>
          
                <AlertDialogContent className="!ab-ftr-bg-contrast ab-z-[2147483641]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Wirklich Löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Das KI-Modell kann anschließend nur manuell wieder hinzugefügt werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemoveModelClick(rowData)}>Ja, löschen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>    
            </span>
          )
        },
      }
    ])
  }, [isTesting])

  const [inferenceProviderName, setInferenceProviderName] = useState<InferenceProviderType>(form.getValues().inferenceProviderName as InferenceProviderType)

  form.watch((data, { name, type }) => {
    if (name === "inferenceProviderName") {
      console.log("inferenceProviderName changed", data.inferenceProviderName)
      setInferenceProviderName(data.inferenceProviderName as InferenceProviderType);
    }
  });

  useEffect(() => { 
    if (mode === "update") return
    console.log("inferenceProviderName changed", inferenceProviderName)
    const knownModels = getModelListForInferenceProvider(inferenceProviderName as InferenceProviderType) || []
    setData(knownModels)
    form.setValue("models", knownModels)
  }, [inferenceProviderName, mode, form])

  const [data, setData] = useState(form.getValues().models);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  useEffect(() => {    
    console.log("models changed", models)
    if (mode === "update") {
      setData(models)
    }
  }, [models, mode, form])

  const ref = useRef<HTMLSpanElement>(null)

  return (
    <span ref={ref}>
     <FormLabel>🧠 KI-Modelle:</FormLabel>
      <FormDescription>
        Entfernen Sie oder fügen Sie die KI-Modelle hinzu, die im Modell-Selektor angezeigt werden sollen:{" "}
        <a
          href={ModelCardUrlMap[inferenceProviderName]}
          target="_blank"
          rel="noreferrer"
          className="ab-text-sm ab-cursor-pointer"
        >
          Unterstützte Modelle 🔗
        </a>
      </FormDescription>
      <Table className="ab-mt-4">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="ab-align-middle ab-text-sm !ab-h-8 !ab-p-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="ab-text-sm !ab-h-8 !ab-p-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="ab-h-24 ab-text-center ab-text-sm">
                Bisher keine Modelle konfiguriert. Fügen Sie ein KI-Modell hinzu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </span>
  )
}