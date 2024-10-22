import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  VerticalResizeHandle,
} from "../../ui/resizable";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { getElementSelectionStore } from "../../lib/content-script/stores/use-element-selector";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MarkdownEditor } from "../MarkdownEditor";
import AudioPlayer from "../../ui/audio-player";
import {
  audioBufferToWav,
  blobToAudioBuffer,
  getAudioMetadata,
  processAudioBufferWithBandpass,
  sliceAudioBufferAtPauses,
} from "../../lib/audio-dsp";
import { Badge } from "../../ui/badge";
import { filterForVisibleElements } from "../../lib/content-script/element";
import { prefPerPage } from "../../lib/content-script/prefs";
import { formatDuration } from "../../lib/content-script/format";
import { Mic2Icon, PauseCircleIcon, PlayIcon } from "lucide-react";
import type { InferenceProviderType, SlicedAudioWavs } from "../../shared";
import { transcribeInWorker } from "../../lib/content-script/transcribe";
import { AiModelDropdown, type ModelPreference } from "../AiModelDropdown";
import type { InferenceProvider } from "../settings/types";
import { inferenceProvidersDbState } from "../settings/db";
import { db } from "../../lib/content-script/db";
import { toast } from "sonner";
import { getSupportedCodecs } from "../../lib/content-script/codec";
import { useMessageChannelContext } from "../../message-channel";

interface HTMLMediaElementWithCaptureStream extends HTMLMediaElement {
  captureStream(): MediaStream;
}

const modelPkStateDb = db<ModelPreference>("transcriptionModelPk");

async function downloadMediaAsBlob(videoElement: HTMLVideoElement) {
  try {
    const sources = videoElement.getElementsByTagName("source");
    let mediaUrl = null;

    for (const source of Array.from(sources)) {
      if (source.type && videoElement.canPlayType(source.type) !== "") {
        mediaUrl = source.src;
        break;
      }
    }

    if (!mediaUrl) {
      mediaUrl = videoElement.src;
    }

    // need to stream it...
    if (mediaUrl.startsWith("blob:")) {
      return null;
    }

    if (!mediaUrl) {
      throw new Error("No valid media source found.");
    }
    const response = await fetch(mediaUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("There was an error!", error);
  }
}

const printDouble = (value: string) => {
  if (value.length === 1) {
    return `0${value}`;
  }
  return value;
};

export const TranscriptionLayout = () => {
  const audioPlayerContainerRef = useRef<any>();
  const mediaElContainerRef = useRef<any>();
  const audioPlayerStatusRef = useRef<any>();
  const videoEl$ = getElementSelectionStore();
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBufferSlices, setAudioBufferSlices] = useState<
    Array<AudioBuffer>
  >([]);
  const [audioBufferBlobs, setAudioBufferBlobs] = useState<SlicedAudioWavs>([]);
  const [editorValue, setEditorValue] = useState<string>("");
  const [selectedMediaElement, setSelectedMediaElement] =
    useState<HTMLMediaElement | null>(null);
  const [mediaElements, setMediaElements] = useState<Array<HTMLMediaElement>>(
    [],
  );
  const [audioBlob, setAudioBlob] = useState<Blob>();
  const [isLiveTranscriptionRunning, setIsLiveTranscriptionRunning] =
    useState<boolean>(false);
  const [elapsedTimes, setElapsedTimes] = useState<
    Array<{ index: number; mins: number; secs: number }>
  >([]);
  const [indexesTranscribing, setIndexesTranscribing] = useState<Array<number>>(
    [],
  );
  const [isTranscriptionRunning, setIsTranscriptionRunning] =
    useState<boolean>(false);
  const [inferenceProviders, setInferenceProviders] = useState<Array<InferenceProvider>>([]);
  const [modelPk, setModelPk] = useState<ModelPreference>();
  const [supportedCodecs] = useState(
    getSupportedCodecs()
      .flatMap(codec => codec.fileExtensions)
  );
  const messageChannelApi = useMessageChannelContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEncoding, setIsEncoding] = useState<boolean>(false);

  // New state to track the status of each wavBlob
  const [transcriptionStatuses, setTranscriptionStatuses] = useState<Array<'not_started' | 'transcribing' | 'done' | 'error'>>([]);

  // New state to track the start time for recording
  const [startTime, setStartTime] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);

  const onToggleMute = useCallback((isMuted: boolean) => {
    setMuted(isMuted);
    if (selectedMediaElement) {
      selectedMediaElement.muted = isMuted
    }
  }, [selectedMediaElement]);

  useEffect(() => {
    console.log("supportedCodecs", supportedCodecs);
    (async () => {
      console.log("loading inference providers");
      const inferenceProviders: Array<InferenceProvider> = (await inferenceProvidersDbState.get()).sort((a, b) => a.name.localeCompare(b.name));
      setInferenceProviders(inferenceProviders);
      console.log("DONE loading inference providers", inferenceProviders);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const storedModelPk = await modelPkStateDb.get();
      console.log("loading inference providers storedModelPk", storedModelPk);
      setModelPk(storedModelPk);
    })();
  }, []);

  const setInternalModelPk = useCallback(
    (value: ModelPreference) => {
      (async () => {
        setModelPk((prev) => {
          if (prev !== value) {
            setTranscriptionStatuses([]); // Reset transcription statuses when model changes
            return value;
          }
          return prev;
        });
        await modelPkStateDb.set(value);
      })();
    },
    [],
  );

  const onFindVisibleMediaElements = useCallback(() => {
    const mediaElementsPref = prefPerPage<Array<string>>("mediaElements", []);
    const mediaElementSelectors = mediaElementsPref.get();
    const mediaElements = mediaElementSelectors.map(
      (selector) => document.querySelector(selector) as HTMLMediaElement | null,
    );
    const visibleMediaElements = filterForVisibleElements(mediaElements).filter(
      (el) => el !== null,
    ) as HTMLMediaElement[];
    setMediaElements(visibleMediaElements);
  }, []);

  const onTranscribe = useCallback((e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (audioPlayerContainerRef.current && audioPlayerStatusRef.current) {
        audioPlayerContainerRef.current.classList.add("ab-hidden");

        audioPlayerStatusRef.current.innerHTML = "Loading audio file...";
        audioPlayerStatusRef.current.classList.remove("ab-hidden");
      }
      setAudioBufferBlobs([]);
      setElapsedTimes([]);
      setIndexesTranscribing([]);
      setTranscriptionStatuses([]); // Reset transcription statuses

      setAudioFile(file);
    }
  }, []);

  useEffect(() => {
    if (!audioFile) {
      console.log("no audio file");
      return;
    }

    (async () => {
      console.log("audioFile", audioFile);

      try {
        setIsProcessing(true);
        const metaData = await getAudioMetadata(audioFile);

        console.log("metaData", metaData);

        console.log("processing audio... (slicing)");

        // load test audio blob
        const waitingSpeechAudioBlobUrl = chrome.runtime.getURL("data/audio_file_processing_de.mp3");
        const waitingSpeechAudioBlob = await (await fetch(waitingSpeechAudioBlobUrl)).blob();

        const wavBlobs: SlicedAudioWavs = await messageChannelApi.sendCommand("process-transcription-audio", {
          audioFile,
          metaData,
          waitingSpeechAudioBlob,
        });

          //setIsEncoding(true);

            /*
            console.time("encodeToOgg");
            // Run encoding in parallel
            const oggBlobs = await Promise.all(wavBlobs.map(async (wavBlob) => {
              const oggBlob = await encodeToOgg({
                blob: wavBlob.blob,
                duration: wavBlob.duration,
                bitrate: 48000, 
              });
              console.log("oggBlob", oggBlob);
              return oggBlob;
            }));

            console.timeEnd("encodeToOgg");
            */
            //setIsEncoding(false);
            
            //console.log("oggBlobs", oggBlobs);
            /*
            setAudioBufferBlobs(wavBlobs.map(wavBlob => ({
              ...wavBlob,
              blob: oggBlobs[wavBlobs.indexOf(wavBlob)],
              fileType: "audio/ogg",
            }))); // Replace wavs with oggs
            */

        if (wavBlobs && Array.isArray(wavBlobs)) {
          setIsProcessing(false);
          console.log("encoding to ogg");
          setAudioBufferBlobs(wavBlobs);
          setTranscriptionStatuses(new Array(wavBlobs.length).fill('not_started')); // Initialize statuses
          console.log("done (slicing)", wavBlobs);
          console.log("wavBlobs", wavBlobs);
        } else {
          console.log("Failed to process audio file", wavBlobs);
          throw new Error("Failed to process audio file");
        }
      } catch (error) {
        console.error("Error processing audio file:", error);
        toast.error("Unable to transcribe audio data. Please check the file format and try again.");
      } finally {
        setIsProcessing(false);
        setIsEncoding(false);
      }
    })();
  }, [audioFile, messageChannelApi]);

  useEffect(() => {
    if (!mediaElContainerRef.current) return;

    if (videoEl$) {
      mediaElContainerRef.current!.innerHTML = "";
      const clonedEl = videoEl$.cloneNode(true) as HTMLElement;
      clonedEl.classList.add(
        "ab-w-full",
        "ab-h-full",
        "ab-relative",
        "ab-block",
      );
      mediaElContainerRef.current?.appendChild(clonedEl);
    }
  }, [videoEl$, mediaElContainerRef]);

  const onTranscribeSliceClick = useCallback(
    (blob: Blob, index: number, elapsedMins: number, elapsedSecs: number) => {
      let prevTranscription = "";
      return async () => {
        if (!modelPk) {
          console.error("No model selected");
          toast.error("No model selected. Please select a model.");
          return;
        }

        if (!inferenceProviders) {
          console.error("No inference providers found");
          toast.error("No inference providers found. Please check your settings.");
          return;
        }

        const activeInferenceProvider = inferenceProviders.find((ip) => ip.name === modelPk.providerName);

        if (!activeInferenceProvider) {
          console.log("No active inference provider found", modelPk.providerName, "inferenceProviders", inferenceProviders);
          toast.error("No active inference provider found. Please check your settings.");
          return;
        }

        setIsTranscriptionRunning(true);
        setIndexesTranscribing((indexesTranscribing) => {
          return [...indexesTranscribing, index - 1];
        });

        // Update status to transcribing
        setTranscriptionStatuses((statuses) => {
          const newStatuses = [...statuses];
          newStatuses[index - 1] = 'transcribing';
          return newStatuses;
        });

        console.log("transcribe slice", blob);
        console.log("transcribe with activeInferenceProvider", activeInferenceProvider);
        console.log("transcribe with modelPk", modelPk);

        try {
          const transcription = await transcribeInWorker({
            blob,
            prompt: prevTranscription,
            apiKey: activeInferenceProvider?.apiKey,
            model: modelPk?.model,
            codec: "wav", // it's decoded by this time
            providerType: activeInferenceProvider.inferenceProviderName as InferenceProviderType,
          }, messageChannelApi);

          console.log("done transcribe slice", transcription);

          // buffer
          prevTranscription = transcription.text;

          const newElapsedTimes = [
            ...elapsedTimes,
            { index, mins: elapsedMins, secs: elapsedSecs },
          ];

          setElapsedTimes(newElapsedTimes);

          const prevElapedTime:
            | { index: number; mins: number; secs: number }
            | undefined = newElapsedTimes[index - 2];

          setIndexesTranscribing((indexesTranscribing) =>
            indexesTranscribing.filter((i) => i !== index - 1),
          );

          setEditorValue(
            (editorValue) =>
              `${editorValue}\n\n${index}. ${prevElapedTime ? `${printDouble(prevElapedTime.mins.toFixed(0))}:${printDouble(prevElapedTime.secs.toFixed(0))} -` : "0:00 -"} ${printDouble(
                elapsedMins.toFixed(0),
              )}:${printDouble(elapsedSecs.toFixed(0))} - ${transcription.text}`,
          );

          // Update status to done
          setTranscriptionStatuses((statuses) => {
            const newStatuses = [...statuses];
            newStatuses[index - 1] = 'done';
            return newStatuses;
          });

          setIsTranscriptionRunning(false);
        } catch (error) {
          console.error("Error transcribing slice:", error);
          toast.error("Error transcribing slice. Please try again.");

          // Update status to error
          setTranscriptionStatuses((statuses) => {
            const newStatuses = [...statuses];
            newStatuses[index - 1] = 'error';
            return newStatuses;
          });

          setIsTranscriptionRunning(false);
        }
      };
    },
    [elapsedTimes, modelPk, inferenceProviders, messageChannelApi],
  );

  const onTranscribeAll = useCallback(async () => {
    for (let i = 0; i < audioBufferBlobs.length; i++) {
      const blob = audioBufferBlobs[i];
      const elapsedTime = audioBufferBlobs.reduce(
        (acc, blob, index) => {
          if (index <= i) {
            return acc + blob.duration;
          }
          return acc;
        },
        0,
      );
      const elapsedMins = Math.floor(elapsedTime / 60);
      const elapsedSecs = Math.floor(elapsedTime % 60);

      await onTranscribeSliceClick(blob.blob, i + 1, elapsedMins, elapsedSecs)();
    }
  }, [audioBufferBlobs, onTranscribeSliceClick]);

  const onSelectMediaElement = useCallback(
    (e: any) => {
      const selectedIndex = e.target.selectedIndex;

      console.log("selected!", selectedIndex, mediaElements[selectedIndex]);
      setSelectedMediaElement(mediaElements[selectedIndex]);
    },
    [mediaElements],
  );

  useEffect(() => {
    if (selectedMediaElement) {
      console.log("selected media element", selectedMediaElement);
    }

    if (!selectedMediaElement) {
      // default select
      setSelectedMediaElement(mediaElements[0]);
    }
  }, [selectedMediaElement]);

  useEffect(() => {
    onFindVisibleMediaElements();

    // default select
    if (mediaElements[0]) {
      setSelectedMediaElement(mediaElements[0]);
    }

    setTimeout(() => {
      onFindVisibleMediaElements();
    }, 1000);
  }, []);

  const onPauseLiveTranscription = useCallback(() => {
    if (selectedMediaElement) {
      setIsLiveTranscriptionRunning(false);
      selectedMediaElement.pause();
    }
  }, [selectedMediaElement]);

  const onStartLiveTranscription = useCallback(() => {
    if (selectedMediaElement) {
      console.log("transcribe media element", selectedMediaElement);

      setAudioBufferBlobs([]);
      setElapsedTimes([]);
      setIndexesTranscribing([]);

      let isPlaying =
        !selectedMediaElement.paused && selectedMediaElement.currentTime > 0;

      if (isPlaying) {
        selectedMediaElement.pause();
        isPlaying = false;
      }

      if (!isPlaying) {
        selectedMediaElement.muted = muted;
        selectedMediaElement.currentTime = startTime * 60; // Use the selected start time
        selectedMediaElement.play();
      }

      setIsLiveTranscriptionRunning(true);

      console.log("trying to download media as blob");
      (async () => {
        const blob = await downloadMediaAsBlob(
          selectedMediaElement as HTMLVideoElement,
        );

        if (blob !== null) {
          console.log("got a blob!", blob);
        } else {
          if ("captureStream" in selectedMediaElement) {
            const stream = (
              selectedMediaElement as HTMLMediaElementWithCaptureStream
            ).captureStream();
            const audioTracks = stream.getAudioTracks();
            const audioStream = new MediaStream(audioTracks);
            let secondsPassed = 0;
            console.log("audioBuffer", audioTracks);
            console.log("audioStream", audioStream);

            const recorder = new MediaRecorder(audioStream, {
              bitsPerSecond: 128000,
              mimeType: "audio/webm; codecs=opus",
              audioBitsPerSecond: 128000,
            });
            const audioChunks: Array<Blob> = [];

            recorder.ondataavailable = (e: BlobEvent) => {
              secondsPassed++;
              audioChunks.push(e.data);

              // temporary result
              console.log("Recording chunk data available");
              const audioBlob = new Blob(audioChunks, {
                type: recorder.mimeType,
              });
              setAudioBlob(audioBlob);
            };

            recorder.onstop = () => {
              const audioBlob = new Blob(audioChunks, {
                type: recorder.mimeType,
              });
              console.log("Recording stopped, blob created", audioBlob);
              (async () => {
                const sizeInMb = audioBlob.size / 1024 / 1024;

                if (sizeInMb > 0.1 || secondsPassed > 1) {
                  try {
                    const audioBuffer = await blobToAudioBuffer(audioBlob);
                    console.log("Audio buffer set", audioBlob, audioBuffer);
                    if (audioPlayerStatusRef.current) {
                      audioPlayerStatusRef.current.innerHTML =
                        "Applying band-pass filter...";
                    }
                    console.log("Applying band-pass filter...");

                    const audioBufferFiltered =
                      await processAudioBufferWithBandpass(audioBuffer);

                    setAudioBuffer(audioBufferFiltered);

                    console.log("Slicing into chunks...");
                    if (audioPlayerStatusRef.current) {
                      audioPlayerStatusRef.current.innerHTML =
                        "Slicing into chunks...";
                    }
                    const slicedChunks = await sliceAudioBufferAtPauses(
                      audioBufferFiltered,
                      10,
                    );
                    setAudioBufferSlices(slicedChunks);
                    console.log("Done slicing", slicedChunks);

                    // Convert sliced audio buffers to blobs and update state
                    const slicedBlobs = await Promise.all(slicedChunks.map(async (buffer) => {
                      return {
                        blob: audioBufferToWav(buffer),
                        duration: buffer.duration,
                        fileType: "audio/wav",
                      };
                    }));
                    setAudioBufferBlobs(slicedBlobs);

                    // Set transcription statuses for each sliced blob
                    setTranscriptionStatuses(slicedBlobs.map(() => 'not_started'));
                  } catch (error) {
                    console.error("Error decoding audio data:", error);
                    toast.error("Unable to decode audio data. Please check the file format and try again.");
                  }
                }
              })();

              // @ts-ignore
              window.__currentAudioTranscriptionBlob = audioBlob;
              setAudioBlob(audioBlob);
            };

            selectedMediaElement.addEventListener("play", () => {
              recorder.start(1000 /*ms timeslice*/);
            });

            selectedMediaElement.addEventListener("pause", () => {
              recorder.stop();
            });
          } else {
            console.error("Stream capture is not supported");
          }
        }
      })();
    }
  }, [selectedMediaElement, startTime, muted]);

  const onClearBlobs = useCallback(() => {
    setAudioBufferBlobs([]);
    setElapsedTimes([]);
    setIndexesTranscribing([]);
    setEditorValue("");
    setTranscriptionStatuses([]); // Reset transcription statuses
  }, []);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="ab-flex ab-flex-row ab-h-full ab-items-start ab-justify-center ab-p-2">
          <ResizablePanelGroup direction="horizontal" className="ab-gap-2">
            <ResizablePanel defaultSize={50} minSize={20}>
              <Card className="ab-w-full ab-h-full ab-flex ab-justify-between ab-items-stretch ab-flex-col ab-overflow-y-scroll">
                <div>
                  <CardHeader>
                    <CardTitle>Video oder Audio vom Computer</CardTitle>
                    <CardDescription>
                      Wählen Sie eine Audio oder Video-Datei von Ihrem Computer
                      aus. Die folgenden Formate werden von diesem Browser unterstützt:{" "}
                      <strong>{supportedCodecs.join(", ")}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="ab-mb-4 -ab-mt-2">
                      <div className="ab-flex ab-flex-col ab-w-full ab-items-center ab-space-y-1.5 ab-space-x-2">
                        <Input
                          type="file"
                          onClick={(event: any) => {
                            event.target.value = null;
                          }}
                          onChange={onTranscribe}
                          placeholder="Select audio or video file..."
                        />
                      </div>
                    </form>

                    <CardDescription className="ab-mt-2">
                      Die Audio-Abschnitte werden noch <strong>im Browser</strong> geschnitten,
                      DSP-verarbeitet (Bandpass-Filter) und anschließend mit dem gewählten KI-Modell transkribiert.
                      Bitte beachten Sie, dass der Bandpass-Filter die Qualität der Aufnahme für das menschliche
                      Ohr verschlechtert, für die KI jedoch verbessert.
                    </CardDescription>
                  </CardContent>
                </div>
                <div>
                  <CardFooter className="ab-flex ab-justify-between">
                    <Button onClick={onClearBlobs} variant="outline">
                      Leeren
                    </Button>
                    {/*
                    <Button>
                      Audio-Verarbeitung starten
                      <PlayIcon className="ab-ml-2 ab-h-4 ab-w-4" />
                    </Button>
                    */}
                  </CardFooter>
                </div>
              </Card>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={20}>
              <Card className="ab-w-full ab-h-full ab-flex ab-justify-start ab-items-stretch ab-flex-col  ab-overflow-y-scroll">
                <div>
                  <CardHeader>
                    <CardTitle>Video oder Audio von der Website</CardTitle>
                    <CardDescription>
                      Wählen Sie ein Video oder Audio-Element aus, das auf
                      dieser Website erkannt wurde.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="!ab-pb-2 !-ab-mt-2">
                    <div className="ab-grid ab-w-full ab-items-center ab-gap-2 -ab-pt-2">
                      <div className="ab-flex ab-flex-col ab-space-y-1.5 ab-justify-center ab-items-center ab-w-[100%]">
                        {/*<Button onClick={onFindVisibleMediaElements}>Elemente finden</Button>*/}
                        <Label className="ab-mb-1 !ab-font-bold">
                          Media-Element auswählen:
                        </Label>
                        {mediaElements.length > 0 && (
                          <select onSelect={onSelectMediaElement}>
                            {mediaElements.map((el, index) => {
                              return (
                                <option
                                  key={`${el.tagName}-${index + Math.random()}`}
                                >
                                  {index + 1}: {el.tagName} (Länge:{" "}
                                  {formatDuration(el.duration)})
                                </option>
                              );
                            })}
                          </select>
                        )}

                        {mediaElements.length === 0 && (
                          <select>
                            <option>Kein Element gefunden</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="ab-flex ab-items-center ab-space-x-2 ab-mt-2">
                      <input
                        type="checkbox"
                        id="muteCheckbox"
                        className="ab-form-checkbox ab-h-4 ab-w-4"
                        onChange={(evt) => onToggleMute(evt.target.checked)}
                      />
                      <label htmlFor="muteCheckbox" className="ab-text-sm">
                        Still
                      </label>
                    </div>

                    <div className="ab-flex ab-items-center ab-space-x-2 ab-mt-2">
                      <label htmlFor="startTimeInput" className="ab-text-sm">
                        Startzeit (Minute):
                      </label>
                      <input
                        type="number"
                        id="startTimeInput"
                        className="ab-form-input ab-h-8 ab-w-16"
                        value={startTime}
                        onChange={(e) => setStartTime(Number(e.target.value))}
                        min="0"
                      />
                    </div>

                    <CardDescription className="ab-mt-2">
                      Am Ende der Aufnahme oder wenn Sie die Aufnahme stoppen,
                      wird die Aufnahme Analysiert und geschnitten.
                    </CardDescription>
                  </CardContent>
                </div>
                <div>
                  <CardFooter className="ab-flex ab-justify-between">
                    {/*<Button variant="outline">Test</Button>*/}
                    <Button onClick={onStartLiveTranscription}>
                      Live-Audio-Aufnahme starten
                      <Mic2Icon className="ab-ml-2 ab-h-4 ab-w-4" />
                    </Button>

                    {isLiveTranscriptionRunning && (
                      <Button
                        variant="outline"
                        onClick={onPauseLiveTranscription}
                      >
                        <PauseCircleIcon className="ab-mr-2 ab-h-4 ab-w-4" />
                        Aufnahme pausieren
                      </Button>
                    )}
                  </CardFooter>
                </div>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>

      <VerticalResizeHandle />

      <ResizablePanel
        defaultSize={50}
        minSize={40}
        className="ab-h-full ab-flex ab-flex-col ab-w-full"
      >
        <div className="ab-h-full ab-w-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              className="ab-h-full  ab-flex ab-flex-col ab-w-full !ab-overflow-y-auto"
            >
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between">
              <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                <AiModelDropdown
                  value={modelPk}
                  type="stt"
                  onChange={(value) => {
                    setInternalModelPk(value);
                  }}
                  options={inferenceProviders}
                />
              </h5>
            </div>
             
              {/*
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between">
                <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                  Gesamte Aufnahme (Audio):
                </h5>
              </div>
              <div className="ab-flex ab-flex-row ab-ml-1 ab-justify-between ab-w-full">
                {(audioBuffer || audioBlob) && (
                  <>
                    <div
                      ref={audioPlayerContainerRef}
                      className="ab-w-full ab-m-2"
                    >
                      <AudioPlayer
                        className="w-[100%]"
                        audioBlob={
                          audioBlob && audioBlob instanceof Blob
                            ? audioBlob
                            : audioBuffer
                              ? audioBufferToWav(audioBuffer)
                              : null
                        }
                      />

                      <div
                        ref={audioPlayerStatusRef}
                        className="ab-flex ab-justify-center ab-items-center"
                      />
                    </div>
                  </>
                )}

                {!(audioBuffer || audioBlob) && (
                  <p className="ab-p-2">
                    Der Player wird angezeigt, sobald die Analyse einer Aufnahme
                    abgeschlossen wurde.
                  </p>
                )}

                <AudioPlayer className="w-[100%]" audioBlob={audioBlob!} />
              </div>
              */}
              
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between ab-items-center ab-pr-1">
                <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                  Audio-Abschnitte
                </h5>
                {transcriptionStatuses.some(status => status !== 'done') && (
                  <Button
                    size={"sm"}
                    onClick={onTranscribeAll}
                    disabled={isTranscriptionRunning || audioBufferBlobs.length === 0}
                    className="!ab-h-6 ab-m-1 ab-mr-2"
                  >
                    <PlayIcon className="ab-mr-2 ab-h-4 ab-w-4" />
                    Alle Transkribieren
                  </Button>
                )}
              </div>
              <div className="ab-flex ab-flex-col ab-w-full ab-mt-2">
               
                {audioBufferBlobs.map((blob, index) => {
                  // Calculate the total duration of all audio clips
                  const elapsedTime = audioBufferBlobs.reduce(
                    (acc, blob, i) => {
                      if (i <= index) {
                        return acc + blob.duration;
                      }
                      return acc;
                    },
                    0,
                  );
                  const elapsedMins = Math.floor(elapsedTime / 60); // Fix: Correctly calculate minutes
                  const elapsedSecs = Math.floor(elapsedTime % 60); // Fix: Correctly calculate seconds
                  const sizeInMiB = blob.blob.size / 1024 / 1024;

                  const isTranscribing = indexesTranscribing.includes(index);
                  const isAlreadyTranscribed = transcriptionStatuses[index] === 'done';
                  const isDisabled =
                    isTranscribing ||
                    isAlreadyTranscribed ||
                    isTranscriptionRunning;

                  return (
                    <div
                      key={`entry-${index + Math.random()}`}
                      className="ab-flex ab-flex-col ab-m-2 ab-mt-0 ab-mb-2 ab-border-b ab-border-b-2 ab-border-b-slate-300 ab-border-dashed ab-pb-2"
                    >
                      <div className="ab-flex ab-flex-row ab-jusitfy-between ab-items-center ab-mb-2">
                        <Badge variant="outline" className="ab-mr-2">
                          {index + 1}
                        </Badge>
                        <span className="ab-font-mono ab-text-xs">
                          {elapsedMins}:{printDouble(elapsedSecs.toString())}:{" "}
                          {blob.duration.toFixed(2)} Sek.,{" "}
                          {sizeInMiB.toFixed(2)} MiB
                        </span>
                      </div>
                      <AudioPlayer audioBlob={blob.blob} className="ab-mb-2" />
                      <button
                        type="button"
                        disabled={isDisabled}
                        className={`ab-ftr-bg ab-rounded-md ab-my-2 ab-p-1 ${isDisabled ? "ab-ftr-bg-contrast" : ""}`}
                        onClick={onTranscribeSliceClick(
                          blob.blob,
                          index + 1,
                          elapsedMins,
                          elapsedSecs,
                        )}
                      >
                        {isAlreadyTranscribed
                          ? "✅ Trankribiert"
                          : isTranscribing
                            ? "🤖 Transkribiere..."
                            : "🦻 Transkribieren"}
                      </button>
                    </div>
                  );
                })}
                {audioBufferBlobs.length === 0 && (
                  <p className="ab-p-2">
                    {isProcessing ? "🔄 Slicing/Processing..." : isEncoding ? "🔄 Encoding to OGG..." : "Dieser Bereich wird mit vorverarbeiteten Audio-Abschnitten befüllt. Dies ist technisch notwendig und findet statt, sobald die Verarbeitung der Transkription abgeschlossen wurde wurde. (Klicken Sie auf 'Verarbeiten' oder Pausieren/Stoppen Sie einen Stream, der zuvor aktiviert wurde.)"}
                  </p>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="ml-1 mr-1" />
            <ResizablePanel
              defaultSize={75}
              minSize={5}
              className="ab-h-full ab-flex ab-flex-col ab-w-full !ab-overflow-y-auto"
            >
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between">
                <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                  Transkiptions-Ergebnis:
                </h5>
              </div>
              <div className="ab-flex ab-h-full ab-items-stretch ab-w-full ab-justify-stretch">
                <MarkdownEditor
                  value={editorValue}
                  defaultValue={editorValue}
                  placeholder={`Bitte klicken Sie links für jeden Abschnitt auf 'Transkribieren', um die Einzel-Transkription zu starten. Die Länge der Abschnitte ist momentan technisch bedingt.`}
                  name="transcriptionEditor"
                  showToolbar={false}
                  onChange={(editorValue) => {
                    setEditorValue(editorValue);
                  }}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
