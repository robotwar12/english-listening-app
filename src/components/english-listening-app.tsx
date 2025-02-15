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
} from "lucide-react";
import _ from "lodash";

interface AudioFile {
  filename: string;
  filePath: string;
  index: number;
  word: string;
  meaning: string;
}

// 샘플 단어 데이터베이스 (실제 영어 단어에 대한 한글 의미)
const wordDatabase: Record<string, string> = {
  child: "아이",
  day: "날",
  // ... 다른 단어들 추가
};

const EnglishListeningApp: React.FC = () => {
  const [startNumber, setStartNumber] = useState<string>("");
  const [endNumber, setEndNumber] = useState<string>("");
  const [playlist, setPlaylist] = useState<AudioFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadAvailableFiles = async () => {
      try {
        const response = await fetch("/api/files");
        const files = await response.json();
        setAvailableFiles(files);
      } catch (error) {
        console.error("Failed to load files:", error);
        alert("파일 목록을 불러오는데 실패했습니다.");
      }
    };

    loadAvailableFiles();
  }, []);

  // 파일명에서 단어 추출 (예: "001_child.mp3" -> "child")
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
    const selectedFiles = availableFiles.filter((filename) => {
      const fileNumber = parseInt(filename.split("_")[0]);
      return fileNumber >= start && fileNumber <= end;
    });

    if (selectedFiles.length === 0) {
      alert("선택한 범위에 사용 가능한 파일이 없습니다.");
      return;
    }

    const files: AudioFile[] = selectedFiles.map((filename) => {
      const index = parseInt(filename.split("_")[0]);
      const word = extractWord(filename);

      return {
        filename,
        filePath: `/audio/${filename}`,
        index,
        word,
        meaning:
          wordDatabase[word.toLowerCase()] || "의미 데이터 없음",
      };
    });

    setPlaylist(_.shuffle(files));
    setCurrentTrack(0);
    stopAndReset();
  };

  // 초기화
  const resetApp = (): void => {
    setStartNumber("");
    setEndNumber("");
    setPlaylist([]);
    setCurrentTrack(0);
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

  // 재생/일시정지 토글
  const togglePlay = (): void => {
    if (!playlist.length) return;

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 다음 트랙으로 이동
  const nextTrack = (): void => {
    if (currentTrack < playlist.length - 1) {
      stopAndReset();
      setCurrentTrack((prev) => prev + 1);
    }
  };

  // 오디오 종료 시 처리
  const handleEnded = (): void => {
    stopAndReset();
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
    }
  };

  // 오디오 로딩 에러 처리
  const handleError = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    console.error("Audio loading error:", e);
    alert("오디오 파일을 로드하는데 문제가 발생했습니다.");
  };

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
              {/* 입력 섹션 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습할 단어 범위 선택:
                </label>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="600"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      className="w-24 shadow-sm"
                      placeholder="시작"
                    />
                    <span className="text-gray-500">~</span>
                    <Input
                      type="number"
                      min="1"
                      max="600"
                      value={endNumber}
                      onChange={(e) => setEndNumber(e.target.value)}
                      className="w-24 shadow-sm"
                      placeholder="끝"
                    />
                  </div>
                  <Button
                    onClick={generateRandomPlaylist}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <Play size={18} className="mr-2" />
                    랜덤 재생목록 생성
                  </Button>
                </div>
              </div>

              {/* 현재 재생 중인 단어 섹션 */}
              {playlist.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {currentTrack + 1} / {playlist.length}
                    </p>
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
                      <span>{playlist[currentTrack].filename}</span>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={playlist[currentTrack].filePath}
                    onEnded={handleEnded}
                    onError={handleError}
                    className="hidden"
                  />

                  {/* 컨트롤 버튼 */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className={`w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 ${
                        isPlaying ? "bg-purple-600" : "bg-blue-600"
                      }`}
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
                      className="w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 bg-blue-600"
                      disabled={currentTrack >= playlist.length - 1}
                    >
                      <SkipForward size={24} />
                    </Button>
                    <Button
                      onClick={resetApp}
                      size="lg"
                      className="w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105"
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
                      key={file.index}
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
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
                            </span>
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
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
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
