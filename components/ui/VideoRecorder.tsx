'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiVideo, FiSquare, FiPlay, FiTrash2, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface VideoRecorderProps {
  questionId: number;
  questionText: string;
  isRTL: boolean;
  onRecordingComplete: (blob: Blob, questionId: number) => void;
  onDelete: (questionId: number) => void;
  existingVideoUrl?: string;
  disabled?: boolean;
}

export default function VideoRecorder({
  questionId,
  questionText,
  isRTL,
  onRecordingComplete,
  onDelete,
  existingVideoUrl,
  disabled = false,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(existingVideoUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 180;

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedUrl && !existingVideoUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl, existingVideoUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        onRecordingComplete(blob, questionId);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(isRTL 
        ? 'لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.'
        : 'Cannot access camera. Please check permissions.');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  }, []);

  const handleDelete = () => {
    if (recordedUrl && !existingVideoUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
    onDelete(questionId);
  };

  const handleReRecord = () => {
    handleDelete();
    startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (playbackRef.current) {
      if (isPlaying) {
        playbackRef.current.pause();
      } else {
        playbackRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="mb-3">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mr-2">
          {questionId}
        </span>
        <span className="text-gray-800 font-medium">{questionText}</span>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <FiAlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
        {isRecording ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {isRTL ? 'جاري التسجيل' : 'Recording'} - {formatTime(recordingTime)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div 
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(recordingTime / MAX_RECORDING_TIME) * 100}%` }}
              />
            </div>
          </>
        ) : recordedUrl ? (
          <>
            <video
              ref={playbackRef}
              src={recordedUrl}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && (
                <button
                  onClick={togglePlayback}
                  className="p-4 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <FiPlay className="w-8 h-8 text-purple-600" />
                </button>
              )}
            </div>
            <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <FiCheck className="w-4 h-4" />
              {isRTL ? 'تم التسجيل' : 'Recorded'}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <FiVideo className="w-12 h-12 mb-2" />
            <p className="text-sm">
              {isRTL ? 'اضغط على زر التسجيل للبدء' : 'Click record to start'}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isRecording && !recordedUrl && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiVideo className="w-5 h-5" />
            {isRTL ? 'بدء التسجيل' : 'Start Recording'}
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <FiSquare className="w-5 h-5" />
            {isRTL ? 'إيقاف التسجيل' : 'Stop Recording'}
          </button>
        )}

        {recordedUrl && !isRecording && (
          <>
            <button
              onClick={handleReRecord}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className="w-5 h-5" />
              {isRTL ? 'إعادة التسجيل' : 'Re-record'}
            </button>
            <button
              onClick={handleDelete}
              disabled={disabled}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              {isRTL ? 'حذف' : 'Delete'}
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        {isRTL 
          ? `الحد الأقصى للتسجيل: ${MAX_RECORDING_TIME / 60} دقائق`
          : `Max recording time: ${MAX_RECORDING_TIME / 60} minutes`}
      </p>
    </div>
  );
}
