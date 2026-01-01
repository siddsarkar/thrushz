import { useCallback, useEffect, useState } from 'react';
import TrackPlayer, { Track } from 'react-native-track-player';

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    let unmounted = false;

    const fetchQueue = async () => {
      const queue = await TrackPlayer.getQueue();
      if (unmounted) return;
      setQueue(queue);
    };

    fetchQueue();

    return () => {
      unmounted = true;
    };
  }, []);

  const addToQueue = useCallback(
    async (track: Track) => {
      const trackIndexInQueue = queue.findIndex((t) => t.id === track.id);
      const currentIndex = await TrackPlayer.getActiveTrackIndex();

      console.log('queueLastIndex', queue.length - 1);
      console.log('trackIndexInQueue', trackIndexInQueue);
      console.log('currentIndex', currentIndex);

      if (trackIndexInQueue !== -1) {
        if (currentIndex !== undefined) {
          TrackPlayer.move(trackIndexInQueue, currentIndex + 1);
        } else {
          TrackPlayer.add(track);
        }
      } else {
        if (currentIndex !== undefined) {
          TrackPlayer.add(track, currentIndex + 1);
        } else {
          TrackPlayer.add(track);
        }
      }

      // update the queue
      const newQueue = await TrackPlayer.getQueue();
      setQueue(newQueue);
    },
    [queue]
  );

  return { queue, addToQueue };
}
