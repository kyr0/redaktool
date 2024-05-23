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
  CardFooter,
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
  type SyntheticEvent,
} from "react";
import AudioPlayer from "../../ui/audio-player";
import {
  audioBufferToWav,
  blobToAudioBuffer,
  blobToDataUrl,
  getAudioFileAsAudioBuffer,
  processAudioBufferWithBandpass,
  sliceAudioBufferAtPauses,
} from "../../lib/audio-dsp";
import { Badge } from "../../ui/badge";
import { filterForVisibleElements } from "../../lib/content-script/element";
import { prefPerPage } from "../../lib/content-script/prefs";
import { formatDuration } from "../../lib/content-script/format";
import { MarkdownEditor } from "../MarkdownEditor";
interface HTMLMediaElementWithCaptureStream extends HTMLMediaElement {
  captureStream(): MediaStream;
}

async function transcribeInWorker(blob: Blob) {
  return new Promise((resolve, reject) => {
    (async () => {
      chrome.runtime.sendMessage(
        {
          action: "transcribe",
          text: JSON.stringify({ blobDataUrl: await blobToDataUrl(blob) }),
        },
        (response) => {
          console.log("transcribeInWorker response", response);
          if (response.success) {
            const value = JSON.parse(response.value);
            console.log("got value", value);
            resolve(value);
          } else {
            reject("could not transcribe");
          }
        },
      );
    })();
  });
}

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

export const TranscriptionLayout = () => {
  const audioPlayerContainerRef = useRef<any>();
  const mediaElContainerRef = useRef<any>();
  const audioPlayerStatusRef = useRef<any>();
  const videoEl$ = getElementSelectionStore();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBufferSlices, setAudioBufferSlices] = useState<
    Array<AudioBuffer>
  >([]);
  const [audioBufferBlobs, setAudioBufferBlobs] = useState<
    Array<{ duration: number; blob: Blob }>
  >([]);
  const [editorValue, setEditorValue] = useState<string>("");
  const [selectedMediaElement, setSelectedMediaElement] =
    useState<HTMLMediaElement | null>(null);
  const [mediaElements, setMediaElements] = useState<Array<HTMLMediaElement>>(
    [],
  );
  const [audioBlob, setAudioBlob] = useState<Blob>();

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
      const audioContext = new AudioContext();
      setAudioFile(file);
      setAudioContext(audioContext);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (audioFile && audioContext) {
        if (audioPlayerStatusRef.current) {
          audioPlayerStatusRef.current.innerHTML =
            "Applying bandpass filter...";
        }

        setAudioBuffer(
          await processAudioBufferWithBandpass(
            await getAudioFileAsAudioBuffer(audioFile, audioContext),
          ),
        );

        if (audioPlayerContainerRef.current) {
          console.log("shoing audio player");
          audioPlayerContainerRef.current.classList.remove("ab-hidden");
        }
      }
    })();
  }, [audioFile, audioContext]);

  useEffect(() => {
    if (audioBuffer && audioContext) {
      (async () => {
        console.log("Slicing into chunks...", audioBuffer);

        if (audioPlayerStatusRef.current) {
          audioPlayerStatusRef.current.innerHTML = "Slicing into chunks...";
        }
        setAudioBufferSlices(await sliceAudioBufferAtPauses(audioBuffer, 60));
      })();
    }
  }, [audioBuffer, audioContext]);

  useEffect(() => {
    if (audioBufferSlices.length === 0) return;

    if (audioPlayerStatusRef.current) {
      audioPlayerStatusRef.current.innerHTML = "Transcoding slices into wav...";
    }
    console.log("Transcoding slices into wav...", audioBufferSlices);

    const blobs = [];
    for (let i = 0; i < audioBufferSlices.length; i++) {
      blobs.push({
        blob: audioBufferToWav(audioBufferSlices[i]),
        duration: audioBufferSlices[i].duration,
      });
    }
    console.log("Settings blobs", blobs);
    setAudioBufferBlobs(blobs);

    if (audioPlayerStatusRef.current) {
      audioPlayerStatusRef.current.classList.add("ab-hidden");
      audioPlayerStatusRef.current.innerHTML = "";
    }
  }, [audioBufferSlices]);

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
      return async () => {
        console.log("transcribe slice", blob);
        const transcription = (await transcribeInWorker(blob)) as {
          text: string;
        };
        console.log("done transcribe slice", transcription);

        setEditorValue(
          `${editorValue}\n\n${index}. ${elapsedMins.toFixed(
            0,
          )}:${elapsedSecs.toFixed(0)}\n${transcription.text}`,
        );
      };
    },
    [editorValue],
  );

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

  const onTranscribeMediaElement = useCallback(() => {
    if (selectedMediaElement) {
      console.log("transcribe media element", selectedMediaElement);

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
                  console.log("Done slicing");
                }
                /*
                const transcription = (await transcribeInWorker(
                  audioBlob,
                )) as {
                  text: string;
                };
                console.log("done transcribe slice 1MiB", transcription);
                */
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
  }, [selectedMediaElement]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="ab-flex ab-flex-row ab-h-full ab-items-start ab-justify-center ab-p-2">
          <ResizablePanelGroup direction="horizontal" className="ab-gap-2">
            <ResizablePanel defaultSize={50} minSize={20}>
              <Card className="ab-w-full ab-h-full ab-flex ab-justify-between ab-items-stretch ab-flex-col">
                <div>
                  <CardHeader>
                    <CardTitle>Video oder Audio vom Computer</CardTitle>
                    <CardDescription>
                      In diesem Modus wird Dein Browser das Transkodieren in
                      Echtzeit starten. Es werden keine Daten vorab auf Server,
                      nur an die KI gesendet hochgeladen.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form>
                      <div className="ab-grid ab-w-full ab-items-center ab-gap-2">
                        <div className="ab-flex ab-w-full ab-items-center ab-space-y-1.5 ab-space-x-2">
                          <Input
                            type="file"
                            onClick={(event: any) => {
                              event.target.value = null;
                            }}
                            onChange={onTranscribe}
                            placeholder="Select audio or video file..."
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </div>
                <div>
                  <CardFooter className="ab-flex ab-justify-between">
                    {/*<Button variant="outline">Cancel</Button>*/}
                    <Button>Verarbeiten</Button>
                  </CardFooter>
                </div>
              </Card>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={20}>
              <Card className="ab-w-full ab-h-full ab-flex ab-justify-between ab-items-stretch ab-flex-col">
                <div>
                  <CardHeader>
                    <CardTitle>Video oder Audio von der Website</CardTitle>
                    <CardDescription>
                      Wähle ein Video oder Audio-Element aus, das auf dieser
                      Website erkannt wurde, um es in Echtzeit zu
                      transkribieren.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="ab-grid ab-w-full ab-items-center ab-gap-2">
                      <div className="ab-flex ab-flex-col ab-space-y-1.5 ab-justify-center ab-items-center ab-w-[100%]">
                        {/*<Button onClick={onFindVisibleMediaElements}>Elemente finden</Button>*/}
                        <Label>MediaElement auswählen:</Label>
                        <br />
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
                  </CardContent>
                </div>
                <div>
                  <CardFooter className="ab-flex ab-justify-between">
                    {/*<Button variant="outline">Test</Button>*/}
                    <Button onClick={onTranscribeMediaElement}>
                      Stream aktivieren
                    </Button>
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
        className="!ab-overflow-y-scroll ab-h-full ab-flex ab-flex-col ab-w-full"
      >
        <div className="ab-h-full ab-w-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30  ab-justify-between">
                <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                  Gesamt-Audio:
                </h5>
              </div>
              <div className="ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30  ab-justify-between">
                <div
                  ref={audioPlayerContainerRef}
                  className="ab-h-[100px] ab-rounded-md ab-overflow-scroll ab-w-[100%]"
                >
                  {(audioBuffer || audioBlob) && (
                    <>
                      Player:
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
                    </>
                  )}
                  <div
                    ref={audioPlayerStatusRef}
                    className="ab-flex ab-justify-center ab-items-center ab-h-full"
                  />
                </div>

                {!(audioBuffer || audioBlob) && (
                  <p className="ab-p-2">
                    Der Player wird angezeigt, sobald die Transkription
                    gestartet wurde.
                  </p>
                )}

                <AudioPlayer className="w-[100%]" audioBlob={audioBlob!} />
              </div>
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30  ab-justify-between">
                <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                  Audio-Abschnitte
                </h5>
              </div>
              <div className="ab-flex ab-h-[100%] ab-w-[100%] ab-overflow-auto ab-flex-col">
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
                  const elapsedMins = elapsedTime / 60;
                  const elapsedSecs = elapsedTime % 60;
                  const sizeInMiB = blob.blob.size / 1024 / 1024;
                  return (
                    <div
                      key={`entry-${index + Math.random()}`}
                      className="ab-flex ab-flex-col ab-m-2 ab-mb-4"
                    >
                      <div className="ab-flex ab-flex-row">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="ab-font-mono">
                          {elapsedMins.toFixed(0)}:{elapsedSecs.toFixed(0)}:{" "}
                          {blob.duration.toFixed(2)} Sek.,{" "}
                          {sizeInMiB.toFixed(2)} MiB
                        </span>
                      </div>
                      <AudioPlayer audioBlob={blob.blob} />
                      <button
                        type="button"
                        onClick={onTranscribeSliceClick(
                          blob.blob,
                          index + 1,
                          elapsedMins,
                          elapsedSecs,
                        )}
                      >
                        Transcribe
                      </button>
                    </div>
                  );
                })}
                {audioBufferBlobs.length === 0 && (
                  <p className="ab-p-2">
                    Dieser Bereich wird mit vorverarbeiteten Audio-Abschnitten
                    befüllt. Dies ist technisch notwendig und findet statt,
                    sobald die Verarbeitung der Transkription abgeschlossen
                    wurde wurde. (Klicken Sie auf "Verarbeiten" oder
                    Pausieren/Stoppen Sie einen Stream, der zuvor aktiviert
                    wurde.)
                  </p>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="ml-1 mr-1" />
            <ResizablePanel defaultSize={75} minSize={20}>
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30  ab-justify-between">
                <h5 className="ab-font-bold ab-p-1 ab-px-2 !ab-text-[12px]">
                  Ergebnis:
                </h5>
              </div>
              <div className="ab-flex ab-h-full ab-items-stretch ab-w-full ab-justify-stretch">
                <MarkdownEditor
                  defaultValue={editorValue}
                  placeholder={
                    "Das Ergebnis wird durch jeden Klick auf 'Transkribieren' pro Audio-Chunk erweitert."
                  }
                  name="transcriptionEditor"
                  showToolbar={true}
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
