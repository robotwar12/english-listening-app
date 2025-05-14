"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  List,
  Grid,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import _ from "lodash";

interface AudioFile {
  filename: string;
  filePath: string;
  index: number;
  word: string;
  meaning: string;
  level: "beginner" | "intermediate";
}

// Import WordDatabases
import { beginnerWords, intermediateWords } from "./wordDatabase";

const wordDatabase: Record<
  string,
  { meaning: string; level: "beginner" | "intermediate" }
> = {};

// 초급 단어 추가 (1-600)
Object.keys(beginnerWords).forEach((word) => {
  wordDatabase[word] = {
    meaning: beginnerWords[word],
    level: "beginner",
  };
});

// 중급 단어 추가 (1-600)
Object.keys(intermediateWords).forEach((word) => {
  wordDatabase[word] = {
    meaning: intermediateWords[word],
    level: "intermediate",
  };
});

const EnglishListeningApp: React.FC = () => {
  const [startNumber, setStartNumber] = useState<string>("1");
  const [endNumber, setEndNumber] = useState<string>("600");
  const [playlist, setPlaylist] = useState<AudioFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [level, setLevel] = useState<
    "all" | "beginner" | "intermediate"
  >("all");
  const [availableFiles, setAvailableFiles] = useState<{
    beginner: string[];
    intermediate: string[];
  }>({ beginner: [], intermediate: [] });
  const [fileLoadError, setFileLoadError] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 실제 디렉토리에서 파일 목록을 가져오는 대신 시뮬레이션
  useEffect(() => {
    const generateMockFiles = () => {
      const beginnerFiles: string[] = [];
      const intermediateFiles: string[] = [];

      // 초급 단어 (1-600)
      Object.keys(beginnerWords).forEach((word, index) => {
        const fileNumber = (index + 1).toString().padStart(3, "0");
        beginnerFiles.push(`${fileNumber}_${word}.mp3`);
      });

      // 중급 단어 (1-600)
      Object.keys(intermediateWords).forEach((word, index) => {
        const fileNumber = (index + 1).toString().padStart(3, "0");
        intermediateFiles.push(`${fileNumber}_${word}.mp3`);
      });

      setAvailableFiles({
        beginner: beginnerFiles,
        intermediate: intermediateFiles,
      });
    };

    generateMockFiles();
  }, []);

  // 파일명에서 단어 추출
  const extractWord = (filename: string): string => {
    const match = filename.match(/\d+_(.+)\.mp3$/);
    return match ? match[1] : "";
  };

  // 재생 목록 생성
  const generateRandomPlaylist = (): void => {
    const start = parseInt(startNumber);
    const end = parseInt(endNumber);

    if (
      isNaN(start) ||
      isNaN(end) ||
      start < 1 ||
      end > 600 ||
      start > end
    ) {
      alert(
        "시작 번호는 1-600 사이, 끝 번호는 시작 번호보다 크고 600 이하여야 합니다."
      );
      return;
    }

    // 선택된 범위의 파일들만 필터링
    const beginnerSelectedFiles = availableFiles.beginner.filter(
      (filename) => {
        const fileNumber = parseInt(filename.split("_")[0]);
        return fileNumber >= start && fileNumber <= end;
      }
    );

    const intermediateSelectedFiles =
      availableFiles.intermediate.filter((filename) => {
        const fileNumber = parseInt(filename.split("_")[0]);
        return fileNumber >= start && fileNumber <= end;
      });

    // 레벨에 따른 필터링
    let selectedFiles: {
      filename: string;
      level: "beginner" | "intermediate";
    }[] = [];

    if (level === "all" || level === "beginner") {
      selectedFiles = selectedFiles.concat(
        beginnerSelectedFiles.map((filename) => ({
          filename,
          level: "beginner" as const,
        }))
      );
    }

    if (level === "all" || level === "intermediate") {
      selectedFiles = selectedFiles.concat(
        intermediateSelectedFiles.map((filename) => ({
          filename,
          level: "intermediate" as const,
        }))
      );
    }

    if (selectedFiles.length === 0) {
      alert("선택한 범위에 사용 가능한 파일이 없습니다.");
      return;
    }

    const files: AudioFile[] = selectedFiles.map(
      ({ filename, level }) => {
        const index = parseInt(filename.split("_")[0]);
        const word = extractWord(filename);
        const wordInfo = wordDatabase[word.toLowerCase()] || {
          meaning: "의미 데이터 없음",
          level,
        };

        // 파일 경로 설정: 초급은 /audio/, 중급은 /audio2/
        const filePath =
          level === "beginner"
            ? `/audio/${filename}`
            : `/audio2/${filename}`;

        return {
          filename,
          filePath,
          index,
          word,
          meaning: wordInfo.meaning,
          level,
        };
      }
    );

    // 파일 로드 에러 상태 초기화
    setFileLoadError(false);
    setPlaylist(_.shuffle(files));
    setCurrentTrack(0);
    stopAndReset();
  };

  // 초기화
  const resetApp = (): void => {
    setStartNumber("1");
    setEndNumber("600");
    setPlaylist([]);
    setCurrentTrack(0);
    setFileLoadError(false);
    stopAndReset();
  };

  // 재생 중지 및 초기화
  const stopAndReset = (): void => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 레벨 선택
  const setLevelSelection = (
    selectedLevel: "all" | "beginner" | "intermediate"
  ) => {
    setLevel(selectedLevel);
  };

  // 재생/일시정지 토글
  const togglePlay = (): void => {
    if (!playlist.length || fileLoadError) return;

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      // 오디오 재생 시도 후 에러 처리
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("재생 에러:", error);
          setFileLoadError(true);
          setIsPlaying(false);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // 다음 트랙으로 이동
  const nextTrack = (): void => {
    if (currentTrack < playlist.length - 1) {
      stopAndReset();
      setCurrentTrack((prev) => prev + 1);
      setFileLoadError(false); // 새 트랙으로 이동하면 에러 상태 초기화
    }
  };

  // 오디오 종료 시 처리
  const handleEnded = (): void => {
    stopAndReset();
    // 자동으로 다음 트랙으로 이동 (선택 사항)
    if (currentTrack < playlist.length - 1) {
      setCurrentTrack((prev) => prev + 1);
    }
  };

  // 트랙 선택 및 재생 처리
  const selectTrack = (index: number): void => {
    if (index === currentTrack) {
      // 현재 트랙을 다시 클릭한 경우 재생/일시정지 토글
      togglePlay();
    } else {
      // 다른 트랙을 선택한 경우
      stopAndReset();
      setCurrentTrack(index);
      setFileLoadError(false); // 새 트랙으로 이동하면 에러 상태 초기화
    }
  };

  // 오디오 로딩 에러 처리
  const handleError = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    console.error("오디오 로딩 에러:", e);
    setFileLoadError(true);
    // 팝업 대신 상태 업데이트로 처리
  };

  // 오디오 로드 성공 처리
  const handleCanPlay = () => {
    setFileLoadError(false);
  };

  // 실제 파일 존재 여부 확인 (시뮬레이션 - 실제로는 서버에서 확인 필요)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-lg mb-3 mx-auto">
              <Volume2 size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
            English Listening Practice
          </h1>
          <p className="text-gray-600 text-lg">
            Listen and learn English words with pronunciation
          </p>
        </div>

        {/* 컨트롤 카드 */}
        <Card className="bg-white/80 backdrop-blur shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* 레벨 선택 버튼 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습 수준 선택:
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setLevelSelection("all")}
                    variant={level === "all" ? "default" : "outline"}
                    className={level === "all" ? "bg-blue-600" : ""}
                  >
                    전체 단어
                  </Button>
                  <Button
                    onClick={() => setLevelSelection("beginner")}
                    variant={
                      level === "beginner" ? "default" : "outline"
                    }
                    className={
                      level === "beginner" ? "bg-green-600" : ""
                    }
                  >
                    <BookOpen size={16} className="mr-2" />
                    초급 단어
                  </Button>
                  <Button
                    onClick={() => setLevelSelection("intermediate")}
                    variant={
                      level === "intermediate" ? "default" : "outline"
                    }
                    className={
                      level === "intermediate" ? "bg-purple-600" : ""
                    }
                  >
                    <GraduationCap size={16} className="mr-2" />
                    중급 단어
                  </Button>
                </div>
              </div>

              {/* 입력 섹션 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습할 단어 범위 선택 (1-600):
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                      type="number"
                      min="1"
                      max="600"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      className="w-full sm:w-24 shadow-sm"
                      placeholder="시작"
                    />
                    <span className="text-gray-500">~</span>
                    <Input
                      type="number"
                      min="1"
                      max="600"
                      value={endNumber}
                      onChange={(e) => setEndNumber(e.target.value)}
                      className="w-full sm:w-24 shadow-sm"
                      placeholder="끝"
                    />
                  </div>
                  <Button
                    onClick={generateRandomPlaylist}
                    className="w-full sm:w-auto sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <Play size={18} className="mr-2" />
                    랜덤 생성
                  </Button>
                </div>
              </div>

              {/* 현재 재생 중인 단어 섹션 */}
              {playlist.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    {fileLoadError && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                        오디오 파일을 로드할 수 없습니다. 오디오 재생
                        없이 단어 학습은 계속할 수 있습니다.
                      </div>
                    )}
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {currentTrack + 1} / {playlist.length}
                    </p>
                    <div className="flex justify-center items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          playlist[currentTrack].level === "beginner"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {playlist[currentTrack].level === "beginner"
                          ? "초급"
                          : "중급"}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{playlist[currentTrack].index}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-blue-800">
                        {playlist[currentTrack].word}
                      </p>
                      {showMeanings && (
                        <p className="text-xl text-gray-600">
                          {playlist[currentTrack].meaning}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Volume2 size={16} />
                      <span>
                        {playlist[currentTrack].level === "beginner"
                          ? "초급"
                          : "중급"}
                        : {playlist[currentTrack].filename}
                      </span>
                    </div>
                  </div>

                  {/* preload="none"으로 설정하여 페이지 로드 시 자동 로드 방지 */}
                  <audio
                    ref={audioRef}
                    src={playlist[currentTrack].filePath}
                    onEnded={handleEnded}
                    onError={handleError}
                    onCanPlay={handleCanPlay}
                    preload="none"
                    className="hidden"
                  >
                    {/* 오디오가 지원되지 않는 브라우저를 위한 대체 텍스트 */}
                    Your browser does not support the audio element.
                  </audio>

                  {/* 컨트롤 버튼 */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className={`w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 ${
                        isPlaying ? "bg-purple-600" : "bg-blue-600"
                      } ${
                        fileLoadError
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={fileLoadError}
                    >
                      {isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </Button>
                    <Button
                      onClick={nextTrack}
                      size="lg"
                      className="w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 bg-blue-600"
                      disabled={currentTrack >= playlist.length - 1}
                    >
                      <SkipForward size={24} />
                    </Button>
                    <Button
                      onClick={resetApp}
                      size="lg"
                      className="w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105"
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

        {/* 단어 목록 카드 */}
        {playlist.length > 0 && (
          <Card className="bg-white/80 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* 단어 목록 헤더 */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    학습 단어 목록
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setViewMode(
                          viewMode === "grid" ? "list" : "grid"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      {viewMode === "grid" ? (
                        <List size={16} />
                      ) : (
                        <Grid size={16} />
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowMeanings(!showMeanings)}
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      {showMeanings ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 단어 목록 그리드/리스트 */}
                <div
                  className={`
                  ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-2"
                  }
                `}
                >
                  {playlist.map((file, index) => (
                    <div
                      key={file.index + file.level + index}
                      onClick={() => selectTrack(index)}
                      className={`
                        ${
                          viewMode === "grid"
                            ? "p-4 rounded-lg border transition-all duration-200"
                            : "p-3 rounded-lg border flex justify-between items-center"
                        }
                        ${
                          index === currentTrack
                            ? "bg-blue-50 border-blue-300 shadow-md"
                            : "border-gray-200 hover:border-blue-200 hover:shadow-sm"
                        }
                        cursor-pointer hover:bg-blue-50
                      `}
                    >
                      {viewMode === "grid" ? (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <span className="text-lg font-medium text-gray-800">
                                {file.word}
                              </span>
                              <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  file.level === "beginner"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {file.level === "beginner"
                                  ? "초급"
                                  : "중급"}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                          </div>
                          {showMeanings && (
                            <p className="text-gray-600">
                              {file.meaning}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                file.level === "beginner"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {file.level === "beginner"
                                ? "초급"
                                : "중급"}
                            </span>
                          </div>
                          {showMeanings && (
                            <p className="text-gray-600">
                              {file.meaning}
                            </p>
                          )}
                        </>
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
