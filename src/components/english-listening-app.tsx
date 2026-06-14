"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Eye,
  EyeOff,
  Grid,
  List,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AudioFile {
  filename: string;
  filePath: string;
  index: number;
  word: string;
  meaning: string;
}

type WordDatabase = Record<string, string>;

const MAX_WORD_COUNT = 750;

const extractWord = (filename: string): string => {
  const match = filename.match(/^\d+_(.+)\.mp3$/);
  return match ? match[1] : "";
};

const shuffleFiles = <T,>(items: T[]): T[] => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const EnglishListeningApp: React.FC = () => {
  const [startNumber, setStartNumber] = useState<string>("1");
  const [endNumber, setEndNumber] = useState<string>(String(MAX_WORD_COUNT));
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [wordDatabase, setWordDatabase] = useState<WordDatabase>({});
  const [playlist, setPlaylist] = useState<AudioFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        setIsLoading(true);

        const [filesResponse, wordsResponse] = await Promise.all([
          fetch("/api/files"),
          fetch("/voca3200data.json"),
        ]);

        if (!filesResponse.ok) {
          throw new Error("오디오 파일 목록을 불러오지 못했습니다.");
        }

        if (!wordsResponse.ok) {
          throw new Error("단어 뜻 데이터를 불러오지 못했습니다.");
        }

        const files = (await filesResponse.json()) as string[];
        const words = (await wordsResponse.json()) as WordDatabase;

        setAvailableFiles(files);
        setWordDatabase(words);
      } catch (error) {
        console.error("Failed to load app data:", error);
        alert(
          error instanceof Error
            ? error.message
            : "앱 데이터를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAppData();
  }, []);

  const stopAndReset = (): void => {
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const generateRandomPlaylist = (): void => {
    const start = Number.parseInt(startNumber, 10);
    const end = Number.parseInt(endNumber, 10);

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 1 ||
      end > MAX_WORD_COUNT ||
      start > end
    ) {
      alert(
        `시작 번호는 1-${MAX_WORD_COUNT} 사이, 끝 번호는 시작 번호보다 크고 ${MAX_WORD_COUNT} 이하여야 합니다.`
      );
      return;
    }

    const filteredFiles = availableFiles.filter((filename) => {
      const fileNumber = Number.parseInt(filename.split("_")[0], 10);
      return fileNumber >= start && fileNumber <= end;
    });

    if (filteredFiles.length === 0) {
      alert("선택한 범위에 사용 가능한 파일이 없습니다.");
      return;
    }

    const files: AudioFile[] = filteredFiles.map((filename) => {
      const index = Number.parseInt(filename.split("_")[0], 10);
      const word = extractWord(filename);
      const meaning = wordDatabase[word.toLowerCase()] ?? "의미 데이터 없음";

      return {
        filename,
        filePath: `/audio3/${filename}`,
        index,
        word,
        meaning,
      };
    });

    setPlaylist(shuffleFiles(files));
    setCurrentTrack(0);

    if (isPlaying) {
      stopAndReset();
    }
  };

  const resetApp = (): void => {
    setStartNumber("1");
    setEndNumber(String(MAX_WORD_COUNT));
    setPlaylist([]);
    setCurrentTrack(0);
    stopAndReset();
  };

  const togglePlay = (): void => {
    if (!playlist.length) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("오디오 재생 실패:", error);
          alert(`오디오 재생 실패: ${error.message}`);
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = (): void => {
    if (currentTrack < playlist.length - 1) {
      stopAndReset();
      setCurrentTrack((prev) => prev + 1);
    }
  };

  const handleEnded = (): void => {
    stopAndReset();
  };

  const selectTrack = (index: number): void => {
    if (index === currentTrack) {
      togglePlay();
      return;
    }

    stopAndReset();
    setCurrentTrack(index);
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = e.target as HTMLAudioElement;
    console.error(
      "오디오 파일을 로드하는데 문제가 발생했습니다.",
      audioElement.error
    );
    alert(
      `오디오 파일 로드 오류: ${
        audioElement.error?.message || "알 수 없는 오류"
      }`
    );
    setIsPlaying(false);
  };

  const currentFile = playlist[currentTrack];
  const wordCount = Object.keys(wordDatabase).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg">
              <Volume2 size={32} className="text-white" />
            </div>
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
            English Listening Practice
          </h1>
          <p className="text-lg text-gray-600">
            VOCA 3200 단어를 랜덤으로 섞어 듣고 뜻을 확인하세요.
          </p>
        </div>

        <Card className="bg-white/80 shadow-lg backdrop-blur">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습 데이터
                </label>
                <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  <BookOpen size={16} className="mr-2" />
                  VOCA 3200 단어
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습할 단어 범위 선택 (1-{MAX_WORD_COUNT})
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Input
                      type="number"
                      min="1"
                      max={MAX_WORD_COUNT}
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      className="w-full shadow-sm sm:w-24"
                      placeholder="시작"
                    />
                    <span className="text-gray-500">~</span>
                    <Input
                      type="number"
                      min="1"
                      max={MAX_WORD_COUNT}
                      value={endNumber}
                      onChange={(e) => setEndNumber(e.target.value)}
                      className="w-full shadow-sm sm:w-24"
                      placeholder="끝"
                    />
                  </div>
                  <Button
                    onClick={generateRandomPlaylist}
                    className="w-full bg-blue-600 text-white shadow-md hover:bg-blue-700 sm:flex-1"
                    disabled={isLoading || availableFiles.length === 0}
                  >
                    <Play size={18} className="mr-2" />
                    랜덤 생성
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p>오디오 파일: {availableFiles.length}개 로드됨</p>
                <p>뜻 데이터: {wordCount}개 로드됨</p>
                {isLoading && <p>데이터를 불러오는 중입니다...</p>}
              </div>

              {playlist.length > 0 && currentFile && (
                <div className="space-y-6">
                  <div className="rounded-lg bg-blue-50 p-6 text-center">
                    <p className="mb-3 text-sm font-medium text-blue-600">
                      {currentTrack + 1} / {playlist.length}
                    </p>
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        VOCA 3200
                      </span>
                      <span className="text-xs text-gray-500">
                        #{currentFile.index}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-blue-800">
                        {currentFile.word}
                      </p>
                      {showMeanings && (
                        <p className="text-xl text-gray-600">
                          {currentFile.meaning}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Volume2 size={16} />
                      <span>{currentFile.filename}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {currentFile.filePath}
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={currentFile.filePath}
                    onEnded={handleEnded}
                    onError={handleError}
                    preload="none"
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className={`h-16 w-full rounded-full shadow-lg transition-transform hover:scale-105 sm:w-16 ${
                        isPlaying ? "bg-purple-600" : "bg-blue-600"
                      }`}
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </Button>
                    <Button
                      onClick={nextTrack}
                      size="lg"
                      className="h-16 w-full rounded-full bg-blue-600 shadow-lg transition-transform hover:scale-105 sm:w-16"
                      disabled={currentTrack >= playlist.length - 1}
                    >
                      <SkipForward size={24} />
                    </Button>
                    <Button
                      onClick={resetApp}
                      size="lg"
                      className="h-16 w-full rounded-full shadow-lg transition-transform hover:scale-105 sm:w-16"
                      variant="outline"
                    >
                      <RefreshCw size={24} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {playlist.length > 0 && (
          <Card className="bg-white/80 shadow-lg backdrop-blur">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">
                    학습 단어 목록
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setViewMode(viewMode === "grid" ? "list" : "grid")
                      }
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
                    </Button>
                    <Button
                      onClick={() => setShowMeanings(!showMeanings)}
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      {showMeanings ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-2"
                  }
                >
                  {playlist.map((file, index) => (
                    <div
                      key={`${file.index}-${file.word}-${index}`}
                      onClick={() => selectTrack(index)}
                      className={`cursor-pointer border hover:bg-blue-50 ${
                        viewMode === "grid"
                          ? "rounded-lg p-4 transition-all duration-200"
                          : "rounded-lg p-3"
                      } ${
                        index === currentTrack
                          ? "border-blue-300 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      {viewMode === "grid" ? (
                        <div>
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex flex-wrap items-center">
                              <span className="mr-2 text-lg font-medium text-gray-800">
                                {file.word}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                VOCA 3200
                              </span>
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              #{file.index}
                            </span>
                          </div>
                          {showMeanings && (
                            <p className="text-gray-600">{file.meaning}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
                            </span>
                          </div>
                          {showMeanings && (
                            <p className="text-gray-600">{file.meaning}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnglishListeningApp;
