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

// 초급 단어 추가
Object.keys(beginnerWords).forEach((word) => {
  wordDatabase[word] = {
    meaning: beginnerWords[word],
    level: "beginner",
  };
});

// 중급 단어 추가
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

  // 초급 단어와 중급 단어 목록을 따로 저장
  const [beginnerFiles, setBeginnerFiles] = useState<string[]>([]);
  const [intermediateFiles, setIntermediateFiles] = useState<
    string[]
  >([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 서버에서 파일 목록 가져오기
  useEffect(() => {
    const loadAvailableFiles = async () => {
      try {
        // 원래 API를 사용하여 모든 파일 가져오기
        const response = await fetch("/api/files");
        const files = await response.json();

        // 임시로 모든 파일을 초급으로 분류
        const beginner: string[] = [];
        beginner.push(...files);

        console.log(`로드된 초급 파일: ${beginner.length}개`);
        setBeginnerFiles(beginner);
      } catch (error) {
        console.error("Failed to load files:", error);
        alert("파일 목록을 불러오는데 실패했습니다.");
      }
    };

    loadAvailableFiles();
  }, []);

  // 중급 단어 파일 목록 별도로 가져오기
  useEffect(() => {
    const loadIntermediateFiles = async () => {
      try {
        // audio2 폴더의 파일 목록을 가져오는 API 호출
        const response = await fetch("/api/intermediate-files");
        const files = await response.json();

        console.log(`로드된 중급 파일: ${files.length}개`);
        setIntermediateFiles(files);
      } catch (error) {
        console.error("Failed to load intermediate files:", error);
        // 실패해도 계속 진행 (중급 단어가 없을 수 있음)
      }
    };

    loadIntermediateFiles();
  }, []);

  // 파일명에서 단어 추출 (예: "406_hurt.mp3" -> "hurt")
  const extractWord = (filename: string): string => {
    const match = filename.match(/\d+_(.+)\.mp3$/);
    return match ? match[1] : "";
  };

  // 재생 목록 생성 (오디오 재생은 하지 않음)
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

    // 레벨에 따른 파일 목록 선택
    const selectedFiles: {
      filename: string;
      level: "beginner" | "intermediate";
    }[] = [];

    // 초급 단어 선택 (level이 all 또는 beginner인 경우)
    if (level === "all" || level === "beginner") {
      const filteredBeginnerFiles = beginnerFiles.filter(
        (filename) => {
          const fileNumber = parseInt(filename.split("_")[0]);
          return fileNumber >= start && fileNumber <= end;
        }
      );

      selectedFiles.push(
        ...filteredBeginnerFiles.map((filename) => ({
          filename,
          level: "beginner" as const,
        }))
      );
    }

    // 중급 단어 선택 (level이 all 또는 intermediate인 경우)
    if (level === "all" || level === "intermediate") {
      const filteredIntermediateFiles = intermediateFiles.filter(
        (filename) => {
          const fileNumber = parseInt(filename.split("_")[0]);
          return fileNumber >= start && fileNumber <= end;
        }
      );

      selectedFiles.push(
        ...filteredIntermediateFiles.map((filename) => ({
          filename,
          level: "intermediate" as const,
        }))
      );
    }

    if (selectedFiles.length === 0) {
      alert("선택한 범위에 사용 가능한 파일이 없습니다.");
      return;
    }

    console.log(`선택된 파일: ${selectedFiles.length}개`);

    const files: AudioFile[] = selectedFiles.map(
      ({ filename, level }) => {
        const index = parseInt(filename.split("_")[0]);
        const word = extractWord(filename);
        const wordInfo = wordDatabase[word.toLowerCase()] || {
          meaning: "의미 데이터 없음",
          level,
        };

        // 중급 단어는 /audio2/ 폴더에서 가져옴
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

    // 셔플된 플레이리스트 생성 (오디오 재생 하지 않음)
    setPlaylist(_.shuffle(files));
    setCurrentTrack(0);

    // 재생 중이라면 중지 (새 플레이리스트 생성 시)
    if (isPlaying) {
      stopAndReset();
    }
  };

  // 초기화
  const resetApp = (): void => {
    setStartNumber("1");
    setEndNumber("600");
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

  // 레벨 선택
  const setLevelSelection = (
    selectedLevel: "all" | "beginner" | "intermediate"
  ) => {
    setLevel(selectedLevel);
  };

  // 재생/일시정지 토글 - 사용자가 명시적으로 재생 버튼을 누를 때만 호출됨
  const togglePlay = (): void => {
    if (!playlist.length) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // 재생 버튼을 누를 때만 오디오 재생 시작
      if (audioRef.current) {
        console.log(`재생 시도: ${playlist[currentTrack].filePath}`);

        // 재생 전에 먼저 로드 확인
        audioRef.current.load();

        // TypeScript 오류 수정: 조건 검사 제거
        audioRef.current
          .play()
          .then(() => {
            // 재생 성공
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("오디오 재생 실패:", error);
            alert(`오디오 재생 실패: ${error.message}`);
            setIsPlaying(false);
          });
      }
    }
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
              {/* 레벨 선택 버튼 - 모바일 최적화 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습 수준 선택:
                </label>
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <Button
                    onClick={() => setLevelSelection("all")}
                    variant={level === "all" ? "default" : "outline"}
                    className={`w-full md:w-auto ${
                      level === "all" ? "bg-blue-600" : ""
                    }`}
                  >
                    전체 단어
                  </Button>
                  <Button
                    onClick={() => setLevelSelection("beginner")}
                    variant={
                      level === "beginner" ? "default" : "outline"
                    }
                    className={`w-full md:w-auto ${
                      level === "beginner" ? "bg-green-600" : ""
                    }`}
                  >
                    <BookOpen size={16} className="mr-2" />
                    초급 단어
                  </Button>
                  <Button
                    onClick={() => setLevelSelection("intermediate")}
                    variant={
                      level === "intermediate" ? "default" : "outline"
                    }
                    className={`w-full md:w-auto ${
                      level === "intermediate" ? "bg-purple-600" : ""
                    }`}
                  >
                    <GraduationCap size={16} className="mr-2" />
                    중급 단어
                  </Button>
                </div>
              </div>

              {/* 입력 섹션 - 모바일 최적화 */}
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

              {/* 파일 정보 확인 */}
              <div className="text-xs text-gray-500">
                <p>초급 단어: {beginnerFiles.length}개 로드됨</p>
                <p>중급 단어: {intermediateFiles.length}개 로드됨</p>
              </div>

              {/* 현재 재생 중인 단어 섹션 */}
              {playlist.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
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
                    {/* 파일 경로 디버깅 */}
                    <div className="mt-1 text-xs text-gray-400">
                      {playlist[currentTrack].filePath}
                    </div>
                  </div>

                  {/* preload="none" 추가하여 자동 로드 방지 */}
                  <audio
                    ref={audioRef}
                    src={playlist[currentTrack].filePath}
                    onEnded={handleEnded}
                    onError={handleError}
                    preload="none"
                    className="hidden"
                  />

                  {/* 컨트롤 버튼 */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className={`w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 ${
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
                            <div className="flex items-center flex-wrap">
                              <span className="text-lg font-medium text-gray-800 mr-2">
                                {file.word}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                            <span className="text-sm text-gray-500 ml-2">
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                            <p className="text-gray-600 mt-1">
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
