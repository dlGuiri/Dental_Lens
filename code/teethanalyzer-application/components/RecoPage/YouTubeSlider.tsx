import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { gql, useQuery } from "@apollo/client";
import { usePrediction } from "context/PredictionContext";

const GET_USER_BY_OAUTH_ID = gql`
  query GetUserByOauthId($oauthId: String!) {
    getUserByOauthId(oauthId: $oauthId) {
      name
      teeth_status
      scanRecords {
        date
        result
        notes
      }
    }
  }
`;

const ChevronLeft = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronRight = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const Play = ({ size = 24, fill, className }: { size?: number; fill?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polygon points="5,3 19,12 5,21" fill={fill || "currentColor"} />
  </svg>
);

interface Video {
  id: string;
  thumbnail: string;
}

// Video collections organized by dental condition
const videoCollections: Record<string, string[]> = {
  'Hypodontia': [
    '4htOv4LG_iM',
    'Oz5d0LRYeF0',
    'u_BkpjglyCQ',
    'slnwmJI4dtI',
    's3PpDB0Ghjc'
  ],
  'Gingivitis': [
    'aiWiA_zPDOk',
    'ggdjx0NVy74',
    'wzpqSfUZUmk',
    'zz9cyjPNk3k',
    'xG4lhQ9FyEI'
  ],
  'Calculus': [
    'owNMKbZBLD8',
    'yY8iYnRJLJQ',
    'y7g1gKyzL94',
    'PwJiZPV2yqI',
    '2hTlkOJnIn0'
  ],
  'Dental Caries': [
    '4wlRM-YgRQ8',
    'zGoBFU1q4g0',
    'E_Z8UA-jVDc',
    'NHUXAe5miUc',
    'Fhaxk03viJI'
  ],
  'Tooth Discoloration': [
    'AZLNCdbu83E',
    '2wLrHtqTDxc',
    'Wd-5CZQEeCE',
    '2XU8mmZNe-8',
    'ndZYoRXP7zA'
  ],
  'Mouth Ulcer': [
    'HkeCmhKLQx4',
    'dFvr6LkBN2w',
    '8rs1vaYU05M',
    'aaMEk_rkzlc',
    '9h7tiIOk4vc'
  ],
  'default': [
    'Hkfxki3ywaU',
    '3oG_JLuQ8T8',
    '7_GjyhgUSaw',
    '5J89gCDt_rk',
    'MFNKacCKGHM'
  ]
};

// Function to convert video IDs to Video objects
const createVideoObjects = (videoIds: string[]): Video[] => {
  return videoIds.map(id => ({
    id,
    thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
  }));
};

// Function to get videos based on dental condition
const getVideosForCondition = (condition: string): Video[] => {
  // Normalize the condition string for matching
  const normalizedCondition = condition.trim();
  
  // Check if the condition matches any of our video collections
  if (videoCollections[normalizedCondition]) {
    return createVideoObjects(videoCollections[normalizedCondition]);
  }
  
  // Return default videos if condition not found
  return createVideoObjects(videoCollections['default']);
};

const YoutubeSlider = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [visibleThumbnails, setVisibleThumbnails] = useState(3);
  const [videos, setVideos] = useState<Video[]>(createVideoObjects(videoCollections['default']));
  const [mainVideo, setMainVideo] = useState<Video>(videos[0]);

  const { data: session } = useSession();
  const oauthId = (session as any)?.user?.oauthId;

  const { predictionResult } = usePrediction();
  const { data, refetch } = useQuery(GET_USER_BY_OAUTH_ID, {
    variables: { oauthId },
    skip: !oauthId
  });

  useEffect(() => {
    if (predictionResult && oauthId) {
      refetch();
    }
  }, [predictionResult, oauthId, refetch]);

  const scanRecords = Array.isArray(data?.getUserByOauthId?.scanRecords)
    ? data.getUserByOauthId.scanRecords
    : [];

  const latestScanResult = scanRecords.length > 0 ? scanRecords[scanRecords.length - 1].result : "";
  const displayResultRaw =
    predictionResult &&
    predictionResult !== "" &&
    predictionResult !== "Invalid image: Please upload a clear image of an actual teeth."
      ? predictionResult
      : latestScanResult;

  const displayResult = Array.isArray(displayResultRaw)
    ? displayResultRaw.join(", ")
    : String(displayResultRaw ?? "");

  console.log("THIS IS THE displayResult", displayResult);

  // Update videos when displayResult changes
  useEffect(() => {
    const newVideos = getVideosForCondition(displayResult);
    setVideos(newVideos);
    setMainVideo(newVideos[0]);
    setStartIndex(0); // Reset slider position when videos change
  }, [displayResult]);

  // Responsive thumbnail count
  useEffect(() => {
    const updateVisibleThumbnails = () => {
      if (window.innerWidth < 640) {
        setVisibleThumbnails(1);
      } else if (window.innerWidth < 768) {
        setVisibleThumbnails(2);
      } else {
        setVisibleThumbnails(3);
      }
    };

    updateVisibleThumbnails();
    window.addEventListener("resize", updateVisibleThumbnails);
    return () => window.removeEventListener("resize", updateVisibleThumbnails);
  }, []);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handlePrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setStartIndex((i) => Math.min(videos.length - visibleThumbnails, i + 1));
  const handleThumbnailClick = (video: Video) => setMainVideo(video);

  const getThumbnailDimensions = () => {
    if (visibleThumbnails === 1) {
      return { width: "", height: "h-48 sm:h-56", gap: "gap-4" };
    } else if (visibleThumbnails === 2) {
      return { width: "", height: "h-32 sm:h-36", gap: "gap-3" };
    } else {
      return { width: "", height: "h-28 lg:h-36", gap: "gap-2 lg:gap-4" };
    }
  };

  const dimensions = getThumbnailDimensions();

  // Get condition-specific title
  const getTitle = () => {
    if (displayResult && videoCollections[displayResult]) {
      return `${displayResult} - Dental Care Tips`;
    }
    return "Personalized Dental Tips";
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-sky-400 mb-4 sm:mb-6 text-center">
        {getTitle()}
      </h2>

      {/* Main Video Player */}
      <div className="relative mb-4 sm:mb-6">
        <div className="relative mx-auto w-full max-w-4xl">
          <iframe
            src={`https://www.youtube.com/embed/${mainVideo.id}`}
            title="Main Video"
            className="w-full h-56 sm:h-72 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-500 ease-in-out"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="relative flex items-center justify-center">
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          className={`absolute left-0 sm:left-2 z-10 p-1 sm:p-2 rounded-full transition-all duration-200 ${
            startIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-sky-400 hover:text-sky-600 hover:bg-sky-50"
          } ${visibleThumbnails === 1 ? "hidden sm:block" : ""}`}
        >
          <ChevronLeft size={visibleThumbnails === 1 ? 24 : 28} />
        </button>

        <div
          className={`${visibleThumbnails === 1 ? "mx-0" : "mx-8 sm:mx-12 lg:mx-16"} overflow-hidden touch-pan-y`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex ${dimensions.gap} transition-transform duration-500 ease-in-out justify-center sm:justify-start`}
            style={{
              transform: `translateX(-${(startIndex * 100) / visibleThumbnails}%)`
            }}
          >
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleThumbnailClick(video)}
                className={`relative cursor-pointer group transition-all duration-200 flex-shrink-0 ${
                  mainVideo.id === video.id
                    ? "ring-2 sm:ring-4 rounded-lg sm:rounded-xl"
                    : "hover:ring-2 hover:ring-sky-300 rounded-lg sm:rounded-xl"
                }`}
                style={{
                  width:
                    visibleThumbnails === 1
                      ? "100%"
                      : `calc(${100 / visibleThumbnails}% - ${
                          visibleThumbnails === 3 ? "0.5rem" : "0.75rem"
                        })`
                }}
              >
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                  <img
                    src={video.thumbnail}
                    alt="Video thumbnail"
                    className={`${dimensions.height} w-full object-cover transition-transform duration-200 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Play className="text-white" size={visibleThumbnails === 1 ? 32 : 20} fill="white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={startIndex >= videos.length - visibleThumbnails}
          className={`absolute right-0 sm:right-2 z-10 p-1 sm:p-2 rounded-full transition-all duration-200 ${
            startIndex >= videos.length - visibleThumbnails
              ? "text-gray-400 cursor-not-allowed"
              : "text-sky-400 hover:text-sky-600 hover:bg-sky-50"
          } ${visibleThumbnails === 1 ? "hidden sm:block" : ""}`}
        >
          <ChevronRight size={visibleThumbnails === 1 ? 24 : 28} />
        </button>
      </div>

      <div className="flex justify-center mt-4 sm:mt-6 gap-2">
        {Array.from({ length: videos.length - visibleThumbnails + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setStartIndex(idx)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
              startIndex === idx ? "bg-sky-400" : "bg-gray-300 hover:bg-sky-200"
            }`}
          />
        ))}
      </div>

      {visibleThumbnails === 1 && (
        <p className="text-center text-xs text-gray-500 mt-2 sm:hidden">Swipe left or right to browse videos</p>
      )}
    </div>
  );
};

export default YoutubeSlider;